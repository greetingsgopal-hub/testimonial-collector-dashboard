/**
 * AI Translation — Translates testimonial text between languages.
 *
 * Uses the browser's built-in Intl APIs for language detection,
 * and a mock translation layer (would connect to DeepL/Google Translate API in production).
 */

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  translatedAt: string;
}

// ── Language Detection (heuristic) ──────────────────────────
const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  es: [/\b(el|la|los|las|un|una|es|está|son|muy|pero|como|para|por|más|con|que)\b/gi],
  fr: [/\b(le|la|les|un|une|est|sont|très|mais|comme|pour|par|plus|avec|que|des)\b/gi],
  de: [/\b(der|die|das|ein|eine|ist|sind|sehr|aber|wie|für|durch|mehr|mit|dass)\b/gi],
  pt: [/\b(o|a|os|as|um|uma|é|são|muito|mas|como|para|por|mais|com|que)\b/gi],
  it: [/\b(il|la|i|le|un|una|è|sono|molto|ma|come|per|più|con|che)\b/gi],
  nl: [/\b(de|het|een|is|zijn|heel|maar|zoals|voor|door|meer|met|dat)\b/gi],
  ja: [/[\u3040-\u309f\u30a0-\u30ff]/],
  zh: [/[\u4e00-\u9fff]/],
  ko: [/[\uac00-\ud7af]/],
  ar: [/[\u0600-\u06ff]/],
  hi: [/[\u0900-\u097f]/],
  ru: [/[\u0400-\u04ff]/],
};

export function detectLanguage(text: string): { code: string; name: string; confidence: number } {
  // Check non-Latin scripts first (highest confidence)
  for (const [code, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    if (['ja', 'zh', 'ko', 'ar', 'hi', 'ru'].includes(code)) {
      const match = patterns[0].test(text);
      if (match) {
        return { code, name: getLanguageName(code), confidence: 0.95 };
      }
    }
  }

  // Check Latin-based languages by word frequency
  let bestMatch = { code: 'en', score: 0 };
  for (const [code, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    if (['ja', 'zh', 'ko', 'ar', 'hi', 'ru'].includes(code)) continue;
    let score = 0;
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      score += matches ? matches.length : 0;
    }
    if (score > bestMatch.score) {
      bestMatch = { code, score };
    }
  }

  // If score is very low, default to English
  if (bestMatch.score < 3) {
    return { code: 'en', name: 'English', confidence: 0.7 };
  }

  return {
    code: bestMatch.code,
    name: getLanguageName(bestMatch.code),
    confidence: Math.min(0.9, 0.5 + bestMatch.score * 0.05),
  };
}

// ── Translation (mock — would use API in production) ────────
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResult> {
  const detected = sourceLanguage || detectLanguage(text).code;

  // In production, this would call DeepL or Google Translate API:
  // const response = await fetch('https://api.deepl.com/v2/translate', { ... });

  // For demo purposes, we return a mock translation with a note
  await new Promise(r => setTimeout(r, 800)); // Simulate API latency

  return {
    originalText: text,
    translatedText: `[${getLanguageName(targetLanguage)} translation] ${text}`,
    sourceLanguage: detected,
    targetLanguage,
    confidence: 0.85,
    translatedAt: new Date().toISOString(),
  };
}

// ── Supported Languages ─────────────────────────────────────
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
];

function getLanguageName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang?.name || code.toUpperCase();
}
