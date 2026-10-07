import { WorkerEnv } from '../types';
import { checkRateLimit } from '../lib/rateLimit';

export interface VerifyWidgetResult {
  verified: boolean;
  code:
    | 'DETECTED_ACTIVE'
    | 'SCRIPT_FOUND_CONTAINER_MISSING'
    | 'CONTAINER_FOUND_SCRIPT_MISSING'
    | 'NOT_FOUND'
    | 'INVALID_URL'
    | 'FORBIDDEN_HOST'
    | 'TIMEOUT'
    | 'UNREACHABLE'
    | 'ERROR';
  url: string;
  hasScript: boolean;
  hasContainer: boolean;
  hasMatchingProject: boolean;
  details: string;
  hint: string;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8',
};

/**
 * Validates whether a hostname or IP is an internal/private target to prevent SSRF.
 */
export function isPrivateOrBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();

  // 1. Loopback and localhost checks
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.lan')
  ) {
    return true;
  }

  // 2. Cloud metadata endpoints (AWS, GCP, Azure IMDS)
  if (host === '169.254.169.254' || host === 'metadata.google.internal') {
    return true;
  }

  // 3. IPv4 Private addresses (RFC 1918 & link-local)
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const octet1 = parseInt(ipv4Match[1], 10);
    const octet2 = parseInt(ipv4Match[2], 10);

    // 10.0.0.0/8
    if (octet1 === 10) return true;
    // 127.0.0.0/8
    if (octet1 === 127) return true;
    // 169.254.0.0/16
    if (octet1 === 169 && octet2 === 254) return true;
    // 172.16.0.0/12
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
    // 192.168.0.0/16
    if (octet1 === 192 && octet2 === 168) return true;
    // 0.0.0.0/8
    if (octet1 === 0) return true;
  }

  return false;
}

