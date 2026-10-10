import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * TASK 4 smoke-test regression: public testimonial submission.
 *
 * Two production bugs surfaced when a stranger submitted via the public form:
 *  1. firestore.rules rejected null-valued optional fields (avatarUrl) because
 *     the guard was "absent OR is string" — the adapter always writes the key.
 *  2. After a successful create, evaluateAutoApproval ran a collection-wide
 *     query on collection_forms filtered only by projectId. The per-doc read
 *     rule is an OR (owner-scoped OR isActive), which Firestore cannot
 *     guarantee for that query, so the whole query was PERMISSION_DENIED —
 *     surfacing as a submission error even though the review was created.
 *
 * These tests pin the fixes statically (no emulator required).
 */

const adapterSrc = readFileSync(join(process.cwd(), 'src/lib/storage/firebaseAdapter.ts'), 'utf8');
const rules = readFileSync(join(process.cwd(), 'firestore.rules'), 'utf8');

describe('TASK 4 regression: public submission end-to-end', () => {
  it('rules accept null avatarUrl on review create (all 5 guards)', () => {
    const nullGuards = rules.match(/avatarUrl == null/g) ?? [];
    expect(nullGuards.length).toBe(5);
  });

  it('evaluateAutoApproval fetches the form doc by collectionFormId (doc-level get, rules-safe)', () => {
    const m = adapterSrc.match(/async evaluateAutoApproval[\s\S]*?\n  \}/);
    expect(m, 'evaluateAutoApproval must exist').not.toBeNull();
    const body = m![0];
    expect(body).toContain("doc(db, 'collection_forms', data.collectionFormId)");
    // The old rules-breaking call must be gone from this method.
    expect(body).not.toContain('this.getCollectionForm(');
  });

  it('evaluateAutoApproval failure never rejects the submission (best-effort, review stays pending)', () => {
    const m = adapterSrc.match(/async evaluateAutoApproval[\s\S]*?\n  \}/);
    const body = m![0];
    expect(body).toMatch(/catch/);
    expect(body).toMatch(/review stays pending|Auto-approval evaluation failed/);
  });

  it('anonymous getReviews resolves project slugs for the public Wall of Love', () => {
    // Wall of Love URLs use the project SLUG (/love/:slug), but public_reviews
    // docs store the Firestore project ID. Without a slug bridge, the public
    // wall is always empty for strangers. The anonymous path must fall back to
    // a projectSlug query when the direct projectId match returns nothing.
    const m = adapterSrc.match(/async getReviews[\s\S]*?\n  \}/);
    expect(m, 'getReviews must exist').not.toBeNull();
    const body = m![0];
    expect(body).toContain("'public_reviews'");
    expect(body).toContain("where('projectSlug', '==', projectId)");
  });

  it('syncPublicReview writes projectSlug onto public_reviews docs', () => {
    const m = adapterSrc.match(/private async syncPublicReview[\s\S]*?\n  \}/);
    expect(m, 'syncPublicReview must exist').not.toBeNull();
    const body = m![0];
    expect(body).toContain('projectSlug');
    expect(body).toContain("doc(db, 'projects', review.projectId)");
  });

  it('rules permit the projectSlug field on public_reviews create and update', () => {
    const m = rules.match(/match \/public_reviews\/\{reviewId\} \{[\s\S]*?\n    \}/);
    expect(m, 'public_reviews block must exist').not.toBeNull();
    const block = m![0];
    // projectSlug must appear in both the create hasOnly list and the update affectedKeys list
    const occurrences = block.match(/'projectSlug'/g) ?? [];
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
  });
});

describe('content integrity: owner-edit guardrails (verbatim sources, disclosed edits)', () => {
  const reviewsBlock = rules.match(/match \/reviews\/\{reviewId\} \{[\s\S]*?\n    \}/)![0];
  const publicBlock = rules.match(/match \/public_reviews\/\{reviewId\} \{[\s\S]*?\n    \}/)![0];

  it('rules lock content fields on form-collected and imported reviews', () => {
    // Only owner-sourced entries may change content fields; everything else
    // (form, google, facebook, ...) must keep the reviewer's words verbatim.
    expect(reviewsBlock).toContain("in ['csv', 'manual', 'import']");
    expect(reviewsBlock).toContain("hasAny(['name', 'role', 'company', 'title', 'rating', 'content'])");
  });

  it('rules require the editedByOwner disclosure and a faithful first-edit snapshot on content edits', () => {
    expect(reviewsBlock).toContain('request.resource.data.editedByOwner == true');
    expect(reviewsBlock).toContain('request.resource.data.originalContent == resource.data.content');
    expect(reviewsBlock).toContain('request.resource.data.originalRating == resource.data.rating');
    expect(reviewsBlock).toContain('request.resource.data.originalName == resource.data.name');
  });

  it('rules make original snapshots and the disclosure flag write-once', () => {
    expect(reviewsBlock).toContain("!('originalContent' in resource.data)");
    expect(reviewsBlock).toContain("!('originalRating' in resource.data)");
    expect(reviewsBlock).toContain("!('originalName' in resource.data)");
    expect(reviewsBlock).toContain("!('editedByOwner' in resource.data)");
  });

  it('adapter applies the content-integrity guard before writing updates', () => {
    const m = adapterSrc.match(/async updateReview[\s\S]*?await updateDoc/);
    expect(m, 'updateReview must exist').not.toBeNull();
    expect(m![0]).toContain('buildReviewEditUpdates');
  });

  it('public_reviews carries the editedByOwner disclosure (create and update lists)', () => {
    const occurrences = publicBlock.match(/'editedByOwner'/g) ?? [];
    expect(occurrences.length).toBeGreaterThanOrEqual(2);
    expect(adapterSrc.match(/private async syncPublicReview[\s\S]*?\n  \}/)![0]).toContain('editedByOwner');
  });
});
