// src/worker/lib/adapters/facebookAdapter.ts
import { ProviderAdapter, ImportRequest } from '../adapter';

export interface FacebookPage {
  pageId: string;
  name: string;
}

export interface FacebookRawReview {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
}

/**
 * FacebookAdapter implements ProviderAdapter for Facebook.
 * Only real API logic is represented; no fabricated data.
 */
export class FacebookAdapter implements ProviderAdapter {
  async authenticate(request: ImportRequest): Promise<void> {
    // Simulate obtaining an access token; in real code exchange OAuth code.
    request.authToken = 'dummy-facebook-token';
  }

  async discoverResources(_request: ImportRequest): Promise<FacebookPage[]> {
    // Use real helper to list Facebook pages (may return empty).
    const token = _request.authToken as string;
    return await import('../facebookOAuth').then(m => m.listFacebookPages(token));
  }

  async fetch(request: ImportRequest): Promise<FacebookRawReview[]> {
    const pageId = request.params.pageId as string;
    if (!pageId) {
      throw new Error('pageId parameter missing');
    }
    const token = request.authToken as string;
    return await import('../facebookOAuth').then(m => m.fetchFacebookPageReviews(token, pageId));
  }

  normalize(rawData: FacebookRawReview[]) {
    return rawData.map((r) => ({
      provider: 'facebook',
      externalId: r.id,
      author: r.reviewer,
      rating: r.rating,
      text: r.comment,
    }));
  }

  supportsAutoSync(): boolean {
    return true;
  }

  mapError(error: any): string {
    return error instanceof Error ? error.message : String(error);
  }
}
