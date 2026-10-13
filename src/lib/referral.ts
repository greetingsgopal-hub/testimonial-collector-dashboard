/**
 * PandaPraise Viral Referral Engine ("Give 1 Month / Get 1 Month")
 * Tracks referral code attribution with 60-day longevity.
 */

const REFERRAL_STORAGE_KEY = 'pandapraise_referral_code';

export function captureReferralCode(search: string = window.location.search): string | null {
  try {
    const params = new URLSearchParams(search);
    const code = params.get('ref') || params.get('referral');
    if (code) {
      const sanitized = code.replace(/[^a-zA-Z0-9_-]/g, '').trim();
      if (sanitized) {
        localStorage.setItem(REFERRAL_STORAGE_KEY, sanitized);
        sessionStorage.setItem(REFERRAL_STORAGE_KEY, sanitized);
        return sanitized;
      }
    }
  } catch (err) {
    console.warn('[Referral] Could not parse referral query:', err);
  }
  return null;
}

export function getStoredReferralCode(): string | null {
  try {
    return (
      localStorage.getItem(REFERRAL_STORAGE_KEY) ||
      sessionStorage.getItem(REFERRAL_STORAGE_KEY) ||
      null
    );
  } catch {
    return null;
  }
}

export function clearStoredReferralCode(): void {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
    sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function generateReferralUrl(workspaceSlugOrId: string): string {
  const code = encodeURIComponent(workspaceSlugOrId || 'vip');
  return `https://pandapraise.com/r/${code}`;
}
