import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { decryptToken, encryptToken } from '../lib/crypto';
import { getDocument, saveDocument } from '../lib/firestoreAdmin';
import { GRAPH_API_VERSION } from '../lib/facebookOAuth';

const GRAPH = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/** Exchanges the signed-in user's Facebook Login token and lists only WABAs
 * visible to that user. The shared WhatsApp system token is never used as proof. */
export async function handleWhatsAppMetaLink(request: Request, env: WorkerEnv): Promise<Response> {
  const user = await authenticatedUser(request, env);
  if (!user) return json({ error: 'Authentication required.' }, 401);
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  const appId = env.META_APP_ID?.trim();
  const appSecret = env.META_APP_SECRET?.trim();
  if (!appId || !appSecret || !env.APP_ENCRYPTION_KEY) return json({ error: 'Meta account linking is not configured.' }, 503);
  let input: any;
  try { input = await request.json(); } catch { return json({ error: 'Invalid JSON body.' }, 400); }
  const userToken = typeof input?.userAccessToken === 'string' ? input.userAccessToken.trim() : '';
  if (!userToken || userToken.length > 8192) return json({ error: 'A Facebook Login token is required.' }, 400);

  const exchange = new URL(`${GRAPH}/oauth/access_token`);
  exchange.search = new URLSearchParams({ grant_type: 'fb_exchange_token', client_id: appId, client_secret: appSecret, fb_exchange_token: userToken }).toString();
  const exchanged = await fetch(exchange);
  if (!exchanged.ok) return json({ error: 'Meta could not exchange the authorization token.' }, 401);
  const tokenData = await exchanged.json() as { access_token?: string; expires_in?: number };
  if (!tokenData.access_token) return json({ error: 'Meta did not return an access token.' }, 502);

  const businessesRes = await fetch(`${GRAPH}/me/businesses?fields=id,name&limit=100`, { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  if (!businessesRes.ok) return json({ error: 'Meta did not allow access to the signed-in user’s businesses.' }, 403);
  const businesses = await businessesRes.json() as { data?: Array<{ id: string; name?: string }> };
  const wabas: Array<{ id: string; name: string; phones: Array<{ id: string; displayPhoneNumber: string }> }> = [];
  for (const business of (businesses.data || []).slice(0, 100)) {
    const wabaRes = await fetch(`${GRAPH}/${encodeURIComponent(business.id)}/owned_whatsapp_business_accounts?fields=id,name&limit=100`, { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    if (!wabaRes.ok) continue;
    const wabaData = await wabaRes.json() as { data?: Array<{ id: string; name?: string }> };
    for (const waba of wabaData.data || []) {
      const phonesRes = await fetch(`${GRAPH}/${encodeURIComponent(waba.id)}/phone_numbers?fields=id,display_phone_number&limit=100`, { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
      if (!phonesRes.ok) continue;
      const phones = await phonesRes.json() as { data?: Array<{ id: string; display_phone_number?: string }> };
      wabas.push({ id: waba.id, name: waba.name || business.name || 'WhatsApp Business Account', phones: (phones.data || []).map(p => ({ id: p.id, displayPhoneNumber: p.display_phone_number || '' })) });
    }
  }
  if (!wabas.length) return json({ error: 'No WhatsApp Business Accounts and phone numbers were available to this Meta user.' }, 403);
  await saveDocument('whatsapp_meta_connections', user.uid, {
    ownerUid: user.uid,
    accessTokenEncrypted: encryptToken(tokenData.access_token, env),
    expiresAt: new Date(Date.now() + (tokenData.expires_in || 5184000) * 1000).toISOString(),
    wabaIds: wabas.map(w => w.id),
    updatedAt: new Date().toISOString(),
  }, undefined, env);
  return json({ wabas }, 200);
}

/** Confirms a selected phone against the caller's stored per-user Meta token. */
export async function handleWhatsAppMetaConfirm(request: Request, env: WorkerEnv): Promise<Response> {
  const user = await authenticatedUser(request, env);
  if (!user) return json({ error: 'Authentication required.' }, 401);
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  let input: any;
  try { input = await request.json(); } catch { return json({ error: 'Invalid JSON body.' }, 400); }
  const wabaId = typeof input?.wabaId === 'string' ? input.wabaId.trim() : '';
  const phoneNumberId = typeof input?.phoneNumberId === 'string' ? input.phoneNumberId.trim() : '';
  if (!/^\d{5,30}$/.test(wabaId) || !/^\d{5,30}$/.test(phoneNumberId)) return json({ error: 'Valid WABA and phone number IDs are required.' }, 400);
  const connection = await getDocument('whatsapp_meta_connections', user.uid, undefined, env);
  if (!connection || connection.ownerUid !== user.uid || !connection.wabaIds?.includes(wabaId) || !connection.accessTokenEncrypted) return json({ error: 'Authorize this Meta account before linking a WhatsApp number.' }, 403);
  let metaToken: string;
  try { metaToken = decryptToken(connection.accessTokenEncrypted, env); } catch { return json({ error: 'Stored Meta authorization could not be decrypted.' }, 503); }
  const response = await fetch(`${GRAPH}/${encodeURIComponent(wabaId)}/phone_numbers?fields=id,display_phone_number&limit=100`, { headers: { Authorization: `Bearer ${metaToken}` } });
  if (!response.ok) return json({ error: 'Meta authorization is expired or cannot access this WABA.' }, 403);
  const phoneData = await response.json() as { data?: Array<{ id: string; display_phone_number?: string }> };
  const phone = phoneData.data?.find(p => p.id === phoneNumberId);
  if (!phone) return json({ error: 'That phone number is not part of the authorized WABA.' }, 403);
  // A verified mapping is useful only when Meta delivers this WABA's events to
  // our already-configured app webhook. Subscribe before persisting the link.
  const subscription = await fetch(`${GRAPH}/${encodeURIComponent(wabaId)}/subscribed_apps`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${metaToken}` },
  });
  if (!subscription.ok) return json({ error: 'Meta verified the number, but could not subscribe this app to the WABA webhook.' }, 502);
  console.log(JSON.stringify({ event: 'whatsapp.account_link', stage: 'waba_subscription', result: 'success' }));
  const mapping = { ownerUid: user.uid, wabaId, phoneNumberId, displayPhoneNumber: phone.display_phone_number || '', verified: true, verifiedVia: 'per_user_meta_oauth', linkedAt: new Date().toISOString() };
  await saveDocument('whatsapp_accounts', wabaId, mapping, undefined, env);
  await saveDocument('whatsapp_accounts_by_phone', phoneNumberId, mapping, undefined, env);
  console.log(JSON.stringify({ event: 'whatsapp.account_link', stage: 'owner_mapping', result: 'success' }));
  return json({ ok: true, account: { wabaId, phoneNumberId, displayPhoneNumber: mapping.displayPhoneNumber } }, 200);
}

async function authenticatedUser(request: Request, env: WorkerEnv) {
  const token = extractBearerToken(request.headers.get('Authorization'));
  return token ? verifyFirebaseToken(token, env) : null;
}
function json(body: unknown, status: number) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }); }

