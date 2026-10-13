import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';

export interface AlertTestimonialData {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorCompany?: string;
  rating: number;
  text: string;
  spaceSlug?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export function formatSlackTestimonialPayload(review: AlertTestimonialData, origin: string = 'https://pandapraise.com') {
  const stars = '⭐'.repeat(Math.max(1, Math.min(5, Math.round(review.rating))));
  const company = review.authorCompany ? ` (${review.authorCompany})` : '';
  const dashboardLink = `${origin}/dashboard/space/${review.spaceSlug || 'default'}`;

  return {
    text: `New ${review.rating}-star testimonial from ${review.authorName}${company}: "${review.text.slice(0, 100)}..."`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🎉 New Testimonial Received! (${stars})`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Rating:* ${stars}\n*Author:* *${review.authorName}*${company}\n*Quote:*\n> "${review.text}"`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View in Dashboard',
              emoji: true,
            },
            url: dashboardLink,
            style: 'primary',
          },
        ],
      },
    ],
  };
}

export function formatDiscordTestimonialPayload(review: AlertTestimonialData, origin: string = 'https://pandapraise.com') {
  const stars = '⭐'.repeat(Math.max(1, Math.min(5, Math.round(review.rating))));
  const company = review.authorCompany ? ` (${review.authorCompany})` : '';
  const dashboardLink = `${origin}/dashboard/space/${review.spaceSlug || 'default'}`;

  return {
    embeds: [
      {
        title: `🎉 New ${review.rating}-Star Testimonial Received!`,
        url: dashboardLink,
        color: 0x6701e6, // PandaPraise brand purple
        description: `"${review.text}"`,
        fields: [
          {
            name: 'Reviewer',
            value: `${review.authorName}${company}`,
            inline: true,
          },
          {
            name: 'Rating',
            value: `${stars} (${review.rating}/5)`,
            inline: true,
          },
        ],
        footer: {
          text: 'PandaPraise Distribution Engine',
          icon_url: `${origin}/favicon.ico`,
        },
        timestamp: review.createdAt || new Date().toISOString(),
      },
    ],
  };
}

export function formatGenericWebhookPayload(
  event: 'testimonial.created' | 'testimonial.approved' | 'testimonial.deleted',
  review: AlertTestimonialData
) {
  return {
    event,
    timestamp: new Date().toISOString(),
    data: {
      ...review,
    },
  };
}

export async function dispatchSlackAlert(
  webhookUrl: string,
  review: AlertTestimonialData,
  origin: string = 'https://pandapraise.com'
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = formatSlackTestimonialPayload(review, origin);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Slack returned HTTP ${res.status}: ${errText}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to dispatch Slack alert' };
  }
}

export async function dispatchDiscordAlert(
  webhookUrl: string,
  review: AlertTestimonialData,
  origin: string = 'https://pandapraise.com'
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = formatDiscordTestimonialPayload(review, origin);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Discord returned HTTP ${res.status}: ${errText}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to dispatch Discord alert' };
  }
}

export async function dispatchGenericWebhook(
  webhookUrl: string,
  event: 'testimonial.created' | 'testimonial.approved' | 'testimonial.deleted',
  review: AlertTestimonialData
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = formatGenericWebhookPayload(event, review);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PandaPraise-Event': event,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { success: false, error: `Webhook returned HTTP ${res.status}` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to dispatch generic webhook' };
  }
}

/**
 * Worker handler for testing webhook integrations from the dashboard settings
 * POST /api/webhooks/test
 */
export async function handleWebhookTestDispatch(
  request: Request,
  _env: WorkerEnv
): Promise<Response> {
  const corsHeaders = getCorsHeaders(request.headers.get('Origin'));

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { platform, targetUrl, customData } = body;

  if (!platform || !targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing targetUrl or platform' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const sampleReview: AlertTestimonialData = customData || {
    id: 'test_sample_001',
    authorName: 'Alex Rivera',
    authorCompany: 'Rivera Labs',
    authorEmail: 'alex@riveralabs.com',
    rating: 5,
    text: 'PandaPraise is brilliant! We captured 20+ video testimonials on day one and our sales pitch conversion doubled.',
    spaceSlug: 'demo-space',
    createdAt: new Date().toISOString(),
  };

  const url = new URL(request.url);
  const origin = url.origin;

  let dispatchResult: { success: boolean; error?: string };

  switch (platform.toLowerCase()) {
    case 'slack':
      dispatchResult = await dispatchSlackAlert(targetUrl, sampleReview, origin);
      break;
    case 'discord':
      dispatchResult = await dispatchDiscordAlert(targetUrl, sampleReview, origin);
      break;
    case 'generic':
    case 'zapier':
    case 'make':
      dispatchResult = await dispatchGenericWebhook(targetUrl, 'testimonial.created', sampleReview);
      break;
    default:
      return new Response(JSON.stringify({ error: `Unsupported webhook platform: ${platform}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
  }

  if (!dispatchResult.success) {
    return new Response(JSON.stringify({ error: dispatchResult.error }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Test alert successfully sent to ${platform}!`,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
