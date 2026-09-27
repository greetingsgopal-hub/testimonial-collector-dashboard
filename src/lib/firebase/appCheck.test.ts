import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Static regression guard for App Check wiring (public submission abuse layer).
 *
 * App Check is the volume/abuse boundary for the anonymous `reviews` create in
 * firestore.rules. These tests pin the invariants that keep it safe to enable:
 *
 * 1. The debug-token escape hatch is gated on VITE_FIREBASE_APPCHECK_DEBUG so a
 *    production build (env absent/false) never sets FIREBASE_APPCHECK_DEBUG_TOKEN.
 * 2. App Check initialization itself stays gated on VITE_FIREBASE_APPCHECK_ENABLED
 *    AND a site key — it cannot silently activate from a partial config.
 * 3. The site key must come from VITE_FIREBASE_APPCHECK_SITE_KEY (documented),
 *    not from an undocumented variable.
 */
const source = readFileSync(
  resolve(__dirname, 'index.ts'),
  'utf8'
);

describe('App Check wiring (src/lib/firebase/index.ts)', () => {
  it('sets the App Check debug token only behind VITE_FIREBASE_APPCHECK_DEBUG', () => {
    expect(source).toMatch(
      /if\s*\(\s*import\.meta\.env\.VITE_FIREBASE_APPCHECK_DEBUG\s*===\s*'true'\s*\)\s*\{[\s\S]*?FIREBASE_APPCHECK_DEBUG_TOKEN/
    );
  });

  it('never sets the debug token unconditionally', () => {
    // Any assignment of FIREBASE_APPCHECK_DEBUG_TOKEN outside the gated if-block
    // would disable attestation for every client in production.
    const assignments = source.match(/FIREBASE_APPCHECK_DEBUG_TOKEN\s*=/g) ?? [];
    expect(assignments.length).toBe(1);
  });

  it('initializes App Check only when enabled AND a site key is present', () => {
    expect(source).toMatch(
      /if\s*\(\s*appCheckEnabled\s*&&\s*appCheckSiteKey[\s\S]{0,600}initializeAppCheck/
    );
    expect(source).toMatch(/VITE_FIREBASE_APPCHECK_ENABLED\s*===\s*'true'/);
  });

  it('reads the site key from the documented VITE_FIREBASE_APPCHECK_SITE_KEY var', () => {
    expect(source).toMatch(/VITE_FIREBASE_APPCHECK_SITE_KEY/);
  });
});
