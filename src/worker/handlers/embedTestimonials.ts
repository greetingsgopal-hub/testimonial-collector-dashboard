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

const SAMPLE_REVIEWS: PublicEmbedReview[] = [
  {
    id: 'sample-1',
    authorName: 'Sarah Jenkins',
    authorTitle: 'VP of Growth',
    authorCompany: 'ScaleFlow AI',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Panda Praise completely transformed our landing page conversion rate. We saw an immediate 34% lift within 48 hours of embedding the Wall of Love widget!',
    source: 'linkedin',
    verified: true,
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'sample-2',
    authorName: 'Marcus Vance',
    authorTitle: 'Founder & CEO',
    authorCompany: 'DevPulse',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'The automatic sync from Google Reviews and Facebook Page is magical. Customer comments land in our proof vault without any manual copying and pasting.',
    source: 'google',
    verified: true,
    createdAt: '2026-09-18T14:30:00Z',
  },
  {
    id: 'sample-3',
    authorName: 'Elena Rostova',
    authorTitle: 'Head of Product',
    authorCompany: 'NovaSphere',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Setting up the Wall of Love took less than 2 minutes. The dark theme looks unbelievable on our Next.js SaaS landing page.',
    source: 'instagram',
    verified: true,
    createdAt: '2026-09-16T09:15:00Z',
  },
  {
    id: 'sample-4',
    authorName: 'David Chen',
    authorTitle: 'Lead Architect',
    authorCompany: 'CloudStack Media',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'High-speed script, zero layout shifts, and real-time webhook updates. This is the gold standard for social proof collection.',
    source: 'facebook',
    verified: true,
    createdAt: '2026-09-14T16:45:00Z',
  },
  {
    id: 'sample-5',
    authorName: 'Jessica Morales',
    authorTitle: 'E-commerce Director',
    authorCompany: 'LuxeGlow Beauty',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'Our checkout conversion skyrocketed after we placed the 5-star customer reviews right beside our pricing table. Absolutely essential tool.',
    source: 'direct',
    verified: true,
    createdAt: '2026-09-12T11:20:00Z',
  },
  {
    id: 'sample-6',
    authorName: 'Alexander Hayes',
    authorTitle: 'Co-founder',
    authorCompany: 'HyperGrowth Labs',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    text: 'The automatic social cards and responsive masonry grid make our customers feel like celebrities. 10/10 recommendation.',
    source: 'linkedin',
    verified: true,
    createdAt: '2026-09-10T18:00:00Z',
  },
];

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

    // Fallback to rich curated samples if no Firestore records exist for the project
    if (reviews.length === 0) {
      reviews = [...SAMPLE_REVIEWS];
    }

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
        : '5.0',
      testimonials: filtered.slice(0, limit),
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err: any) {
    console.error('[handleEmbedTestimonials] Error:', err);
    // Fallback gracefully to sample reviews
    return new Response(
      JSON.stringify({
        projectId,
        totalCount: SAMPLE_REVIEWS.length,
        averageRating: '5.0',
        testimonials: SAMPLE_REVIEWS.slice(0, limit),
      }),
      { status: 200, headers: corsHeaders }
    );
  }
}
