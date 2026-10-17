/**
 * Superadmin authorization helpers for PandaPraise frontend.
 */

const DEFAULT_SUPERADMIN_EMAILS = [
  'greetings.gopal@gmail.com',
];

/**
 * Normalizes email address (handles Gmail dots and alias tags).
 */
export function canonicalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.indexOf('@');
  if (atIndex === -1) return normalized;

  const user = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const cleanUser = user.split('+')[0].replace(/\./g, '');
    return `${cleanUser}@gmail.com`;
  }

  return normalized;
}

/**
 * Returns true if the given email is authorized for Platform Superadmin access.
 */
export function isSuperadmin(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;

  const envAdmins = (import.meta.env.VITE_SUPERADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const rawList = [...DEFAULT_SUPERADMIN_EMAILS, ...envAdmins];
  const canonicalList = new Set(rawList.map(canonicalizeEmail));

  const targetRaw = email.trim().toLowerCase();
  const targetCanonical = canonicalizeEmail(targetRaw);

  return canonicalList.has(targetRaw) || canonicalList.has(targetCanonical);
}
