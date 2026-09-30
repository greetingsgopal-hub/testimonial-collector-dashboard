import { describe, test, expect, afterEach, vi } from 'vitest';
const jest = vi;
import { handleImportProvider } from '../../handlers/importProviderHandler';
import worker from '../../index';
import * as importEngineModule from '../importEngine';
import { ImportStatus } from '../importEngine';

function createRequest(options: {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}): Request {
  const method = options.method || 'POST';
  const url = options.url || 'https://pandapraise.com/api/import';
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  });

  return new Request(url, {
    method,
    headers,
    body: method !== 'GET' && method !== 'OPTIONS' ? JSON.stringify(options.body ?? {}) : undefined,
  });
}

describe('Worker POST /api/import Endpoint', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('1. Missing Authorization header returns 401 Unauthorized', async () => {
    const req = createRequest({
      body: { provider: 'google', params: { placeId: 'place-123' } },
    });
    const res = await worker.fetch(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/missing or malformed Bearer token/i);
  });

  test('2. Malformed Authorization header returns 401 Unauthorized', async () => {
    const malformedHeaders = [
      'Basic dXNlcjpwYXNz',
      'Bearer',
      'Token abc-123',
      'Bearer    ',
    ];

    for (const authVal of malformedHeaders) {
      const req = createRequest({
        headers: { Authorization: authVal },
        body: { provider: 'google', params: { placeId: 'place-123' } },
      });
      const res = await worker.fetch(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/missing or malformed Bearer token/i);
    }
  });

  test('3. Valid Firebase identity + provider auth failure returns 401 AUTH_REQUIRED', async () => {
    jest.spyOn(importEngineModule, 'importProvider').mockResolvedValue({
      status: ImportStatus.AUTH_REQUIRED,
      error: 'Google OAuth token expired or invalid',
    });

    const req = createRequest({
      headers: { Authorization: 'Bearer valid-firebase-token' },
      body: {
        provider: 'google',
        authToken: 'expired-google-token',
        params: { placeId: 'place-123' },
      },
    });

    const res = await worker.fetch(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Google OAuth token expired or invalid');
  });

  test('4. Unsupported provider returns 400 UNSUPPORTED', async () => {
    jest.spyOn(importEngineModule, 'importProvider').mockResolvedValue({
      status: ImportStatus.UNSUPPORTED,
      error: 'API capability not supported',
    });

    const req = createRequest({
      headers: { Authorization: 'Bearer valid-firebase-token' },
      body: { provider: 'instagram', params: {} },
    });

    const res = await worker.fetch(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('API capability not supported');
  });

  test('5. Multiple resources discovered returns 200 RESOURCE_SELECTION_REQUIRED with resources', async () => {
    const mockResources = [
      { placeId: 'loc-1', name: 'Downtown Branch' },
      { placeId: 'loc-2', name: 'Uptown Branch' },
    ];
    jest.spyOn(importEngineModule, 'importProvider').mockResolvedValue({
      status: ImportStatus.RESOURCE_SELECTION_REQUIRED,
      resources: mockResources,
    });

    const req = createRequest({
      headers: { Authorization: 'Bearer valid-firebase-token' },
      body: { provider: 'google', params: {} },
    });

    const res = await worker.fetch(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('RESOURCE_SELECTION_REQUIRED');
    expect(data.resources).toEqual(mockResources);
  });

  test('6. Successful import returns 200 with minimal { status: "SUCCESS", importedCount } payload', async () => {
    jest.spyOn(importEngineModule, 'importProvider').mockResolvedValue({
      status: ImportStatus.SUCCESS,
      importedCount: 5,
      reviews: [{ id: 'rev-1', sensitiveField: 'internal' }],
    });

    const req = createRequest({
      headers: { Authorization: 'Bearer valid-firebase-token' },
      body: {
        provider: 'google',
        authToken: 'valid-google-oauth-token',
        params: { placeId: 'place-xyz' },
      },
    });

    const res = await worker.fetch(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      status: 'SUCCESS',
      importedCount: 5,
    });
    // Verifies full reviews payload is NOT leaked in the response
    expect(data.reviews).toBeUndefined();
  });

  test('7. Zero reviews imported returns 200 with { status: "EMPTY_SUCCESS", importedCount: 0 }', async () => {
    jest.spyOn(importEngineModule, 'importProvider').mockResolvedValue({
      status: ImportStatus.EMPTY_SUCCESS,
      importedCount: 0,
      reviews: [],
    });

    const req = createRequest({
      headers: { Authorization: 'Bearer valid-firebase-token' },
      body: {
        provider: 'google',
        params: { placeId: 'place-zero' },
      },
    });

    const res = await worker.fetch(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      status: 'EMPTY_SUCCESS',
      importedCount: 0,
    });
  });

  test('8. Repeated import (deduplicated) returns 200 with importedCount: 0', async () => {
    // When all imported reviews are duplicates, the engine yields EMPTY_SUCCESS
    jest.spyOn(importEngineModule, 'importProvider').mockResolvedValue({
      status: ImportStatus.EMPTY_SUCCESS,
      importedCount: 0,
      reviews: [],
    });

    const req = createRequest({
      headers: { Authorization: 'Bearer valid-firebase-token' },
      body: {
        provider: 'google',
        params: { placeId: 'place-repeat' },
      },
    });

    const res = await worker.fetch(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('EMPTY_SUCCESS');
    expect(data.importedCount).toBe(0);
  });

  test('9. Ownership security: Handler strips client-supplied ownerId and workspaceId before invoking engine', async () => {
    const importSpy = jest.spyOn(importEngineModule, 'importProvider').mockResolvedValue({
      status: ImportStatus.SUCCESS,
      importedCount: 1,
    });

    const req = createRequest({
      headers: { Authorization: 'Bearer valid-firebase-token' },
      body: {
        provider: 'google',
        ownerId: 'attacker-spoofed-owner',
        workspaceId: 'attacker-spoofed-workspace',
        params: {
          placeId: 'place-legit',
          ownerId: 'attacker-spoofed-owner',
          workspaceId: 'attacker-spoofed-workspace',
        },
      },
    });

    await handleImportProvider(req);

    expect(importSpy).toHaveBeenCalledTimes(1);
    const passedRequest = importSpy.mock.calls[0][0];

    // Ownership fields must be completely stripped from params
    expect(passedRequest.params.ownerId).toBeUndefined();
    expect(passedRequest.params.workspaceId).toBeUndefined();
    expect(passedRequest.params.placeId).toBe('place-legit');
    expect(passedRequest.firebaseIdToken).toBe('valid-firebase-token');
  });

  test('10. Sensitive data sanitization: Internal database exceptions are not leaked in HTTP response', async () => {
    jest.spyOn(importEngineModule, 'importProvider').mockResolvedValue({
      status: ImportStatus.FAILED,
      error: 'Firestore connection ECONNREFUSED at service_account.json:23',
    });

    const req = createRequest({
      headers: { Authorization: 'Bearer valid-firebase-token' },
      body: { provider: 'google', params: {} },
    });

    const res = await handleImportProvider(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Import processing encountered a server error. Please try again later.');
    expect(data.error).not.toContain('service_account');
    expect(data.error).not.toContain('ECONNREFUSED');
  });
});
