// src/worker/lib/adapters/instagramAdapter.ts
import { ProviderAdapter, ImportRequest } from '../adapter';

export interface InstagramBusinessAccount {
  accountId: string;
  name: string;
}

export interface InstagramRawReview {
  id: string;
  author: string;
  rating: number;
  text: string;
}

/**
 * InstagramAdapter implements ProviderAdapter for Instagram.
 * Only API‑based comment/mention fetching is represented.
 * URL‑import is NOT supported (as per architectural rule).
 */
export class InstagramAdapter implements ProviderAdapter {
  async authenticate(request: ImportRequest): Promise<void> {
    request.authToken = 'dummy-instagram-token';
  }

  async discoverResources(_request: ImportRequest): Promise<InstagramBusinessAccount[]> {
    // Use real helper to list Instagram business accounts.
    const token = _request.authToken as string;
    return await import('../instagramOAuth').then(m => m.listInstagramAccounts(token));
  }

  async fetch(request: ImportRequest): Promise<InstagramRawReview[]> {
    const accountId = request.params.accountId as string;
    if (!accountId) {
      throw new Error('accountId parameter missing');
    }
    const token = request.authToken as string;
    return await import('../instagramOAuth').then(m => m.fetchInstagramReviews(token, accountId));
  }

  normalize(rawData: InstagramRawReview[]) {
    return rawData.map((r) => ({
      provider: 'instagram',
      externalId: r.id,
      author: r.author,
      rating: r.rating,
      text: r.text,
    }));
  }

  supportsAutoSync(): boolean {
    return true;
  }

  mapError(error: any): string {
    return error instanceof Error ? error.message : String(error);
  }
}
