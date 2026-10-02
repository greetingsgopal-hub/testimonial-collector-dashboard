import { WorkerEnv, ScheduledEvent, ExecutionContext } from '../types';
import { decryptToken } from './crypto';
import { fetchFacebookPageReviews } from './facebookOAuth';
import { fetchInstagramCommentsAndMentions } from './instagramOAuth';
import { getDocument, queryDocumentsByField } from './firestoreAdmin';
import { resolveUserOwnership, isDuplicate, validateExternalId, saveReviewsBatch } from './firestore';

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

      // Only sync the Page the user explicitly selected (pageSelected=true).
      // OAuth success alone never triggers review import.
      if (fbConn && fbConn.status === 'connected' && fbConn.pageSelected && fbConn.accessTokenEncrypted) {
        try {
          const pageToken = decryptToken(fbConn.accessTokenEncrypted, env);
          const pageId = fbConn.pageId || fbConn.platformUserId;

          if (pageToken && pageId) {
            const reviews = await fetchFacebookPageReviews(pageToken, pageId, env);
            // Import into the canonical `reviews` collection with tenant-scoped dedupe.
            let savedCount = 0;
            if (reviews.length > 0) {
              const ownership = await resolveUserOwnership(userId, undefined, env);
              const deduped: any[] = [];
              for (const rev of reviews) {
                try {
                  const externalId = validateExternalId(rev.id);
                  if (!(await isDuplicate(userId, 'facebook', externalId, env))) {
                    deduped.push({
                      author: rev.authorName,
                      avatarUrl: rev.authorAvatar,
                      rating: typeof rev.rating === 'number' ? rev.rating : 5,
                      text: rev.text,
                      createdAt: rev.date,
                      externalId,
                      sourceUrl: rev.postUrl || `https://facebook.com/${pageId}`,
                    });
                  }
                } catch (_err) {
                  continue;
                }
              }
              if (deduped.length > 0) {
                await saveReviewsBatch(userId, ownership.workspaceId, ownership.projectId, 'facebook', pageId, deduped, env);
                savedCount = deduped.length;
              }
            }
            console.log(`[BackgroundSync] Facebook polling synced ${savedCount} new reviews for ${userId} (${reviews.length} fetched)`);
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
            // Import into the canonical `reviews` collection with tenant-scoped dedupe.
            let savedCount = 0;
            if (reviews.length > 0) {
              const ownership = await resolveUserOwnership(userId, undefined, env);
              const deduped: any[] = [];
              for (const rev of reviews) {
                try {
                  const externalId = validateExternalId(rev.id);
                  if (!(await isDuplicate(userId, 'instagram', externalId, env))) {
                    deduped.push({
                      author: rev.authorName,
                      avatarUrl: rev.authorAvatar,
                      rating: typeof rev.rating === 'number' ? rev.rating : 5,
                      text: rev.text,
                      createdAt: rev.date,
                      externalId,
                      sourceUrl: rev.postUrl || null,
                    });
                  }
                } catch (_err) {
                  continue;
                }
              }
              if (deduped.length > 0) {
                await saveReviewsBatch(userId, ownership.workspaceId, ownership.projectId, 'instagram', igBusinessId, deduped, env);
                savedCount = deduped.length;
              }
            }
            console.log(`[BackgroundSync] Instagram polling synced ${savedCount} new comments for ${userId} (${reviews.length} fetched)`);
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
