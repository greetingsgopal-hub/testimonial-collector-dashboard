export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type ReviewType = 'text' | 'video';

export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CollectionForm {
  id: string;
  projectId: string;
  publicSlug: string;
  title: string;
  description: string;
  isActive: boolean;
  allowVideo: boolean;
  settings?: {
    theme?: 'dark' | 'light';
    requireRating?: boolean;
    brandColor?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  projectId?: string;
  collectionFormId?: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  avatarUrl?: string;
  rating: number; // 1 to 5
  title?: string;
  content: string;
  type: ReviewType;
  videoUrl?: string;
  tags: string[];
  source: 'form' | 'twitter' | 'import' | 'api';
  status: ReviewStatus;
  isFeatured: boolean;
  consent: boolean;
  helpfulCount?: number;
  createdAt: string; // ISO string
  updatedAt?: string;
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'source' | 'status' | 'isFeatured' | 'helpfulCount'> & {
  source?: 'form' | 'twitter' | 'import' | 'api';
  status?: ReviewStatus;
  isFeatured?: boolean;
};

export interface ReviewStats {
  total: number;
  averageRating: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  archivedCount: number;
  featuredCount: number;
  ratingBreakdown: Record<number, number>; // 1: count, 2: count...
}

export interface ReviewFilters {
  search: string;
  status: ReviewStatus | 'all';
  rating: number | 'all'; // 1-5 or 'all'
  tag: string | 'all';
  sortBy: 'createdAt' | 'rating' | 'name';
  sortOrder: 'asc' | 'desc';
}

export type WidgetType = 'wall' | 'carousel' | 'badge' | 'spotlight';

export interface WidgetSettings {
  type: WidgetType;
  theme: 'dark' | 'light';
  primaryColor: string;
  showRating: boolean;
  showAvatar: boolean;
  showDate: boolean;
  showCompany: boolean;
  maxCount: number;
  onlyFeatured: boolean;
}

export type SocialPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram';
export type SocialConnectionStatus = 'connected' | 'expired' | 'revoked' | 'unauthorized' | 'not_connected';
export type SocialPublicationStatus = 'draft' | 'publishing' | 'published' | 'failed' | 'revoked';

export interface SocialConnection {
  id: string;
  ownerId: string;
  platform: SocialPlatform;
  platformUserId?: string;
  platformAccountName: string;
  platformProfilePicture?: string;
  accountType?: 'member' | 'organization' | 'page';
  scopes: string[];
  status: SocialConnectionStatus;
  tokenExpiresAt?: string;
  connectedAt: string;
  updatedAt?: string;
}

export interface SocialPublication {
  id: string;
  ownerId: string;
  reviewId: string;
  testimonialAuthor: string;
  platform: SocialPlatform;
  socialConnectionId: string;
  platformPostId?: string;
  platformPostUrl?: string;
  status: SocialPublicationStatus;
  caption: string;
  mediaType: 'image' | 'text';
  publishedAt?: string;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SocialPublishRequest {
  reviewId: string;
  platform: SocialPlatform;
  caption: string;
  mediaBase64?: string;
}

export interface SocialPublishResult {
  success: boolean;
  platform: SocialPlatform;
  postId?: string;
  postUrl?: string;
  publishedAt?: string;
  error?: string;
  reauthRequired?: boolean;
}

