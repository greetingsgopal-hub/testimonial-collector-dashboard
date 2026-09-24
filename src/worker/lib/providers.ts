import { publishLinkedInImagePost, publishLinkedInTextPost } from './linkedin';

export interface PublishPayload {
  accessToken: string;
  platformAccountId: string;
  commentary: string;
  mediaBase64?: string;
}

export interface PublishResponse {
  postId: string;
  postUrl: string;
}

export interface SocialProvider {
  readonly platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
  readonly displayName: string;
  readonly isLive: boolean;
  publish(payload: PublishPayload): Promise<PublishResponse>;
}

export class LinkedInProvider implements SocialProvider {
  readonly platform = 'linkedin' as const;
  readonly displayName = 'LinkedIn';
  readonly isLive = true;

  async publish(payload: PublishPayload): Promise<PublishResponse> {
    if (!payload.accessToken || !payload.platformAccountId) {
      throw new Error('Missing LinkedIn access token or Member URN.');
    }

    if (payload.mediaBase64) {
      return await publishLinkedInImagePost(
        payload.accessToken,
        payload.platformAccountId,
        payload.commentary,
        payload.mediaBase64
      );
    } else {
      return await publishLinkedInTextPost(
        payload.accessToken,
        payload.platformAccountId,
        payload.commentary
      );
    }
  }
}

export class XProvider implements SocialProvider {
  readonly platform = 'twitter' as const;
  readonly displayName = 'X (Twitter)';
  readonly isLive = false;

  async publish(_payload: PublishPayload): Promise<PublishResponse> {
    throw new Error(
      'X (Twitter) direct API publishing requires an approved X Developer App with Basic/Pro Tier (tweet.write scope). Web Intent fallback is currently active.'
    );
  }
}

export class FacebookProvider implements SocialProvider {
  readonly platform = 'facebook' as const;
  readonly displayName = 'Facebook';
  readonly isLive = false;

  async publish(_payload: PublishPayload): Promise<PublishResponse> {
    throw new Error(
      'Facebook direct API publishing requires Meta Business Verification and Page publishing permissions (pages_manage_posts). Verified Share Dialog fallback is currently active.'
    );
  }
}

export class InstagramProvider implements SocialProvider {
  readonly platform = 'instagram' as const;
  readonly displayName = 'Instagram';
  readonly isLive = false;

  async publish(_payload: PublishPayload): Promise<PublishResponse> {
    throw new Error(
      'Instagram Content Publishing API requires a connected Instagram Business/Creator Account via Meta Business Suite (instagram_content_publish scope). High-DPI export is currently active.'
    );
  }
}

const providers: Record<string, SocialProvider> = {
  linkedin: new LinkedInProvider(),
  twitter: new XProvider(),
  facebook: new FacebookProvider(),
  instagram: new InstagramProvider(),
};

export function getSocialProvider(platform: string): SocialProvider {
  const provider = providers[platform];
  if (!provider) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return provider;
}
