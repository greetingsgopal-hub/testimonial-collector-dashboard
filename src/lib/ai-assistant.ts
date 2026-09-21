/**
 * AI Testimonial Assistant
 * Intelligent client-side testimonial polishing, tone adaptation,
 * and impact scoring to help customers craft high-converting social proof.
 */

export type TestimonialTone = 'professional' | 'enthusiastic' | 'concise';

interface PolishResult {
  polishedText: string;
  headline: string;
  suggestedTags: string[];
}

export interface ImpactScore {
  score: number; // 0 - 100
  label: 'Needs Detail' | 'Good' | 'High Impact 🔥' | 'Elite Social Proof 🏆';
  feedback: string;
  color: string;
}

/**
 * Polishes raw notes or rough text into a compelling, professional testimonial.
 */
export function polishWithAI(
  rawText: string,
  tone: TestimonialTone = 'enthusiastic',
  metadata?: { role?: string; company?: string; name?: string }
): PolishResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      polishedText: 'We achieved outstanding results and saved valuable hours every week. The user experience is frictionless, and the team support is world-class.',
      headline: 'A truly transformative experience',
      suggestedTags: ['High ROI', 'Performance', 'Recommended'],
    };
  }

  // Clean and normalize sentences
  let sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length === 1 && !/[.!?]$/.test(sentences[0])) {
    sentences[0] += '.';
  }

  const roleContext = metadata?.role ? ` As a ${metadata.role},` : '';
  const companyContext = metadata?.company ? ` at ${metadata.company}` : '';

  let polishedText = '';
  let headline = '';
  const tags = new Set<string>();

  // Keyword extraction for smart tags
  const lower = trimmed.toLowerCase();
  if (lower.includes('speed') || lower.includes('fast') || lower.includes('quick')) tags.add('Performance');
  if (lower.includes('support') || lower.includes('team') || lower.includes('help')) tags.add('Support');
  if (lower.includes('easy') || lower.includes('simple') || lower.includes('intuitive') || lower.includes('ui')) tags.add('UI/UX');
  if (lower.includes('money') || lower.includes('roi') || lower.includes('time') || lower.includes('saved')) tags.add('High ROI');
  if (lower.includes('scale') || lower.includes('grow') || lower.includes('business')) tags.add('Growth');
  if (tags.size === 0) {
    tags.add('Recommended');
    tags.add('SaaS');
  }

  if (tone === 'professional') {
    headline = 'Reliable, powerful, and impeccably executed';
    const base = sentences.join(' ');
    polishedText = `${roleContext ? roleContext.trim() + ': ' : ''}${base} It has consistently delivered measurable efficiency gains for our workflow${companyContext}. The platform demonstrates outstanding reliability and engineering quality.`;
  } else if (tone === 'concise') {
    headline = 'Fast, intuitive, and delivers real ROI';
    polishedText = `${sentences[0]} Exceptional speed, intuitive interface, and immediate value from day one.`;
  } else {
    // Enthusiastic (default)
    headline = 'Exceeded all expectations — an absolute game changer!';
    const base = sentences.join(' ');
    polishedText = `${base} Working with this platform has been an absolute breath of fresh air${companyContext}. It exceeded our expectations across the board and I cannot recommend it highly enough!`;
  }

  return {
    polishedText: polishedText.trim(),
    headline,
    suggestedTags: Array.from(tags).slice(0, 4),
  };
}

/**
 * Evaluates the persuasive power of a testimonial in real-time.
 */
export function calculateImpactScore(text: string): ImpactScore {
  const len = text.trim().length;
  if (len < 20) {
    return {
      score: 25,
      label: 'Needs Detail',
      feedback: 'Add a specific result, benefit, or what you loved most.',
      color: 'text-zinc-500',
    };
  }

  if (len < 60) {
    return {
      score: 55,
      label: 'Good',
      feedback: 'Great start! Mentioning a specific outcome makes it even stronger.',
      color: 'text-amber-400',
    };
  }

  if (len < 140) {
    return {
      score: 85,
      label: 'High Impact 🔥',
      feedback: 'Engaging, credible, and descriptive social proof!',
      color: 'text-emerald-400',
    };
  }

  return {
    score: 100,
    label: 'Elite Social Proof 🏆',
    feedback: 'Outstanding testimonial with rich context and authentic detail.',
    color: 'text-purple-400',
  };
}

export const INSPIRATION_STARTERS = [
  {
    label: '🚀 Game Changer',
    text: 'This has completely streamlined our workflow and saved our team hours every single week.',
    headline: 'Unmatched speed and workflow simplicity',
  },
  {
    label: '📈 Measurable ROI',
    text: 'We saw immediate value within the first 48 hours of setup. The conversion increase was undeniable.',
    headline: 'Immediate, measurable business impact',
  },
  {
    label: '💎 World-Class UX',
    text: 'The user experience is clean, modern, and delightfully intuitive. Easily the best tool in its class.',
    headline: 'Gorgeous design and effortless usability',
  },
];
