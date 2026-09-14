import type { Handler } from '@netlify/functions';
import { extractBearerToken, verifyFirebaseToken } from './_shared/firebaseAuth';
import { deleteDocument } from './_shared/firestoreAdmin';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const idToken = extractBearerToken(event.headers.authorization || event.headers.Authorization);
  const user = await verifyFirebaseToken(idToken || '');

  if (!user) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const platform = body.platform;

    if (!platform) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Platform is required' }),
      };
    }

    const connectionId = `${user.uid}_${platform}`;
    await deleteDocument('social_connections', connectionId, idToken);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, platform, message: `Disconnected ${platform} account successfully.` }),
    };
  } catch (err: any) {
    console.error('[SocialDisconnect] Error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Failed to disconnect account' }),
    };
  }
};
