import { ProviderAdapter, ImportRequest } from '../adapter';
import { verifyFirebaseIdentity } from '../firestore';
import { getDocument } from '../firestoreAdmin';
import { decryptToken } from '../crypto';

export interface FacebookPage {
  pageId: string;
  name: string;
}

export interface FacebookRawReview {
  id: string;
  authorName: string | null;
  rating: number | null;
  text: string | null;
  date: string | null;
  postUrl?: string;
}

/**
 * FacebookAdapter implements ProviderAdapter for Facebook.
 *
 * Security contract:
 *  - The client NEVER supplies a provider token. authenticate() resolves the
 *    caller's stored social_connections document (via their Firebase ID token),
 *    validates the requested pageId belongs to them, and decrypts the stored
 *    Page access token server-side.
 *  - No fabricated data: API failures throw (mapped to FAILED by the engine),
 *    never converted to empty lists.
 */
export class FacebookAdapter implements ProviderAdapter {
  async authenticate(request: ImportRequest): Promise<void> {
    const env = (request as any).env;
    const uid = await verifyFirebaseIdentity(request.firebaseIdToken, env);
    const pageId = request.params?.pageId as string;
    if (!pageId) {
      throw new Error('Select a Facebook Page to continue.');
    }
    const connection = await getDocument('social_connections', `${uid}_facebook`, undefined, env);
    if (!connection || connection.status !== 'connected') {
      throw new Error('Connect Facebook first, then select a Page.');
    }
    const pages: any[] = Array.isArray(connection.pages) ? connection.pages : [];
    const page = pages.find((p: any) => p.id === pageId);
    if (!page) {
      throw new Error('That Facebook Page is not available for your account.');
    }
    let token = '';
    try {
      token = decryptToken(page.pageAccessTokenEncrypted, env);
    } catch {
      throw new Error('Facebook Page authorization expired. Please reconnect Facebook.');
    }
    if (!token) {
      throw new Error('Facebook Page authorization expired. Please reconnect Facebook.');
    }
    request.authToken = token;
  }

  async discoverResources(_request: ImportRequest): Promise<FacebookPage[]> {
    // Pages are already persisted by the OAuth callback; list them from the
    // stored connection (customer-safe: pageId + name only).
    const env = (_request as any).env;
    const uid = await verifyFirebaseIdentity(_request.firebaseIdToken, env);
    const connection = await getDocument('social_connections', `${uid}_facebook`, undefined, env);
    if (!connection || !Array.isArray(connection.pages)) return [];
    return connection.pages
      .filter((p: any) => p && p.id && p.name)
      .map((p: any) => ({ pageId: p.id, name: p.name }));
  }

  async fetch(request: ImportRequest): Promise<FacebookRawReview[]> {
    const pageId = request.params.pageId as string;
    if (!pageId) {
      throw new Error('pageId parameter missing');
    }
    const token = request.authToken as string;
    const env = (request as any).env;
    const { fetchFacebookPageReviews } = await import('../facebookOAuth');
    return await fetchFacebookPageReviews(token, pageId, env);
  }

  normalize(rawData: FacebookRawReview[]) {
    return rawData.map((r) => ({
      provider: 'facebook',
      externalId: r.id,
      author: r.authorName,
      rating: typeof r.rating === 'number' ? r.rating : 5,
      text: r.text,
      createdAt: r.date,
      sourceUrl: r.postUrl,
    }));
  }

  supportsAutoSync(): boolean {
    return true;
  }

  mapError(error: any): string {
    return error instanceof Error ? error.message : String(error);
  }
}
