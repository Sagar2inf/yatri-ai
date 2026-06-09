#  YatraAI — AI-Powered India Travel Planner

> **Yatra** (यात्रा) — *journey* in Sanskrit.  
> Plan smart, optimized trips across India with AI itineraries backed by real data — not hallucinations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org)

---

##  What It Does

Tell YatraAI something like:

> *"Plan a 7-day Rajasthan trip from Delhi for 2 people in December, budget ₹30,000"*

And get back a complete, day-by-day itinerary with:

-  **Route-optimized path** — TSP algorithm so you never backtrack
-  **Real hotels** — pulled live from OpenStreetMap
-  **Real trains** — actual train numbers, timings, and fares for 40+ Indian city pairs
-  **Weather-aware scheduling** — extreme heat (42°C+) = outdoor only at 6–9am, midday rest in AC hotel
-  **Honest cost breakdown** — accommodation, food, local transport, activities per day
-  **City-specific transport** — Delhi Metro vs Goa scooter vs Varanasi Ganga boat, with real prices
-  **Local food recommendations** — specific dish names (Dal Baati Churma, not just "Rajasthani food")
-  **Interactive map** — day-by-day route visualized on Leaflet
-  **Conversational modifications** — "skip Ajmer, more time in Jaipur" re-plans instantly

---

##  Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Leaflet, Recharts |
| Backend | Node.js, Express, TypeScript |
| AI / LLM | Groq (primary), Google Gemini (secondary), Ollama (local fallback) |
| Session Storage | Redis |
| Real Data | OpenStreetMap Overpass API, Open-Meteo weather, Wikipedia API |
| Containerization | Docker + Docker Compose |

**All external data sources are 100% free — no paid APIs required.**

---

##  Quick Start

### Prerequisites

- Node.js 20+ and npm
- Redis — quickest option: `docker run -d -p 6379:6379 redis:7-alpine`
- A free [Groq API key](https://console.groq.com) *(2 minutes to get)*

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/yatri-ai.git
cd yatri-ai
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and add your Groq key:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here
```

### 3. Run

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173** and start planning.

---

##  Getting Free API Keys

### Option 1 — Groq (Recommended)

1. Go to **https://console.groq.com**
2. Sign up (no credit card)
3. **API Keys** → **Create API Key**
4. Copy the key — it starts with `gsk_`
5. Paste into `backend/.env`:
   ```env
   LLM_PROVIDER=groq
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
   GROQ_MODEL=llama-3.1-8b-instant
   ```

---

### Option 2 — Google Gemini

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with a **personal** Google account (not a Workspace/org account)
3. Click **Create API Key**
4. Copy the key — it starts with `AIzaSy`
5. Paste into `backend/.env`:
   ```env
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSy_xxxxxxxxxxxxxxxx
   GEMINI_MODEL=gemini-2.0-flash
   ```

---

### Option 3 — Ollama (100% Local, No Key)

1. Download from **https://ollama.ai/download**
2. Install, then:
   ```bash
   ollama serve
   ollama pull llama3.2:3b   # ~2 GB, takes a few minutes
   ```
3. In `backend/.env`:
   ```env
   LLM_PROVIDER=ollama
   ```

**Requirements:** 8 GB+ RAM. Quality is noticeably lower than cloud providers.

---

### Provider Fallback

YatraAI automatically falls through providers if one fails or rate-limits:

```
Primary (your LLM_PROVIDER) → Secondary → Ollama (local)
```

For best resilience, configure both Groq and a Gemini key — they back each other up automatically.

---

##  Docker (Full Stack)

Runs everything — backend, frontend, Redis, Ollama — in one command.

```bash
docker compose up -d
```

Open **http://localhost**

To use Groq instead of Ollama inside Docker, edit `docker-compose.yml` under the `backend` service:

```yaml
environment:
  - LLM_PROVIDER=groq
  - GROQ_API_KEY=gsk_your_key_here
```

---

## ⚙️ Configuration Reference

Full annotated config: [`backend/.env.example`](backend/.env.example)

| Variable | Default | Description |
|---|---|---|
| `LLM_PROVIDER` | `groq` | Primary LLM: `groq` \| `gemini` \| `ollama` |
| `GROQ_API_KEY` | — | Groq API key (get at console.groq.com) |
| `GROQ_MODEL` | `llama-3.1-8b-instant` | Groq model name |
| `GEMINI_API_KEY` | — | Gemini API key (get at aistudio.google.com) |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Gemini model name |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.2:3b` | Ollama model (must be pulled first) |
| `REDIS_HOST` | `localhost` | Redis hostname |
| `SESSION_TTL_HOURS` | `24` | Session lifetime |
| `RATE_LIMIT_MAX` | `50` | Max requests per 15 min per IP |

---

##  Contributing

PRs welcome. Good first contributions:

- Add more train routes → `backend/src/services/data/railways.ts`
- Add more city profiles (weights, costs) → `backend/src/services/graph/index.ts`
- Add en-route attractions → same file, `EN_ROUTE_ATTRACTIONS` map, key format: `'city1|city2'`
- Improve frontend components
- Add support for multi-language output (Hindi, Tamil, etc.)

```bash
# Type check
cd backend && npx tsc --noEmit
```

---

##  License

MIT — use it, fork it, build on it. See [LICENSE](LICENSE) for details.

---

*India is vast, beautiful, and endlessly fascinating. Happy travels! 🇮🇳*
