/**
 * AI Sentiment Analysis — Analyzes testimonial text for sentiment polarity,
 * emotion, key topics, and generates a summary.
 *
 * In production, this would call an AI API (OpenAI, Claude, etc.).
 * For now, we use a rule-based heuristic that's surprisingly effective.
 */
import { Review, SentimentResult } from '../types';

// ── Word lists for sentiment scoring ────────────────────────
const POSITIVE_WORDS = new Set([
  'amazing', 'awesome', 'best', 'brilliant', 'excellent', 'exceptional', 'fantastic',
  'great', 'incredible', 'love', 'loved', 'outstanding', 'perfect', 'phenomenal',
  'recommend', 'superb', 'terrific', 'wonderful', 'delighted', 'impressed',
  'smooth', 'easy', 'fast', 'helpful', 'friendly', 'professional', 'reliable',
  'intuitive', 'beautiful', 'elegant', 'powerful', 'seamless', 'efficient',
  'game-changer', 'innovative', 'revolutionary', 'transformed', 'exceeded',
  'pleased', 'happy', 'satisfied', 'grateful', 'thankful', 'trust', 'enjoy',
  'favorite', 'favourite', 'top-notch', 'world-class', 'must-have', 'essential',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'horrible', 'awful', 'poor', 'worst', 'disappointing',
  'frustrated', 'frustrating', 'slow', 'buggy', 'broken', 'useless', 'waste',
  'confusing', 'complicated', 'difficult', 'annoying', 'unreliable', 'expensive',
  'lacking', 'missing', 'problem', 'issue', 'error', 'crash', 'fail', 'failed',
  'hate', 'dislike', 'regret', 'unfortunately', 'downgrade', 'mediocre',
]);

const EMOTION_KEYWORDS: Record<string, string[]> = {
  joy: ['happy', 'love', 'amazing', 'delighted', 'thrilled', 'excited', 'wonderful', 'fantastic', 'awesome'],
  trust: ['reliable', 'trust', 'professional', 'consistent', 'dependable', 'secure', 'safe', 'confident'],
  gratitude: ['thankful', 'grateful', 'appreciate', 'thanks', 'thank', 'blessing'],
  surprise: ['surprised', 'unexpected', 'blown away', 'exceeded', 'wow', 'incredible', 'unbelievable'],
  frustration: ['frustrated', 'annoying', 'confusing', 'complicated', 'difficult', 'struggle'],
};

const TOPIC_KEYWORDS: Record<string, string[]> = {
  'Customer Support': ['support', 'help', 'team', 'response', 'service', 'customer service', 'assistance'],
  'Product Quality': ['quality', 'product', 'feature', 'features', 'functionality', 'performance'],
  'Ease of Use': ['easy', 'simple', 'intuitive', 'user-friendly', 'straightforward', 'seamless'],
  'Value for Money': ['price', 'value', 'worth', 'affordable', 'cost', 'money', 'investment', 'roi'],
  'Speed & Performance': ['fast', 'quick', 'speed', 'performance', 'efficient', 'responsive'],
  'Design & UX': ['design', 'beautiful', 'clean', 'ui', 'ux', 'interface', 'look', 'modern'],
  'Onboarding': ['setup', 'onboarding', 'getting started', 'migration', 'install'],
  'Integration': ['integration', 'integrate', 'api', 'connect', 'plugin', 'extension'],
};

