import { getFirebaseAuth } from './firebase';
import { SocialPlatform, SocialPublishRequest, SocialPublishResult, SocialPublication } from '../types';

export interface SocialPlatformConnectionInfo {
  connected: boolean;
  status?: 'connected' | 'expired' | 'revoked' | 'unauthorized';
  accountName?: string;
  profilePicture?: string;
  connectedAt?: string;
  tokenExpiresAt?: string;
}

export interface SocialStatusResponse {
  connections: Record<SocialPlatform, SocialPlatformConnectionInfo>;
  publications: SocialPublication[];
}

async function getAuthToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
}

function getEndpointUrl(path: string): string {
  // The frontend and API share the same origin on the unified Cloudflare
  // Worker deployment (pandapraise.com), and on the local Vite dev server.
  // Always use same-origin /api/*.
  return `/api/${path}`;
}

export const socialClient = {
  /**
   * List the Facebook Pages available for selection (after FB OAuth).
   * Returns customer-safe descriptors only: pageId + name.
   */
  async listFacebookPages(): Promise<{ status?: string; pages?: { pageId: string; name: string; profilePicture?: string | null }[]; error?: string }> {
    const token = await getAuthToken();
    if (!token) return { error: 'Please sign in to continue.' };
    try {
      const res = await fetch(getEndpointUrl('facebook/pages'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to list Facebook Pages.' };
      return data;
    } catch (err) {
      console.error('[SocialClient] listFacebookPages error:', err);
      return { error: 'Network error listing Facebook Pages. Please try again.' };
    }
  },

  /**
   * Explicitly select a Facebook Page and import its reviews.
   */
  async selectFacebookPage(pageId: string): Promise<{ status?: string; importedCount?: number; pageName?: string; error?: string }> {
    const token = await getAuthToken();
    if (!token) return { error: 'Please sign in to continue.' };
    try {
      const res = await fetch(getEndpointUrl('facebook/select-page'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (!res.ok) return { status: data.status, error: data.error || 'Failed to select Facebook Page.' };
      return data;
    } catch (err) {
      console.error('[SocialClient] selectFacebookPage error:', err);
      return { error: 'Network error selecting Facebook Page. Please try again.' };
    }
  },

  /**
   * Request official OAuth authorization URL for the target platform.
   */
  async initOAuth(platform: SocialPlatform): Promise<{ authUrl?: string; error?: string }> {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Please sign in to connect social accounts.' };
    }

    try {
      const res = await fetch(getEndpointUrl('oauth-init'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ platform }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || `Failed to initialize ${platform} OAuth.` };
      }
      return { authUrl: data.authUrl };
    } catch (err: any) {
      console.error('[SocialClient] initOAuth error:', err);
      return { error: 'Network error initializing OAuth. Please try again.' };
    }
  },

  /**
   * Fetch connected social accounts status and recent publication records.
   */
  async getStatus(): Promise<SocialStatusResponse | null> {
    const token = await getAuthToken();
    if (!token) return null;

    try {
      const res = await fetch(getEndpointUrl('social-status'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      return res.json();
    } catch (err) {
      console.error('[SocialClient] getStatus error:', err);
      return null;
    }
  },

  /**
   * Publish an approved testimonial directly to the selected platform.
   */
  async publish(request: SocialPublishRequest): Promise<SocialPublishResult> {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, platform: request.platform, error: 'Authentication required. Please sign in.' };
    }

    try {
      const res = await fetch(getEndpointUrl('social-publish'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          platform: request.platform,
          error: data.error || 'Publishing failed.',
          reauthRequired: data.reauthRequired,
        };
      }

      return {
        success: true,
        platform: request.platform,
        postId: data.postId,
        postUrl: data.postUrl,
        publishedAt: data.publishedAt,
      };
    } catch (err: any) {
      console.error('[SocialClient] publish error:', err);
      return {
        success: false,
        platform: request.platform,
        error: 'Network failure communicating with publishing server. Please retry.',
      };
    }
  },

  /**
   * Disconnect a linked social account.
   */
  async disconnect(platform: SocialPlatform): Promise<{ success: boolean; error?: string }> {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Authentication required.' };
    }

    try {
      const res = await fetch(getEndpointUrl('social-disconnect'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ platform }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to disconnect account.' };
      }

      return { success: true };
    } catch (err: any) {
      console.error('[SocialClient] disconnect error:', err);
      return { success: false, error: 'Network failure disconnecting account.' };
    }
  },
};
