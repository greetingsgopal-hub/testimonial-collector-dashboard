import { describe, it, expect, vi } from 'vitest';
import {
  parseRedditSearchJson,
  parseHnAlgoliaHits,
  parseGoogleNewsRss,
  classifyMentionsHeuristic,
  handleRadarScan,
  ScrapedRawMention,
} from './radarHandler';
import { WorkerEnv } from '../types';

describe('Radar Multi-Source Scraper & Classifier', () => {
  describe('parseRedditSearchJson', () => {
    it('extracts valid mentions from Reddit JSON response', () => {
      const mockPayload = {
        data: {
          children: [
            {
              data: {
                id: 't3_abc123',
                title: 'Switched to PandaPraise and love it',
                selftext: 'The best review tool we have used so far.',
                author: 'indie_dev_42',
                permalink: '/r/SaaS/comments/abc123/switched_to_pandapraise',
                created_utc: 1700000000,
              },
            },
          ],
        },
      };

      const result = parseRedditSearchJson(mockPayload, 'PandaPraise', false);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        externalId: 'reddit-t3_abc123',
        source: 'Reddit',
        targetKeyword: 'PandaPraise',
        isCompetitor: false,
        author: 'u/indie_dev_42',
        title: 'Switched to PandaPraise and love it',
        rawText: 'Switched to PandaPraise and love it. The best review tool we have used so far.',
        sourceUrl: 'https://reddit.com/r/SaaS/comments/abc123/switched_to_pandapraise',
      });
    });

    it('returns empty array on malformed or empty data', () => {
      expect(parseRedditSearchJson(null, 'test', false)).toEqual([]);
      expect(parseRedditSearchJson({}, 'test', false)).toEqual([]);
    });
  });

  describe('parseHnAlgoliaHits', () => {
    it('extracts valid mentions from Hacker News Algolia response', () => {
      const mockPayload = {
        hits: [
          {
            objectID: 'hn_98765',
            author: 'techfounder',
            title: 'Senja is getting too expensive for small startups',
            comment_text: 'Anyone know an alternative? The pricing jumped 3x.',
            story_id: 98765,
          },
        ],
      };

      const result = parseHnAlgoliaHits(mockPayload, 'Senja', true);
      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('HackerNews');
      expect(result[0].isCompetitor).toBe(true);
      expect(result[0].author).toBe('techfounder');
      expect(result[0].sourceUrl).toBe('https://news.ycombinator.com/item?id=98765');
      expect(result[0].rawText).toContain('pricing jumped 3x');
    });

    it('handles HTML entities or tags safely in comment_text', () => {
      const mockPayload = {
        hits: [
          {
            objectID: 'hn_111',
            author: 'coder',
            comment_text: 'We &lt;love&gt; PandaPraise! Fast &amp; reliable.',
          },
        ],
      };
      const result = parseHnAlgoliaHits(mockPayload, 'PandaPraise', false);
      expect(result[0].rawText).toBe('We <love> PandaPraise! Fast & reliable.');
    });
  });

  describe('parseGoogleNewsRss', () => {
    it('extracts items from Google News RSS XML string using regex', () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Google News</title>
          <item>
            <title>CompetitorX users frustrated with new restrictions - TechPulse</title>
            <link>https://news.google.com/articles/CAIiE12345</link>
            <pubDate>Mon, 19 Oct 2026 12:00:00 GMT</pubDate>
            <description>Users are reporting frequent outages and pricing hikes.</description>
          </item>
        </channel>
      </rss>`;

      const result = parseGoogleNewsRss(sampleXml, 'CompetitorX', true);
      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('GoogleNews');
      expect(result[0].isCompetitor).toBe(true);
      expect(result[0].sourceUrl).toBe('https://news.google.com/articles/CAIiE12345');
      expect(result[0].rawText).toContain('Users are reporting frequent outages');
    });

    it('returns empty array when XML is empty or missing items', () => {
      expect(parseGoogleNewsRss('', 'keyword', false)).toEqual([]);
      expect(parseGoogleNewsRss('<channel></channel>', 'keyword', false)).toEqual([]);
    });
  });

  describe('classifyMentionsHeuristic', () => {
    it('classifies competitor frustration as POACHABLE_LEAD with reply script', () => {
      const rawMentions: ScrapedRawMention[] = [
        {
          externalId: 'test-1',
          source: 'HackerNews',
          targetKeyword: 'Senja',
          isCompetitor: true,
          author: 'frustrated_buyer',
          title: 'Senja is too expensive',
          rawText: 'Looking for a Senja alternative. The pricing is crazy high and support is slow.',
          sourceUrl: 'https://news.ycombinator.com/item?id=123',
        },
      ];

      const classified = classifyMentionsHeuristic(rawMentions, 'PandaPraise', 'Senja');
      expect(classified).toHaveLength(1);
      expect(classified[0].category).toBe('POACHABLE_LEAD');
      expect(classified[0].urgencyScore).toBeGreaterThanOrEqual(8);
      expect(classified[0].aiPoachReply).toBeDefined();
      expect(classified[0].aiPoachReply).toContain('PandaPraise');
    });

    it('classifies brand positive mentions as PRAISE', () => {
      const rawMentions: ScrapedRawMention[] = [
        {
          externalId: 'test-2',
          source: 'Reddit',
          targetKeyword: 'PandaPraise',
          isCompetitor: false,
          author: 'u/happy_customer',
          title: 'Love PandaPraise',
          rawText: 'PandaPraise is awesome, saved our team 10 hours a week!',
          sourceUrl: 'https://reddit.com/r/SaaS/123',
        },
      ];

      const classified = classifyMentionsHeuristic(rawMentions, 'PandaPraise', undefined);
      expect(classified).toHaveLength(1);
      expect(classified[0].category).toBe('PRAISE');
      expect(classified[0].cleanQuote).toContain('awesome');
    });

    it('classifies brand negative mentions as FIRE_ALERT', () => {
      const rawMentions: ScrapedRawMention[] = [
        {
          externalId: 'test-3',
          source: 'Reddit',
          targetKeyword: 'PandaPraise',
          isCompetitor: false,
          author: 'u/unhappy',
          title: 'PandaPraise bug',
          rawText: 'PandaPraise form is broken and slow today. Anyone else having this issue?',
          sourceUrl: 'https://reddit.com/r/SaaS/456',
        },
      ];

      const classified = classifyMentionsHeuristic(rawMentions, 'PandaPraise', undefined);
      expect(classified).toHaveLength(1);
      expect(classified[0].category).toBe('FIRE_ALERT');
    });
  });

  describe('handleRadarScan API endpoint', () => {
    it('returns 400 when brand keyword is missing', async () => {
      const req = new Request('https://api.pandapraise.com/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const env = {} as WorkerEnv;
      const res = await handleRadarScan(req, env);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Brand keyword is required');
    });

    it('successfully processes scan request with mock fetch', async () => {
      // Mock global fetch to return sample Reddit, HN, and Google News data
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockImplementation((url: string | URL) => {
        const urlStr = url.toString();
        if (urlStr.includes('reddit.com')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                data: {
                  children: [
                    {
                      data: {
                        id: 'red_1',
                        title: 'PandaPraise is the best tool',
                        selftext: 'Highly recommend it to any founder.',
                        author: 'growth_guru',
                        permalink: '/r/growth/red_1',
                      },
                    },
                  ],
                },
              }),
              { status: 200 }
            )
          );
        }
        if (urlStr.includes('algolia.com')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                hits: [
                  {
                    objectID: 'hn_2',
                    author: 'saas_guy',
                    comment_text: 'Senja pricing is ridiculous, switching to an alternative.',
                  },
                ],
              }),
              { status: 200 }
            )
          );
        }
        if (urlStr.includes('news.google.com')) {
          return Promise.resolve(
            new Response(
              `<?xml version="1.0"?><rss><channel><item><title>PandaPraise raises standard for reviews</title><link>https://news.google.com/1</link><pubDate>Now</pubDate></item></channel></rss>`,
              { status: 200 }
            )
          );
        }
        return Promise.reject(new Error('Unknown url'));
      });

      try {
        const req = new Request('https://api.pandapraise.com/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brand: 'PandaPraise',
            competitor: 'Senja',
          }),
        });

        const env = {} as WorkerEnv;
        const res = await handleRadarScan(req, env);
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.brand).toBe('PandaPraise');
        expect(data.competitor).toBe('Senja');
        expect(data.mentions).toBeInstanceOf(Array);
        expect(data.mentions.length).toBeGreaterThan(0);
        expect(data.summary).toBeDefined();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