// ── Core Analysis Function ──────────────────────────────────
export function analyzeSentiment(text: string): SentimentResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/).filter(w => w.length > 2);

  // Score calculation
  let positiveCount = 0;
  let negativeCount = 0;
  const matchedPositive: string[] = [];
  const matchedNegative: string[] = [];

  for (const word of words) {
    if (POSITIVE_WORDS.has(word)) {
      positiveCount++;
      matchedPositive.push(word);
    }
    if (NEGATIVE_WORDS.has(word)) {
      negativeCount++;
      matchedNegative.push(word);
    }
  }

  // Normalize score to 0-1 range
  const totalSentimentWords = positiveCount + negativeCount;
  let score: number;
  if (totalSentimentWords === 0) {
    score = 0.5; // Neutral
  } else {
    score = positiveCount / totalSentimentWords;
  }

  // Determine label
  let label: SentimentResult['label'];
  if (score >= 0.7) label = 'positive';
  else if (score >= 0.4) label = 'neutral';
  else label = 'negative';

  // Detect primary emotion
  let primaryEmotion = 'neutral';
  let maxEmotionScore = 0;
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    const emotionScore = keywords.filter(kw => lower.includes(kw)).length;
    if (emotionScore > maxEmotionScore) {
      maxEmotionScore = emotionScore;
      primaryEmotion = emotion;
    }
  }

  // Extract topics
  const topics: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      topics.push(topic);
    }
  }

  // Generate summary
  const summary = generateSummary(label, primaryEmotion, topics, matchedPositive, matchedNegative);

  return {
    score,
    label,
    emotion: primaryEmotion,
    topics,
    summary,
    analyzedAt: new Date().toISOString(),
  };
}

function generateSummary(
  label: string,
  emotion: string,
  topics: string[],
  positive: string[],
  negative: string[]
): string {
  const parts: string[] = [];

  if (label === 'positive') {
    parts.push(`This is a positive testimonial expressing ${emotion}`);
  } else if (label === 'negative') {
    parts.push(`This testimonial expresses ${emotion} with a negative sentiment`);
  } else {
    parts.push(`This testimonial has a neutral/mixed sentiment`);
  }

  if (topics.length > 0) {
    parts.push(`focusing on ${topics.slice(0, 3).join(', ')}`);
  }

  if (positive.length > 0 && label === 'positive') {
    parts.push(`Key positive signals: ${[...new Set(positive)].slice(0, 4).join(', ')}`);
  }

  if (negative.length > 0 && label === 'negative') {
    parts.push(`Key concern areas: ${[...new Set(negative)].slice(0, 4).join(', ')}`);
  }

  return parts.join('. ') + '.';
}

// ── Batch Analysis ──────────────────────────────────────────
export function analyzeReviewBatch(reviews: Review[]): Map<string, SentimentResult> {
  const results = new Map<string, SentimentResult>();
  for (const review of reviews) {
    results.set(review.id, analyzeSentiment(review.content));
  }
  return results;
}

// ── Aggregate Stats ─────────────────────────────────────────
export interface SentimentStats {
  averageScore: number;
  distribution: { positive: number; neutral: number; negative: number };
  topEmotions: { emotion: string; count: number }[];
  topTopics: { topic: string; count: number }[];
  trendDirection: 'improving' | 'stable' | 'declining';
}

export function computeSentimentStats(results: Map<string, SentimentResult>): SentimentStats {
  const all = Array.from(results.values());
  if (all.length === 0) {
    return {
      averageScore: 0,
      distribution: { positive: 0, neutral: 0, negative: 0 },
      topEmotions: [],
      topTopics: [],
      trendDirection: 'stable',
    };
  }

  const avgScore = all.reduce((sum, r) => sum + r.score, 0) / all.length;

  const dist: Record<'positive' | 'neutral' | 'negative', number> = { positive: 0, neutral: 0, negative: 0 };
  for (const r of all) dist[r.label]++;

  // Count emotions
  const emotionCounts: Record<string, number> = {};
  for (const r of all) {
    emotionCounts[r.emotion] = (emotionCounts[r.emotion] || 0) + 1;
  }
  const topEmotions = Object.entries(emotionCounts)
    .map(([emotion, count]) => ({ emotion, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Count topics
  const topicCounts: Record<string, number> = {};
  for (const r of all) {
    for (const t of r.topics) {
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    }
  }
  const topTopics = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Trend (compare first half vs second half)
  const mid = Math.floor(all.length / 2);
  const firstHalf = all.slice(0, mid);
  const secondHalf = all.slice(mid);
  const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((s, r) => s + r.score, 0) / firstHalf.length : 0.5;
  const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((s, r) => s + r.score, 0) / secondHalf.length : 0.5;
  const diff = secondAvg - firstAvg;
  const trendDirection = diff > 0.05 ? 'improving' : diff < -0.05 ? 'declining' : 'stable';

  return {
    averageScore: avgScore,
    distribution: dist,
    topEmotions,
    topTopics,
    trendDirection,
  };
}
