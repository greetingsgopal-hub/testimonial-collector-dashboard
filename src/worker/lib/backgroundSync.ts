import { WorkerEnv, ScheduledEvent, ExecutionContext } from '../types';
import { decryptToken } from './crypto';
import { fetchFacebookPageReviews } from './facebookOAuth';
import { fetchInstagramCommentsAndMentions } from './instagramOAuth';
import { saveDocument, getDocument, queryDocumentsByField } from './firestoreAdmin';

/**
 * Executes automated background polling for connected Facebook Pages and Instagram accounts.
 * Triggered on schedule by Cloudflare Workers cron event.
 */
export async function executeAutomatedBackgroundSync(
  event: ScheduledEvent,
  env: WorkerEnv,
  _ctx: ExecutionContext
): Promise<void> {
  console.log(`[BackgroundSync] Starting cron trigger at ${new Date(event.scheduledTime).toISOString()} (Cron: ${event.cron})`);

  // Discover connected users dynamically — never a hardcoded demo list.
  const connections = await queryDocumentsByField('social_connections', 'status', 'connected', undefined, env).catch(
    (e) => {
      console.warn('[BackgroundSync] Failed to query connected accounts:', e);
      return [] as any[];
    }
  );
  const activeUsers = [...new Set(connections.map((c: any) => c.ownerId).filter(Boolean))];

  if (activeUsers.length === 0) {
    console.log('[BackgroundSync] No connected accounts to sync.');
    return;
  }

  for (const userId of activeUsers) {
    // 1. Check Facebook Page Sync
    try {
      const fbDocId = `${userId}_facebook`;
      const fbConn = await getDocument('social_connections', fbDocId, undefined, env);

      if (fbConn && fbConn.status === 'connected' && fbConn.accessTokenEncrypted) {
        try {
          const pageToken = decryptToken(fbConn.accessTokenEncrypted, env);
          const pageId = fbConn.pageId || fbConn.platformUserId;

          if (pageToken && pageId) {
            const reviews = await fetchFacebookPageReviews(pageToken, pageId, env);
            const now = new Date().toISOString();

            for (const rev of reviews) {
              const testimonialDoc = {
                ownerId: userId,
                author: rev.authorName,
                avatar: rev.authorAvatar,
                rating: rev.rating,
                text: rev.text,
                source: 'facebook',
                verified: true,
                status: 'approved',
                pageId,
                createdAt: rev.date,
                importedAt: now,
              };
              await saveDocument('testimonials', rev.id, testimonialDoc, undefined, env).catch(() => {});
            }
            console.log(`[BackgroundSync] Facebook polling synced ${reviews.length} reviews for ${userId}`);
          }
        } catch (decryptErr) {
          console.warn(`[BackgroundSync] Failed to decrypt Facebook token for ${userId}:`, decryptErr);
        }
      }
    } catch (fbErr) {
      console.warn(`[BackgroundSync] Facebook sync error for ${userId}:`, fbErr);
    }

    // 2. Check Instagram Comments Sync
    try {
      const igDocId = `${userId}_instagram`;
      const igConn = await getDocument('social_connections', igDocId, undefined, env);

      if (igConn && igConn.status === 'connected' && igConn.accessTokenEncrypted) {
        try {
          const userToken = decryptToken(igConn.accessTokenEncrypted, env);
          const igBusinessId = igConn.platformUserId;

          if (userToken && igBusinessId) {
            const reviews = await fetchInstagramCommentsAndMentions(userToken, igBusinessId, env);
            const now = new Date().toISOString();

            for (const rev of reviews) {
              const testimonialDoc = {
                ownerId: userId,
                author: rev.authorName,
                avatar: rev.authorAvatar,
                rating: rev.rating,
                text: rev.text,
                source: 'instagram',
                verified: true,
                status: 'approved',
                postUrl: rev.postUrl,
                createdAt: rev.date,
                importedAt: now,
              };
              await saveDocument('testimonials', rev.id, testimonialDoc, undefined, env).catch(() => {});
            }
            console.log(`[BackgroundSync] Instagram polling synced ${reviews.length} comments for ${userId}`);
          }
        } catch (decryptErr) {
          console.warn(`[BackgroundSync] Failed to decrypt Instagram token for ${userId}:`, decryptErr);
        }
      }
    } catch (igErr) {
      console.warn(`[BackgroundSync] Instagram sync error for ${userId}:`, igErr);
    }
  }

  console.log('[BackgroundSync] Automated background polling completed.');
}
