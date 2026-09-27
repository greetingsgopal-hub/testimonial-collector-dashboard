/**
 * Lightweight in-memory sliding-window rate limiter for Cloudflare Worker.
 *
 * KNOWN LIMITATION: this store is per-isolate. Cloudflare Workers run many
 * isolates per deployment, so limits are enforced per isolate, not globally.
 * A determined attacker rotating across isolates can exceed the configured
 * rate. For global enforcement, back this with Cloudflare KV or Durable
 * Objects. Acceptable for OAuth-init brute-force slowing, not for hard
 * abuse guarantees on public submission endpoints.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let record = memoryStore.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(identifier, record);
  }

  // Filter timestamps within the sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}
