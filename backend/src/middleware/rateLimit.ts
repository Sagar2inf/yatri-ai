import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { config } from '../config/index.js';

function getIpKey(req: { headers: Record<string, string | string[] | undefined>; ip?: string }): string {
  const forwarded = (req.headers['x-forwarded-for'] as string | undefined)
    ?.split(',')[0]
    ?.trim();
  const ip = forwarded ?? req.ip ?? '::1';
  return ipKeyGenerator(ip);
}

export const apiRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  keyGenerator: (req) => getIpKey(req),
  validate: { ip: false },
});

export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many messages. Please wait a moment before sending another.',
  },
  keyGenerator: (req) => req.sessionId ?? getIpKey(req),
  validate: { ip: false },
});
