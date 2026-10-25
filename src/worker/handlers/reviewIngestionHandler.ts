import { Context } from 'hono';
import { parseReviewInput } from '../../features/reviews/reviewParser';
import { filterAndRankReviews } from '../../features/reviews/intentFilter';
import { RawReviewInput } from '../../features/reviews/types';

/**
 * Handles POST /api/reviews/ingest
 * Accepts an array of raw reviews (from Judge.me, Loox, CSV, or WhatsApp)
 * and returns ranked, high-converting Meta Ad review candidates.
 */
export async function handleReviewIngestion(c: Context) {
  try {
    const body = await c.req.json();
    const rawList: (string | RawReviewInput)[] = Array.isArray(body.reviews)
      ? body.reviews
      : [];

    if (rawList.length === 0) {
      return c.json({ error: 'No reviews provided in payload' }, 400);
    }

    const parsed = rawList.map((item, idx) =>
      parseReviewInput(item, `ingest-${Date.now()}-${idx}`)
    );

    const highIntentCandidates = filterAndRankReviews(parsed, {
      minScore: body.minScore ?? 50,
      minRating: body.minRating ?? 4,
    });

    return c.json({
      success: true,
      totalReceived: rawList.length,
      qualifiedForAds: highIntentCandidates.length,
      candidates: highIntentCandidates,
    }, 200);
  } catch (err: any) {
    return c.json({ error: 'Failed to ingest and score reviews', message: err.message }, 500);
  }
}
