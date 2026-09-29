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
});
