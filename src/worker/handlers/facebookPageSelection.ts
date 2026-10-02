import crypto from 'node:crypto';
import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { getDocument, saveDocument } from '../lib/firestoreAdmin';
import { importProvider, ImportStatus } from '../lib/importEngine';
import { getCorsHeaders } from '../lib/cors';
import { checkRateLimit } from '../lib/rateLimit';

/**
 * Dedicated Facebook Page selection + review import step.
 *
 * Runs AFTER the OAuth callback has stored the connection with all discovered
 * Pages (status connected, pageSelected=false). The user must explicitly
 * select one of their Pages here - never silent auto-selection, even for a
 * single Page.
 *
 * Both endpoints require Firebase Bearer auth; ownership is resolved from the
 * verified caller, never from the client body.
 *
 *   GET  /api/facebook/pages        -> list available Pages (customer-safe:
 *                                      pageId + name only; no tokens, no
 *                                      internal document IDs)
 *   POST /api/facebook/select-page  -> { pageId } - validates the selection
 *                                      belongs to the caller's stored
 *                                      connection, then imports reviews
 *                                      through the canonical Import Engine
 *                                      (fetch -> normalize -> tenant dedupe
 *                                      -> canonical /reviews persist).
 *
 * Explicit outcomes (never one generic failure):
 *   IMPORT_SUCCESS | EMPTY_SUCCESS | REVIEW_FETCH_FAILED | PAGE_TOKEN_FAILED
 *   | NO_PAGES_FOUND | INVALID_PAGE | AUTH_REQUIRED | NOT_CONNECTED
 *   | RATE_LIMITED | IMPORT_FAILED
 *
 * Internal diagnostic status (returned as `diagnostic` on POST responses so
 * the connection can never be mistaken for verified review importing):
 *   CONNECTED                    - a stored Facebook connection exists
 *   PAGE_DISCOVERY_SUCCESS       - Pages were discovered and listed
 *   REVIEW_IMPORT_AVAILABLE      - a full import round-trip succeeded
 *   REVIEW_IMPORT_BLOCKED        - Meta API prevented review retrieval
 */
