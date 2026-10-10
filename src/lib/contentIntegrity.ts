import { Review } from '../types';

/**
 * Content integrity guardrails for owner edits.
 *
 * PandaPraise's promise is that displayed testimonials are the reviewer's own
 * words. Editing a collected or imported review (flipping sentiment, fixing a
 * negative review into a positive one) is deceptive and, in many
 * jurisdictions, unlawful (e.g. the FTC Consumer Reviews and Testimonials
 * Rule, in force since Oct 2024; imported reviews must also stay verbatim
 * under source-platform terms such as Google's).
 *
 * Policy:
 * - Reviews collected via the public form or imported from a platform are
 *   VERBATIM: the owner cannot edit their content fields at all.
 * - Owner-sourced entries (csv / manual / import — data the owner transcribed
 *   themselves) may be edited, but every content edit snapshots the pre-edit
 *   values once (originalContent/originalRating/originalName) and marks the
 *   review editedByOwner, which is disclosed publicly on widgets and walls.
 *
 * Firestore rules enforce the same policy server-side; this module is the
 * client-side mirror so the UI can gate itself and adapters can apply the
 * guard before writing.
 */

/** Sources where the owner supplied the data and may edit with disclosure. */
export const OWNER_EDITABLE_SOURCES: ReadonlyArray<string> = ['csv', 'manual', 'import'];

/** Fields that form the substance of a review (words, identity, rating). */
export const CONTENT_FIELD_KEYS = ['name', 'role', 'company', 'title', 'rating', 'content'] as const;

export function isOwnerEditableSource(source?: string): boolean {
  return OWNER_EDITABLE_SOURCES.includes((source || '').toLowerCase());
}

export function touchesContentFields(updates: Partial<Review>): boolean {
  return CONTENT_FIELD_KEYS.some((key) => (updates as Record<string, unknown>)[key] !== undefined);
}

export class ReviewEditNotAllowedError extends Error {
  public readonly source?: string;

  constructor(source?: string) {
    super(
      `Reviews from source "${source || 'unknown'}" are kept verbatim and cannot be edited. ` +
      'Only owner-entered reviews (CSV, manual entry) can be edited, and edits are publicly disclosed.'
    );
    this.name = 'ReviewEditNotAllowedError';
    this.source = source;
  }
}

/**
 * Apply the content-integrity policy to a pending update.
 *
 * - Updates that do not touch content fields pass through unchanged.
 * - Content edits on non-editable sources throw ReviewEditNotAllowedError.
 * - Content edits on editable sources are augmented with a one-time snapshot
 *   of the pre-edit values and the public disclosure flags.
 */
export function buildReviewEditUpdates(
  current: Pick<Review, 'source' | 'content' | 'rating' | 'name' | 'originalContent' | 'originalRating' | 'originalName'>,
  updates: Partial<Review>,
  now: string = new Date().toISOString()
): Partial<Review> {
  if (!touchesContentFields(updates)) {
    return { ...updates };
  }

  if (!isOwnerEditableSource(current.source)) {
    throw new ReviewEditNotAllowedError(current.source);
  }

  const guarded: Partial<Review> = { ...updates };
  if (current.originalContent === undefined) guarded.originalContent = current.content;
  if (current.originalRating === undefined) guarded.originalRating = current.rating;
  if (current.originalName === undefined) guarded.originalName = current.name;
  guarded.editedByOwner = true;
  guarded.editedAt = now;
  return guarded;
}
