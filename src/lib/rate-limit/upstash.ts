import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Distributed rate limiting via Upstash Redis. This project runs on
// Vercel's serverless/edge platform, where each invocation is a fresh
// process — an in-memory counter would reset constantly and wouldn't be
// shared across instances, so it can't actually protect anything in
// production. Upstash's REST-based Redis is the standard lightweight fit
// for this environment (no persistent connection/socket needed).
//
// If UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN aren't configured,
// this fails OPEN (rate limiting is simply skipped) rather than blocking
// every booking — see getLimiter() below. A missing/misconfigured
// anti-abuse layer must never take down the booking form itself.

export type LimiterName = "bookingCreate" | "bookingAction";

const LIMITER_CONFIG: Record<
  LimiterName,
  { requests: number; window: Parameters<typeof Ratelimit.slidingWindow>[1]; prefix: string }
> = {
  // 5 booking submissions per IP per 10 minutes.
  bookingCreate: { requests: 5, window: "10 m", prefix: "zenith:ratelimit:booking-create" },
  // The signed action token is the real authorization check for
  // approve/decline — this is only a generous backstop against obvious
  // automated hammering, not a primary control, and must not make
  // legitimate owner clicks flaky.
  bookingAction: { requests: 30, window: "10 m", prefix: "zenith:ratelimit:booking-action" },
};

let redisClient: Redis | null | undefined; // undefined = not checked yet
let warnedMissingConfig = false;
const limiters = new Map<LimiterName, Ratelimit>();

function getRedis(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!warnedMissingConfig) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set — " +
          "rate limiting is disabled (failing open) until they're configured. See " +
          "docs/booking-backend.md."
      );
      warnedMissingConfig = true;
    }
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function getLimiter(name: LimiterName): Ratelimit | null {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  const cached = limiters.get(name);
  if (cached) {
    return cached;
  }

  const config = LIMITER_CONFIG[name];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    prefix: config.prefix,
    analytics: false,
  });
  limiters.set(name, limiter);
  return limiter;
}

export type RateLimitResult =
  | { limited: false }
  | { limited: true; retryAfterSeconds: number };

export async function checkRateLimit(
  name: LimiterName,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getLimiter(name);
  if (!limiter) {
    return { limited: false };
  }

  try {
    const result = await limiter.limit(identifier);
    if (result.success) {
      return { limited: false };
    }
    const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return { limited: true, retryAfterSeconds };
  } catch (err) {
    // Upstash being briefly unreachable must not take the booking form
    // down — log it and let the request through.
    console.error(`[rate-limit] ${name} check failed, failing open:`, err);
    return { limited: false };
  }
}
