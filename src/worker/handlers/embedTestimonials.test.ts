import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * MEDIUM (embed) regression test — the public embed endpoint authenticates
 * to Firestore with the service account and enforces the projectId filter
 * server-side inside the query.
 */

vi.mock('../lib/firestoreAdmin', () => ({
  getAuthHeader: vi.fn(async () => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer fake-service-account-token',
  })),
}));

import { handleEmbedTestimonials } from './embedTestimonials';
import { getAuthHeader } from '../lib/firestoreAdmin';

const ENV = { FIREBASE_PROJECT_ID: 'test-project' } as any;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function embedGet(query: string) {
  return new Request(`https://worker.dev/api/embed/testimonials?${query}`, { method: 'GET' });
}

describe('MEDIUM: embed endpoint server-side auth and projectId filter', () => {
  it('authenticates the Firestore query with the service account', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as any)));

    const res = await handleEmbedTestimonials(embedGet('projectId=proj_1'), ENV);
    expect(res.status).toBe(200);
    expect(getAuthHeader).toHaveBeenCalledWith(undefined, ENV);

    const fetchCall = (fetch as any).mock.calls[0];
    expect(fetchCall[1].headers.Authorization).toBe('Bearer fake-service-account-token');
  });

  it('filters by projectId inside the structured query (server-side)', async () => {
    let capturedBody: any = null;
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: any) => {
      capturedBody = JSON.parse(init.body);
      return {
        ok: true,
        status: 200,
        json: async () => ([]),
      } as any;
    }));

    const res = await handleEmbedTestimonials(embedGet('projectId=proj_abc&limit=10'), ENV);
    expect(res.status).toBe(200);

    const filters = capturedBody.structuredQuery.where.compositeFilter.filters;
    const projectFilter = filters.find(
      (f: any) => f.fieldFilter.field.fieldPath === 'projectId'
    );
    expect(projectFilter).toBeDefined();
    expect(projectFilter.fieldFilter.value.stringValue).toBe('proj_abc');
    expect(projectFilter.fieldFilter.op).toBe('EQUAL');
  });

  it('requires projectId (400 without it)', async () => {
    const res = await handleEmbedTestimonials(embedGet('limit=10'), ENV);
    expect(res.status).toBe(400);
  });
});
