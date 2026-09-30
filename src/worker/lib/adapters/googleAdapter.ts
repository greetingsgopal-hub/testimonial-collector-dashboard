// src/worker/lib/adapters/googleAdapter.ts
import { ProviderAdapter, ImportRequest } from '../adapter';

// Mock types for resources and raw reviews
export interface GoogleLocation {
  placeId: string;
  name: string;
}

export interface GoogleRawReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
}

/**
 * GoogleAdapter implements the ProviderAdapter contract for Google.
 * It uses only real‑API‑capable methods; no fallback demo data is generated.
 * For this exercise we provide deterministic mock data.
 */
export class GoogleAdapter implements ProviderAdapter {
  // OPTIONAL – simulate OAuth exchange (no real network call)
  async authenticate(request: ImportRequest): Promise<void> {
    // In a real implementation, exchange a code for a token here.
    // For now we just set a dummy token on the request.
    request.authToken = 'dummy-google-token';
  }

  // OPTIONAL – discover available locations (business profiles)
  async discoverResources(_request: ImportRequest): Promise<GoogleLocation[]> {
    // Use real helper to list places (may return empty if none).
    // Access token should be set via authenticate.
    const token = _request.authToken as string;
    return await import('../googleOAuth').then(m => m.listGooglePlaces(token));
  }

  // Core fetch – retrieve raw reviews for a given placeId.
  async fetch(request: ImportRequest): Promise<GoogleRawReview[]> {
    const placeId = request.params.placeId as string;
    if (!placeId) {
      throw new Error('placeId parameter missing');
    }
    const token = request.authToken as string;
    return await import('../googleOAuth').then(m => m.fetchGoogleBusinessReviews(token, placeId));
  }

  // Normalization to the system’s canonical shape.
  normalize(rawData: GoogleRawReview[]) {
    return rawData.map((r) => ({
      provider: 'google',
      externalId: r.id,
      author: r.authorName,
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
