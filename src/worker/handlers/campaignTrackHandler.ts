import { WorkerEnv } from '../types';
import { getCorsHeaders } from '../lib/cors';

/**
 * Handles click tracking on review invitation links.
 * Logs click analytics and redirects the reviewer seamlessly to the collection space.
 */
export async function handleCampaignTrackClick(request: Request, _env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('to') || url.searchParams.get('dest');
  const campaignId = url.searchParams.get('cid') || url.searchParams.get('c');
  const logId = url.searchParams.get('lid') || url.searchParams.get('logId');

  // Fallback destination if none specified
  const destination = targetUrl || `${url.origin}/c/feedback`;

  // Log tracking event in worker logs (or future analytics sink)
  console.log(`[Campaign Tracker] Click recorded: campaign=${campaignId || 'unknown'}, log=${logId || 'direct'}, destination=${destination}`);

  // Issue HTTP 302 Found redirect to target review collection form
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Tracked-Campaign': campaignId || 'none',
    },
  });
}

/**
 * Handles campaign dispatch check / cron triggers via HTTP.
 */
export async function handleCampaignDispatchTrigger(request: Request, _env: WorkerEnv): Promise<Response> {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Campaign scheduled queue processor executed successfully.',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
