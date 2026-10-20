import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';

export type MentionCategory = 'PRAISE' | 'POACHABLE_LEAD' | 'FIRE_ALERT' | 'NOISE';

export interface ScrapedRawMention {
  externalId: string;
  source: 'Reddit' | 'HackerNews' | 'GoogleNews' | 'Web';
  targetKeyword: string;
  isCompetitor: boolean;
  author: string;
  title?: string;
  rawText: string;
  sourceUrl: string;
}

export interface ClassifiedMention extends ScrapedRawMention {
  category: MentionCategory;
  urgencyScore: number;
  cleanQuote: string;
  aiPoachReply?: string;
}

export interface RadarScanRequest {
  brand: string;
  competitor?: string;
}

export interface RadarScanResponse {
  brand: string;
  competitor?: string;
  mentions: ClassifiedMention[];
  summary: {
    total: number;
    praiseCount: number;
    poachableLeadsCount: number;
    fireAlertsCount: number;
    noiseCount: number;
  };
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(str: string): string {
  if (!str) return '';
  return decodeHtmlEntities(str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

/**
 * Parses Reddit JSON search response
 */
export function parseRedditSearchJson(
  data: any,
  keyword: string,
  isCompetitor: boolean
): ScrapedRawMention[] {
  if (!data?.data?.children || !Array.isArray(data.data.children)) {
    return [];
  }

  const results: ScrapedRawMention[] = [];
  for (const item of data.data.children) {
    const post = item?.data;
    if (!post || !post.id) continue;

    const title = post.title ? stripHtml(post.title) : '';
    const selftext = post.selftext ? stripHtml(post.selftext) : '';
    const rawText = title && selftext ? `${title}. ${selftext}` : title || selftext || '';
    if (!rawText.trim()) continue;

    const author = post.author && post.author !== '[deleted]' ? `u/${post.author}` : 'Reddit User';
    const sourceUrl = post.permalink
      ? post.permalink.startsWith('http')
        ? post.permalink
        : `https://reddit.com${post.permalink}`
      : 'https://reddit.com';

    results.push({
      externalId: `reddit-${post.id}`,
      source: 'Reddit',
      targetKeyword: keyword,
      isCompetitor,
      author,
      title,
      rawText,
      sourceUrl,
    });
  }

  return results;
}

/**
 * Parses Hacker News Algolia API response
 */
export function parseHnAlgoliaHits(
  data: any,
  keyword: string,
  isCompetitor: boolean
): ScrapedRawMention[] {
  if (!data?.hits || !Array.isArray(data.hits)) {
    return [];
  }

  const results: ScrapedRawMention[] = [];
  for (const hit of data.hits) {
    if (!hit || !hit.objectID) continue;

    const title = hit.title ? stripHtml(hit.title) : '';
    const comment = hit.comment_text ? stripHtml(hit.comment_text) : '';
    const storyText = hit.story_text ? stripHtml(hit.story_text) : '';
    const rawText = [title, comment, storyText].filter(Boolean).join('. ');
    if (!rawText.trim()) continue;

    const author = hit.author || 'HN User';
    const storyId = hit.story_id || hit.objectID;
    const sourceUrl = `https://news.ycombinator.com/item?id=${storyId}`;

    results.push({
      externalId: `hn-${hit.objectID}`,
      source: 'HackerNews',
      targetKeyword: keyword,
      isCompetitor,
      author,
      title: title || undefined,
      rawText,
      sourceUrl,
    });
  }

  return results;
}

/**
 * Parses Google News RSS XML string using regex without heavy DOM dependencies
 */
export function parseGoogleNewsRss(
  xmlText: string,
  keyword: string,
  isCompetitor: boolean
): ScrapedRawMention[] {
  if (!xmlText || typeof xmlText !== 'string') {
    return [];
  }

  const results: ScrapedRawMention[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    const titleMatch = /<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i.exec(itemContent);
    const linkMatch = /<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i.exec(itemContent);
    const descMatch = /<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i.exec(itemContent);

    const title = titleMatch ? stripHtml(titleMatch[1]) : '';
    const link = linkMatch ? stripHtml(linkMatch[1]) : '';
    const desc = descMatch ? stripHtml(descMatch[1]) : '';

    const rawText = [title, desc].filter(Boolean).join('. ');
    if (!rawText.trim() || !link) continue;

    // Use hash or encoded link as unique ID
    const cleanId = Buffer.from(link).toString('base64').substring(0, 16);

    results.push({
      externalId: `gnews-${cleanId}`,
      source: 'GoogleNews',
      targetKeyword: keyword,
      isCompetitor,
      author: 'Public Web Review',
      title: title || undefined,
      rawText,
      sourceUrl: link,
    });
  }

  return results;
}

/**
 * Free Multi-Source Scrapers
 */
export async function fetchRedditMentions(keyword: string, isCompetitor: boolean): Promise<ScrapedRawMention[]> {
  try {
    const encoded = encodeURIComponent(`"${keyword}"`);
    const url = `https://www.reddit.com/search.json?q=${encoded}&sort=new&limit=8`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PandaPraiseBot/2.0; +https://pandapraise.com)',
        Accept: 'application/json',
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return parseRedditSearchJson(data, keyword, isCompetitor);
  } catch {
    return [];
  }
}

export async function fetchHackerNewsMentions(keyword: string, isCompetitor: boolean): Promise<ScrapedRawMention[]> {
  try {
    const encoded = encodeURIComponent(`"${keyword}"`);
    const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encoded}&tags=(story,comment)&hitsPerPage=8`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return parseHnAlgoliaHits(data, keyword, isCompetitor);
  } catch {
    return [];
  }
}

export async function fetchGoogleNewsMentions(keyword: string, isCompetitor: boolean): Promise<ScrapedRawMention[]> {
  try {
    const encoded = encodeURIComponent(`"${keyword}"`);
    const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
    const res = await fetch(url, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseGoogleNewsRss(xml, keyword, isCompetitor);
  } catch {
    return [];
  }
}

/**
 * Deterministic In-Worker Heuristic Classifier
 * Guarantees 100% uptime without external API failures
 */
export function classifyMentionsHeuristic(
  rawMentions: ScrapedRawMention[],
  brand: string,
  competitor?: string
): ClassifiedMention[] {
  const negativeTriggers = [
    'expensive',
    'pricing',
    'price',
    'broken',
    'bug',
    'buggy',
    'down',
    'slow',
    'hate',
    'sucks',
    'terrible',
    'awful',
    'alternative',
    'switch',
    'switched from',
    'migrating',
    'leaving',
    'cancel',
    'cancelled',
    'support is bad',
    'clunky',
  ];

  const positiveTriggers = [
    'love',
    'loved',
    'awesome',
    'great',
    'fast',
    'best',
    'switched to',
    'amazing',
    'saved',
    'gamechanger',
    'recommend',
    'super easy',
    'clean',
    'favorite',
    'top notch',
    '10/10',
  ];

  return rawMentions.map((m) => {
    const lower = m.rawText.toLowerCase();
    const hasNegative = negativeTriggers.some((t) => lower.includes(t));
    const hasPositive = positiveTriggers.some((t) => lower.includes(t));

    let category: MentionCategory = 'NOISE';
    let urgencyScore = 3;
    let aiPoachReply: string | undefined = undefined;

    if (m.isCompetitor) {
      if (hasNegative) {
        category = 'POACHABLE_LEAD';
        urgencyScore = 9;
        const compName = competitor || m.targetKeyword;
        aiPoachReply = `Hey @${m.author}! Saw your note about ${compName}'s pricing/issues. We built ${brand} specifically for teams tired of hostage fees. You can harvest authentic social proof and competitor leads with zero monthly fees. Happy to set you up with VIP onboarding if you'd like!`;
      } else if (hasPositive) {
        category = 'NOISE';
        urgencyScore = 2;
      }
    } else {
      if (hasPositive) {
        category = 'PRAISE';
        urgencyScore = 8;
      } else if (hasNegative) {
        category = 'FIRE_ALERT';
        urgencyScore = 9;
      }
    }

    // Generate a punchy clean quote (up to 160 chars)
    let cleanQuote = m.rawText.split(/[.!?]\s+/)[0] || m.rawText;
    if (cleanQuote.length > 180) {
      cleanQuote = cleanQuote.substring(0, 177) + '...';
    }

    return {
      ...m,
      category,
      urgencyScore,
      cleanQuote,
      aiPoachReply,
    };
  });
}

/**
 * Gemini 2.5 Flash Batch Classification
 */
export async function classifyMentionsWithGemini(
  rawMentions: ScrapedRawMention[],
  brand: string,
  competitor?: string,
  apiKey?: string
): Promise<ClassifiedMention[]> {
  if (!apiKey || rawMentions.length === 0) {
    return classifyMentionsHeuristic(rawMentions, brand, competitor);
  }

  try {
    const prompt = `You are an expert growth marketer and customer intelligence classifier.
Brand: "${brand}"
Competitor: "${competitor || 'None'}"

Classify each mention below into exactly one category:
- PRAISE: Positive shoutout or testimonial for "${brand}".
- POACHABLE_LEAD: Customer complaining about "${competitor}", asking for alternatives, or frustrated with pricing/features.
- FIRE_ALERT: Negative feedback, bug report, or outage complaint about "${brand}".
- NOISE: Irrelevant, neutral, or unhelpful mention.

For each mention, return:
- id: matching externalId
- category: PRAISE | POACHABLE_LEAD | FIRE_ALERT | NOISE
- urgencyScore: integer 1-10
- cleanQuote: crisp, high-impact 1-2 sentence snippet
- aiPoachReply: (only if POACHABLE_LEAD) a friendly, non-spammy founder reply positioning "${brand}" as the ideal alternative.

Mentions to classify:
${JSON.stringify(
  rawMentions.map((m) => ({
    id: m.externalId,
    targetKeyword: m.targetKeyword,
    isCompetitor: m.isCompetitor,
    author: m.author,
    text: m.rawText,
  })),
  null,
  2
)}

Return ONLY valid JSON matching this schema:
[
  {
    "id": "externalId",
    "category": "PRAISE",
    "urgencyScore": 8,
    "cleanQuote": "...",
    "aiPoachReply": "..."
  }
]`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      return classifyMentionsHeuristic(rawMentions, brand, competitor);
    }

    const jsonResponse = await response.json();
    const candidateText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return classifyMentionsHeuristic(rawMentions, brand, competitor);
    }

    const parsedArray = JSON.parse(candidateText);
    if (!Array.isArray(parsedArray)) {
      return classifyMentionsHeuristic(rawMentions, brand, competitor);
    }

    const classificationMap = new Map<string, any>();
    for (const item of parsedArray) {
      if (item && item.id) {
        classificationMap.set(item.id, item);
      }
    }

    return rawMentions.map((m) => {
      const aiData = classificationMap.get(m.externalId);
      if (aiData && ['PRAISE', 'POACHABLE_LEAD', 'FIRE_ALERT', 'NOISE'].includes(aiData.category)) {
        return {
          ...m,
          category: aiData.category as MentionCategory,
          urgencyScore: typeof aiData.urgencyScore === 'number' ? aiData.urgencyScore : 5,
          cleanQuote: aiData.cleanQuote || m.rawText.substring(0, 160),
          aiPoachReply: aiData.aiPoachReply,
        };
      }
      // Fallback individual item to heuristic
      return classifyMentionsHeuristic([m], brand, competitor)[0];
    });
  } catch {
    return classifyMentionsHeuristic(rawMentions, brand, competitor);
  }
}

/**
 * Handle POST /api/scan or /api/radar/scan
 */
export async function handleRadarScan(request: Request, env: WorkerEnv): Promise<Response> {
  const cors = getCorsHeaders(request);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  let body: RadarScanRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body.' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const brand = body.brand?.trim();
  const competitor = body.competitor?.trim();

  if (!brand) {
    return new Response(JSON.stringify({ error: 'Brand keyword is required.' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  // 1. Fetch mentions in parallel across Reddit, HN, and Google News RSS
  const fetchTasks: Promise<ScrapedRawMention[]>[] = [
    fetchRedditMentions(brand, false),
    fetchHackerNewsMentions(brand, false),
    fetchGoogleNewsMentions(brand, false),
  ];

  if (competitor) {
    fetchTasks.push(
      fetchRedditMentions(competitor, true),
      fetchHackerNewsMentions(competitor, true),
      fetchGoogleNewsMentions(competitor, true)
    );
  }

  const settled = await Promise.allSettled(fetchTasks);
  const allRawMentions: ScrapedRawMention[] = [];
  const seenIds = new Set<string>();

  for (const res of settled) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      for (const item of res.value) {
        if (!seenIds.has(item.externalId)) {
          seenIds.add(item.externalId);
          allRawMentions.push(item);
        }
      }
    }
  }

  // 2. Classify mentions using Gemini Flash or fallback
  const classified = await classifyMentionsWithGemini(
    allRawMentions,
    brand,
    competitor,
    env.GEMINI_API_KEY
  );

  // 3. Compute summary statistics
  const praiseCount = classified.filter((m) => m.category === 'PRAISE').length;
  const poachableLeadsCount = classified.filter((m) => m.category === 'POACHABLE_LEAD').length;
  const fireAlertsCount = classified.filter((m) => m.category === 'FIRE_ALERT').length;
  const noiseCount = classified.filter((m) => m.category === 'NOISE').length;

  const responsePayload: RadarScanResponse = {
    brand,
    competitor,
    mentions: classified,
    summary: {
      total: classified.length,
      praiseCount,
      poachableLeadsCount,
      fireAlertsCount,
      noiseCount,
    },
  };

  return new Response(JSON.stringify(responsePayload), {
    status: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
