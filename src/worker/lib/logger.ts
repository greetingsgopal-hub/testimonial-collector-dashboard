/**
 * Structured Logging for Cloudflare Workers
 * Outputs uniform JSON logs for queryability and observability.
 */

export type LogLevel = 'info' | 'warn' | 'error';
export type LogCategory = 'stripe' | 'auth' | 'collector' | 'ratelimit' | 'embed' | 'deletion' | 'system';

export interface StructuredLogPayload {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  action: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

export function logWorkerEvent(
  category: LogCategory,
  action: string,
  metadata?: Record<string, unknown>,
  level: LogLevel = 'info',
  err?: unknown
): void {
  const payload: StructuredLogPayload = {
    timestamp: new Date().toISOString(),
    level,
    category,
    action,
    metadata,
  };

  if (err) {
    payload.error = err instanceof Error ? err.message : String(err);
  }

  const jsonStr = JSON.stringify(payload);

  if (level === 'error') {
    console.error(jsonStr);
  } else if (level === 'warn') {
    console.warn(jsonStr);
  } else {
    console.log(jsonStr);
  }
}
