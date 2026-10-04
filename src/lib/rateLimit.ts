import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createSupabaseServiceClient } from "@/infrastructure/supabase/server";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}
export class RateLimitUnavailableError extends Error {
  constructor() {
    super(
      "Proteção temporariamente indisponível. Tente novamente em alguns instantes.",
    );
    this.name = "RateLimitUnavailableError";
  }
}
const limiters = new Map<string, Ratelimit>();
const memoryStore = new Map<string, { count: number; resetAt: number }>();
async function bounded<T>(promise: PromiseLike<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new RateLimitUnavailableError()), 3000);
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
}
function validateResult(data: unknown): RateLimitResult {
  const result = data as RateLimitResult;
  if (
    !result ||
    typeof result.allowed !== "boolean" ||
    !Number.isInteger(result.remaining) ||
    result.remaining < 0 ||
    !Number.isFinite(result.resetAt) ||
    result.resetAt <= 0
  )
    throw new RateLimitUnavailableError();
  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}
export async function rateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  if (
    typeof identifier !== "string" ||
    !identifier ||
    identifier.length > 512 ||
    !/^[-_a-zA-Z0-9]{1,120}$/.test(action) ||
    !Number.isInteger(config.maxRequests) ||
    config.maxRequests < 1 ||
    config.maxRequests > 10000 ||
    !Number.isInteger(config.windowMs) ||
    config.windowMs < 1000 ||
    config.windowMs > 86400000
  )
    throw new Error("Invalid rate limit configuration");
  const production = process.env.NODE_ENV === "production";
  const secret =
    process.env.RATE_LIMIT_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (production && (!secret || secret.length < 32))
    throw new RateLimitUnavailableError();
  const key = createHmac("sha256", secret || "local-development-rate-limit")
    .update(
      JSON.stringify([action, identifier, config.maxRequests, config.windowMs]),
    )
    .digest("hex");
  const url = process.env.UPSTASH_REDIS_REST_URL,
    token = process.env.UPSTASH_REDIS_REST_TOKEN;
  // A backend is chosen consistently. Never switch counters after Redis fails.
  if (url || token) {
    if (!url || !token) throw new RateLimitUnavailableError();
    try {
      const settings = JSON.stringify([
        url,
        action,
        config.maxRequests,
        config.windowMs,
      ]);
      let limiter = limiters.get(settings);
      if (!limiter) {
        limiter = new Ratelimit({
          redis: new Redis({ url, token }),
          limiter: Ratelimit.slidingWindow(
            config.maxRequests,
            `${Math.ceil(config.windowMs / 1000)} s`,
          ),
          prefix: "figura-viva:rate-limit:v2",
          analytics: false,
          timeout: 0,
        });
        limiters.set(settings, limiter);
      }
      const result = await bounded(limiter.limit(key));
      // The SDK's timeout success must never authorize a protected action.
      if (result.reason === "timeout") throw new RateLimitUnavailableError();
      return validateResult({
        allowed: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      });
    } catch {
      throw new RateLimitUnavailableError();
    }
  }
  if (production) {
    try {
      const { data, error } = await bounded(
        createSupabaseServiceClient().rpc("consume_request_rate_limit", {
          p_key: key,
          p_max: config.maxRequests,
          p_window_ms: config.windowMs,
        }),
      );
      if (error) throw new RateLimitUnavailableError();
      return validateResult(data);
    } catch {
      throw new RateLimitUnavailableError();
    }
  }
  const now = Date.now();
  let entry = memoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    if (memoryStore.size >= 10000) {
      for (const [k, value] of memoryStore)
        if (value.resetAt <= now) memoryStore.delete(k);
      if (memoryStore.size >= 10000)
        return { allowed: false, remaining: 0, resetAt: now + config.windowMs };
    }
    entry = { count: 0, resetAt: now + config.windowMs };
    memoryStore.set(key, entry);
  }
  entry.count = Math.min(entry.count + 1, config.maxRequests + 1);
  return {
    allowed: entry.count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}

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
  SIGNUP_ATTEMPT: { maxRequests: 5, windowMs: 600000 },
  // Exchanging an already-verified Supabase token for the session cookie.
  // Looser than LOGIN_ATTEMPT because it carries no credentials and every
  // call must present a valid token, but it runs on each token refresh.
  SESSION_SYNC: { maxRequests: 30, windowMs: 300000 },
  PASSWORD_RESET: { maxRequests: 3, windowMs: 600000 },
  CERTIFICATE_VERIFY: { maxRequests: 10, windowMs: 60000 }, // P1 addition
  APPLICATION_SUBMIT: { maxRequests: 10, windowMs: 600000 }, // P1-03 addition
} as const;

export function getClientIdentifier(request?: {
  headers?: Pick<Headers, "get"> | Record<string, unknown>;
}): string {
  if (process.env.NODE_ENV !== "production") return "dev-local";
  const configured = process.env.RATE_LIMIT_IP_HEADER?.toLowerCase();
  const header =
    process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : configured;
  if (
    !header ||
    ![
      "x-vercel-forwarded-for",
      "x-forwarded-for",
      "x-real-ip",
      "cf-connecting-ip",
    ].includes(header)
  )
    return "unknown";
  const get = (name: string) => {
    const h = request?.headers;
    if (!h) return null;
    return typeof h.get === "function"
      ? h.get(name)
      : (h as Record<string, unknown>)[name];
  };
  const value =
    get(header) || (process.env.VERCEL === "1" ? get("x-forwarded-for") : null);
  if (typeof value !== "string") return "unknown";
  const ip = value.split(",")[0].trim();
  return isIP(ip) ? ip.toLowerCase() : "unknown";
}
