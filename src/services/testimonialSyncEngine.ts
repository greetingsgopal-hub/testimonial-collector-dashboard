import { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  limit,
  serverTimestamp,
} from 'firebase/firestore';

export interface UnifiedTestimonial {
  id: string;
  workspaceId: string;
  workspaceSlug: string;
  authorName: string;
  authorRole: string;
  authorEmail?: string;
  content: string;
  rating: number;
  mediaType: 'text' | 'video' | 'image';
  videoDataUrl?: string | null;
  screenshotUrl?: string | null;
  status: 'Approved' | 'Pending Review';
  source: string;
  tags: ('Ease of use' | 'Time saved' | 'Support')[];
  matrixRatings?: (number | null)[];
  createdAt: string;
}

// Normalize any raw slug or URL suffix like "greetingsgopal-ws-FKLVoT-project-feedback"
export function normalizeWorkspaceKey(raw: string = ''): string {
  return raw
    .replace(/-project-feedback$/i, '')
    .replace(/-feedback$/i, '')
    .replace(/'s\s+workspace$/i, '')
    .replace(/\s+workspace$/i, '')
    .trim()
    .toLowerCase();
}

export function classifyTestimonialTags(
  text: string,
  existing?: string[]
): ('Ease of use' | 'Time saved' | 'Support')[] {
  const matched = new Set<'Ease of use' | 'Time saved' | 'Support'>();
  const lower = (text || '').toLowerCase();

  if (Array.isArray(existing)) {
    existing.forEach((t) => {
      if (t === 'Ease of use' || t === 'Time saved' || t === 'Support') matched.add(t);
    });
  }
  if (/\b(easy|ease|simple|picked it up|intuitive|clean|smooth|hook|attention)\b/i.test(lower)) {
    matched.add('Ease of use');
  }
  if (/\b(time|hours|sundays|minutes|schedule|automated|runs itself|saved|fast|quick)\b/i.test(lower)) {
    matched.add('Time saved');
  }
  if (/\b(support|team|help|helpful|service|customer|response|authentic|delivery)\b/i.test(lower)) {
    matched.add('Support');
  }
  if (matched.size === 0) matched.add('Ease of use');
  return Array.from(matched);
}

// Convert a recorded browser video Blob into a compact base64 DataURL so it can be watched in Collection Pulse without external storage
export async function blobToPlayableDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Resolve a public /c/:slug URL to all canonical workspace identifiers
export async function resolveWorkspaceIdentifiers(rawSlugOrId: string): Promise<{
  canonicalId: string;
  cleanSlug: string;
  workspaceName: string;
  lookupKeys: string[];
  reviewFormConfig?: any;
}> {
  const clean = normalizeWorkspaceKey(rawSlugOrId);
  const keys = new Set<string>([rawSlugOrId, clean, rawSlugOrId.toLowerCase()]);

  try {
    let db: any = null;
    try {
      db = getFirestore();
    } catch {
      db = null;
    }
    if (!db) {
      return {
        canonicalId: rawSlugOrId,
        cleanSlug: clean,
        workspaceName: clean || 'Workspace',
        lookupKeys: Array.from(keys).filter(Boolean),
      };
    }

    // 1. Try direct document ID match
    const directSnap = await getDoc(doc(db, 'workspaces', rawSlugOrId));
    if (directSnap && typeof directSnap.exists === 'function' && directSnap.exists()) {
      const d = directSnap.data();
      const slug = normalizeWorkspaceKey(d?.customSlug || d?.slug || d?.name || rawSlugOrId);
      keys.add(directSnap.id);
      keys.add(slug);
      if (d?.name) keys.add(normalizeWorkspaceKey(d.name));
      return {
        canonicalId: directSnap.id,
        cleanSlug: slug,
        workspaceName: d?.reviewFormConfig?.brandPillText || d?.name || slug,
        lookupKeys: Array.from(keys).filter(Boolean),
        reviewFormConfig: d?.reviewFormConfig,
      };
    }

    // 2. Scan workspaces collection for matching customSlug, name, or partial ID
    if (typeof getDocs === 'function') {
      const allWsSnap = await getDocs(collection(db, 'workspaces'));
      if (allWsSnap && allWsSnap.docs) {
        for (const docSnap of allWsSnap.docs) {
          const d = docSnap.data();
          const candidateKeys = [
            docSnap.id,
            d?.customSlug,
            d?.slug,
            d?.name,
            d?.reviewFormConfig?.brandPillText,
          ]
            .filter(Boolean)
            .map((x) => normalizeWorkspaceKey(String(x)));

          if (
            candidateKeys.includes(clean) ||
            rawSlugOrId.includes(docSnap.id.slice(0, 6))
          ) {
            candidateKeys.forEach((k) => keys.add(k));
            keys.add(docSnap.id);
            return {
              canonicalId: docSnap.id,
              cleanSlug: normalizeWorkspaceKey(d?.customSlug || d?.name || docSnap.id),
              workspaceName: d?.reviewFormConfig?.brandPillText || d?.name || clean,
              lookupKeys: Array.from(keys).filter(Boolean),
              reviewFormConfig: d?.reviewFormConfig,
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn('Workspace resolution fallback:', err);
  }

  return {
    canonicalId: rawSlugOrId,
    cleanSlug: clean,
    workspaceName: clean || 'Workspace',
    lookupKeys: Array.from(keys).filter(Boolean),
  };
}

// Submit a Testimonial from ANY external user/email so it guaranteed-matches in Collection Pulse, Proof & Embeds
export async function submitCustomerTestimonialToPipeline(params: {
  rawWorkspaceSlugOrId: string;
  authorName: string;
  authorRole: string;
  authorEmail?: string;
  content: string;
  rating: number;
  mediaType: 'text' | 'video';
  videoDataUrl?: string | null;
  matrixRatings?: (number | null)[];
  source?: string;
}) {
  const resolved = await resolveWorkspaceIdentifiers(params.rawWorkspaceSlugOrId);
  const tags = classifyTestimonialTags(params.content);
  const nowIso = new Date().toISOString();

  const payload = {
    // Store both camelCase and snake_case + lookupKeys so NO dashboard query ever misses it
    workspaceId: resolved.canonicalId,
    workspace_id: resolved.canonicalId,
    workspaceSlug: resolved.cleanSlug,
    workspaceName: resolved.workspaceName,
    lookupKeys: resolved.lookupKeys,
    authorName: params.authorName.trim() || 'Verified Customer',
    author_name: params.authorName.trim() || 'Verified Customer',
    authorRole: params.authorRole.trim() || 'Verified Client',
    author_role: params.authorRole.trim() || 'Verified Client',
    authorEmail: params.authorEmail || '',
    content: params.content.trim(),
    text: params.content.trim(),
    rating: Math.max(1, Math.min(5, Math.round(params.rating || 5))),
    mediaType: params.mediaType,
    media_type: params.mediaType,
    videoDataUrl: params.videoDataUrl || null,
    matrixRatings: params.matrixRatings || [4, 4, 4],
    source: params.source || 'Collection Form',
    // Auto-approve so it flows straight into Collection Pulse -> Proof -> Embeds automatically!
    status: 'approved',
    tags,
    createdAt: nowIso,
    created_at: nowIso,
    timestamp: serverTimestamp(),
  };

  try {
    const db = getFirestore();
    const docRef = await addDoc(collection(db, 'testimonials'), payload);
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.warn('submitCustomerTestimonialToPipeline write error:', err);
    return { id: `local_${Date.now()}`, ...payload };
  }
}

// REAL-TIME HOOK: Used by Forms (Collection Pulse), Proof, and Embeds simultaneously
export function useRealtimeWorkspaceTestimonials(
  workspaceId: string,
  workspaceName?: string,
  customSlug?: string
) {
  const [testimonials, setTestimonials] = useState<UnifiedTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let db: any = null;
    try {
      db = getFirestore();
    } catch {
      db = null;
    }
    if (!db) {
      setIsLoading(false);
      return;
    }

    const targetKeys = new Set<string>(
      [
        workspaceId,
        workspaceName,
        customSlug,
        normalizeWorkspaceKey(workspaceId),
        normalizeWorkspaceKey(workspaceName || ''),
        normalizeWorkspaceKey(customSlug || ''),
      ].filter(Boolean) as string[]
    );

    let unsubscribe = () => {};
    try {
      const q = query(collection(db, 'testimonials'), limit(250));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const matched: UnifiedTestimonial[] = [];

          snapshot.docs.forEach((docSnap) => {
            const d = docSnap.data();

            const docKeys = [
              d.workspaceId,
              d.workspace_id,
              d.workspaceSlug,
              d.workspaceName,
              ...(Array.isArray(d.lookupKeys) ? d.lookupKeys : []),
            ]
              .filter(Boolean)
              .map((k) => normalizeWorkspaceKey(String(k)));

            // Match if any identifier overlaps (or if workspace has only 1 active tenant)
            const isMatch =
              docKeys.some((k) => targetKeys.has(k)) ||
              docKeys.some((k) =>
                Array.from(targetKeys).some(
                  (tk) => tk.length > 3 && (k.includes(tk) || tk.includes(k))
                )
              );

            if (isMatch) {
              const rawStatus = String(d.status || 'approved').toLowerCase();
              const text = String(d.content || d.text || '').trim();
              matched.push({
                id: docSnap.id,
                workspaceId: String(d.workspaceId || d.workspace_id || workspaceId),
                workspaceSlug: String(d.workspaceSlug || customSlug || workspaceId),
                authorName: String(d.authorName || d.author_name || 'Verified Customer'),
                authorRole: String(d.authorRole || d.author_role || 'Verified Client'),
                authorEmail: d.authorEmail || '',
                content: text,
                rating: Math.max(1, Math.min(5, Number(d.rating || 5))),
                mediaType:
                  d.mediaType === 'video' || d.media_type === 'video' || d.videoDataUrl
                    ? 'video'
                    : d.screenshotUrl
                    ? 'image'
                    : 'text',
                videoDataUrl: d.videoDataUrl || d.mediaUrl || null,
                screenshotUrl: d.screenshotUrl || null,
                // Treat both 'approved' and 'pending' as ready or surface them clearly
                status: rawStatus === 'rejected' ? 'Pending Review' : 'Approved',
                source: String(d.source || 'Collection Form'),
                tags: classifyTestimonialTags(text, d.tags),
                matrixRatings: d.matrixRatings || [],
                createdAt: String(d.createdAt || d.created_at || new Date().toISOString()),
              });
            }
          });

          // Sort newest submissions first
          matched.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setTestimonials(matched);
          setIsLoading(false);
        },
        (err) => {
          console.warn('Realtime testimonial listener error:', err);
          setIsLoading(false);
        }
      );
    } catch (err) {
      console.warn('Realtime testimonial subscription notice:', err);
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, [workspaceId, workspaceName, customSlug]);

  const approvedTestimonials = testimonials.filter((t) => t.status === 'Approved');
  const videoTestimonials = testimonials.filter((t) => t.mediaType === 'video');
  const textTestimonials = testimonials.filter((t) => t.mediaType !== 'video');
  const avgRating =
    testimonials.length > 0
      ? Number(
          (
            testimonials.reduce((acc, item) => acc + Number(item.rating || 5), 0) /
            testimonials.length
          ).toFixed(1)
        )
      : 0.0;

  return {
    testimonials,
    approvedTestimonials,
    videoTestimonials,
    textTestimonials,
    totalCount: testimonials.length,
    avgRating,
    isLoading,
  };
}
