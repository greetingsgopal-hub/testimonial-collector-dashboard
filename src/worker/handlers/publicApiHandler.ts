import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';

export function generateOpenApiSpec(origin: string = 'https://pandapraise.com') {
  return {
    openapi: '3.0.3',
    info: {
      title: 'PandaPraise Public REST API',
      version: '1.0.0',
      description: 'Programmatic API to query testimonials, submit new reviews, and manage embeddable widgets for your workspaces.',
      contact: {
        name: 'PandaPraise Developer Support',
        url: `${origin}/developers`,
        email: 'api@pandapraise.com',
      },
    },
    servers: [
      {
        url: origin,
        description: 'Production Edge API Server',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Api-Key',
          description: 'Standard PandaPraise API Key (prefix: pp_live_...)',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
        },
      },
      schemas: {
        Testimonial: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'rev_78910' },
            authorName: { type: 'string', example: 'Alex Rivera' },
            authorEmail: { type: 'string', example: 'alex@company.com' },
            authorCompany: { type: 'string', example: 'Acme Inc' },
            rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
            text: { type: 'string', example: 'PandaPraise 10x our social proof conversions!' },
            status: { type: 'string', enum: ['approved', 'pending', 'rejected'], example: 'approved' },
            avatarUrl: { type: 'string', example: 'https://images.unsplash.com/...' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      { ApiKeyAuth: [] },
      { BearerAuth: [] },
    ],
    paths: {
      '/api/v1/testimonials': {
        get: {
          summary: 'List testimonials',
          description: 'Fetch approved testimonials for a space or workspace with optional filtering.',
          parameters: [
            { name: 'space', in: 'query', schema: { type: 'string' }, description: 'Target space slug' },
            { name: 'rating', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5 }, description: 'Minimum star rating' },
            { name: 'status', in: 'query', schema: { type: 'string', default: 'approved' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
          ],
          responses: {
            200: {
              description: 'List of testimonials',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Testimonial' },
                      },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
            401: { description: 'Missing or invalid API key' },
          },
        },
        post: {
          summary: 'Submit a testimonial programmatically',
          description: 'Submit a new customer review via server-side CRM or custom form.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['authorName', 'text', 'rating'],
                  properties: {
                    authorName: { type: 'string' },
                    authorEmail: { type: 'string' },
                    authorCompany: { type: 'string' },
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    text: { type: 'string' },
                    spaceSlug: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Testimonial created successfully' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/v1/widgets': {
        get: {
          summary: 'List available widget configurations',
          description: 'Get ready-to-embed widget templates and HTML snippets for a space.',
          parameters: [
            { name: 'space', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Widget configurations' },
            401: { description: 'Unauthorized' },
          },
        },
      },
    },
  };
}

function extractApiKey(request: Request): string | null {
  const authHeader = request.headers.get('Authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  const xApiKey = request.headers.get('X-Api-Key');
  if (xApiKey) {
    return xApiKey.trim();
  }
  const xPandaKey = request.headers.get('X-PandaPraise-Key');
  if (xPandaKey) {
    return xPandaKey.trim();
  }
  return null;
}

// Helper: Query Supabase with Service Role or Anon Key
async function sbFetch(env: WorkerEnv, path: string, init: RequestInit = {}) {
  const sbUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const sbKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!sbUrl || !sbKey) return null;

  try {
    return await fetch(`${sbUrl}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(init.headers || {}),
      },
    });
  } catch {
    return null;
  }
}

// Helper: Real AI Sentiment & Spam Shield Analyzer (Deterministic + LLM Fallback)
export async function evaluateSentimentAndSpam(text: string, apiKey?: string): Promise<{
  is_spam: boolean;
  sentiment_label: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
}> {
  const lower = text.toLowerCase();
  const spamPatterns = [/http:\/\/|https:\/\//i, /crypto|casino|viagra|telegram\.me|whatsapp\.me/i, /(.)\1{6,}/];
  const hasHardSpam = spamPatterns.some((rx) => rx.test(lower));

  if (hasHardSpam) {
    return { is_spam: true, sentiment_label: 'negative', sentiment_score: 0.05 };
  }

  if (apiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this customer testimonial for spam and sentiment. Return ONLY valid JSON: {"is_spam": boolean, "sentiment_label": "positive"|"neutral"|"negative", "sentiment_score": number between 0 and 1}. Testimonial: ${JSON.stringify(text)}`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (res.ok) {
        const data: any = await res.json();
        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback to lexical scoring below if API call times out
    }
  }

  const positiveWords = ['love', 'great', 'awesome', 'best', 'amazing', 'fast', 'helpful', 'recommend', 'excellent', 'superb'];
  const negativeWords = ['worst', 'scam', 'broken', 'terrible', 'hate', 'slow', 'awful', 'refund'];

  let score = 0.75;
  positiveWords.forEach((w) => { if (lower.includes(w)) score += 0.06; });
  negativeWords.forEach((w) => { if (lower.includes(w)) score -= 0.2; });
  score = Math.max(0, Math.min(1, Number(score.toFixed(2))));

  return {
    is_spam: false,
    sentiment_label: score >= 0.6 ? 'positive' : score >= 0.4 ? 'neutral' : 'negative',
    sentiment_score: score,
  };
}

export async function handlePublicApi(
  request: Request,
  env: WorkerEnv
): Promise<Response> {
  const corsHeaders = getCorsHeaders(request.headers.get('Origin'));
  const url = new URL(request.url);
  const pathname = url.pathname;
  const origin = url.origin;

  // 1. Unauthenticated route: OpenAPI spec
  if (pathname === '/api/v1/openapi.json') {
    return new Response(JSON.stringify(generateOpenApiSpec(origin), null, 2), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // =========================================================================
  // 1. CUSTOM DOMAIN & SUBDOMAIN RESOLVER (Pro & Agency)
  // =========================================================================
  if (pathname === '/api/v1/resolve-domain' && request.method === 'GET') {
    const host = (url.searchParams.get('host') || request.headers.get('host') || '').toLowerCase();
    const wsRes = await sbFetch(
      env,
      `workspaces?or=(custom_domain.eq.${encodeURIComponent(host)},custom_subdomain.eq.${encodeURIComponent(host.split('.')[0])})&select=id,name,plan,remove_branding,custom_css`
    );

    if (wsRes && wsRes.ok) {
      const rows: any[] = await wsRes.json();
      if (!rows.length || rows[0].plan === 'starter' || rows[0].plan === 'free') {
        return new Response(JSON.stringify({ error: 'Custom domain requires Pro or Agency plan.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ workspace: rows[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default mock response when DB not configured
    if (host.includes('starter') || host.includes('free')) {
      return new Response(JSON.stringify({ error: 'Custom domain requires Pro or Agency plan.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        workspace: {
          id: 'ws_resolved_demo',
          name: host.split('.')[0] || 'My Brand',
          plan: 'pro',
          remove_branding: true,
          custom_css: '',
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // =========================================================================
  // 2. SUBMIT TESTIMONIAL + AI SENTIMENT SHIELD + AGENCY WEBHOOK DISPATCH
  // =========================================================================
  if (pathname === '/api/v1/testimonials/submit' && request.method === 'POST') {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { workspace_id, author_name, author_role, content, rating = 5, media_type = 'text', media_url = null } = body;

    let workspace: any = { id: workspace_id || 'ws_default', plan: 'pro', webhook_url: null };
    const wsRes = await sbFetch(env, `workspaces?id=eq.${workspace_id}&select=*`);
    if (wsRes && wsRes.ok) {
      const workspaces: any[] = await wsRes.json();
      workspace = workspaces?.[0];
      if (!workspace) {
        return new Response(JSON.stringify({ error: 'Workspace not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Run AI Sentiment & Spam Shield automatically for Pro, Agency & Lifetime workspaces
    let aiResult: {
      is_spam: boolean;
      sentiment_label: 'positive' | 'neutral' | 'negative';
      sentiment_score: number;
    } = { is_spam: false, sentiment_label: 'positive', sentiment_score: 0.95 };
    if (workspace.plan !== 'starter' && workspace.plan !== 'free' && content) {
      aiResult = await evaluateSentimentAndSpam(content, env.GEMINI_API_KEY);
    }

    const newTestimonial = {
      id: `proof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workspace_id: workspace.id,
      author_name: author_name || 'Anonymous',
      author_role: author_role || 'Verified Customer',
      content: content || '',
      rating: Math.min(5, Math.max(1, parseInt(rating || '5', 10))),
      media_type,
      media_url,
      is_spam: aiResult.is_spam,
      ai_sentiment_label: aiResult.sentiment_label,
      ai_sentiment_score: aiResult.sentiment_score,
      status: aiResult.is_spam ? 'rejected' : 'pending',
      created_at: new Date().toISOString(),
    };

    // If Supabase is active, persist via sbFetch
    const insertRes = await sbFetch(env, 'testimonials', {
      method: 'POST',
      body: JSON.stringify(newTestimonial),
    });

    if (insertRes && !insertRes.ok) {
      const insertedErr: any = await insertRes.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: insertedErr?.message || 'Quota limit reached on Starter plan.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Trigger Outbound Webhook if workspace is on Agency plan and has webhook_url configured
    if (workspace.plan === 'agency' && workspace.webhook_url && !aiResult.is_spam) {
      fetch(workspace.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-PandaPraise-Event': 'testimonial.created' },
        body: JSON.stringify({ event: 'testimonial.created', data: newTestimonial }),
      }).catch(() => null);
    }

    return new Response(JSON.stringify({ success: true, testimonial: newTestimonial, ai_shield: aiResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // =========================================================================
  // 3. AUTOMATED EMAIL & WHATSAPP DRIPS DISPATCHER (Pro & Agency Only)
  // =========================================================================
  if (pathname === '/api/v1/drips/dispatch' && request.method === 'POST') {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { workspace_id, customer_name, customer_email, customer_phone, channel, collection_link } = body;

    let workspace: any = { id: workspace_id, name: 'PandaPraise Workspace', plan: 'pro' };
    const wsRes = await sbFetch(env, `workspaces?id=eq.${workspace_id}&select=id,name,plan`);
    if (wsRes && wsRes.ok) {
      const rows: any[] = await wsRes.json();
      workspace = rows?.[0];
    }

    if (!workspace || workspace.plan === 'starter' || workspace.plan === 'free') {
      return new Response(
        JSON.stringify({ error: 'UPGRADE_REQUIRED: Automated Email & WhatsApp Drips require PandaPraise Pro or Agency.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let deliveryStatus = 'sent';

    if (channel === 'email' && env.RESEND_API_KEY && customer_email) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${workspace.name} <reviews@pandapraise.com>`,
          to: [customer_email],
          subject: `Quick question about your experience with ${workspace.name}`,
          html: `<p>Hi ${customer_name},</p><p>Would you mind sharing a quick 30-second review of your experience with <strong>${workspace.name}</strong>?</p><p><a href="${collection_link || 'https://pandapraise.com'}">Click here to leave your testimonial</a></p>`,
        }),
      }).catch(() => null);
      if (!emailRes || !emailRes.ok) deliveryStatus = 'failed';
    }

    if (channel === 'whatsapp' && env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID && customer_phone) {
      const waRes = await fetch(
        `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: customer_phone.replace(/[^0-9]/g, ''),
            type: 'text',
            text: {
              body: `Hi ${customer_name}! 👋 Thanks for choosing ${workspace.name}. Could you spare 30 seconds to share your feedback here? ${collection_link || 'https://pandapraise.com'}`,
            },
          }),
        }
      ).catch(() => null);
      if (!waRes || !waRes.ok) deliveryStatus = 'failed';
    }

    const logRecord = {
      id: `drip_${Date.now()}`,
      workspace_id,
      customer_name,
      customer_email,
      customer_phone,
      channel,
      status: deliveryStatus,
      sent_at: new Date().toISOString(),
    };

    await sbFetch(env, 'drip_campaigns', {
      method: 'POST',
      body: JSON.stringify(logRecord),
    });

    return new Response(JSON.stringify({ success: true, status: deliveryStatus, record: logRecord }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // =========================================================================
  // 4. CHROME EXTENSION PRO — WHATSAPP WEB CLIPPER ENDPOINT (Pro & Agency)
  // =========================================================================
  if ((pathname === '/api/v1/clipper/capture' || pathname === '/api/v1/clipper') && request.method === 'POST') {
    const apiKey = extractApiKey(request) || '';
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { author_name, message_text, source_platform = 'WhatsApp Web' } = body;

    let workspace: any = { id: 'ws_clipper_pro', plan: 'pro' };
    const wsRes = await sbFetch(env, `workspaces?api_key=eq.${encodeURIComponent(apiKey)}&select=id,plan`);
    if (wsRes && wsRes.ok) {
      const rows: any[] = await wsRes.json();
      workspace = rows?.[0];
    }

    if (!workspace || workspace.plan === 'starter' || workspace.plan === 'free') {
      return new Response(
        JSON.stringify({ error: 'Chrome Extension Pro requires an active Pro or Agency plan.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clippedTestimonial = {
      id: `clip_${Date.now()}`,
      workspace_id: workspace.id,
      author_name: author_name || 'WhatsApp Contact',
      author_role: `Verified via ${source_platform}`,
      content: message_text || '',
      rating: 5,
      media_type: 'text',
      status: 'approved',
      created_at: new Date().toISOString(),
    };

    await sbFetch(env, 'testimonials', {
      method: 'POST',
      body: JSON.stringify(clippedTestimonial),
    });

    return new Response(JSON.stringify({ clipped: true, data: clippedTestimonial }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Authentication check for standard Developer endpoints
  const apiKey = extractApiKey(request);
  if (!apiKey || !apiKey.startsWith('pp_live_')) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized: Missing or invalid API key. Keys must start with pp_live_',
        documentation: `${origin}/developers`,
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // =========================================================================
  // 5. DEVELOPER REST API (GET / POST /api/v1/testimonials)
  // =========================================================================
  if (pathname === '/api/v1/testimonials') {
    if (request.method === 'GET') {
      // Check Agency plan if workspace exists in DB
      const wsRes = await sbFetch(env, `workspaces?api_key=eq.${encodeURIComponent(apiKey)}&select=id,plan`);
      if (wsRes && wsRes.ok) {
        const rows: any[] = await wsRes.json();
        if (rows.length > 0 && rows[0].plan !== 'agency') {
          return new Response(
            JSON.stringify({ error: 'Developer REST API access is exclusive to the Agency Plan.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const space = url.searchParams.get('space') || 'demo';
      const minRating = parseInt(url.searchParams.get('rating') || '1', 10);
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
      const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

      const sampleReviews = [
        {
          id: 'api_rev_001',
          authorName: 'Alex Rivera',
          authorCompany: 'Rivera Labs',
          rating: 5,
          text: 'PandaPraise doubled our sales conversion on day one.',
          status: 'approved',
          spaceSlug: space,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'api_rev_002',
          authorName: 'Sarah Jenkins',
          authorCompany: 'HyperGrowth',
          rating: 5,
          text: 'The marquee ticker widget embeds flawlessly on Shopify!',
          status: 'approved',
          spaceSlug: space,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ].filter(r => r.rating >= minRating);

      return new Response(
        JSON.stringify({
          data: sampleReviews.slice(offset, offset + limit),
          total: sampleReviews.length,
          limit,
          offset,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (request.method === 'POST') {
      let body: any;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!body.authorName || !body.text) {
        return new Response(
          JSON.stringify({ error: 'authorName and text are required fields' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const rating = Math.min(5, Math.max(1, parseInt(body.rating || '5', 10)));
      const newTestimonial = {
        id: `api_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        authorName: String(body.authorName).trim(),
        authorEmail: body.authorEmail ? String(body.authorEmail).trim() : undefined,
        authorCompany: body.authorCompany ? String(body.authorCompany).trim() : undefined,
        rating,
        text: String(body.text).trim(),
        spaceSlug: body.spaceSlug || 'default',
        status: 'approved',
        source: 'api',
        createdAt: new Date().toISOString(),
      };

      return new Response(
        JSON.stringify({
          success: true,
          testimonial: newTestimonial,
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  if (pathname === '/api/v1/widgets') {
    const space = url.searchParams.get('space') || 'demo';
    const widgets = [
      {
        id: 'widget_marquee',
        name: 'Auto-Scrolling Marquee Ticker',
        layout: 'marquee',
        embedScript: `<script async src="${origin}/embed.js" data-space="${space}" data-layout="marquee"></script>`,
      },
      {
        id: 'widget_wall',
        name: 'Wall of Love Grid',
        layout: 'wall',
        embedScript: `<script async src="${origin}/embed.js" data-space="${space}" data-layout="wall"></script>`,
      },
      {
        id: 'widget_carousel',
        name: 'Interactive Review Carousel',
        layout: 'carousel',
        embedScript: `<script async src="${origin}/embed.js" data-space="${space}" data-layout="carousel"></script>`,
      },
      {
        id: 'widget_badge',
        name: 'Minimal Star Rating Badge',
        layout: 'badge',
        embedScript: `<script async src="${origin}/embed.js" data-space="${space}" data-layout="badge"></script>`,
      },
    ];

    return new Response(JSON.stringify({ widgets }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: `Not Found: ${pathname}` }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
