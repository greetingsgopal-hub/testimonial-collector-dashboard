/**
 * Superadmin authorization helpers for PandaPraise frontend.
 */

const DEFAULT_SUPERADMIN_EMAILS = [
  'admin@pandapraise.com',
  'founder@pandapraise.com',
  'greetingsgopal@gmail.com',
];

/**
 * Returns true if the given email is authorized for Platform Superadmin access.
 */
export function isSuperadmin(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();

  const envAdmins = (import.meta.env.VITE_SUPERADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const allowed = new Set([...DEFAULT_SUPERADMIN_EMAILS, ...envAdmins]);
  return allowed.has(normalized);
}
