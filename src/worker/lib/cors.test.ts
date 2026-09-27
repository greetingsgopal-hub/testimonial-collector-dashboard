import { describe, it, expect } from 'vitest';
import { getCorsHeaders } from './cors';

/**
 * MEDIUM (CORS) regression test — exact-match origin allowlist.
 * Suffix wildcards (*.workers.dev / *.netlify.app) are gone: an attacker
 * who registers evil.workers.dev must NOT receive Access-Control-Allow-Origin.
 */

describe('CORS: exact-match allowlist only', () => {
  it('allows an explicitly listed origin with credentials', () => {
    const h = getCorsHeaders('http://localhost:5173');
    expect(h['Access-Control-Allow-Origin']).toBe('http://localhost:5173');
    expect(h['Access-Control-Allow-Credentials']).toBe('true');
  });

  it('does NOT allow an arbitrary *.workers.dev subdomain', () => {
    const h = getCorsHeaders('https://evil-attacker.workers.dev');
    expect(h['Access-Control-Allow-Origin']).toBeUndefined();
    expect(h['Access-Control-Allow-Credentials']).toBeUndefined();
  });

  it('does NOT allow an arbitrary *.netlify.app subdomain', () => {
    const h = getCorsHeaders('https://evil-attacker.netlify.app');
    expect(h['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('does not echo a random foreign origin', () => {
    const h = getCorsHeaders('https://phishing-site.example.com');
    expect(h['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('still sends Vary: Origin and method headers for disallowed origins', () => {
    const h = getCorsHeaders('https://evil-attacker.workers.dev');
    expect(h['Vary']).toBe('Origin');
    expect(h['Access-Control-Allow-Methods']).toBeTruthy();
  });
});
