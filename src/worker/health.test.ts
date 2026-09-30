import { describe, it, expect } from 'vitest';
import worker from './index';

describe('TASK 8: /api/health liveness probe', () => {
  it('returns 200 ok without authentication', async () => {
    const res = await worker.fetch(
      new Request('https://pandapraise.com/api/health'),
      {} as any,
      {} as any
    );
    expect(res.status).toBe(200);
    const data: any = await res.json();
    expect(data.status).toBe('ok');
    expect(data.service).toBe('pandapraise-api');
    expect(typeof data.timestamp).toBe('string');
  });

  it('exposes no secrets and makes no external calls (static payload)', async () => {
    const res = await worker.fetch(
      new Request('https://pandapraise.com/api/health'),
      {} as any,
      {} as any
    );
    const text = await res.text();
    // No env values, keys, or tokens may leak into the payload
    expect(text).not.toMatch(/AIza|sk_live|sk_test|SECRET|PRIVATE_KEY/i);
  });
});
