import { parseSafePublicHttpsUrl } from './safeUrl';

export type ResearchMode = 'prospect' | 'competitor';

export interface ResearchRequest {
  companyName: string;
  websiteUrl?: string;
  mode: ResearchMode;
}

export type ValidationResult =
  | { ok: true; value: ResearchRequest }
  | { ok: false; error: string };

const NAME_MIN = 2;
const NAME_MAX = 100;
// Letters/digits in any script plus common business punctuation. Excludes quotes,
// braces, angle brackets and semicolons to keep the value inert inside prompts and URLs.
const NAME_PATTERN = /^[\p{L}\p{N} .,'&()+\-!/]+$/u;
const MODES: ResearchMode[] = ['prospect', 'competitor'];

export function validateResearchRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }
  const input = body as Record<string, unknown>;

  if (typeof input.companyName !== 'string') {
    return { ok: false, error: 'companyName is required.' };
  }
  const companyName = input.companyName.trim().replace(/\s+/g, ' ');
  if (companyName.length < NAME_MIN || companyName.length > NAME_MAX) {
    return { ok: false, error: `companyName must be ${NAME_MIN}-${NAME_MAX} characters.` };
  }
  if (!NAME_PATTERN.test(companyName)) {
    return { ok: false, error: 'companyName contains unsupported characters.' };
  }

  let mode: ResearchMode = 'prospect';
  if (input.mode !== undefined) {
    if (typeof input.mode !== 'string' || !MODES.includes(input.mode as ResearchMode)) {
      return { ok: false, error: 'mode must be "prospect" or "competitor".' };
    }
    mode = input.mode as ResearchMode;
  }

  const value: ResearchRequest = { companyName, mode };

  if (input.websiteUrl !== undefined && input.websiteUrl !== null) {
    if (typeof input.websiteUrl !== 'string') {
      return { ok: false, error: 'websiteUrl must be a string.' };
    }
    if (input.websiteUrl.trim()) {
      const url = parseSafePublicHttpsUrl(input.websiteUrl);
      if (!url) {
        return { ok: false, error: 'websiteUrl must be a public https:// URL.' };
      }
      value.websiteUrl = url.href;
    }
  }

  return { ok: true, value };
}