export async function handleVerifyWidget(request: Request, _env: WorkerEnv): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Rate limiting per client IP
  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';
  const rate = checkRateLimit(`verify_widget_${clientIp}`, 30, 60000);
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({
        verified: false,
        code: 'ERROR',
        details: 'Rate limit exceeded. Please wait a minute before verifying again.',
        hint: 'Limit is 30 verifications per minute.',
      }),
      { status: 429, headers: CORS_HEADERS }
    );
  }

  let rawUrl = '';
  let projectId = '';

  const requestUrl = new URL(request.url);
  if (request.method === 'GET') {
    rawUrl = requestUrl.searchParams.get('url') || '';
    projectId = requestUrl.searchParams.get('projectId') || requestUrl.searchParams.get('project') || '';
  } else if (request.method === 'POST') {
    try {
      const body = (await request.json()) as { url?: string; targetUrl?: string; projectId?: string; project?: string };
      rawUrl = body.url || body.targetUrl || '';
      projectId = body.projectId || body.project || '';
    } catch {
      rawUrl = requestUrl.searchParams.get('url') || '';
      projectId = requestUrl.searchParams.get('projectId') || '';
    }
  }

  if (!rawUrl || typeof rawUrl !== 'string') {
    return new Response(
      JSON.stringify({
        verified: false,
        code: 'INVALID_URL',
        url: '',
        details: 'No website URL provided.',
        hint: 'Enter your website URL (e.g. https://papasystem.in) to verify.',
      }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Prepend https:// if protocol was omitted
  let normalizedUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    return new Response(
      JSON.stringify({
        verified: false,
        code: 'INVALID_URL',
        url: rawUrl,
        details: 'Invalid website URL format.',
        hint: 'Please provide a valid URL like https://papasystem.in or https://yourdomain.com.',
      }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return new Response(
      JSON.stringify({
        verified: false,
        code: 'INVALID_URL',
        url: normalizedUrl,
        details: 'Only HTTP and HTTPS protocols are supported.',
        hint: 'Please enter a web URL starting with https://',
      }),
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (isPrivateOrBlockedHost(parsed.hostname)) {
    return new Response(
      JSON.stringify({
        verified: false,
        code: 'FORBIDDEN_HOST',
        url: normalizedUrl,
        details: 'Private, internal, or loopback network addresses cannot be verified.',
        hint: 'Please verify a publicly accessible website address.',
      }),
      { status: 403, headers: CORS_HEADERS }
    );
  }

  // Fetch the page with 5-second timeout and 512KB cap
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  let html = '';
  try {
    const upstreamRes = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'PandaPraise-WidgetBot/1.0 (+https://pandapraise.com/widget-verification)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!upstreamRes.ok) {
      return new Response(
        JSON.stringify({
          verified: false,
          code: 'UNREACHABLE',
          url: normalizedUrl,
          hasScript: false,
          hasContainer: false,
          hasMatchingProject: false,
          details: `Target website responded with HTTP ${upstreamRes.status} (${upstreamRes.statusText}).`,
          hint: 'Ensure your website is published, live, and publicly accessible.',
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // Read up to 512 KB
    const reader = upstreamRes.body?.getReader();
    if (reader) {
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      const MAX_BYTES = 512 * 1024;

      while (totalBytes < MAX_BYTES) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        chunks.push(value);
        totalBytes += value.length;
      }
      reader.cancel().catch(() => {});

      const decoder = new TextDecoder('utf-8', { fatal: false, ignoreBOM: true });
      html = chunks.map((c) => decoder.decode(c, { stream: true })).join('');
    } else {
      html = await upstreamRes.text();
    }
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = (err as Error)?.name === 'AbortError';
    return new Response(
      JSON.stringify({
        verified: false,
        code: isAbort ? 'TIMEOUT' : 'UNREACHABLE',
        url: normalizedUrl,
        hasScript: false,
        hasContainer: false,
        hasMatchingProject: false,
        details: isAbort
          ? 'Website took longer than 5 seconds to respond.'
          : `Failed to connect to ${parsed.hostname}: ${(err as Error)?.message || 'Network unreachable'}`,
        hint: 'Check that the URL is spelled correctly and your web server is online.',
      }),
      { status: 200, headers: CORS_HEADERS }
    );
  }

  // Parse HTML for widget indicators
  const scriptRegex =
    /(?:https:\/\/(?:pandapraise\.com|[\w-]+\.workers\.dev)\/(?:widget|embed)\.js|(?:widget|embed)\.js)/i;
  const containerRegex =
    /(?:id=["']panda-praise-wall["']|data-panda-praise|\.panda-praise-wall)/i;

  const hasScript = scriptRegex.test(html);
  const hasContainer = containerRegex.test(html);

  let hasMatchingProject = false;
  if (projectId) {
    const escapedProj = projectId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const projRegex = new RegExp(`data-(?:project-id|project)=["']${escapedProj}["']`, 'i');
    hasMatchingProject = projRegex.test(html);
  }

  let result: VerifyWidgetResult;

  if (hasScript && hasContainer) {
    result = {
      verified: true,
      code: 'DETECTED_ACTIVE',
      url: normalizedUrl,
      hasScript: true,
      hasContainer: true,
      hasMatchingProject,
      details: `Panda Praise widget script and container detected live on ${parsed.hostname}!`,
      hint: 'Your customer testimonials are active and visible to your visitors.',
    };
  } else if (hasScript && !hasContainer) {
    result = {
      verified: true,
      code: 'SCRIPT_FOUND_CONTAINER_MISSING',
      url: normalizedUrl,
      hasScript: true,
      hasContainer: false,
      hasMatchingProject,
      details: `Widget script tag detected on ${parsed.hostname}. (Container #panda-praise-wall will be auto-created at script position).`,
      hint: 'For custom section placement, you can also add <div id="panda-praise-wall"></div> exactly where you want reviews.',
    };
  } else if (!hasScript && hasContainer) {
    result = {
      verified: false,
      code: 'CONTAINER_FOUND_SCRIPT_MISSING',
      url: normalizedUrl,
      hasScript: false,
      hasContainer: true,
      hasMatchingProject,
      details: `Found target container <div id="panda-praise-wall">, but the widget.js script tag was not found.`,
      hint: 'Ensure you also pasted the <script src="https://pandapraise.com/widget.js" ...></script> code snippet into your builder.',
    };
  } else {
    result = {
      verified: false,
      code: 'NOT_FOUND',
      url: normalizedUrl,
      hasScript: false,
      hasContainer: false,
      hasMatchingProject: false,
      details: `Neither widget script nor container element were found on ${parsed.hostname}.`,
      hint: 'Did you remember to click "Publish" or "Update" in your website builder (Elementor, Shopify, Webflow) after pasting?',
    };
  }

  return new Response(JSON.stringify(result), { status: 200, headers: CORS_HEADERS });
}
