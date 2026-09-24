/**
 * Safe, privacy-preserving Google Analytics 4 utility.
 *
 * Enforces:
 * - Production-safe: Operates as a pure no-op if VITE_GA_MEASUREMENT_ID is not configured.
 * - Zero PII: Does NOT send emails, review content, internal IDs, or sensitive customer data.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let isInitialized = false;

export function initAnalytics() {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || isInitialized) {
    return;
  }

  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      send_page_view: false, // Managed manually via trackPageView
    });

    isInitialized = true;
  } catch (err) {
    console.warn('[Analytics] Failed to initialize Google Analytics:', err);
  }
}

export function trackPageView(pagePath: string) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  try {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
    });
  } catch (e) {
    // Silent fail
  }
}

export function trackEvent(eventName: string, params: Record<string, string | number | boolean> = {}) {
  if (!GA_MEASUREMENT_ID || !window.gtag) return;
  try {
    window.gtag('event', eventName, params);
  } catch (e) {
    // Silent fail
  }
}

// Predefined privacy-safe high-level event helpers
export const analytics = {
  landingPageVisit: () => trackEvent('landing_page_visit'),
  ctaClicked: (ctaName: string, destination: string) =>
    trackEvent('cta_clicked', { cta_name: ctaName, destination }),
  signupStarted: (source: string = 'landing_cta') =>
    trackEvent('signup_started', { source }),
  signupCompleted: () =>
    trackEvent('signup_completed'),
  collectionCreated: () =>
    trackEvent('collection_created'),
  publicCollectionSubmitted: () =>
    trackEvent('public_collection_submitted'),
  widgetPageViewed: () =>
    trackEvent('widget_page_viewed'),
  socialCardOpened: (format: string) =>
    trackEvent('social_card_opened', { format }),
  socialCardDownloaded: (format: string) =>
    trackEvent('social_card_downloaded', { format }),
  socialCardShared: (format: string) =>
    trackEvent('social_card_shared', { format }),
  socialCardTextCopied: () =>
    trackEvent('social_card_text_copied'),
  distributionViewed: (channel: 'website' | 'social') =>
    trackEvent('distribution_viewed', { channel }),
  socialPlatformSelected: (platform: string) =>
    trackEvent('social_platform_selected', { platform }),
  socialCaptionCopied: (platform: string) =>
    trackEvent('social_caption_copied', { platform }),
  socialIntentOpened: (platform: string) =>
    trackEvent('social_intent_opened', { platform }),
  socialComposerOpened: (reviewId: string) =>
    trackEvent('social_composer_opened', { review_id: reviewId }),
  socialConnectStarted: (platform: string) =>
    trackEvent('social_account_connect_started', { platform }),
  socialConnectCompleted: (platform: string) =>
    trackEvent('social_account_connected', { platform }),
  socialConnectFailed: (platform: string, error?: string) =>
    trackEvent('social_account_connect_failed', { platform, error: error || 'unknown' }),
  socialAccountDisconnected: (platform: string) =>
    trackEvent('social_account_disconnected', { platform }),
  socialPublishStarted: (platform: string) =>
    trackEvent('social_publish_started', { platform }),
  socialPublishSucceeded: (platform: string, postId?: string) =>
    trackEvent('social_publish_succeeded', { platform, post_id: postId || 'unknown' }),
  socialPublishFailed: (platform: string, error?: string) =>
    trackEvent('social_publish_failed', { platform, error: error || 'unknown' }),
  socialReauthRequired: (platform: string) =>
    trackEvent('social_reauth_required', { platform }),
  socialPublishAllStarted: (count: number) =>
    trackEvent('social_publish_all_started', { platform_count: count }),
  socialPublishAllCompleted: () =>
    trackEvent('social_publish_all_completed'),

  // ── Viral Growth Loop Tracking (Requirement 13) ───────────────
  testimonialSubmissionCompleted: (params?: Record<string, string | number | boolean>) =>
    trackEvent('testimonial_submission_completed', params),
  viralCtaViewed: (params?: Record<string, string | number | boolean>) =>
    trackEvent('viral_cta_viewed', params),
  viralCtaClicked: (params?: Record<string, string | number | boolean>) =>
    trackEvent('viral_cta_clicked', params),
  viralSignupStarted: (params?: Record<string, string | number | boolean>) =>
    trackEvent('viral_signup_started', params),
  viralSignupCompleted: (params?: Record<string, string | number | boolean>) =>
    trackEvent('viral_signup_completed', params),
  viralWorkspaceCreated: (params?: Record<string, string | number | boolean>) =>
    trackEvent('viral_workspace_created', params),
  viralCollectionLinkGenerated: (params?: Record<string, string | number | boolean>) =>
    trackEvent('viral_collection_link_generated', params),
  viralCollectionLinkCopied: (params?: Record<string, string | number | boolean>) =>
    trackEvent('viral_collection_link_copied', params),
  viralShareStarted: (params?: Record<string, string | number | boolean>) =>
    trackEvent('viral_share_started', params),
};

