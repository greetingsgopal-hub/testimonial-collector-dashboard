import { WorkerEnv, ExecutionContext, ScheduledEvent } from './types';
import { handleOptionsPreflight } from './lib/cors';
import { handleOAuthInit } from './handlers/oauthInit';
import { handleOAuthCallback } from './handlers/oauthCallback';
import { handleGoogleAuthInit } from './handlers/googleAuthInit';
import { handleGoogleAuthCallback } from './handlers/googleAuthCallback';
import { handleGooglePlaceImport } from './handlers/googlePlaceImport';
import { handleLinkedInAuthInit } from './handlers/linkedinAuthInit';
import { handleLinkedInAuthCallback } from './handlers/linkedinAuthCallback';
import { handleInstagramAuthInit } from './handlers/instagramAuthInit';
import { handleInstagramAuthCallback } from './handlers/instagramAuthCallback';
import { handleInstagramFetchMentions } from './handlers/instagramFetchMentions';
import { handleFacebookAuthInit } from './handlers/facebookAuthInit';
import { handleFacebookAuthCallback } from './handlers/facebookAuthCallback';
import { handleFacebookWebhook } from './handlers/facebookWebhook';
import { handleSocialPublish } from './handlers/socialPublish';
import { handleSocialStatus } from './handlers/socialStatus';
import { handleSocialDisconnect } from './handlers/socialDisconnect';
import { handleEmbedScript } from './handlers/embedScript';
import { handleEmbedTestimonials } from './handlers/embedTestimonials';
import { executeAutomatedBackgroundSync } from './lib/backgroundSync';

export default {
  async fetch(request: Request, env: WorkerEnv, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Public Static Client-Side JavaScript Runtime for Wall of Love Embed
    if (pathname === '/embed.js' || pathname === '/embed.min.js') {
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

      // 2. Normalize endpoint name
      const endpoint = pathname.replace(/^\/api\//, '').split('?')[0].replace(/\/$/, '');

      switch (endpoint) {
        case 'auth/facebook':
        case 'facebook-auth':
          return await handleFacebookAuthInit(request, env);

        case 'auth/facebook/callback':
        case 'facebook-callback':
          return await handleFacebookAuthCallback(request, env);

        case 'webhook/facebook':
        case 'facebook-webhook':
          return await handleFacebookWebhook(request, env);

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

        case 'google/import-place':
        case 'google-place-import':
        case 'places/import':
          return await handleGooglePlaceImport(request, env);

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

        default:
          return new Response(JSON.stringify({ error: `API route '${pathname}' not found.` }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          });
      }
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
