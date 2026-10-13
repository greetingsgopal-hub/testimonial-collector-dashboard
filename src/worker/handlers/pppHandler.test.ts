import { describe, it, expect } from 'vitest';
import { handlePppGeoDetection } from './pppHandler';
import { WorkerEnv } from '../types';

describe('Edge PPP Geo-IP Detection Endpoint (Task 4.2)', () => {
  const mockEnv: WorkerEnv = {} as any;

  it('detects country from cf-ipcountry header and returns local currency rates', async () => {
    const req = new Request('https://pandapraise.com/api/geo/ppp', {
      headers: {
        'cf-ipcountry': 'IN',
      },
    });

    const res = await handlePppGeoDetection(req, mockEnv);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.country).toBe('IN');
    expect(data.currency).toBe('INR');
    expect(data.rates.symbol).toBe('₹');
    expect(data.rates.discountPercent).toBe(55);
    expect(data.rates.localMethods).toContain('UPI');
  });

  it('allows country override via query parameter for testing', async () => {
    const req = new Request('https://pandapraise.com/api/geo/ppp?country=BR');

    const res = await handlePppGeoDetection(req, mockEnv);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.country).toBe('BR');
    expect(data.currency).toBe('BRL');
    expect(data.rates.symbol).toBe('R$');
    expect(data.rates.localMethods).toContain('Pix');
  });

  it('falls back to USD for US or unspecified countries', async () => {
    const req = new Request('https://pandapraise.com/api/geo/ppp');

    const res = await handlePppGeoDetection(req, mockEnv);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.currency).toBe('USD');
    expect(data.rates.discountPercent).toBe(0);
  });
});
