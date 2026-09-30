// src/worker/handlers/importProviderHandler.ts
import { importProvider, ImportStatus } from '../lib/importEngine';
import { ImportRequest } from '../lib/adapter';

/**
 * Extracts the Bearer token from the Authorization header.
 * Rejects missing or malformed Authorization headers.
 */
export function extractBearerToken(authHeader?: string | null): string | null {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const trimmed = authHeader.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
    const token = parts[1].trim();
    return token.length > 0 ? token : null;
  }
  return null;
}

/**
 * Sanitizes error messages to strictly prevent leaking internal credentials,
 * connection strings, database errors, or internal stack traces to clients.
 */
export function sanitizeErrorMessage(error?: string): string {
  if (!error) return 'An error occurred during import';
  const lower = error.toLowerCase();

  // Strip internal infrastructure, tokens, or database exceptions
  if (
    lower.includes('firestore') ||
    lower.includes('firebase-admin') ||
    lower.includes('econnrefused') ||
    lower.includes('etimedout') ||
    lower.includes('at ') ||
    lower.includes('syntaxerror') ||
    lower.includes('token') && (lower.includes('bearer') || lower.includes('secret') || lower.includes('private'))
  ) {
    return 'Import processing encountered a server error. Please try again later.';
  }
  return error;
}

/**
 * Worker HTTP Gateway for POST /api/import.
 *
 * Implements Workstream 1 contract:
 * - Reads Firebase caller identity from Authorization: Bearer <firebaseIdToken>
 * - Reads provider OAuth credentials separately from body
 * - Strips and rejects untrusted client-supplied ownerId/workspaceId
 * - Delegates directly to the existing ImportEngine
 * - Returns minimal, secure responses conforming to the required HTTP contract:
 *     SUCCESS -> 200 { status: 'SUCCESS', importedCount }
 *     EMPTY_SUCCESS -> 200 { status: 'EMPTY_SUCCESS', importedCount: 0 }
 *     RESOURCE_SELECTION_REQUIRED -> 200 { status: 'RESOURCE_SELECTION_REQUIRED', resources }
 *     AUTH_REQUIRED -> 401 { error }
 *     UNSUPPORTED -> 400 { error }
 *     FAILED -> 422 / 500 { error }
 */
export async function handleImportProvider(request: Request, _env?: any): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Content-Type': 'application/json',
  };

  // 1. Handle CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 2. Validate HTTP method
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  // 3. Extract and validate Firebase caller authentication
  const authHeader = request.headers.get('Authorization');
  const firebaseIdToken = extractBearerToken(authHeader);

  if (!firebaseIdToken) {
    return new Response(
      JSON.stringify({ error: 'Authentication required: missing or malformed Bearer token' }),
      { status: 401, headers: corsHeaders }
    );
  }

  // 4. Parse request body
  let body: any = {};
  try {
    body = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const providerId = body.provider || body.providerId;
  if (!providerId || typeof providerId !== 'string') {
    return new Response(
      JSON.stringify({ error: 'provider is required and must be a string' }),
      { status: 400, headers: corsHeaders }
    );
  }

  // 5. Build params, preventing client tampering with ownership hierarchy
  const params: Record<string, any> =
    body.params && typeof body.params === 'object' ? { ...body.params } : {};

  // Never accept ownerId/workspaceId from the client as trusted identity
  delete params.ownerId;
  delete params.workspaceId;

  // Support explicit resourceId passed at root of body or inside params
  if (body.resourceId && !params.resourceId) {
    params.resourceId = body.resourceId;
  }

  // 6. Build ImportRequest for the existing ImportEngine
  const importRequest: ImportRequest = {
    providerId,
    params,
    authToken: body.authToken || body.providerAuthToken, // Third-party provider OAuth token
    firebaseIdToken, // Authenticated Panda Praise user token
  };

  // 7. Invoke existing ImportEngine pipeline
  let result;
  try {
    result = await importProvider(importRequest);
  } catch (unexpectedErr: any) {
    return new Response(
      JSON.stringify({ error: 'Import failed due to an internal server error.' }),
      { status: 500, headers: corsHeaders }
    );
  }

  // 8. Map ImportStatus to the exact HTTP response contract
  switch (result.status) {
    case ImportStatus.SUCCESS:
      return new Response(
        JSON.stringify({
          status: 'SUCCESS',
          importedCount: result.importedCount ?? 0,
        }),
        { status: 200, headers: corsHeaders }
      );

    case ImportStatus.EMPTY_SUCCESS:
      return new Response(
        JSON.stringify({
          status: 'EMPTY_SUCCESS',
          importedCount: 0,
        }),
        { status: 200, headers: corsHeaders }
      );

    case ImportStatus.RESOURCE_SELECTION_REQUIRED:
      return new Response(
        JSON.stringify({
          status: 'RESOURCE_SELECTION_REQUIRED',
          resources: result.resources || [],
        }),
        { status: 200, headers: corsHeaders }
      );

    case ImportStatus.AUTH_REQUIRED:
      return new Response(
        JSON.stringify({
          error: sanitizeErrorMessage(result.error) || 'Authentication required',
        }),
        { status: 401, headers: corsHeaders }
      );

    case ImportStatus.UNSUPPORTED:
      return new Response(
        JSON.stringify({
          error: sanitizeErrorMessage(result.error) || 'Unsupported provider or capability',
        }),
        { status: 400, headers: corsHeaders }
      );

    case ImportStatus.FAILED:
    default: {
      const sanitized = sanitizeErrorMessage(result.error);
      const isClientError =
        sanitized.includes('required') ||
        sanitized.includes('must be') ||
        sanitized.includes('No resources discovered');
      const statusCode = isClientError ? 422 : 500;
      return new Response(
        JSON.stringify({
          error: sanitized,
        }),
        { status: statusCode, headers: corsHeaders }
      );
    }
  }
}
