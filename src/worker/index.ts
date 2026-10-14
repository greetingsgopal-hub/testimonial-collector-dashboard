import { WorkerEnv, ExecutionContext, ScheduledEvent } from './types';
import { handleOptionsPreflight } from './lib/cors';
import { handleOAuthInit } from './handlers/oauthInit';
import { handleOAuthCallback } from './handlers/oauthCallback';
import { handleGoogleAuthInit } from './handlers/googleAuthInit';
import { handleGoogleAuthCallback } from './handlers/googleAuthCallback';
import { handleGooglePlaceImport, handleGooglePlaceResolve } from './handlers/googlePlaceImport';
import {
  handleGoogleBusinessDiscover,
  handleGoogleBusinessPreviewReviews,
  handleGoogleBusinessImportReviews,
} from './handlers/googleBusinessHandlers';
import { handleLinkedInAuthInit } from './handlers/linkedinAuthInit';
import { handleLinkedInAuthCallback } from './handlers/linkedinAuthCallback';
import { handleInstagramAuthInit } from './handlers/instagramAuthInit';
import { handleInstagramAuthCallback } from './handlers/instagramAuthCallback';
import { handleInstagramFetchMentions } from './handlers/instagramFetchMentions';
import { handleFacebookAuthInit } from './handlers/facebookAuthInit';
import { handleFacebookAuthCallback } from './handlers/facebookAuthCallback';
import { handleFacebookPageSelection } from './handlers/facebookPageSelection';
import { handleFacebookWebhook } from './handlers/facebookWebhook';
import { handleStripeWebhook } from './handlers/stripeWebhook';
import { handleReviewInviteWebhook } from './handlers/reviewInviteWebhook';
import { handleCreateCheckoutSession, handleBillingPortal, handleGetSubscription } from './handlers/stripeCheckout';
import { handleRazorpayCheckout } from './handlers/razorpayCheckout';
import { handleRazorpayWebhook } from './handlers/razorpayWebhook';
import { handleSocialPublish } from './handlers/socialPublish';
import { handleSocialStatus } from './handlers/socialStatus';
import { handleSocialDisconnect } from './handlers/socialDisconnect';
import { handleEmbedScript } from './handlers/embedScript';
import { handleEmbedTestimonials } from './handlers/embedTestimonials';
import { handleImportProvider } from './handlers/importProviderHandler';
import { handleUniversalUrlResolve, handleUniversalReviewsCommit } from './handlers/universalImportHandler';
import { handleVerifyWidget } from './handlers/verifyWidget';
import { executeAutomatedBackgroundSync } from './lib/backgroundSync';
import { handleCampaignTriggerWebhook } from './handlers/campaignTriggerWebhook';
import { handleCampaignTrackClick, handleCampaignDispatchTrigger } from './handlers/campaignTrackHandler';
import { handleReferralRedirect, handleReferralStats } from './handlers/referralHandler';
import { handleSitemapXml, handleRobotsTxt, handleSeoPagePreRender } from './handlers/seoHandler';
import { handleWebhookTestDispatch } from './handlers/alertWebhooks';
import { handlePublicApi } from './handlers/publicApiHandler';
import { handleAffiliatesApi } from './handlers/affiliateHandler';
import { handlePppGeoDetection } from './handlers/pppHandler';
import { handlePublicTestimonialSubmit } from './handlers/publicSubmissionHandler';
import { handleAccountDeletion } from './handlers/accountDeletionHandler';
import { handleAdminGetWorkspaces, handleAdminUpdateWorkspacePlan } from './handlers/admin';

