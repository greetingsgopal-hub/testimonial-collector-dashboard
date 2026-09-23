// ─────────────────────────────────────────────────────────────
// Panda Praise — Full Senja-class type system
// ─────────────────────────────────────────────────────────────

// ── Core enums ──────────────────────────────────────────────
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type ReviewType = 'text' | 'video';
export type PlanTier = 'free' | 'starter' | 'pro';
export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type BillingCycle = 'monthly' | 'annual';

// ── User Profile ────────────────────────────────────────────
export interface UserProfile {
  id: string;            // Same as Firebase UID
  email: string;
  displayName: string;
  avatarUrl?: string;
  timezone?: string;
  createdAt: string;
  updatedAt?: string;
}

// ── Workspace (tenant) ──────────────────────────────────────
export interface Workspace {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  plan: PlanTier;
  billingCycle?: BillingCycle;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'incomplete';
  planExpiresAt?: string;
  // Branding
  logoUrl?: string;
  brandColor?: string;
  customDomain?: string;
  // Usage tracking
  testimonialCount?: number;
  projectCount?: number;
  seatCount?: number;
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

// ── Team ────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: TeamRole;
  invitedBy: string;
  joinedAt: string;
  updatedAt?: string;
}

export interface TeamInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  token: string;
  expiresAt: string;
  createdAt: string;
}

// ── Project ─────────────────────────────────────────────────
export interface Project {
  id: string;
  workspaceId: string;
  ownerId?: string;
  name: string;
  slug: string;
  websiteUrl?: string;
  logoUrl?: string;
  brandColor?: string;
  customDomain?: string;      // e.g. love.mybrand.com
  description?: string;
  industry?: string;
  createdAt: string;
  updatedAt?: string;
}

// ── Collection Form ─────────────────────────────────────────
export interface CollectionForm {
  id: string;
  projectId: string;
  publicSlug: string;
  title: string;
  description: string;
  isActive: boolean;
  allowVideo: boolean;
  settings?: CollectionFormSettings;
  createdAt: string;
  updatedAt?: string;
}

export interface CollectionFormSettings {
  theme?: 'dark' | 'light';
  requireRating?: boolean;
  brandColor?: string;
  brandName?: string;
  websiteUrl?: string;
  logoUrl?: string;
  // Multi-step form config
  multiStep?: boolean;
  steps?: CollectionFormStep[];
  // Rewards / Thank-you
  thankYouMessage?: string;
  rewardEnabled?: boolean;
  rewardType?: 'coupon' | 'egift' | 'message';
  rewardValue?: string;        // Coupon code or gift URL
  // Customization
  ctaButtonText?: string;
  placeholderText?: string;
  allowTags?: boolean;
  tagOptions?: string[];
  requireConsent?: boolean;
  consentText?: string;
  // Video settings
  maxVideoDurationSeconds?: number;
  allowWebcamRecording?: boolean;
  // Automation
  autoTag?: string;
  autoApprove?: boolean;
}

export interface CollectionFormStep {
  id: string;
  type: 'rating' | 'text' | 'video' | 'profile' | 'tags';
  title: string;
  description?: string;
  required?: boolean;
}

// ── Review / Testimonial ────────────────────────────────────
export type ImportSource =
  | 'form'
  | 'twitter'
  | 'linkedin'
  | 'google'
  | 'g2'
  | 'trustpilot'
  | 'producthunt'
  | 'capterra'
  | 'yelp'
  | 'shopify'
  | 'appstore'
  | 'playstore'
  | 'facebook'
  | 'reddit'
  | 'csv'
  | 'api'
  | 'chrome_extension'
  | 'zapier'
  | 'manual'
  | 'import';

