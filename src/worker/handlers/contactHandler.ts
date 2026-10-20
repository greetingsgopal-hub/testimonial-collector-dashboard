import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimitKV } from '../lib/rateLimit';
import { saveDocument } from '../lib/firestoreAdmin';

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
  'sharklasers.com',
  'getairmail.com',
  'dispostable.com',
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleContactSubmit(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 1. IP Rate Limiting (5 contact submissions per 10 minutes)
  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
    '127.0.0.1';

  const rateCheck = await checkRateLimitKV(`contact-submit:${clientIp}`, 5, 600, env.RATE_LIMIT_KV);
  if (rateCheck.error) {
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable. Please try again shortly.' }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many messages sent. Please wait a few minutes before submitting another inquiry.',
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(rateCheck.resetMs / 1000).toString(),
        },
      }
    );
  }

  // 2. Parse payload
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : 'support';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  // 3. Server-side validation
  if (!name || name.length > 100) {
    return new Response(JSON.stringify({ error: 'Name is required and must be under 100 characters.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!email || email.length > 150 || !EMAIL_REGEX.test(email)) {
    return new Response(JSON.stringify({ error: 'A valid email address is required.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const domain = email.split('@')[1];
  if (domain && DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return new Response(JSON.stringify({ error: 'Please provide a permanent work or personal email address.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!message || message.length < 10 || message.length > 3000) {
    return new Response(JSON.stringify({ error: 'Message must be between 10 and 3,000 characters.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Anti-Spam checks
  if (/(.)\1{9,}/.test(message)) {
    return new Response(JSON.stringify({ error: 'Message contains repetitive spam characters.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (/\b([a-zA-Z0-9]+)\b(?:\s+\1\b){4,}/i.test(message)) {
    return new Response(JSON.stringify({ error: 'Message contains repetitive spam patterns.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 4. Persist to Firestore contact_inquiries
  const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const inquiryRecord = {
    id: inquiryId,
    name,
    email,
    subject: subject.slice(0, 100),
    message,
    status: 'new',
    clientIp: clientIp.replace(/:/g, '_'),
    createdAt: new Date().toISOString(),
  };

  try {
    await saveDocument('contact_inquiries', inquiryId, inquiryRecord, null, env);
  } catch (err: any) {
    console.error('[Contact] Failed to save inquiry to Firestore:', err);
    return new Response(
      JSON.stringify({ error: 'Unable to deliver message at this time. Please email support@pandapraise.com directly.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // 5. External Webhook Delivery notification if configured (e.g. Slack/Discord/Email worker)
  const webhookUrl = (env as any).CONTACT_WEBHOOK_URL;
  if (webhookUrl && typeof webhookUrl === 'string' && webhookUrl.startsWith('https://')) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `📩 New Panda Praise Inquiry from ${name} (${email}) [${subject}]:\n${message}`,
          inquiry: inquiryRecord,
        }),
      });
    } catch (whErr) {
      console.warn('[Contact] External notification webhook dispatch failed:', whErr);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      inquiryId,
      message: 'Thank you for reaching out. We have received your inquiry and our team will get back to you within 2 business days.',
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
