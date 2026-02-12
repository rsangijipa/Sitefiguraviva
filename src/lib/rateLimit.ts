import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Distributed Rate Limiter powered by Upstash Redis.
 * Falls back to in-memory if Redis is not configured (or in development).
 */

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Persistent ratelimiter instance cache (by action/config pairs)
const limiters = new Map<string, Ratelimit>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Rate limit a request by identifier (IP, user ID, session).
 * Uses Upstash Redis for distributed state.
 */
export async function rateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  const windowSec = Math.ceil(config.windowMs / 1000);

  if (!redis) {
    // Fallback to in-memory for local dev if Redis not set
    return fallbackRateLimit(identifier, action, config);
  }

  const limiterKey = `${action}:${config.maxRequests}:${config.windowMs}`;
  let limiter = limiters.get(limiterKey);

  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(config.maxRequests, `${windowSec} s`),
      analytics: true,
      prefix: "@ratelimit",
    });
    limiters.set(limiterKey, limiter);
  }

  const { success, remaining, reset } = await limiter.limit(
    `${action}:${identifier}`,
  );

  return {
    allowed: success,
    remaining,
    resetAt: reset,
  };
}

/**
 * In-memory fallback for development or when Redis is unavailable.
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function fallbackRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig,
): RateLimitResult {
  const key = `${identifier}:${action}`;
  const now = Date.now();
  let entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + config.windowMs };
    memoryStore.set(key, entry);
  }

  entry.count++;

  return {
    allowed: entry.count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit presets for common actions
 */
export const RateLimitPresets = {
  // Admin actions (strict)
  CREATE_EVENT: { maxRequests: 20, windowMs: 60000 },
  CREATE_COURSE: { maxRequests: 5, windowMs: 60000 },
  ENROLL_USER: { maxRequests: 30, windowMs: 60000 },
  DELETE_RESOURCE: { maxRequests: 10, windowMs: 60000 },

  // Student actions (moderate)
  MARK_COMPLETE: { maxRequests: 100, windowMs: 60000 },
  SUBMIT_ASSIGNMENT: { maxRequests: 20, windowMs: 60000 },
  POST_COMMENT: { maxRequests: 30, windowMs: 60000 },

  // Auth actions (very strict)
  LOGIN_ATTEMPT: { maxRequests: 5, windowMs: 300000 },
  PASSWORD_RESET: { maxRequests: 3, windowMs: 600000 },
  CERTIFICATE_VERIFY: { maxRequests: 10, windowMs: 60000 }, // P1 addition
} as const;

/**
 * Helper to get client identifier from request
 */
export function getClientIdentifier(request?: any): string {
  if (process.env.NODE_ENV === "development") {
    return "dev-local";
  }

  // Handle both Request objects and Next.js header proxies
  const getHeader = (name: string) => {
    if (request?.headers?.get) return request.headers.get(name);
    return request?.headers?.[name];
  };

  const ip =
    getHeader("x-forwarded-for")?.split(",")[0] ||
    getHeader("x-real-ip") ||
    "unknown";
  return ip;
}
