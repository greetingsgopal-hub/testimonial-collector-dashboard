import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectPlatform, resolveReviewsFromPublicUrl } from '../lib/universalExtractor';
import { handleUniversalUrlResolve, handleUniversalReviewsCommit } from './universalImportHandler';

vi.mock('../lib/firebaseAuth', () => ({
  extractBearerToken: vi.fn((header) => (header?.includes('valid') ? 'valid_token' : null)),
  verifyFirebaseToken: vi.fn(async (token) => (token === 'valid_token' ? { uid: 'user_123', email: 'user@example.com' } : null)),
}));

vi.mock('../lib/firestoreAdmin', () => ({
  saveDocument: vi.fn(async () => {}),
  queryUserDocuments: vi.fn(async (col) => (col === 'projects' ? [{ id: 'proj_abc' }] : [{ id: 'ws_123' }])),
}));

describe('Universal Zero-Auth Review Import System', () => {
  describe('detectPlatform', () => {
    it('detects platforms accurately from URLs', () => {
      expect(detectPlatform('https://www.facebook.com/PandaPraise')).toBe('facebook');
      expect(detectPlatform('https://www.facebook.com/PandaPraise/reviews')).toBe('facebook');
      expect(detectPlatform('https://www.trustpilot.com/review/pandapraise.com')).toBe('trustpilot');
      expect(detectPlatform('https://maps.google.com/?cid=12345')).toBe('google');
      expect(detectPlatform('https://apps.apple.com/us/app/slack/id618783545')).toBe('appstore');
      expect(detectPlatform('https://play.google.com/store/apps/details?id=com.slack')).toBe('playstore');
      expect(detectPlatform('https://www.producthunt.com/products/pandapraise/reviews')).toBe('producthunt');
      expect(detectPlatform('https://www.g2.com/products/pandapraise/reviews')).toBe('g2');
      expect(detectPlatform('https://www.capterra.com/p/12345/PandaPraise')).toBe('capterra');
      expect(detectPlatform('https://www.yelp.com/biz/joes-pizza-new-york')).toBe('yelp');
      expect(detectPlatform('https://custom-company.com/testimonials')).toBe('web');
    });
  });

  describe('handleUniversalUrlResolve', () => {
    const env: any = {};

    it('returns 401 when Authorization header is missing', async () => {
      const req = new Request('https://pandapraise.com/api/import/resolve-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://trustpilot.com/review/google.com' }),
      });
      const res = await handleUniversalUrlResolve(req, env);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Authentication required.');
    });

    it('returns 400 when url is missing', async () => {
      const req = new Request('https://pandapraise.com/api/import/resolve-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid_token',
        },
        body: JSON.stringify({}),
      });
      const res = await handleUniversalUrlResolve(req, env);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('valid review page');
    });

    it('extracts public App Store reviews from public iTunes feed without OAuth', async () => {
      const fakeFeed = {
        feed: {
          entry: [
            {
              'im:name': { label: 'Slack' },
              'im:image': [{ label: 'https://example.com/icon.png' }],
            },
            {
              author: { name: { label: 'Alice' } },
              'im:rating': { label: '5' },
              title: { label: 'Must have team tool' },
              content: { label: 'Transformed our daily collaboration.' },
              id: { label: 'rev_99' },
              updated: { label: '2026-09-01T12:00:00Z' },
            },
          ],
        },
      };

      const originalFetch = global.fetch;
      global.fetch = vi.fn(async (url: any) => {
        if (typeof url === 'string' && url.includes('itunes.apple.com')) {
          return new Response(JSON.stringify(fakeFeed), { status: 200 });
        }
        return originalFetch(url);
      }) as any;

      try {
        const req = new Request('https://pandapraise.com/api/import/resolve-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid_token',
          },
          body: JSON.stringify({ url: 'https://apps.apple.com/us/app/slack/id618783545' }),
        });
        const res = await handleUniversalUrlResolve(req, env);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.platform).toBe('appstore');
        expect(data.entity.name).toBe('Slack');
        expect(data.reviews.length).toBe(1);
        expect(data.reviews[0].authorName).toBe('Alice');
        expect(data.reviews[0].rating).toBe(5);
        expect(data.reviews[0].text).toContain('Transformed our daily collaboration.');
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('extracts Trustpilot public reviews from JSON-LD schema without OAuth', async () => {
      const fakeHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Acme Inc Reviews | Trustpilot</title>
          <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Acme Inc",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "120"
            },
            "review": [
              {
                "@type": "Review",
                "author": { "@type": "Person", "name": "Bob Smith" },
                "reviewRating": { "@type": "Rating", "ratingValue": "5" },
                "headline": "Outstanding product",
                "reviewBody": "Fast shipping and amazing customer support.",
                "datePublished": "2026-08-15"
              }
            ]
          }
          </script>
        </head>
        <body></body>
        </html>
      `;

      const originalFetch = global.fetch;
      global.fetch = vi.fn(async (url: any) => {
        if (typeof url === 'string' && url.includes('trustpilot.com')) {
          return new Response(fakeHtml, { status: 200, headers: { 'content-type': 'text/html' } });
        }
        return originalFetch(url);
      }) as any;

      try {
        const req = new Request('https://pandapraise.com/api/import/resolve-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer valid_token',
          },
          body: JSON.stringify({ url: 'https://www.trustpilot.com/review/acme.com' }),
        });
        const res = await handleUniversalUrlResolve(req, env);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.platform).toBe('trustpilot');
        expect(data.entity.name).toBe('Acme Inc');
        expect(data.reviews.length).toBe(1);
        expect(data.reviews[0].authorName).toBe('Bob Smith');
        expect(data.reviews[0].rating).toBe(5);
        expect(data.reviews[0].text).toContain('Fast shipping');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('handleUniversalReviewsCommit', () => {
    const env: any = {};

    it('returns 400 when no reviews are provided to commit', async () => {
      const req = new Request('https://pandapraise.com/api/import/commit-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid_token',
        },
        body: JSON.stringify({ reviews: [] }),
      });
      const res = await handleUniversalReviewsCommit(req, env);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('No reviews selected for import.');
    });

    it('saves selected reviews to canonical store', async () => {
      const reviews = [
        {
          id: 'test_1',
          authorName: 'Charlie',
          rating: 5,
          text: 'Super happy customer!',
          date: '2026-09-20T00:00:00Z',
          source: 'facebook',
          platformUrl: 'https://facebook.com/mypage',
        },
      ];

      const req = new Request('https://pandapraise.com/api/import/commit-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer valid_token',
        },
        body: JSON.stringify({
          platform: 'facebook',
          projectId: 'proj_abc',
          reviews,
        }),
      });

      const res = await handleUniversalReviewsCommit(req, env);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.importedCount).toBe(1);
      expect(data.reviews[0].name).toBe('Charlie');
      expect(data.reviews[0].rating).toBe(5);
      expect(data.reviews[0].source).toBe('facebook');
      expect(data.reviews[0].status).toBe('approved');
    });
  });
});
