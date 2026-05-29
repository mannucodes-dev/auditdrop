/**
 * In-memory sliding window rate limiter.
 *
 * No external dependencies (no Redis, no Upstash).
 * Suitable for single-instance deployments (Vercel serverless).
 *
 * For multi-instance production, replace with @upstash/ratelimit.
 */

const rateLimitStore = new Map<string, number[]>();

// Clean up expired entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  for (const [key, timestamps] of rateLimitStore) {
    const recent = timestamps.filter((t) => now - t < windowMs);
    if (recent.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, recent);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * Check if a request is within the rate limit.
 *
 * @param identifier - Unique key (e.g., userId, IP address)
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  // Periodic cleanup
  cleanup(windowMs);

  const timestamps = rateLimitStore.get(identifier) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxRequests) {
    // Find the oldest timestamp in the window to calculate retry-after
    const oldestInWindow = Math.min(...recent);
    const retryAfterMs = windowMs - (now - oldestInWindow);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  recent.push(now);
  rateLimitStore.set(identifier, recent);
  return {
    allowed: true,
    remaining: maxRequests - recent.length,
    retryAfterMs: 0,
  };
}
