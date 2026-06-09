import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Redis } from 'ioredis';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { SessionStore } from './services/session/index.js';
import { ItineraryService } from './services/itinerary/index.js';
import { sessionMiddleware } from './middleware/session.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createRouter } from './routes/index.js';

async function bootstrap() {
  const redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
  });

  try {
    await redis.connect();
    logger.info('Redis connected', { host: config.redis.host, port: config.redis.port });
  } catch (err) {
    logger.error('Redis connection failed', { err });
    logger.warn('Continuing without Redis — sessions will not persist across restarts');
  }

  const sessionStore = new SessionStore(redis);
  const itineraryService = new ItineraryService(sessionStore);

  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.use(sessionMiddleware(sessionStore));
  app.use(apiRateLimit);

  app.use('/api', createRouter(sessionStore, itineraryService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(config.port, () => {
    logger.info(`YatraAI Backend running`, {
      port: config.port,
      env: config.nodeEnv,
      llmProvider: config.llmProvider,
      ollamaModel: config.ollama.model,
    });
  });

  const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await redis.quit();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
