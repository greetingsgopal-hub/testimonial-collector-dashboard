import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * C5 hardening regression tests: Firestore rules must prevent clients from
 * altering subscription state or touching the Stripe webhook idempotency ledger.
 *
 * Static analysis of firestore.rules (no emulator required). These tests fail
 * if the rule file is edited in a way that weakens subscription protections.
 */

const rulesPath = join(process.cwd(), 'firestore.rules');
const rules = readFileSync(rulesPath, 'utf8');

/** Extract the workspaces match block */
function workspaceBlock(): string {
  const m = rules.match(/match \/workspaces\/\{workspaceId\} \{[\s\S]*?\n    \}/);
  expect(m, 'workspaces match block must exist in firestore.rules').not.toBeNull();
  return m![0];
}

/** Extract the stripe_events match block */
function stripeEventsBlock(): string {
  const m = rules.match(/match \/stripe_events\/\{eventId\} \{[\s\S]*?\n    \}/);
  expect(m, 'stripe_events match block must exist in firestore.rules').not.toBeNull();
  return m![0];
}

/** Extract the reviews match block */
function reviewsBlock(): string {
  const start = rules.indexOf('match /reviews/{reviewId} {');
  expect(start, 'reviews match block must exist in firestore.rules').toBeGreaterThan(-1);
  const end = rules.indexOf('match /public_reviews/{reviewId} {');
  expect(end, 'public_reviews match block must exist after reviews').toBeGreaterThan(start);
  return rules.slice(start, end);
}

describe('C5: Firestore rules — subscription state protection', () => {
  it('locks plan against client updates in the workspaces rule', () => {
    const block = workspaceBlock();
    expect(block).toMatch(/allow update/);
    expect(block).toMatch(/affectedKeys\(\)\.hasAny\(/);
    expect(block).toMatch(/'plan'/);
  });

  it('locks subscriptionStatus against client updates', () => {
    expect(workspaceBlock()).toMatch(/'subscriptionStatus'/);
  });

  it('locks stripeCustomerId and stripeSubscriptionId against client updates', () => {
    const block = workspaceBlock();
    expect(block).toMatch(/'stripeCustomerId'/);
    expect(block).toMatch(/'stripeSubscriptionId'/);
  });

  it('locks currentPeriodEnd against client updates', () => {
    expect(workspaceBlock()).toMatch(/'currentPeriodEnd'/);
  });

  it('requires workspace updates to be owner-scoped and ownership-unchanged', () => {
    const block = workspaceBlock();
    expect(block).toMatch(/isOwner\(resource\.data\.ownerId\)/);
    expect(block).toMatch(/isOwnerUnchanged\(\)/);
  });

  it('forces new workspaces to free plan with no Stripe fields', () => {
    const block = workspaceBlock();
    expect(block).toMatch(/request\.resource\.data\.plan == 'free'/);
    expect(block).toMatch(/!\('stripeCustomerId' in request\.resource\.data\)/);
    expect(block).toMatch(/!\('stripeSubscriptionId' in request\.resource\.data\)/);
  });
});

describe('C5: Firestore rules — stripe_events ledger protection', () => {
  it('has an explicit deny rule for stripe_events', () => {
    const block = stripeEventsBlock();
    expect(block).toMatch(/allow read, write: if false/);
  });

  it('does not grant any allow on stripe_events', () => {
    const block = stripeEventsBlock();
    expect(block).not.toMatch(/allow [^:]+: if (?!false)/);
  });
});

describe('Owner review creation path (manual entry / CSV import)', () => {
  it('allows authenticated owners to create reviews in their own tenant only', () => {
    const block = reviewsBlock();
    expect(block).toMatch(/allow create: if\s+isAuthenticated\(\) &&\s+request\.resource\.data\.ownerId == request\.auth\.uid/);
  });

  it('restricts owner-created review status to pending or approved', () => {
    const block = reviewsBlock();
    expect(block).toMatch(/request\.resource\.data\.status in \['pending', 'approved'\]/);
  });

  it('keeps the anonymous submission path forcing pending/form/consent', () => {
    const block = reviewsBlock();
    // The anonymous create must still force status == 'pending', source == 'form',
    // consent == true, isFeatured == false.
    expect(block).toMatch(/request\.resource\.data\.status == 'pending'/);
    expect(block).toMatch(/request\.resource\.data\.source == 'form'/);
    expect(block).toMatch(/request\.resource\.data\.consent == true/);
    expect(block).toMatch(/request\.resource\.data\.isFeatured == false/);
  });

  it('caps review content, rating, and tags on the owner path', () => {
    const block = reviewsBlock();
    expect(block).toMatch(/request\.resource\.data\.rating >= 1/);
    expect(block).toMatch(/request\.resource\.data\.rating <= 5/);
    expect(block).toMatch(/request\.resource\.data\.tags\.size\(\) <= 10/);
  });
});

describe('C5: Worker Firestore write path uses service account (rules bypass)', () => {
  it('firestoreAdmin authenticates with the service-account access token when env is present', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/worker/lib/firestoreAdmin.ts'),
      'utf8'
    );
    expect(src).toMatch(/getServiceAccountAccessToken\(env\)/);
    // Service account token must take precedence over any user idToken
    const saIdx = src.indexOf('getServiceAccountAccessToken(env)');
    const userTokenIdx = src.indexOf('if (idToken)');
    expect(saIdx).toBeGreaterThan(-1);
    expect(userTokenIdx).toBeGreaterThan(saIdx);
  });

  it('googleAuth issues tokens from FIREBASE_SERVICE_ACCOUNT_KEY (privileged path)', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/worker/lib/googleAuth.ts'),
      'utf8'
    );
    expect(src).toMatch(/FIREBASE_SERVICE_ACCOUNT_KEY/);
    expect(src).toMatch(/private_key/);
  });
});
