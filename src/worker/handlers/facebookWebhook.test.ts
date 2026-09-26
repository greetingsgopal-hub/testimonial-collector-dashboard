import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { handleFacebookWebhook } from './facebookWebhook';

/**
 * C2 regression test — Meta webhook authentication.
 * POSTs must carry a valid X-Hub-Signature-256 (HMAC-SHA256 of the exact
 * raw body with META_APP_SECRET). Missing/invalid signatures get 401.
 * Fails closed when secrets are not configured.
 */

const APP_SECRET = 'test-meta-app-secret';
const VERIFY_TOKEN = 'test-verify-token-2026';

const ENV = {
  META_APP_SECRET: APP_SECRET,
  META_WEBHOOK_VERIFY_TOKEN: VERIFY_TOKEN,
} as any;

const NO_SECRET_ENV = {
  META_WEBHOOK_VERIFY_TOKEN: VERIFY_TOKEN,
} as any;

const NO_TOKEN_ENV = {
  META_APP_SECRET: APP_SECRET,
} as any;

const VALID_PAYLOAD = JSON.stringify({
  object: 'page',
  entry: [
    {
      id: 'page_123',
      changes: [
        {
          field: 'ratings',
          value: {
            review_id: 'rev_1',
            reviewer_name: 'Test Reviewer',
            rating: 5,
            review_text: 'Great service, highly recommended!',
            created_time: 1727000000,
          },
        },
      ],
    },
  ],
});

function sign(body: string, secret: string = APP_SECRET): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
}

function webhookPost(body: string, headers: Record<string, string> = {}) {
  return new Request('https://worker.dev/api/webhook/facebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
}

// Mock Firestore so tests assert on calls without touching real infrastructure
vi.mock('../lib/firestoreAdmin', () => ({
  saveDocument: vi.fn().mockResolvedValue(undefined),
}));

import { saveDocument } from '../lib/firestoreAdmin';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('C2: Meta webhook signature verification (POST)', () => {
  it('rejects POST without X-Hub-Signature-256 with 401 and writes nothing', async () => {
    const res = await handleFacebookWebhook(webhookPost(VALID_PAYLOAD), ENV);
    expect(res.status).toBe(401);
    expect(saveDocument).not.toHaveBeenCalled();
  });

  it('rejects POST with a signature computed over a different body with 401', async () => {
    const res = await handleFacebookWebhook(
      webhookPost(VALID_PAYLOAD, { 'X-Hub-Signature-256': sign('{"object":"page"}') }),
      ENV
    );
    expect(res.status).toBe(401);
    expect(saveDocument).not.toHaveBeenCalled();
  });

  it('rejects POST with wrong secret in signature with 401', async () => {
    const res = await handleFacebookWebhook(
      webhookPost(VALID_PAYLOAD, { 'X-Hub-Signature-256': sign(VALID_PAYLOAD, 'attacker-secret') }),
      ENV
    );
    expect(res.status).toBe(401);
    expect(saveDocument).not.toHaveBeenCalled();
  });

  it('rejects malformed signature values with 401', async () => {
    const badSignatures = [
      'sha256=', // empty
      'sha256=zzzz', // not hex
      'sha256=deadbeef', // wrong length
      'md5=abc123', // wrong prefix
      sign(VALID_PAYLOAD).slice(7), // missing prefix
    ];
    for (const sig of badSignatures) {
      const res = await handleFacebookWebhook(
        webhookPost(VALID_PAYLOAD, { 'X-Hub-Signature-256': sig }),
        ENV
      );
      expect(res.status).toBe(401);
    }
    expect(saveDocument).not.toHaveBeenCalled();
  });

  it('fails closed when META_APP_SECRET is not configured (401 even with valid-looking signature)', async () => {
    // Attacker cannot produce a valid signature without the secret, but the
    // handler must not process anything when the secret is unset — even a
    // signature that would validate against some other key.
    const res = await handleFacebookWebhook(
      webhookPost(VALID_PAYLOAD, { 'X-Hub-Signature-256': sign(VALID_PAYLOAD) }),
      NO_SECRET_ENV
    );
    expect(res.status).toBe(401);
    expect(saveDocument).not.toHaveBeenCalled();
  });

  it('accepts POST with correct HMAC over the exact raw body and writes the testimonial', async () => {
    const res = await handleFacebookWebhook(
      webhookPost(VALID_PAYLOAD, { 'X-Hub-Signature-256': sign(VALID_PAYLOAD) }),
      ENV
    );
    expect(res.status).toBe(200);
    expect(saveDocument).toHaveBeenCalledTimes(1);
    const [collection, docId, doc] = (saveDocument as any).mock.calls[0];
    expect(collection).toBe('testimonials');
    expect(docId).toBe('fb_webhook_rev_1');
    expect(doc.text).toBe('Great service, highly recommended!');
    expect(doc.verified).toBe(true);
    expect(doc.status).toBe('approved');
  });

  it('uses timingSafeEqual for comparison (not string equality)', async () => {
    const spy = vi.spyOn(crypto, 'timingSafeEqual');
    await handleFacebookWebhook(
      webhookPost(VALID_PAYLOAD, { 'X-Hub-Signature-256': sign(VALID_PAYLOAD) }),
      ENV
    );
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('C2: Meta webhook subscription verification (GET)', () => {
  it('echoes the challenge when mode, token, and configured verify token all match', async () => {
    const res = await handleFacebookWebhook(
      new Request(
        'https://worker.dev/api/webhook/facebook?hub.mode=subscribe&hub.verify_token=' +
          VERIFY_TOKEN +
          '&hub.challenge=CHALLENGE_12345'
      ),
      ENV
    );
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('CHALLENGE_12345');
  });

  it('rejects verification with wrong token with 403', async () => {
    const res = await handleFacebookWebhook(
      new Request(
        'https://worker.dev/api/webhook/facebook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=CHALLENGE_12345'
      ),
      ENV
    );
    expect(res.status).toBe(403);
  });

  it('fails closed when META_WEBHOOK_VERIFY_TOKEN is not configured (403, hardcoded fallback gone)', async () => {
    // The old hardcoded fallback 'pandapraise_meta_verify_token_2026' must no longer work
    const res = await handleFacebookWebhook(
      new Request(
        'https://worker.dev/api/webhook/facebook?hub.mode=subscribe&hub.verify_token=pandapraise_meta_verify_token_2026&hub.challenge=CHALLENGE_12345'
      ),
      NO_TOKEN_ENV
    );
    expect(res.status).toBe(403);
  });
});
