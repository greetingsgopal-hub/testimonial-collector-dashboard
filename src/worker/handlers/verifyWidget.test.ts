import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleVerifyWidget, isPrivateOrBlockedHost } from './verifyWidget';
import { WorkerEnv } from '../types';

describe('verifyWidget Handler & SSRF Protections', () => {
  const mockEnv: WorkerEnv = {} as WorkerEnv;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('isPrivateOrBlockedHost (SSRF Prevention)', () => {
    it('blocks loopback and localhost addresses', () => {
      expect(isPrivateOrBlockedHost('localhost')).toBe(true);
      expect(isPrivateOrBlockedHost('127.0.0.1')).toBe(true);
      expect(isPrivateOrBlockedHost('0.0.0.0')).toBe(true);
      expect(isPrivateOrBlockedHost('::1')).toBe(true);
      expect(isPrivateOrBlockedHost('test.localhost')).toBe(true);
      expect(isPrivateOrBlockedHost('app.local')).toBe(true);
      expect(isPrivateOrBlockedHost('corp.internal')).toBe(true);
    });

    it('blocks cloud metadata endpoints', () => {
      expect(isPrivateOrBlockedHost('169.254.169.254')).toBe(true);
      expect(isPrivateOrBlockedHost('metadata.google.internal')).toBe(true);
    });

    it('blocks RFC 1918 private IPv4 subnets', () => {
      expect(isPrivateOrBlockedHost('10.0.0.1')).toBe(true);
      expect(isPrivateOrBlockedHost('10.255.255.255')).toBe(true);
      expect(isPrivateOrBlockedHost('192.168.1.1')).toBe(true);
      expect(isPrivateOrBlockedHost('192.168.0.254')).toBe(true);
      expect(isPrivateOrBlockedHost('172.16.0.5')).toBe(true);
      expect(isPrivateOrBlockedHost('172.31.255.255')).toBe(true);
    });

    it('allows valid public domain names', () => {
      expect(isPrivateOrBlockedHost('papasystem.in')).toBe(false);
      expect(isPrivateOrBlockedHost('pandapraise.com')).toBe(false);
      expect(isPrivateOrBlockedHost('example.com')).toBe(false);
      expect(isPrivateOrBlockedHost('sub.domain.co.uk')).toBe(false);
      expect(isPrivateOrBlockedHost('172.32.0.1')).toBe(false); // Outside 172.16-31
      expect(isPrivateOrBlockedHost('8.8.8.8')).toBe(false);
    });
  });

  describe('handleVerifyWidget Request Handling', () => {
    it('handles OPTIONS preflight request with 204 status', async () => {
      const req = new Request('https://pandapraise.com/api/verify-widget', { method: 'OPTIONS' });
      const res = await handleVerifyWidget(req, mockEnv);
      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });

    it('returns 400 when URL parameter is missing', async () => {
      const req = new Request('https://pandapraise.com/api/verify-widget', { method: 'GET' });
      const res = await handleVerifyWidget(req, mockEnv);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('INVALID_URL');
    });

    it('returns 403 when private host is requested (SSRF blocked)', async () => {
      const req = new Request('https://pandapraise.com/api/verify-widget?url=http://127.0.0.1:8080', {
        method: 'GET',
      });
      const res = await handleVerifyWidget(req, mockEnv);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe('FORBIDDEN_HOST');
      expect(json.verified).toBe(false);
    });

    it('verifies DETECTED_ACTIVE when HTML contains script and container', async () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <head><title>Papa System</title></head>
        <body>
          <h1>Welcome to Papa System</h1>
          <div id="panda-praise-wall" data-project-id="proj-123"></div>
          <script src="https://pandapraise.com/widget.js" data-project-id="proj-123" async></script>
        </body>
        </html>
      `;

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(sampleHtml, { status: 200, headers: { 'Content-Type': 'text/html' } })
      );

      const req = new Request('https://pandapraise.com/api/verify-widget?url=https://papasystem.in&projectId=proj-123', {
        method: 'GET',
      });
      const res = await handleVerifyWidget(req, mockEnv);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.verified).toBe(true);
      expect(json.code).toBe('DETECTED_ACTIVE');
      expect(json.hasScript).toBe(true);
      expect(json.hasContainer).toBe(true);
      expect(json.hasMatchingProject).toBe(true);
    });

    it('verifies SCRIPT_FOUND_CONTAINER_MISSING when script is found without container', async () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <body>
          <script src="https://pandapraise.com/widget.js" data-project="proj-123" async></script>
        </body>
        </html>
      `;

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(sampleHtml, { status: 200, headers: { 'Content-Type': 'text/html' } })
      );

      const req = new Request('https://pandapraise.com/api/verify-widget?url=https://papasystem.in', {
        method: 'GET',
      });
      const res = await handleVerifyWidget(req, mockEnv);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.verified).toBe(true);
      expect(json.code).toBe('SCRIPT_FOUND_CONTAINER_MISSING');
      expect(json.hasScript).toBe(true);
      expect(json.hasContainer).toBe(false);
    });

    it('returns CONTAINER_FOUND_SCRIPT_MISSING when container is present but script is missing', async () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
        <body>
          <div id="panda-praise-wall"></div>
        </body>
        </html>
      `;

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(sampleHtml, { status: 200, headers: { 'Content-Type': 'text/html' } })
      );

      const req = new Request('https://pandapraise.com/api/verify-widget?url=https://papasystem.in', {
        method: 'GET',
      });
      const res = await handleVerifyWidget(req, mockEnv);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.verified).toBe(false);
      expect(json.code).toBe('CONTAINER_FOUND_SCRIPT_MISSING');
      expect(json.hasScript).toBe(false);
      expect(json.hasContainer).toBe(true);
    });

    it('returns NOT_FOUND when neither script nor container is found on page', async () => {
      const sampleHtml = `<!DOCTYPE html><html><body><h1>Standard Site</h1></body></html>`;

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(sampleHtml, { status: 200, headers: { 'Content-Type': 'text/html' } })
      );

      const req = new Request('https://pandapraise.com/api/verify-widget?url=https://papasystem.in', {
        method: 'GET',
      });
      const res = await handleVerifyWidget(req, mockEnv);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.verified).toBe(false);
      expect(json.code).toBe('NOT_FOUND');
      expect(json.hasScript).toBe(false);
      expect(json.hasContainer).toBe(false);
    });

    it('handles target site HTTP 404/500 errors gracefully without crashing', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response('Not Found', { status: 404, statusText: 'Not Found' })
      );

      const req = new Request('https://pandapraise.com/api/verify-widget?url=https://papasystem.in/missing', {
        method: 'GET',
      });
      const res = await handleVerifyWidget(req, mockEnv);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.verified).toBe(false);
      expect(json.code).toBe('UNREACHABLE');
    });

    it('handles fetch network exceptions without unhandled rejection', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Connection refused'));

      const req = new Request('https://pandapraise.com/api/verify-widget?url=https://unreachable-domain-xyz.com', {
        method: 'GET',
      });
      const res = await handleVerifyWidget(req, mockEnv);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.verified).toBe(false);
      expect(json.code).toBe('UNREACHABLE');
    });
  });
});
