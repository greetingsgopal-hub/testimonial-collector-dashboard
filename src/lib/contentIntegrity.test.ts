import { describe, expect, it } from 'vitest';
import {
  buildReviewEditUpdates,
  isOwnerEditableSource,
  ReviewEditNotAllowedError,
  touchesContentFields,
} from './contentIntegrity';

const formReview = {
  source: 'form',
  content: 'The product was okay but support was slow.',
  rating: 3,
  name: 'Real Reviewer',
};

describe('isOwnerEditableSource', () => {
  it('allows only owner-sourced entries', () => {
    expect(isOwnerEditableSource('csv')).toBe(true);
    expect(isOwnerEditableSource('manual')).toBe(true);
    expect(isOwnerEditableSource('import')).toBe(true);
    expect(isOwnerEditableSource('form')).toBe(false);
    expect(isOwnerEditableSource('google')).toBe(false);
    expect(isOwnerEditableSource('facebook')).toBe(false);
    expect(isOwnerEditableSource(undefined)).toBe(false);
  });
});

describe('touchesContentFields', () => {
  it('detects content edits', () => {
    expect(touchesContentFields({ content: 'x' })).toBe(true);
    expect(touchesContentFields({ rating: 5 })).toBe(true);
    expect(touchesContentFields({ name: 'x', role: 'y' })).toBe(true);
    expect(touchesContentFields({ status: 'approved' })).toBe(false);
    expect(touchesContentFields({ tags: ['a'] })).toBe(false);
    expect(touchesContentFields({ isFeatured: true })).toBe(false);
  });
});

describe('buildReviewEditUpdates', () => {
  it('passes through non-content updates untouched', () => {
    const result = buildReviewEditUpdates(formReview, { status: 'approved' });
    expect(result).toEqual({ status: 'approved' });
    expect(result.editedByOwner).toBeUndefined();
  });

  it('blocks content edits on form-collected reviews', () => {
    expect(() => buildReviewEditUpdates(formReview, { content: 'Amazing! 10/10!' })).toThrow(
      ReviewEditNotAllowedError
    );
  });

  it('blocks rating flips on imported reviews', () => {
    const googleReview = { ...formReview, source: 'google' };
    expect(() => buildReviewEditUpdates(googleReview, { rating: 5 })).toThrow(ReviewEditNotAllowedError);
  });

  it('snapshots originals and discloses edits on owner-sourced reviews', () => {
    const csvReview = { ...formReview, source: 'csv' };
    const result = buildReviewEditUpdates(csvReview, { content: 'The product was great.', rating: 5 }, '2026-10-09T00:00:00.000Z');
    expect(result.content).toBe('The product was great.');
    expect(result.rating).toBe(5);
    expect(result.originalContent).toBe('The product was okay but support was slow.');
    expect(result.originalRating).toBe(3);
    expect(result.originalName).toBe('Real Reviewer');
    expect(result.editedByOwner).toBe(true);
    expect(result.editedAt).toBe('2026-10-09T00:00:00.000Z');
  });

  it('never overwrites an existing original snapshot on later edits', () => {
    const alreadyEdited = {
      ...formReview,
      source: 'manual',
      originalContent: 'first version',
      originalRating: 2,
      originalName: 'First Name',
    };
    const result = buildReviewEditUpdates(alreadyEdited, { content: 'second version' });
    expect(result.originalContent).toBeUndefined();
    expect(result.originalRating).toBeUndefined();
    expect(result.originalName).toBeUndefined();
    expect(result.editedByOwner).toBe(true);
  });
});
