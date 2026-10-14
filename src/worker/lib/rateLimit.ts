import { KVNamespaceLike } from '../types';

/**
 * Production-grade distributed rate limiter backed by Cloudflare KV.
 * Falls back to an in-memory sliding window when KV is not bound (dev/tests).
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  error?: string;
}

interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 30,
  windowMs: number = 60000
): RateLimitResult {
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

/**
 * Distributed Cloudflare KV rate limiter.
 * Enforces limits across all global Worker isolates.
 * Fails closed on KV errors by returning { allowed: false, error: ... }.
 */
export async function checkRateLimitKV(
  identifier: string,
  maxRequests: number = 5,
  windowSeconds: number = 600,
  kv?: KVNamespaceLike
): Promise<RateLimitResult> {
  const windowMs = windowSeconds * 1000;
  const now = Date.now();

  if (kv) {
    try {
      const key = `ratelimit:${identifier}`;
      const raw = await kv.get(key, 'text');
      let data: { count: number; resetAt: number } | null = null;
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = null;
        }
      }

      if (!data || now >= data.resetAt) {
        // First request or window expired
        const newRecord = { count: 1, resetAt: now + windowMs };
        await kv.put(key, JSON.stringify(newRecord), { expirationTtl: windowSeconds });
        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetMs: windowMs,
        };
      }

      if (data.count >= maxRequests) {
        const resetMs = Math.max(0, data.resetAt - now);
        return {
          allowed: false,
          remaining: 0,
          resetMs,
        };
      }

      data.count += 1;
      const ttl = Math.max(60, Math.ceil((data.resetAt - now) / 1000));
      await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });

      return {
        allowed: true,
        remaining: maxRequests - data.count,
        resetMs: Math.max(0, data.resetAt - now),
      };
    } catch (err) {
      console.error('[RateLimitKV] KV rate limit error (failing closed):', err);
      return {
        allowed: false,
        remaining: 0,
        resetMs: windowMs,
        error: 'Rate limit service unavailable',
      };
    }
  }

  // Fallback to in-memory sliding window when KV binding is absent (e.g. unit tests or local dev)
  return checkRateLimit(identifier, maxRequests, windowMs);
}
