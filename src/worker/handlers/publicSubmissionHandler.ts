import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimitKV } from '../lib/rateLimit';
import { getDocument, queryUserDocuments, saveDocument } from '../lib/firestoreAdmin';

/**
 * Validates a Cloudflare Turnstile CAPTCHA response token with Cloudflare's siteverify API.
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<{ success: boolean; errorCodes?: string[] }> {
  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      console.warn('[Turnstile] Verification endpoint returned status:', res.status);
      return { success: false, errorCodes: ['endpoint-error'] };
    }

    const data: any = await res.json();
    return {
      success: Boolean(data.success),
      errorCodes: data['error-codes'],
    };
  } catch (err) {
    console.error('[Turnstile] Error validating token:', err);
    return { success: false, errorCodes: ['internal-error'] };
  }
}

/**
 * Public testimonial submission handler with IP rate limiting (5 / 10m via KV),
 * Cloudflare Turnstile bot verification (fail-closed in prod), and free tier ceiling enforcement (15 testimonials).
 * POST /api/testimonials/submit
 */
export async function handlePublicTestimonialSubmit(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 1. IP Rate Limiting (5 submissions per 10 minutes per IP across isolates via Cloudflare KV)
  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
    '127.0.0.1';

  const rateCheck = await checkRateLimitKV(`public-submit:${clientIp}`, 5, 600, env.RATE_LIMIT_KV);
  if (rateCheck.error) {
    return new Response(
      JSON.stringify({ error: 'Rate limit service unavailable. Please try again shortly.' }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many submissions from this network. Please wait a few minutes before submitting another review.',
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

  // 2. Parse request payload
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Cloudflare Turnstile verification (fail closed in production)
  const isProduction = env.NODE_ENV === 'production';
  if (!env.TURNSTILE_SECRET_KEY) {
    if (isProduction) {
      console.error('[Turnstile] TURNSTILE_SECRET_KEY is missing in production. Rejecting (fail closed).');
      return new Response(
        JSON.stringify({ error: 'Security verification service is unconfigured. Submissions are temporarily paused.' }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } else {
    const turnstileToken = body.turnstileToken;
    if (!turnstileToken || typeof turnstileToken !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Security verification required (missing CAPTCHA token).' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const verification = await verifyTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY, clientIp);
    if (!verification.success) {
      return new Response(
        JSON.stringify({ error: 'CAPTCHA verification failed. Please try again.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // 4. Input validation
  const collectionFormId = body.collectionFormId;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const rating = Number(body.rating);
  const consent = Boolean(body.consent);

  if (!collectionFormId || typeof collectionFormId !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing collection form ID.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!name || name.length > 100) {
    return new Response(JSON.stringify({ error: 'Name must be between 1 and 100 characters.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!content || content.length < 10 || content.length > 2500) {
    return new Response(JSON.stringify({ error: 'Review content must be between 10 and 2,500 characters.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 4b. Anti-Spam content checks
  // Repeated character spam (e.g. "aaaaaaaaaa...")
  if (/(.)\1{9,}/.test(content)) {
    return new Response(JSON.stringify({ error: 'Review content appears to contain repetitive spam characters.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Obvious repetitive word spam (e.g. "spam spam spam spam spam")
  if (/\b([a-zA-Z0-9]+)\b(?:\s+\1\b){4,}/i.test(content)) {
    return new Response(JSON.stringify({ error: 'Review content appears to contain repetitive spam words.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Disposable email check
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const disposableDomains = [
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'trashmail.com',
    'yopmail.com',
    'sharklasers.com',
    'getairmail.com',
    'dispostable.com',
  ];
  if (email && disposableDomains.some((d) => email.endsWith(`@${d}`))) {
    return new Response(JSON.stringify({ error: 'Please provide a valid permanent email address.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (isNaN(rating) || rating < 1 || rating > 5) {
    return new Response(JSON.stringify({ error: 'Rating must be a number between 1 and 5.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!consent) {
    return new Response(JSON.stringify({ error: 'Consent to publish feedback is required.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 5. Verify collection form exists and is active
  const form = await getDocument('collection_forms', collectionFormId, undefined, env);
  if (!form || form.isActive === false) {
    return new Response(JSON.stringify({ error: 'This collection form is currently inactive or closed.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const ownerId = form.ownerId;
  const projectId = form.projectId;

  // 6. Free tier limits enforcement: max 15 testimonials per workspace
  if (ownerId) {
    const workspaces = await queryUserDocuments('workspaces', ownerId, undefined, env);
    const workspace = workspaces[0];
    const plan = workspace?.plan || 'free';
    if (plan === 'free') {
      const existingReviews = await queryUserDocuments('reviews', ownerId, undefined, env);
      if (existingReviews.length >= 15) {
        return new Response(
          JSON.stringify({
            error: 'This workspace has reached its free tier limit of 15 testimonials. Submissions are temporarily paused.',
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }

  // 7. Store review in Firestore
  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();

  const reviewDoc = {
    projectId: projectId || '',
    collectionFormId,
    ownerId: ownerId || '',
    name,
    email: typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 150) : '',
    role: typeof body.role === 'string' ? body.role.trim().slice(0, 100) : '',
    company: typeof body.company === 'string' ? body.company.trim().slice(0, 100) : '',
    avatarUrl: typeof body.avatarUrl === 'string' && body.avatarUrl.length <= 75000 ? body.avatarUrl : null,
    rating,
    title: typeof body.title === 'string' ? body.title.trim().slice(0, 150) : '',
    content,
    type: body.type === 'video' ? 'video' : 'text',
    videoUrl: typeof body.videoUrl === 'string' ? body.videoUrl : null,
    tags: Array.isArray(body.tags) ? body.tags.slice(0, 10) : ['Verified'],
    source: 'form',
    status: 'pending',
    isFeatured: false,
    consent: true,
    helpfulCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await saveDocument('reviews', reviewId, reviewDoc, undefined, env);

    return new Response(
      JSON.stringify({
        success: true,
        id: reviewId,
        review: { id: reviewId, ...reviewDoc },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('[PublicSubmission] Failed to save review:', err);
    return new Response(JSON.stringify({ error: 'Failed to record testimonial. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