export async function handleFacebookPageSelection(request: Request, env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
  const rateCheck = checkRateLimit(`fb_select_${clientIp}`, 20, 60000);
  if (!rateCheck.allowed) {
    return json({ status: 'RATE_LIMITED', error: 'Too many requests. Please wait a moment.' }, 429, corsHeaders);
  }

  // Firebase caller identity (never trusted from body/query)
  const authHeader = request.headers.get('Authorization');
  const token = extractBearerToken(authHeader);
  const user = token ? await verifyFirebaseToken(token, env) : null;
  if (!user?.uid) {
    return json({ status: 'AUTH_REQUIRED', error: 'Please sign in to continue.' }, 401, corsHeaders);
  }
  const userId = user.uid;

  const connection = await getDocument('social_connections', `${userId}_facebook`, undefined, env);
  if (!connection || connection.status !== 'connected') {
    return json({ status: 'NOT_CONNECTED', error: 'Connect Facebook first, then select a Page.' }, 400, corsHeaders);
  }

  const pages: any[] = Array.isArray(connection.pages) ? connection.pages : [];

  // ── GET: list available Pages (customer-safe) ─────────────────────────
  if (request.method === 'GET') {
    if (pages.length === 0) {
      return json({ status: 'NO_PAGES_FOUND', diagnostic: 'CONNECTED', error: 'No Facebook Pages were available for this account.' }, 200, corsHeaders);
    }
    return json(
      {
        status: 'OK',
        diagnostic: 'PAGE_DISCOVERY_SUCCESS',
        pages: pages.map((p) => ({ pageId: p.id, name: p.name, profilePicture: p.profilePicture || null })),
      },
      200,
      corsHeaders
    );
  }

  if (request.method !== 'POST') {
    return json({ status: 'METHOD_NOT_ALLOWED', error: 'Method not allowed.' }, 405, corsHeaders);
  }

  // ── POST: explicit Page selection + import via canonical engine ───────
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return json({ status: 'INVALID_PAGE', error: 'Invalid request body.' }, 400, corsHeaders);
  }

  const selectedPageId = typeof body.pageId === 'string' ? body.pageId : null;
  if (!selectedPageId) {
    return json({ status: 'INVALID_PAGE', error: 'Select a Facebook Page to continue.' }, 400, corsHeaders);
  }

  const selectedPage = pages.find((p) => p.id === selectedPageId);
  if (!selectedPage) {
    console.warn(
      JSON.stringify({
        stage: 'facebook.page.selection',
        provider: 'facebook',
        ownerHash: hashUid(userId),
        outcome: 'INVALID_PAGE',
      })
    );
    return json({ status: 'INVALID_PAGE', error: 'That Facebook Page is not available for your account.' }, 400, corsHeaders);
  }

  // Persist the explicit selection before importing
  const now = new Date().toISOString();
  const updatedConnection = {
    ...connection,
    pageId: selectedPage.id,
    persistError: undefined,
    pageName: selectedPage.name,
    platformUserId: selectedPage.id,
    platformAccountName: selectedPage.name,
    platformProfilePicture: selectedPage.profilePicture || null,
    accessTokenEncrypted: selectedPage.pageAccessTokenEncrypted,
    pageSelected: true,
    updatedAt: now,
  };
  try {
    await saveDocument('social_connections', `${userId}_facebook`, updatedConnection, undefined, env);
  } catch (err: any) {
    console.error(
      JSON.stringify({
        stage: 'facebook.reviews.persist',
        provider: 'facebook',
        ownerHash: hashUid(userId),
        error: sanitizeMetaError(err?.message),
      })
    );
    return json({ status: 'IMPORT_FAILED', error: 'Facebook connected, but the selection could not be saved. Please try again.' }, 500, corsHeaders);
  }

  // Import through the canonical Import Engine (no parallel import path).
  // The adapter resolves the Page token server-side from the stored
  // connection; the client never supplies provider tokens.
  let result;
  try {
    result = await importProvider({
      providerId: 'facebook',
      params: { pageId: selectedPage.id },
      firebaseIdToken: token as string,
      env,
    } as any);
  } catch (err: any) {
    console.error(
      JSON.stringify({
        stage: 'facebook.reviews.fetch',
        provider: 'facebook',
        ownerHash: hashUid(userId),
        pageId: selectedPage.id,
        error: sanitizeMetaError(err?.message),
      })
    );
    return json(
      {
        status: 'REVIEW_FETCH_FAILED',
        pageName: selectedPage.name,
        error: 'Facebook connected successfully, but Panda Praise could not retrieve reviews from this Page.',
      },
      502,
      corsHeaders
    );
  }

  console.log(
    JSON.stringify({
      stage: 'facebook.reviews.persist',
      provider: 'facebook',
      handler: 'facebookPageSelection',
      ownerHash: hashUid(userId),
      pageId: selectedPage.id,
      outcome: result.status,
      importedCount: result.importedCount ?? 0,
    })
  );

  switch (result.status) {
    case ImportStatus.SUCCESS:
      return json(
        { status: 'IMPORT_SUCCESS', diagnostic: 'REVIEW_IMPORT_AVAILABLE', importedCount: result.importedCount ?? 0, pageName: selectedPage.name },
        200,
        corsHeaders
      );
    case ImportStatus.EMPTY_SUCCESS:
      return json({ status: 'EMPTY_SUCCESS', diagnostic: 'REVIEW_IMPORT_AVAILABLE', importedCount: 0, pageName: selectedPage.name }, 200, corsHeaders);
    case ImportStatus.AUTH_REQUIRED:
      return json({ status: 'PAGE_TOKEN_FAILED', diagnostic: 'REVIEW_IMPORT_BLOCKED', pageName: selectedPage.name, error: 'Facebook Page authorization expired. Please reconnect Facebook.' }, 401, corsHeaders);
    default:
      // FAILED / UNSUPPORTED / anything else from the engine fetch stage
      return json(
        {
          status: 'REVIEW_FETCH_FAILED',
          diagnostic: 'REVIEW_IMPORT_BLOCKED',
          pageName: selectedPage.name,
          error: 'Facebook connected successfully, but Panda Praise could not retrieve reviews from this Page.',
        },
        502,
        corsHeaders
      );
  }
}

function json(payload: object, status: number, corsHeaders: Record<string, string>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function hashUid(uid: string): string {
  return `uid_${crypto.createHash('sha256').update(uid).digest('hex').slice(0, 12)}`;
}

function sanitizeMetaError(message: string | undefined): string {
  if (!message) return 'unknown error';
  return message
    .replace(/(EA[A-Za-z0-9]{20,}|access_token[^&\s]*|client_secret[^&\s]*)/gi, '[redacted]')
    .slice(0, 300);
}