export interface Review {
  id: string;
  projectId?: string;
  collectionFormId?: string;
  workspaceId?: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  companyLogoUrl?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  rating: number; // 1 to 5
  title?: string;
  content: string;
  type: ReviewType;
  videoUrl?: string;
  videoThumbnailUrl?: string;
  videoTranscript?: string;
  videoDurationSeconds?: number;
  tags: string[];
  source: ImportSource;
  sourceUrl?: string;          // Original URL of imported review
  sourcePlatformId?: string;   // ID on the source platform
  status: ReviewStatus;
  isFeatured: boolean;
  consent: boolean;
  helpfulCount?: number;
  // AI / Sentiment
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;     // 0-1
  keywords?: string[];
  language?: string;           // ISO 639-1 code
  translatedContent?: string;
  translatedLanguage?: string;
  // Metadata
  createdAt: string; // ISO string
  updatedAt?: string;
  importedAt?: string;
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'source' | 'status' | 'isFeatured' | 'helpfulCount'> & {
  source?: ImportSource;
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
  // Extended stats
  sourceBreakdown?: Record<string, number>;
  sentimentBreakdown?: { positive: number; neutral: number; negative: number };
  topKeywords?: string[];
  monthlyTrend?: { month: string; count: number }[];
}

export interface ReviewFilters {
  search: string;
  status: ReviewStatus | 'all';
  rating: number | 'all'; // 1-5 or 'all'
  tag: string | 'all';
  type?: ReviewType | 'all';
  source?: ImportSource | 'all';
  formId?: string | 'all';
  sentiment?: 'positive' | 'neutral' | 'negative' | 'all';
  sortBy: 'createdAt' | 'rating' | 'name';
  sortOrder: 'asc' | 'desc';
}

// ── Import ──────────────────────────────────────────────────
export type ImportPlatform =
  | 'google_reviews'
  | 'twitter'
  | 'linkedin'
  | 'g2'
  | 'trustpilot'
  | 'producthunt'
  | 'capterra'
  | 'yelp'
  | 'shopify'
  | 'appstore'
  | 'playstore'
  | 'facebook'
  | 'reddit'
  | 'csv'
  | 'manual';

export interface ImportJob {
  id: string;
  workspaceId: string;
  projectId: string;
  platform: ImportPlatform;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sourceUrl?: string;
  totalFound: number;
  totalImported: number;
  errors?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface CsvColumnMapping {
  name?: string;
  email?: string;
  rating?: string;
  content?: string;
  title?: string;
  company?: string;
  role?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  companyLogoUrl?: string;
  tags?: string;
  date?: string;
}

// ── Widget Types (20+ Senja-class styles) ───────────────────
export type WidgetType =
  | 'wall'
  | 'carousel'
  | 'badge'
  | 'spotlight'
  // New Senja-class widget types
  | 'masonry'
  | 'masonry_scroll'
  | 'slab_carousel'
  | 'loppa_carousel'
  | 'candy_carousel'
  | 'andoya_carousel'
  | 'mayen_carousel'
  | 'bubble_list'
  | 'quote_grid'
  | 'avatars_grid'
  | 'hero_quote'
  | 'bricks'
  | 'bold_highlights'
  | 'social_star'
  | 'image_gallery'
  | 'company_logos'
  | 'single_video'
  | 'rating_badge'
  | 'rating_badge_compact'
  | 'email_signature'
  | 'floating_tab'
  | 'social_toast';

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
  // Extended settings
  showBranding?: boolean;           // "Powered by Panda Praise" (gated by plan)
  autoScroll?: boolean;
  scrollSpeed?: number;
  animationStyle?: 'fade' | 'slide' | 'none';
  borderRadius?: number;
  cardStyle?: 'default' | 'minimal' | 'bordered' | 'shadow' | 'glassmorphism';
  fontFamily?: string;
  fontSize?: 'sm' | 'md' | 'lg';
  layout?: 'grid' | 'masonry' | 'list';
  columns?: number;
  gap?: number;
  // Auto-add filters
  autoAddByRating?: number;         // minimum star rating
  autoAddBySentiment?: 'positive' | 'all';
  autoAddByTags?: string[];
  // CTA
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaColor?: string;
  // Floating Tab & Drawer Settings (Senja-style)
  tabPosition?: 'bottom-right' | 'bottom-left' | 'side-right' | 'side-left';
  tabText?: string;
  tabAllowSubmit?: boolean;
  // Rich Snippets
  richSnippetsEnabled?: boolean;
}

// ── Wall of Love ────────────────────────────────────────────
export type WallOfLoveTheme = 'default' | 'noire' | 'pastel' | 'whimsical' | 'vibrant' | 'hong_kong';

export interface WallOfLoveConfig {
  id: string;
  projectId: string;
  workspaceId: string;
  slug: string;
  title: string;
  subtitle?: string;
  theme: WallOfLoveTheme;
  layout: 'masonry' | 'grid' | 'list';
  showFilters: boolean;
  filterTags?: string[];
  ctaEnabled: boolean;
  ctaText?: string;
  ctaUrl?: string;
  customDomain?: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ── Social / Publishing ─────────────────────────────────────
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

// ── API & Webhooks ──────────────────────────────────────────
export interface ApiKey {
  id: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;        // First 8 chars for display
  keyHash: string;           // SHA-256 hash of the full key
  scopes: ('read' | 'write' | 'delete')[];
  lastUsedAt?: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export type WebhookEvent =
  | 'testimonial.created'
  | 'testimonial.approved'
  | 'testimonial.rejected'
  | 'testimonial.deleted'
  | 'testimonial.featured'
  | 'form.submitted';

export interface WebhookConfig {
  id: string;
  workspaceId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  lastDeliveredAt?: string;
  lastStatus?: number;
  failureCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: string;
  statusCode?: number;
  response?: string;
  success: boolean;
  deliveredAt: string;
}

// ── Email Request Flows ─────────────────────────────────────
export type EmailTriggerType = 'manual' | 'post_purchase' | 'post_support' | 'milestone' | 'scheduled';

export interface EmailRequestFlow {
  id: string;
  workspaceId: string;
  projectId: string;
  name: string;
  triggerType: EmailTriggerType;
  delayMinutes: number;       // Delay after trigger event
  subject: string;
  body: string;               // HTML template
  collectionFormId: string;   // Link to the form
  isActive: boolean;
  sentCount: number;
  responseCount: number;
  createdAt: string;
  updatedAt?: string;
}

// ── Notifications ───────────────────────────────────────────
export interface AppNotification {
  id: string;
  workspaceId: string;
  type: 'testimonial_received' | 'import_complete' | 'plan_limit' | 'team_invite' | 'webhook_failure' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ── Plan Limits ─────────────────────────────────────────────
export interface PlanLimits {
  maxTestimonials: number;     // -1 = unlimited
  maxProjects: number;
  maxSeats: number;
  maxWidgets: number;
  removeBranding: boolean;
  hdVideo: boolean;
  richSnippets: boolean;
  translation: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  customDomain: boolean;
  sentimentAnalysis: boolean;
  caseStudyGenerator: boolean;
  zapierIntegration: boolean;
  prioritySupport: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxTestimonials: 15,
    maxProjects: 1,
    maxSeats: 1,
    maxWidgets: 3,
    removeBranding: false,
    hdVideo: false,
    richSnippets: false,
    translation: false,
    apiAccess: false,
    webhooks: false,
    customDomain: false,
    sentimentAnalysis: false,
    caseStudyGenerator: false,
    zapierIntegration: false,
    prioritySupport: false,
  },
  starter: {
    maxTestimonials: -1,
    maxProjects: 1,
    maxSeats: 2,
    maxWidgets: 10,
    removeBranding: true,
    hdVideo: true,
    richSnippets: false,
    translation: false,
    apiAccess: true,
    webhooks: true,
    customDomain: true,
    sentimentAnalysis: true,
    caseStudyGenerator: false,
    zapierIntegration: true,
    prioritySupport: false,
  },
  pro: {
    maxTestimonials: -1,
    maxProjects: 5,
    maxSeats: 5,
    maxWidgets: -1,
    removeBranding: true,
    hdVideo: true,
    richSnippets: true,
    translation: true,
    apiAccess: true,
    webhooks: true,
    customDomain: true,
    sentimentAnalysis: true,
    caseStudyGenerator: true,
    zapierIntegration: true,
    prioritySupport: true,
  },
};

/** Check if a workspace can use a given feature */
export function canUsePlanFeature(plan: PlanTier, feature: keyof PlanLimits): boolean {
  const limits = PLAN_LIMITS[plan];
  const value = limits[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return false;
}

/** Check if a workspace has reached a numeric limit */
export function isAtPlanLimit(plan: PlanTier, field: 'maxTestimonials' | 'maxProjects' | 'maxSeats' | 'maxWidgets', currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan][field];
  if (limit === -1) return false; // unlimited
  return currentCount >= limit;
}

// ── AI Sentiment Analysis ───────────────────────────────────
export interface SentimentResult {
  score: number;         // 0 (negative) to 1 (positive)
  label: 'positive' | 'neutral' | 'negative';
  emotion: string;       // Primary emotion detected (joy, trust, gratitude, surprise, frustration)
  topics: string[];      // Key topics mentioned
  summary: string;       // Human-readable summary
  analyzedAt: string;    // ISO timestamp
}
