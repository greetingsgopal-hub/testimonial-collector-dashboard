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

export const socialClient = {
  /**
   * Request official OAuth authorization URL for the target platform.
   */
  async initOAuth(platform: SocialPlatform): Promise<{ authUrl?: string; error?: string }> {
    const token = await getAuthToken();
    if (!token) {
      return { error: 'Please sign in to connect social accounts.' };
    }

    try {
      const res = await fetch('/api/oauth-init', {
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
      const res = await fetch('/api/social-status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.warn('[SocialClient] Failed to fetch social status:', res.status);
        return null;
      }
      return res.json();
    } catch (err) {
      console.error('[SocialClient] Error getting status:', err);
      return null;
    }
  },

  /**
   * One-click direct publish of an approved testimonial to a connected social platform.
   */
  async publish(request: SocialPublishRequest): Promise<SocialPublishResult> {
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        platform: request.platform,
        error: 'Authentication session expired. Please sign in again.',
      };
    }

    try {
      const res = await fetch('/api/social-publish', {
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
          error: data.error || `Publishing to ${request.platform} failed.`,
          reauthRequired: Boolean(data.reauthRequired),
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
        error: err.message || 'Network error while publishing post.',
      };
    }
  },

  /**
   * Disconnect a linked social account.
   */
  async disconnect(platform: SocialPlatform): Promise<{ success: boolean; error?: string }> {
    const token = await getAuthToken();
    if (!token) return { success: false, error: 'Sign in required' };

    try {
      const res = await fetch('/api/social-disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ platform }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to disconnect account' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  },
};
