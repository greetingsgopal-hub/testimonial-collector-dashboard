import { WorkerEnv } from '../types';
import { extractBearerToken, verifyFirebaseToken } from '../lib/firebaseAuth';
import { deleteDocument, getDocument, saveDocument } from '../lib/firestoreAdmin';
import { getServiceAccountAccessToken } from '../lib/googleAuth';

const MAX_SOURCE_BYTES = 100 * 1024 * 1024;
const MIN_VIDEO_BITRATE = 6_000_000;
const OUTPUTS = [
  { key: '9x16', ratio: '9:16' },
  { key: '4x5', ratio: '4:5' },
  { key: '1x1', ratio: '1:1' },
] as const;

/** POST /api/video/render { testimonialId } */
export async function handleVideoRender(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const idToken = extractBearerToken(request.headers.get('Authorization'));
  if (!idToken) return json({ error: 'Authentication required.' }, 401);
  const user = await verifyFirebaseToken(idToken, env);
  if (!user?.uid) return json({ error: 'Authentication required.' }, 401);
  if (!env.FFMPEG_RENDERER) return json({ error: 'Video rendering is not configured.' }, 503);

  let input: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json({ error: 'Request body is too large.' }, 413);
    input = JSON.parse(raw);
  } catch {
    return json({ error: 'A valid JSON body is required.' }, 400);
  }
  const testimonialId = (input as { testimonialId?: unknown })?.testimonialId;
  if (typeof testimonialId !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(testimonialId)) {
    return json({ error: 'A valid testimonialId is required.' }, 400);
  }

  const bucket = env.FIREBASE_STORAGE_BUCKET?.trim();
  if (!bucket) return json({ error: 'Firebase Storage is not configured.' }, 503);
  const record = await getDocument('whatsapp_incoming', `${user.uid}_${testimonialId}`, undefined, env);
  if (!record || record.ownerUid !== user.uid || record.id !== testimonialId) {
    return json({ error: 'Video not found.' }, 404);
  }
  const storagePath = typeof record.storagePath === 'string' ? record.storagePath.trim() : '';
  // Never accept an input path from the caller. Derive it from the owner's
  // stored WhatsApp record and fail closed if it escapes that UID namespace.
  if (!storagePath.startsWith(`whatsapp/${user.uid}/`) || storagePath.includes('..') || storagePath.includes('\\')) {
    return json({ error: 'Stored video is not in the owner’s private media path.' }, 403);
  }

  const renderer = env.FFMPEG_RENDERER.get(env.FFMPEG_RENDERER.idFromName(`${user.uid}:${testimonialId}`));
  const serviceToken = await getServiceAccountAccessToken(env);
  if (!serviceToken) return json({ error: 'Firebase Storage access is not configured.' }, 503);
  const sourceUrl = new URL(`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(storagePath)}`);
  sourceUrl.searchParams.set('alt', 'media');
  const sourceResponse = await fetch(sourceUrl, { headers: { Authorization: `Bearer ${serviceToken}` } });
  if (sourceResponse.status === 404) return json({ error: 'Source video is missing from Storage.' }, 404);
  if (!sourceResponse.ok) return json({ error: 'Could not read the source video from Storage.' }, 502);
  const sourceSize = Number(sourceResponse.headers.get('content-length') || 0);
  if (sourceSize > MAX_SOURCE_BYTES) return json({ error: 'Source video exceeds the 100 MB render limit.' }, 413);
  if (!sourceResponse.body) return json({ error: 'Source video is empty.' }, 422);

  const exports: Array<{ ratio: string; storagePath: string; bytes: number }> = [];
  const written: Array<{ exportId: string; storagePath: string }> = [];
  const renderId = crypto.randomUUID();
  try {
    const prepared = await renderer.fetch(`https://renderer.internal/prepare?renderId=${renderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'video/mp4',
        ...(sourceSize ? { 'Content-Length': String(sourceSize) } : {}),
      },
      body: sourceResponse.body,
    });
    if (!prepared.ok) {
      return json({ error: prepared.status === 413 ? 'Source video exceeds the 100 MB render limit.' : 'Renderer could not accept the source video.' }, prepared.status === 413 ? 413 : 502);
    }

    for (const output of OUTPUTS) {
      const response = await renderer.fetch(`https://renderer.internal/render?renderId=${renderId}&ratio=${output.key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!response.ok) {
        const reason = response.status === 422 ? 'The video did not meet the minimum export quality threshold.' : 'The video renderer failed.';
        throw new RenderFailure(reason, output.ratio, response.status === 413 ? 413 : response.status === 422 ? 422 : 502);
      }

      const renderedSize = Number(response.headers.get('content-length') || 0);
      if (renderedSize > MAX_SOURCE_BYTES) {
        throw new RenderFailure('Rendered output exceeds the 100 MB limit.', output.ratio, 413);
      }
      const videoBitrate = Number(response.headers.get('x-video-bitrate') || 0);
      if (!Number.isSafeInteger(renderedSize) || renderedSize <= 0 || !response.body) {
        throw new RenderFailure('The renderer returned an invalid video file.', output.ratio, 502);
      }
      if (!Number.isFinite(videoBitrate) || videoBitrate < MIN_VIDEO_BITRATE) {
        throw new RenderFailure('The rendered video bitrate is below the 6 Mbps quality threshold.', output.ratio, 422);
      }

      // Keep each render immutable so a failed retry cannot delete or partially
      // replace a previous successful export.
      const outputPath = `edits/${user.uid}/${testimonialId}/${output.key}-${renderId}.mp4`;
      const uploadUrl = new URL(`https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(bucket)}/o`);
      uploadUrl.searchParams.set('uploadType', 'media');
      uploadUrl.searchParams.set('name', outputPath);
      const upload = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceToken}`,
          'Content-Type': 'video/mp4',
          'Content-Length': String(renderedSize),
        },
        body: response.body,
      });
      if (!upload.ok) throw new RenderFailure('Could not save a rendered video to Storage.', output.ratio, 502);

      const exportId = `${user.uid}_${testimonialId}_${output.key}_${renderId}`;
      written.push({ exportId, storagePath: outputPath });
      const height = output.key === '9x16' ? 1920 : output.key === '4x5' ? 1350 : 1080;
      await saveDocument('video_exports', exportId, {
        id: exportId,
        ownerUid: user.uid,
        testimonialId,
        sourceStoragePath: storagePath,
        storagePath: outputPath,
        ratio: output.ratio,
        renderId,
        width: 1080,
        height,
        status: 'done',
        mimeType: 'video/mp4',
        sizeBytes: renderedSize,
        videoBitrate,
        createdAt: new Date().toISOString(),
      }, undefined, env);
      exports.push({ ratio: output.ratio, storagePath: outputPath, bytes: renderedSize });
    }
  } catch (error) {
    await Promise.all(written.map(async ({ exportId, storagePath: outputPath }) => {
      const deleteUrl = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(outputPath)}`;
      await Promise.allSettled([
        fetch(deleteUrl, { method: 'DELETE', headers: { Authorization: `Bearer ${serviceToken}` } }),
        deleteDocument('video_exports', exportId, undefined, env),
      ]);
    }));
    if (error instanceof RenderFailure) {
      return json({ error: error.message, ratio: error.ratio }, error.status);
    }
    return json({ error: 'Video rendering failed before all exports could be saved.' }, 502);
  } finally {
    await renderer.fetch(`https://renderer.internal/prepare?renderId=${renderId}`, { method: 'DELETE' }).catch(() => undefined);
  }

  return json({ ok: true, testimonialId, exports }, 200);
}

class RenderFailure extends Error {
  constructor(message: string, readonly ratio: string, readonly status: number) {
    super(message);
  }
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
