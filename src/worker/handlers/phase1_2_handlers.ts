import { WorkerEnv } from '../types';
import { getDocument, saveDocument } from '../lib/firestoreAdmin';
import { getServiceAccountAccessToken } from '../lib/googleAuth';
import { decryptToken } from '../lib/crypto';

/**
 * Phase 1: Shopify OAuth & 7-Day Delayed Trigger Handlers
 */

// GET /api/shopify/auth?shop=...
export async function handleShopifyAuth(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url);
  const shop = url.searchParams.get('shop')?.trim().toLowerCase();
  if (!shop || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)) {
    return new Response(JSON.stringify({ error: 'Shop domain required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const clientId = env.SHOPIFY_API_KEY || env.SHOPIFY_CLIENT_ID;
  const appUrl = env.APP_URL?.replace(/\/+$/, '');
  if (!clientId || !appUrl) {
    return new Response(JSON.stringify({ error: 'Shopify OAuth is not configured on the server.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const state = crypto.randomUUID();
  const redirectUri = `${appUrl}/api/shopify/callback`;
  const authorizeUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authorizeUrl.search = new URLSearchParams({
    client_id: clientId,
    scope: 'read_orders,write_orders',
    redirect_uri: redirectUri,
    state,
  }).toString();

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      'Set-Cookie': `shopify_oauth_state=${state}; Max-Age=600; Path=/api/shopify/callback; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

// GET/POST /api/shopify/callback
export async function handleShopifyCallback(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url);
  const appUrl = env.APP_URL?.replace(/\/+$/, '');
  const shop = url.searchParams.get('shop')?.trim().toLowerCase() || '';
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state') || '';
  const hmac = url.searchParams.get('hmac') || '';
  const cookieState = request.headers.get('Cookie')?.match(/(?:^|;\s*)shopify_oauth_state=([^;]+)/)?.[1] || '';
  const fail = (reason: string) => Response.redirect(`${appUrl || url.origin}/workflow?shopify_error=${encodeURIComponent(reason)}`, 302);

  if (!appUrl || !env.SHOPIFY_API_KEY || !env.SHOPIFY_API_SECRET || !env.RATE_LIMIT_KV) {
    return fail('Shopify OAuth is not configured on the server.');
  }
  if (!shop || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop) || !code || !hmac || !state) {
    return fail('Shopify returned incomplete authorization details.');
  }
  if (!cookieState || cookieState !== state) {
    return fail('Shopify authorization state did not match. Please try again.');
  }

  const hmacParams = new URLSearchParams(url.search);
  hmacParams.delete('hmac');
  hmacParams.delete('signature');
  const message = [...hmacParams.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('&');
  const encoder = new TextEncoder();
  const hmacKey = await crypto.subtle.importKey('raw', encoder.encode(env.SHOPIFY_API_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, encoder.encode(message)));
  const expectedHmac = [...digest].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  if (hmac.length !== expectedHmac.length) return fail('Shopify authorization signature was invalid.');
  // Web Crypto in Workers has no timingSafeEqual; compare fixed-length digests without early exit.
  let mismatch = 0;
  for (let i = 0; i < expectedHmac.length; i += 1) mismatch |= expectedHmac.charCodeAt(i) ^ (hmac[i] || '').toLowerCase().charCodeAt(0);
  if (mismatch !== 0) return fail('Shopify authorization signature was invalid.');

  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: env.SHOPIFY_API_KEY, client_secret: env.SHOPIFY_API_SECRET, code }),
  });
  if (!tokenRes.ok) return fail('Shopify could not complete token exchange.');
  const tokenData = await tokenRes.json() as { access_token?: string; scope?: string };
  if (!tokenData.access_token) return fail('Shopify did not return an access token.');

  await env.RATE_LIMIT_KV.put(`shop:${shop}`, JSON.stringify({
    access_token: tokenData.access_token,
    scope: tokenData.scope || '',
    connectedAt: Date.now(),
    status: 'connected',
  }));

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${appUrl}/workflow?shopify_connected=${encodeURIComponent(shop)}`,
      'Set-Cookie': 'shopify_oauth_state=; Max-Age=0; Path=/api/shopify/callback; HttpOnly; Secure; SameSite=Lax',
    },
  });
}

// POST /api/shopify/webhook/fulfilled
export async function handleShopifyWebhookFulfilled(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const order = await request.json() as any;
    const shop = request.headers.get('X-Shopify-Shop-Domain') || 'kalyan-silks.myshopify.com';
    const phone = order.phone || order.customer?.phone;
    const customerName = order.customer?.first_name || 'Customer';

    if (!phone) {
      return new Response(JSON.stringify({ ok: true, skipped: 'no_customer_phone' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const triggerAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days later
    if (env.RATE_LIMIT_KV) {
      await env.RATE_LIMIT_KV.put(
        `whatsapp:trigger:${order.id || Date.now()}`,
        JSON.stringify({ shop, phone, customerName, orderId: order.id, triggerAt }),
        { expirationTtl: 8 * 24 * 60 * 60 }
      );
    }

    return new Response(JSON.stringify({ ok: true, scheduled: triggerAt, phone }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/shopify/trigger-test
export async function handleShopifyTriggerTest(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const { phone } = await request.json() as any;
    const whatsappToken = (env as any).WHATSAPP_TOKEN;
    const phoneId = (env as any).WHATSAPP_PHONE_ID;

    if (whatsappToken && phoneId && phone) {
      await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: 'panda_review_request',
            language: { code: 'en_US' },
            components: [{ type: 'body', parameters: [{ type: 'text', text: 'Kalyan Silks' }] }],
          },
        }),
      });
    }

    return new Response(JSON.stringify({ ok: true, testSent: Boolean(whatsappToken) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Phase 2: WhatsApp Incoming Video Collector Handlers
 */

// GET/POST /api/whatsapp/incoming
export async function handleWhatsAppIncoming(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url);

  // Meta Webhook Verification challenge
  if (request.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge') || '';
    const verifyToken = env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    return new Response('Forbidden', { status: 403 });
  }

  // Meta signs the raw webhook body. Reject unsigned payloads before parsing.
  const appSecret = env.META_APP_SECRET;
  const signature = request.headers.get('X-Hub-Signature-256') || '';
  if (!appSecret || !signature.startsWith('sha256=')) {
    return new Response(JSON.stringify({ error: 'WhatsApp webhook signature verification is not configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawBody = await request.text();
  let validSignature = false;
  try {
    const signatureBytes = Uint8Array.from(atob(signature.slice('sha256='.length)), (char) => char.charCodeAt(0));
    const signatureKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(appSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    validSignature = await crypto.subtle.verify('HMAC', signatureKey, signatureBytes, new TextEncoder().encode(rawBody));
  } catch {
    validSignature = false;
  }
  if (!validSignature) {
    return new Response(JSON.stringify({ error: 'Invalid WhatsApp webhook signature.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Incoming customer message / video webhook
  try {
    const body = JSON.parse(rawBody) as any;
    const entry = body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];
    const contact = entry?.contacts?.[0];

    if (!message) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const from = message.from;
    const type = message.type;

    if (type !== 'video') {
      return new Response(JSON.stringify({ ok: true, ignored: 'not_a_video' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const videoId = message.video?.id;
    if (!videoId || !/^[A-Za-z0-9_-]+$/.test(videoId)) {
      return new Response(JSON.stringify({ error: 'WhatsApp video message had an invalid media ID.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const safePhone = String(from || '').replace(/\D/g, '');
    if (!safePhone) {
      return new Response(JSON.stringify({ error: 'WhatsApp video message had no sender number.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const phoneNumberId = String(entry?.metadata?.phone_number_id || '');
    if (!/^\d{5,30}$/.test(phoneNumberId)) {
      return new Response(JSON.stringify({ error: 'WhatsApp webhook did not include a valid business phone number ID.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const account = await getDocument('whatsapp_accounts_by_phone', phoneNumberId, undefined, env);
    if (!account || account.verified !== true || account.verifiedVia !== 'per_user_meta_oauth' || !account.ownerUid || !account.wabaId) {
      // Acknowledge unlinked accounts to prevent Meta retry storms; no media is downloaded or persisted.
      return new Response(JSON.stringify({ ok: true, ignored: 'whatsapp_account_not_linked' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const connection = await getDocument('whatsapp_meta_connections', account.ownerUid, undefined, env);
    if (!connection || connection.ownerUid !== account.ownerUid || !connection.wabaIds?.includes(account.wabaId) || !connection.accessTokenEncrypted) {
      return new Response(JSON.stringify({ error: 'WhatsApp account authorization is no longer available.' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
    let whatsappToken: string;
    try { whatsappToken = decryptToken(connection.accessTokenEncrypted, env); }
    catch { return new Response(JSON.stringify({ error: 'WhatsApp account authorization could not be read.' }), { status: 503, headers: { 'Content-Type': 'application/json' } }); }
    const storagePath = `whatsapp/${account.ownerUid}/${safePhone}/${videoId}.mp4`;
    const bucket = env.FIREBASE_STORAGE_BUCKET;
    const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID;
    if (!whatsappToken || !bucket || !projectId) {
      return new Response(JSON.stringify({ error: 'WhatsApp media storage is not configured on the server.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mediaResponse = await fetch(`https://graph.facebook.com/v20.0/${videoId}`, {
      headers: { Authorization: `Bearer ${whatsappToken}` },
    });
    if (!mediaResponse.ok) throw new Error(`Meta media lookup failed (${mediaResponse.status}).`);
    const media = await mediaResponse.json() as { url?: string; mime_type?: string };
    if (!media.url) throw new Error('Meta did not return a media download URL.');
    const videoResponse = await fetch(media.url, { headers: { Authorization: `Bearer ${whatsappToken}` } });
    if (!videoResponse.ok) throw new Error(`Meta media download failed (${videoResponse.status}).`);
    const videoBytes = await videoResponse.arrayBuffer();

    const firebaseToken = await getServiceAccountAccessToken(env);
    if (!firebaseToken) throw new Error('Firebase service account is not configured for media uploads.');
    const uploadUrl = new URL(`https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o`);
    uploadUrl.searchParams.set('uploadType', 'media');
    uploadUrl.searchParams.set('name', storagePath);
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firebaseToken}`,
        'Content-Type': media.mime_type || message.video?.mime_type || 'video/mp4',
      },
      body: videoBytes,
    });
    if (!uploadResponse.ok) throw new Error(`Firebase Storage upload failed (${uploadResponse.status}).`);

    const testimonial = {
      id: videoId,
      metaVideoId: videoId,
      source: 'whatsapp',
      phone: from,
      name: contact?.profile?.name || from,
      status: 'pending',
      storagePath, // <-- save path, not URL
      type: 'video',
      mimeType: media.mime_type || message.video?.mime_type || 'video/mp4',
      createdAt: new Date().toISOString(),
      shop: entry?.metadata?.display_phone_number || '',
      ownerUid: account.ownerUid,
      wabaId: account.wabaId,
      phoneNumberId,
      content: message.video?.caption || '',
    };

    await saveDocument('whatsapp_incoming', `${account.ownerUid}_${videoId}`, testimonial, null, env);

    // Auto-reply thank you via WhatsApp
    const phoneId = phoneNumberId;
    if (whatsappToken && phoneId) {
      try {
        await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${whatsappToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: from,
            text: {
              body: `Thanks ${testimonial.name}! We received your video review.`,
            },
          }),
        });
      } catch (err) {
        console.warn('WhatsApp auto-reply failed:', err);
      }
    }

    return new Response(JSON.stringify({ ok: true, testimonialId: testimonial.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[WhatsApp] Video intake failed:', err?.constructor?.name || 'Error');
    return new Response(JSON.stringify({ error: 'Could not save the WhatsApp video. Meta can retry this webhook.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