export default {
  async fetch(request: Request, env: WorkerEnv, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Technical SEO: Dynamic XML Sitemap & Robots.txt
    if (pathname === '/sitemap.xml') {
      return await handleSitemapXml(request, env);
    }
    if (pathname === '/robots.txt') {
      return await handleRobotsTxt(request, env);
    }

    // In-App Referral Funnel (/r/:code) -> Sets 60-day cookie and redirects
    if (pathname.startsWith('/r/')) {
      return await handleReferralRedirect(request, env);
    }

    // Public Static Client-Side JavaScript Runtime for Wall of Love Embed
    if (
      pathname === '/embed.js' ||
      pathname === '/embed.min.js' ||
      pathname === '/widget.js' ||
      pathname === '/widget.min.js'
    ) {
      return handleEmbedScript(request, env);
    }

    // Check if the request is destined for an API endpoint or webhook
    const isApiRoute =
      pathname.startsWith('/api/') ||
      pathname.startsWith('/api/webhook/');

    if (isApiRoute) {
      // 1. Handle CORS Preflight for API routes
      const preflight = handleOptionsPreflight(request);
      if (preflight) return preflight;

      // Public REST API & Developer Keys (/api/v1/*)
      if (pathname.startsWith('/api/v1/')) {
        return await handlePublicApi(request, env);
      }

      // Self-Serve Affiliate & Partner Engine (/api/affiliates/*)
      if (pathname.startsWith('/api/affiliates/')) {
        return await handleAffiliatesApi(request, env);
      }

      // 2. Normalize endpoint name
      const endpoint = pathname.replace(/^\/api\//, '').split('?')[0].replace(/\/$/, '');

      // Superadmin Platform Console Endpoints
      if (endpoint === 'admin/workspaces') {
        return await handleAdminGetWorkspaces(request, env);
      }
      const adminPlanMatch = endpoint.match(/^admin\/workspaces\/([^/]+)\/plan$/);
      if (adminPlanMatch) {
        return await handleAdminUpdateWorkspacePlan(request, env, decodeURIComponent(adminPlanMatch[1]));
      }

      switch (endpoint) {
        case 'geo/ppp':
        case 'ppp':
          return await handlePppGeoDetection(request, env);

        case 'webhook/test':
        case 'webhooks/test':
          return await handleWebhookTestDispatch(request, env);
        // Unauthenticated liveness and binding health probe for uptime monitoring.
        // Deliberately safe: boolean checks only, no secret values exposed.
        case 'health': {
          return new Response(
            JSON.stringify({
              status: 'ok',
              service: 'pandapraise-api',
              bindings: {
                rateLimitKv: Boolean(env.RATE_LIMIT_KV),
                firebaseConfigured: Boolean(env.FIREBASE_PROJECT_ID),
                razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
                stripeConfigured: Boolean(env.STRIPE_SECRET_KEY),
              },
              timestamp: new Date().toISOString(),
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        case 'auth/facebook':
        case 'facebook-auth':
          return await handleFacebookAuthInit(request, env);

        case 'auth/facebook/callback':
        case 'facebook-callback':
          return await handleFacebookAuthCallback(request, env);

        case 'facebook/pages':
        case 'facebook/select-page':
          return await handleFacebookPageSelection(request, env);

        case 'webhook/facebook':
        case 'facebook-webhook':
          return await handleFacebookWebhook(request, env);

        // Automated Review Collection Inbound Webhook
        case 'webhook/review-invite':
        case 'review-invite':
        case 'trigger-review':
          return await handleReviewInviteWebhook(request, env);

        // Automated Review Drip Campaigns (Stage 5)
        case 'webhook/campaign-trigger':
        case 'campaigns/trigger':
          return await handleCampaignTriggerWebhook(request, env);

        case 'campaigns/track-click':
        case 'campaign/track':
          return await handleCampaignTrackClick(request, env);

        case 'campaigns/dispatch':
        case 'campaign/dispatch':
          return await handleCampaignDispatchTrigger(request, env);

        // Razorpay billing (India-first processor)
        case 'razorpay/checkout':
          return await handleRazorpayCheckout(request, env);

        case 'webhook/razorpay':
        case 'webhooks/razorpay':
        case 'razorpay-webhook':
          return await handleRazorpayWebhook(request, env);

        // Stripe subscription billing (legacy fallback)
        case 'webhooks/stripe':
        case 'stripe-webhook':
          return await handleStripeWebhook(request, env);

        case 'stripe/checkout':
          return await handleCreateCheckoutSession(request, env);

        case 'stripe/billing-portal':
          return await handleBillingPortal(request, env);

        case 'stripe/subscription':
          return await handleGetSubscription(request, env);

        case 'auth/instagram':
        case 'instagram-auth':
          return await handleInstagramAuthInit(request, env);

        case 'auth/instagram/callback':
        case 'instagram-callback':
          return await handleInstagramAuthCallback(request, env);

        case 'instagram/fetch-mentions':
        case 'instagram-fetch-mentions':
        case 'instagram/import-post':
          return await handleInstagramFetchMentions(request, env);

        case 'auth/linkedin':
        case 'linkedin-auth':
          return await handleLinkedInAuthInit(request, env);

        case 'auth/linkedin/callback':
        case 'linkedin-callback':
          return await handleLinkedInAuthCallback(request, env);

        case 'auth/google':
        case 'google-auth':
          return await handleGoogleAuthInit(request, env);

        case 'auth/google/callback':
        case 'google-callback':
          return await handleGoogleAuthCallback(request, env);

        case 'google/resolve-place':
        case 'google-place-resolve':
        case 'places/resolve':
          return await handleGooglePlaceResolve(request, env);

        case 'google/import-place':
        case 'google-place-import':
        case 'places/import':
          return await handleGooglePlaceImport(request, env);

        case 'google/discover-businesses':
        case 'google-discover-businesses':
          return await handleGoogleBusinessDiscover(request, env);

        case 'google/preview-business-reviews':
        case 'google-preview-business-reviews':
          return await handleGoogleBusinessPreviewReviews(request, env);

        case 'google/import-business-reviews':
        case 'google-import-business-reviews':
          return await handleGoogleBusinessImportReviews(request, env);

        case 'oauth-init':
          return await handleOAuthInit(request, env);

        case 'oauth-callback':
          return await handleOAuthCallback(request, env);

        case 'social-publish':
          return await handleSocialPublish(request, env);

        case 'social-status':
          return await handleSocialStatus(request, env);

        case 'social-disconnect':
          return await handleSocialDisconnect(request, env);

        case 'embed/testimonials':
        case 'embed-testimonials':
        case 'testimonials/embed':
          return await handleEmbedTestimonials(request, env);

        case 'verify-widget':
        case 'public/verify-widget':
        case 'widget/verify':
          return await handleVerifyWidget(request, env);

        case 'import':
        case 'import-reviews':
        case 'import/provider':
          return await handleImportProvider(request, env);

        case 'import/resolve-url':
        case 'import/resolve':
        case 'import-resolve-url':
          return await handleUniversalUrlResolve(request, env);

        case 'import/commit-reviews':
        case 'import/commit':
        case 'import-commit-reviews':
          return await handleUniversalReviewsCommit(request, env);

        case 'referral/stats':
        case 'referral-stats':
          return await handleReferralStats(request, env);

        // Public testimonial submission (Turnstile & IP rate limiting)
        case 'testimonials/submit':
        case 'testimonial/submit':
          return await handlePublicTestimonialSubmit(request, env);

        // Self-service account deletion (GDPR Right to Erasure cascade)
        case 'account/delete':
        case 'account/purge':
          return await handleAccountDeletion(request, env);

        default:
          return new Response(JSON.stringify({ error: `API route '${pathname}' not found.` }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
      }
    }

    // Programmatic SEO: Edge pre-rendered competitor and use-case pages
    const seoPageResponse = await handleSeoPagePreRender(request, env);
    if (seoPageResponse) {
      return seoPageResponse;
    }

    // Static Assets & Single-Page Application routing fallback
    if (env.ASSETS) {
      return await env.ASSETS.fetch(request);
    }

    return new Response('Asset binding not configured.', { status: 500 });
  },

  /**
   * Automated cron trigger for background polling of Facebook and Instagram praise
   */
  async scheduled(event: ScheduledEvent, env: WorkerEnv, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(executeAutomatedBackgroundSync(event, env, ctx));
  },
};
