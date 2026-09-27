import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * HIGH-1 regression test — no fabricated "verified" review data.
 * Fetchers must return empty lists (or throw) on failure. The source files
 * must not contain hardcoded fake reviewer identities.
 */

import {
  fetchGoogleBusinessReviews,
  fetchGooglePlaceReviews,
} from './googleOAuth';
import {
  getInstagramBusinessAccount,
  fetchInstagramCommentsAndMentions,
  extractInstagramPostReview,
} from './instagramOAuth';
import { getFacebookPages, fetchFacebookPageReviews } from './facebookOAuth';

const ENV = { APP_ENCRYPTION_KEY: 'test-key-material' } as any;

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => {
    throw new Error('network down');
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('HIGH-1: fetchers never fabricate data on failure', () => {
  it('fetchGoogleBusinessReviews returns [] when the API is unreachable', async () => {
    const reviews = await fetchGoogleBusinessReviews('token', ENV);
    expect(reviews).toEqual([]);
  });

  it('getFacebookPages returns [] when the Graph API is unreachable', async () => {
    const pages = await getFacebookPages('token');
    expect(pages).toEqual([]);
  });

  it('fetchFacebookPageReviews returns [] when the Graph API is unreachable', async () => {
    const reviews = await fetchFacebookPageReviews('token', 'page_1', ENV);
    expect(reviews).toEqual([]);
  });

  it('fetchInstagramCommentsAndMentions returns [] when the Graph API is unreachable', async () => {
    const reviews = await fetchInstagramCommentsAndMentions('token', 'ig_1', ENV);
    expect(reviews).toEqual([]);
  });

  it('getInstagramBusinessAccount throws instead of returning a fake account', async () => {
    await expect(getInstagramBusinessAccount('token')).rejects.toThrow(/No Instagram Business account/i);
  });

  it('extractInstagramPostReview returns [] for any URL (no fabricated comments)', () => {
    expect(extractInstagramPostReview('https://instagram.com/p/abc123')).toEqual([]);
    expect(extractInstagramPostReview('https://instagram.com/reel/xyz')).toEqual([]);
  });

  it('fetchGooglePlaceReviews throws without GOOGLE_PLACES_API_KEY instead of returning fake reviews', async () => {
    await expect(fetchGooglePlaceReviews('ChIJ12345', ENV)).rejects.toThrow(/GOOGLE_PLACES_API_KEY/);
  });
});

describe('HIGH-1: no hardcoded fake reviewer identities in worker source', () => {
  const FAKE_IDENTITIES = [
    'Sarah Jenkins',
    'Marcus Vance',
    'Elena Rostova',
    'David K. Miller',
    'Amara Patel',
    '@maya.designs',
    '@lucas_growthlab',
    '@elena_saas',
    '@creative_studio_hq',
    '@alexandra.design',
    '@noah.builds',
    'Danielle Cooper',
    'Jeremy Scott',
    'Clara Zhao',
    'Panda Praise Official Page',
    'pandapraise_official',
  ];

  const FILES = [
    'src/worker/lib/googleOAuth.ts',
    'src/worker/lib/instagramOAuth.ts',
    'src/worker/lib/facebookOAuth.ts',
    'src/worker/lib/backgroundSync.ts',
    'src/worker/handlers/googleAuthInit.ts',
    'src/worker/handlers/facebookAuthInit.ts',
    'src/worker/handlers/instagramAuthInit.ts',
    'src/worker/handlers/linkedinAuthInit.ts',
    'src/worker/handlers/googleAuthCallback.ts',
    'src/worker/handlers/facebookAuthCallback.ts',
    'src/worker/handlers/instagramAuthCallback.ts',
    'src/worker/handlers/linkedinAuthCallback.ts',
    'src/worker/handlers/facebookWebhook.ts',
    'src/worker/handlers/instagramFetchMentions.ts',
  ];

  it.each(FILES)('%s contains no fabricated reviewer identities', (file) => {
    const source = readFileSync(resolve(process.cwd(), file), 'utf8');
    for (const identity of FAKE_IDENTITIES) {
      expect(source, `${file} must not contain "${identity}"`).not.toContain(identity);
    }
  });

  it('backgroundSync has no hardcoded demo user list', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/worker/lib/backgroundSync.ts'), 'utf8');
    expect(source).not.toContain('user_demo_gopal');
    // A hardcoded string-array user list is the anti-pattern; dynamic discovery
    // (spread of a Set) is the fix.
    expect(source).not.toMatch(/activeUsers\s*=\s*\[\s*['"]/);
  });
});
