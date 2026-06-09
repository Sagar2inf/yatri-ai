import type { Itinerary, ChatMessage, LLMResponse } from '../../types/index.js';
import { LLMService } from '../llm/index.js';
import { GeoService } from '../geo/index.js';
import { recalculateBudget } from '../budget/index.js';
import { SessionStore } from '../session/index.js';
import { logger } from '../../utils/logger.js';
import { aggregateRealData, extractCitiesFromText } from '../data/aggregator.js';
import { detectBacktracking, optimizeDestinations } from '../route/optimizer.js';
import { parseUserPreferences } from '../graph/index.js';

export class ItineraryService {
  private readonly llm: LLMService;
  private readonly geo: GeoService;
  private readonly sessions: SessionStore;

  constructor(sessions: SessionStore) {
    this.llm = new LLMService();
    this.geo = new GeoService();
    this.sessions = sessions;
  }

  async processChat(
    sessionId: string,
    userMessage: string,
    onToken?: (token: string) => void
  ): Promise<LLMResponse> {
    const session = await this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    await this.sessions.appendMessage(sessionId, {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    });

    logger.debug('Processing chat message', { sessionId, messageLength: userMessage.length });

    // Aggregate real data + graph analysis.
    // For new itineraries: full aggregation.
    // For modifications to existing itinerary: rebuild graph with updated user preferences.
    let realDataContext: string | undefined;
    const prefs = parseUserPreferences(userMessage);

    if (!session.currentItinerary) {
      // New itinerary request
      try {
        const allText = [
          userMessage,
          ...session.conversationHistory.slice(-4).map((m) => m.content),
        ].join(' ');
        const cities = extractCitiesFromText(allText);
        const originMatch = allText.match(/from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
        const originCity = originMatch?.[1];
        const daysMatch = allText.match(/(\d+)\s*(?:days?|nights?)/i);
        const totalDays = daysMatch ? parseInt(daysMatch[1], 10) : undefined;

        if (cities.length > 0) {
          logger.debug('Fetching real data for cities', { cities, originCity });
          const aggregated = await aggregateRealData(cities, originCity, totalDays, userMessage, prefs);
          if (aggregated.dataFetched) {
            realDataContext = aggregated.contextString;
            logger.debug('Real data fetched', { contextLength: realDataContext.length, cities: aggregated.cities });
          }
        }
      } catch (err) {
        logger.warn('Real data aggregation failed, continuing without it', {
          err: err instanceof Error ? err.message : String(err),
        });
      }
    } else if (session.currentItinerary) {
      // Modification of existing itinerary — rebuild graph context with user's updated preferences
      const isModification = /skip|change|update|modify|remove|add|more time|less time|budget|cheaper|faster|slower|relax|rush|no.*attract|only.*main/i.test(userMessage);
      if (isModification) {
        try {
          const itin = session.currentItinerary;
          const destinations = itin.trip.destinations ?? [];
          const origin = itin.trip.from;
          const totalDays = itin.trip.durationDays;
          if (destinations.length > 0 && origin) {
            const aggregated = await aggregateRealData(destinations, origin, totalDays, userMessage, prefs);
            if (aggregated.dataFetched) {
              realDataContext = aggregated.contextString;
              logger.debug('Re-aggregated data for modification', { prefs, destinations });
            }
          }
        } catch (err) {
          logger.warn('Re-aggregation for modification failed', { err });
        }
      }
    }

    let llmResponse: LLMResponse;

    if (onToken) {
      llmResponse = await this.llm.streamMessage(
        userMessage,
        session.conversationHistory,
        session.currentItinerary,
        onToken,
        realDataContext
      );
    } else {
      llmResponse = await this.llm.processMessage(
        userMessage,
        session.conversationHistory,
        session.currentItinerary,
        realDataContext
      );
    }

    // Validate and auto-fix itinerary before returning to user
    if (llmResponse.type === 'itinerary' && llmResponse.itinerary) {
      // Extract the days the user actually asked for — used in the validator
      const allText = [userMessage, ...session.conversationHistory.slice(-4).map((m) => m.content)].join(' ');
      const daysMatch = allText.match(/(\d+)\s*(?:days?|nights?)/i);
      const requestedDays = daysMatch ? parseInt(daysMatch[1], 10) : 0;
      llmResponse = await this.validateAndFixItinerary(llmResponse, session.conversationHistory, realDataContext, requestedDays);
    }

    let assistantContent: string;
    let itinerary: Itinerary | null = null;

    if (llmResponse.type === 'itinerary' && llmResponse.itinerary) {
      let enriched = recalculateBudget(llmResponse.itinerary);
      try {
        enriched = await this.geo.enrichItineraryWithCoordinates(enriched);
      } catch (err) {
        logger.warn('Geo enrichment failed, continuing without coordinates', { err });
      }
      llmResponse.itinerary = enriched;
      itinerary = enriched;
      await this.sessions.saveItinerary(sessionId, enriched);
      assistantContent = JSON.stringify({ type: 'itinerary', title: enriched.title });
    } else if (llmResponse.type === 'modification' && llmResponse.itinerary) {
      let enriched = recalculateBudget(llmResponse.itinerary);
      try {
        enriched = await this.geo.enrichItineraryWithCoordinates(enriched);
      } catch (err) {
        logger.warn('Geo enrichment failed', { err });
      }
      llmResponse.itinerary = enriched;
      itinerary = enriched;
      await this.sessions.saveItinerary(sessionId, enriched);
      assistantContent = llmResponse.answer ?? 'Itinerary updated.';
    } else if (llmResponse.type === 'clarification') {
      assistantContent = (llmResponse.questions ?? []).join('\n');
    } else {
      assistantContent = llmResponse.answer ?? '';
    }

    await this.sessions.appendMessage(sessionId, {
      role: 'assistant',
      content: assistantContent,
      timestamp: Date.now(),
    });

    return { ...llmResponse, itinerary: itinerary ?? llmResponse.itinerary };
  }

  private async validateAndFixItinerary(
    llmResponse: LLMResponse,
    history: ChatMessage[],
    realDataContext?: string,
    requestedDays = 0
  ): Promise<LLMResponse> {
    const itinerary = llmResponse.itinerary!;
    const issues: string[] = [];
    const days = itinerary.days ?? [];
    // Prefer user-extracted days over what the LLM put in durationDays
    const expectedDays = requestedDays > 0 ? requestedDays : (itinerary.trip?.durationDays ?? 0);

    // 0. Critical: empty days array means the model output was truncated/incomplete
    if (days.length === 0) {
      issues.push(
        `CRITICAL: itinerary has 0 days — model output was truncated or incomplete. ` +
        `Must generate ALL ${expectedDays || 'requested'} days with full detail.`
      );
    } else {
      // 1. Check requested vs generated duration
      if (expectedDays > 0 && days.length < expectedDays - 1) {
        issues.push(
          `Duration mismatch: user requested ${expectedDays} days but itinerary only has ${days.length} days. ` +
          `Generate all ${expectedDays} days with complete detail for each day.`
        );
      }

      // 2. Route backtracking
      const backtrack = detectBacktracking(days);
      if (backtrack.hasBacktrack) {
        logger.warn('Backtracking detected', { details: backtrack.details });
        issues.push(backtrack.details);
      }

      // 3. Missing local transport costs
      const missingLT = days.filter((d) => !(d as any).localTransport?.estimatedCostPerDay);
      if (missingLT.length > 0) {
        issues.push(`Days missing localTransport.estimatedCostPerDay: ${missingLT.map((d) => `Day ${d.day}`).join(', ')}`);
      }

      // 4. Missing accommodation (excluding last day)
      const missingAccom = days.slice(0, -1).filter((d) => !d.accommodation);
      if (missingAccom.length > 0) {
        issues.push(`Days missing accommodation: ${missingAccom.map((d) => `Day ${d.day}`).join(', ')}`);
      }

      // 5. Zero/missing meal costs
      const zeroCostMeals = days.filter((d) =>
        (d.meals ?? []).some((m) => !m.estimatedCost || m.estimatedCost === 0)
      );
      if (zeroCostMeals.length > 0) {
        issues.push(`Days with zero meal costs: ${zeroCostMeals.map((d) => `Day ${d.day}`).join(', ')}`);
      }

      // 6. Days with empty meals or steps
      const emptyDays = days.filter(
        (d) => (d.meals ?? []).length === 0 || (d.steps ?? []).length === 0
      );
      if (emptyDays.length > 0) {
        issues.push(`Days with no meals or steps: ${emptyDays.map((d) => `Day ${d.day}`).join(', ')}`);
      }
    }

    if (issues.length === 0) {
      logger.debug('Itinerary validation passed', { days: days.length });
      return llmResponse;
    }

    logger.warn('Itinerary validation failed, requesting correction', { issues });

    // Build optimal route order for the correction prompt
    const origin = itinerary.trip?.from ?? '';
    const destinations = itinerary.trip?.destinations ?? [];
    const routeOpt = origin && destinations.length > 0
      ? optimizeDestinations(origin, destinations)
      : null;

    const correctionMsg = [
      `The itinerary you generated has the following issues that must be fixed:`,
      ...issues.map((i, n) => `${n + 1}. ${i}`),
      ``,
      routeOpt
        ? `CORRECT ROUTE ORDER (no backtracking): ${routeOpt.routeDescription}`
        : '',
      `Please regenerate the complete itinerary fixing ALL issues above.`,
      `Ensure: (a) no city is visited twice with other cities in between, (b) every day has localTransport with estimatedCostPerDay, (c) all meal costs are non-zero, (d) all nights except the last have accommodation.`,
    ].filter(Boolean).join('\n');

    try {
      const fixed = await this.llm.processMessage(
        correctionMsg,
        history,
        null,
        realDataContext
      );
      if (fixed.type === 'itinerary' && fixed.itinerary) {
        logger.debug('Itinerary corrected successfully');
        return fixed;
      }
    } catch (err) {
      logger.warn('Itinerary correction call failed, using original', { err });
    }

    return llmResponse;
  }

  async getItinerary(sessionId: string): Promise<Itinerary | null> {
    const session = await this.sessions.get(sessionId);
    return session?.currentItinerary ?? null;
  }
}
