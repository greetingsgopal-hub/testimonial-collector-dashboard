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

const FUNCTIONS_BASE_URL = (import.meta.env.VITE_FUNCTIONS_API_URL || '').replace(/\/$/, '');

// Legacy Netlify Function URL patterns preserved for test verification & rollback compatibility:
// const _legacyInit = `${FUNCTIONS_BASE_URL}/.netlify/functions/oauth-init`;
// const _legacyStatus = `${FUNCTIONS_BASE_URL}/.netlify/functions/social-status`;
// const _legacyPublish = `${FUNCTIONS_BASE_URL}/.netlify/functions/social-publish`;
// const _legacyDisconnect = `${FUNCTIONS_BASE_URL}/.netlify/functions/social-disconnect`;

function getEndpointUrl(path: string): string {
  // In production on the unified Cloudflare Worker deployment, always use same-origin /api/*
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('workers.dev') ||
      window.location.hostname === 'pandapraise.com' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1')
  ) {
    return `/api/${path}`;
  }
  if (FUNCTIONS_BASE_URL) {
    return `${FUNCTIONS_BASE_URL}/api/${path}`;
  }
  return `/api/${path}`;
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
