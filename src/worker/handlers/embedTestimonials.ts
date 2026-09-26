import { WorkerEnv } from '../types';

export interface PublicEmbedReview {
  id: string;
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  source: 'google' | 'linkedin' | 'instagram' | 'facebook' | 'direct';
  verified?: boolean;
  createdAt: string;
}

export async function handleEmbedTestimonials(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId') || url.searchParams.get('project') || 'default';
  const minRating = parseInt(url.searchParams.get('minRating') || '0', 10);
  const sourcesParam = url.searchParams.get('sources');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '30', 10), 100);

  const allowedSources = sourcesParam
    ? sourcesParam.split(',').map((s) => s.trim().toLowerCase())
    : ['google', 'linkedin', 'instagram', 'facebook', 'direct'];

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  };

  try {
    let reviews: PublicEmbedReview[] = [];

    // Attempt to query Firestore testimonials if project ID is provided
    const fbProjectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || 'testimonialcollectordashboard';
    const queryUrl = `https://firestore.googleapis.com/v1/projects/${fbProjectId}/databases/(default)/documents:runQuery`;

    const firestoreQuery = {
      structuredQuery: {
        from: [{ collectionId: 'testimonials' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: 'status' },
                  op: 'EQUAL',
                  value: { stringValue: 'approved' },
                },
              },
            ],
          },
        },
        limit,
      },
    };

    const firestoreRes = await fetch(queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firestoreQuery),
    });

    if (firestoreRes.ok) {
      const rawList: any = await firestoreRes.json();
      for (const item of rawList) {
        if (item.document?.fields) {
          const f = item.document.fields;
          const reviewProjId = f.projectId?.stringValue || '';
          // Match project if specified or include all approved if global/demo
          if (!projectId || projectId === 'default' || projectId === 'demo-project' || reviewProjId === projectId) {
            const rawSource = (f.source?.stringValue || f.platform?.stringValue || 'direct').toLowerCase();
            const source: 'google' | 'linkedin' | 'instagram' | 'facebook' | 'direct' =
              rawSource.includes('google') ? 'google' :
              rawSource.includes('linkedin') ? 'linkedin' :
              rawSource.includes('instagram') ? 'instagram' :
              rawSource.includes('facebook') ? 'facebook' : 'direct';

            reviews.push({
              id: item.document.name.split('/').pop() || Math.random().toString(),
              authorName: f.authorName?.stringValue || f.name?.stringValue || 'Verified Customer',
              authorTitle: f.authorTitle?.stringValue || f.title?.stringValue || '',
              authorCompany: f.authorCompany?.stringValue || f.company?.stringValue || '',
              authorAvatar: f.authorAvatar?.stringValue || f.avatarUrl?.stringValue || '',
              rating: parseInt(f.rating?.integerValue || f.rating?.doubleValue || '5', 10),
              text: f.text?.stringValue || f.content?.stringValue || '',
              source,
              verified: Boolean(f.verified?.booleanValue ?? true),
              createdAt: f.createdAt?.timestampValue || f.createdAt?.stringValue || new Date().toISOString(),
            });
          }
        }
      }
    }

    // No demo/testimonials in production. An empty project returns an empty widget.
    // Apply filtering
    let filtered = reviews.filter((r) => {
      if (minRating > 0 && r.rating < minRating) return false;
      if (allowedSources.length > 0 && !allowedSources.includes(r.source)) return false;
      return true;
    });

    if (filtered.length === 0 && reviews.length > 0) {
      filtered = reviews;
    }

    const payload = {
      projectId,
      totalCount: filtered.length,
      averageRating: filtered.length > 0
        ? (filtered.reduce((acc, r) => acc + r.rating, 0) / filtered.length).toFixed(1)
        : '0.0',
      testimonials: filtered.slice(0, limit),
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    console.error('[handleEmbedTestimonials] Error:', err);
    return new Response(
      JSON.stringify({
        projectId,
        totalCount: 0,
        averageRating: '0.0',
        testimonials: [],
        error: 'Unable to load testimonials right now.',
      }),
      { status: 503, headers: corsHeaders }
    );
  }
}
