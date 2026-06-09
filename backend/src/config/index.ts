import 'dotenv/config';

export const config = {
  port: parseInt(process.env['PORT'] ?? '3001', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',

  redis: {
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
    password: process.env['REDIS_PASSWORD'] ?? undefined,
    sessionTTL: parseInt(process.env['SESSION_TTL_HOURS'] ?? '24', 10) * 3600,
  },

  ollama: {
    baseUrl: process.env['OLLAMA_BASE_URL'] ?? 'http://localhost:11434',
    model: process.env['OLLAMA_MODEL'] ?? 'llama3.2:3b',
    timeout: parseInt(process.env['OLLAMA_TIMEOUT_MS'] ?? '120000', 10),
    temperature: parseFloat(process.env['OLLAMA_TEMPERATURE'] ?? '0.7'),
  },

  groq: {
    apiKey: process.env['GROQ_API_KEY'] ?? '',
    model: process.env['GROQ_MODEL'] ?? 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
  },

  gemini: {
    apiKey: process.env['GEMINI_API_KEY'] ?? '',
    model: process.env['GEMINI_MODEL'] ?? 'gemini-2.0-flash',
  },

  llmProvider: (process.env['LLM_PROVIDER'] ?? 'ollama') as 'ollama' | 'groq' | 'gemini',

  nominatim: {
    baseUrl: 'https://nominatim.openstreetmap.org',
    userAgent: 'YatraAI-TravelPlanner/1.0 (contact@yatraai.in)',
  },

  cors: {
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX'] ?? '50', 10),
  },
};
