import { Router } from 'express';
import { OllamaClient, GroqClient } from '../services/llm/ollama.js';
import { config } from '../config/index.js';

export function llmRouter(): Router {
  const router = Router();
  const ollama = new OllamaClient();
  const groq = new GroqClient();

  router.get('/status', async (_req, res) => {
    const ollamaUp = await ollama.isAvailable();
    const ollamaModels = ollamaUp ? await ollama.listModels() : [];
    const targetModel = config.ollama.model;
    const modelPulled = ollamaModels.some((m) => m.startsWith(targetModel.split(':')[0] ?? ''));

    res.json({
      provider: config.llmProvider,
      ollama: {
        running: ollamaUp,
        url: config.ollama.baseUrl,
        targetModel,
        modelPulled,
        availableModels: ollamaModels,
        pullCommand: !modelPulled ? `ollama pull ${targetModel}` : null,
      },
      groq: {
        configured: groq.isConfigured(),
        model: config.groq.model,
      },
      recommendation: !ollamaUp && !groq.isConfigured()
        ? 'Run `ollama serve` then `ollama pull llama3.2:3b`, OR get a free key at console.groq.com and set GROQ_API_KEY + LLM_PROVIDER=groq in .env'
        : ollamaUp && !modelPulled
          ? `Run: ollama pull ${targetModel}`
          : 'OK',
    });
  });

  return router;
}
