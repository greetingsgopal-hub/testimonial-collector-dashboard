export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GEMINI_API_KEY?: string;
  RESEND_API_KEY?: string;
  WHATSAPP_ACCESS_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-PandaPraise-Key',
};

// Helper: Query Supabase with Service Role Key
async function sbFetch(env: Env, path: string, init: RequestInit = {}) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  });
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      // =========================================================================
      // 1. CUSTOM DOMAIN & SUBDOMAIN RESOLVER (Pro & Agency)
      // =========================================================================
      if (url.pathname === '/api/v1/resolve-domain' && request.method === 'GET') {
        const host = (url.searchParams.get('host') || request.headers.get('host') || '').toLowerCase();
        const wsRes = await sbFetch(
          env,
          `workspaces?or=(custom_domain.eq.${encodeURIComponent(host)},custom_subdomain.eq.${encodeURIComponent(host.split('.')[0])})&select=id,name,plan,remove_branding,custom_css`
        );
        const rows: any[] = await wsRes.json();
        if (!rows.length || rows[0].plan === 'starter') {
          return new Response(JSON.stringify({ error: 'Custom domain requires Pro or Agency plan.' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ workspace: rows[0] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // =========================================================================
      // 2. SUBMIT TESTIMONIAL + AI SENTIMENT SHIELD + AGENCY WEBHOOK DISPATCH
      // =========================================================================
      if (url.pathname === '/api/v1/testimonials/submit' && request.method === 'POST') {
        const body: any = await request.json();
        const { workspace_id, author_name, author_role, content, rating = 5, media_type = 'text', media_url = null } = body;

        const wsRes = await sbFetch(env, `workspaces?id=eq.${workspace_id}&select=*`);
        const workspaces: any[] = await wsRes.json();
        const workspace = workspaces?.[0];

        if (!workspace) {
          return new Response(JSON.stringify({ error: 'Workspace not found' }), { status: 404, headers: corsHeaders });
        }

        // Run AI Sentiment & Spam Shield automatically for Pro, Agency & Lifetime workspaces
        let aiResult = { is_spam: false, sentiment_label: 'positive', sentiment_score: 0.95 };
        if (workspace.plan !== 'starter' && content) {
          aiResult = await evaluateSentimentAndSpam(content, env.GEMINI_API_KEY);
        }

        const insertRes = await sbFetch(env, 'testimonials', {
          method: 'POST',
          body: JSON.stringify({
            workspace_id,
            author_name,
            author_role,
            content,
            rating,
            media_type,
            media_url,
            is_spam: aiResult.is_spam,
            ai_sentiment_label: aiResult.sentiment_label,
            ai_sentiment_score: aiResult.sentiment_score,
            status: aiResult.is_spam ? 'rejected' : 'pending',
          }),
        });

        const inserted = await insertRes.json();
        if (!insertRes.ok) {
          return new Response(JSON.stringify({ error: inserted?.message || 'Quota limit reached on Starter plan.' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Trigger Outbound Webhook if workspace is on Agency plan and has webhook_url configured
        if (workspace.plan === 'agency' && workspace.webhook_url && !aiResult.is_spam) {
          await fetch(workspace.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-PandaPraise-Event': 'testimonial.created' },
            body: JSON.stringify({ event: 'testimonial.created', data: inserted[0] }),
          }).catch(() => null);
        }

        return new Response(JSON.stringify({ success: true, testimonial: inserted[0], ai_shield: aiResult }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // =========================================================================
      // 3. AUTOMATED EMAIL & WHATSAPP DRIPS DISPATCHER (Pro & Agency Only)
      // =========================================================================
      if (url.pathname === '/api/v1/drips/dispatch' && request.method === 'POST') {
        const { workspace_id, customer_name, customer_email, customer_phone, channel, collection_link }: any = await request.json();

        const wsRes = await sbFetch(env, `workspaces?id=eq.${workspace_id}&select=id,name,plan`);
        const [workspace]: any[] = await wsRes.json();

        if (!workspace || workspace.plan === 'starter') {
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
              html: `<p>Hi ${customer_name},</p><p>Would you mind sharing a quick 30-second review of your experience with <strong>${workspace.name}</strong>?</p><p><a href="${collection_link}">Click here to leave your testimonial</a></p>`,
            }),
          });
          if (!emailRes.ok) deliveryStatus = 'failed';
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
                  body: `Hi ${customer_name}! 👋 Thanks for choosing ${workspace.name}. Could you spare 30 seconds to share your feedback here? ${collection_link}`,
                },
              }),
            }
          );
          if (!waRes.ok) deliveryStatus = 'failed';
        }

        const logRes = await sbFetch(env, 'drip_campaigns', {
          method: 'POST',
          body: JSON.stringify({
            workspace_id,
            customer_name,
            customer_email,
            customer_phone,
            channel,
            status: deliveryStatus,
            sent_at: new Date().toISOString(),
          }),
        });

        return new Response(JSON.stringify({ success: true, status: deliveryStatus, record: await logRes.json() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // =========================================================================
      // 4. CHROME EXTENSION PRO — WHATSAPP WEB CLIPPER ENDPOINT (Pro & Agency)
      // =========================================================================
      if (url.pathname === '/api/v1/clipper/capture' && request.method === 'POST') {
        const apiKey = request.headers.get('X-PandaPraise-Key') || '';
        const { author_name, message_text, source_platform = 'WhatsApp Web' }: any = await request.json();

        const wsRes = await sbFetch(env, `workspaces?api_key=eq.${encodeURIComponent(apiKey)}&select=id,plan`);
        const [workspace]: any[] = await wsRes.json();

        if (!workspace || workspace.plan === 'starter') {
          return new Response(
            JSON.stringify({ error: 'Chrome Extension Pro requires an active Pro or Agency plan.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const insertRes = await sbFetch(env, 'testimonials', {
          method: 'POST',
          body: JSON.stringify({
            workspace_id: workspace.id,
            author_name,
            author_role: `Verified via ${source_platform}`,
            content: message_text,
            rating: 5,
            media_type: 'text',
            status: 'approved',
          }),
        });

        return new Response(JSON.stringify({ clipped: true, data: await insertRes.json() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // =========================================================================
      // 5. DEVELOPER REST API FOR AGENCY PLAN (GET /api/v1/testimonials)
      // =========================================================================
      if (url.pathname === '/api/v1/testimonials' && request.method === 'GET') {
        const apiKey = request.headers.get('X-PandaPraise-Key') || '';
        const wsRes = await sbFetch(env, `workspaces?api_key=eq.${encodeURIComponent(apiKey)}&select=id,plan`);
        const [workspace]: any[] = await wsRes.json();

        if (!workspace || workspace.plan !== 'agency') {
          return new Response(
            JSON.stringify({ error: 'Developer REST API access is exclusive to the Agency Plan.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const proofsRes = await sbFetch(
          env,
          `testimonials?workspace_id=eq.${workspace.id}&is_spam=eq.false&order=created_at.desc`
        );
        return new Response(JSON.stringify({ data: await proofsRes.json() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
