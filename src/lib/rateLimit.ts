/**
 * Simple in-memory rate limiter for Server Actions
 * For production, consider using Upstash Redis or Vercel Edge Config
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 300000);

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
 * Rate limit a request by identifier (IP, user ID, session)
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param action - Action name (e.g., 'createEvent', 'enrollUser')
 * @param config - Rate limit configuration
 * @returns Rate limit result
 *
 * @example
 * const result = rateLimit(request.ip, 'createEvent', { maxRequests: 10, windowMs: 60000 });
 * if (!result.allowed) {
 *   return { error: `Rate limit exceeded. Try again in ${Math.ceil((result.resetAt - Date.now()) / 1000)}s` };
 * }
 */
export function rateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig,
): RateLimitResult {
  const key = `${identifier}:${action}`;
  const now = Date.now();

  let entry = store.get(key);

  // Initialize or reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    store.set(key, entry);
  }

  // Increment counter
  entry.count++;

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit presets for common actions
 */
export const RateLimitPresets = {
  // Admin actions (strict)
  CREATE_EVENT: { maxRequests: 20, windowMs: 60000 }, // 20/min
  CREATE_COURSE: { maxRequests: 5, windowMs: 60000 }, // 5/min
  ENROLL_USER: { maxRequests: 30, windowMs: 60000 }, // 30/min
  DELETE_RESOURCE: { maxRequests: 10, windowMs: 60000 }, // 10/min

  // Student actions (moderate)
  MARK_COMPLETE: { maxRequests: 100, windowMs: 60000 }, // 100/min
  SUBMIT_ASSIGNMENT: { maxRequests: 20, windowMs: 60000 }, // 20/min (includes assessments)
  POST_COMMENT: { maxRequests: 30, windowMs: 60000 }, // 30/min

  // Auth actions (very strict)
  LOGIN_ATTEMPT: { maxRequests: 5, windowMs: 300000 }, // 5 per 5 minutes
  PASSWORD_RESET: { maxRequests: 3, windowMs: 600000 }, // 3 per 10 minutes
} as const;

/**
 * Helper to get client identifier from request
 * In production, use actual IP from headers
 */
export function getClientIdentifier(request?: Request): string {
  // In development, fallback to session
  if (process.env.NODE_ENV === "development") {
    return "dev-session";
  }

  // Production: Extract IP from headers
  const ip =
    request?.headers.get("x-forwarded-for")?.split(",")[0] ||
    request?.headers.get("x-real-ip") ||
    "unknown";

  return ip;
}
