import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Review, WidgetSettings, WidgetType } from '../types';
import { storage } from '../lib/storage';
import { Star, Quote, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { FloatingReviewDrawer } from '../components/widgets/FloatingReviewDrawer';
import { SocialProofToast } from '../components/widgets/SocialProofToast';
import { filterTestimonials, parseFilterRulesFromParams } from '../lib/testimonialFilter';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';

const DEFAULT_SETTINGS: WidgetSettings = {
  type: 'wall',
  theme: 'dark',
  primaryColor: '#8b5cf6',
  showRating: true,
  showAvatar: true,
  showDate: true,
  showCompany: true,
  maxCount: 6,
  onlyFeatured: false,
};

function parseSettings(): WidgetSettings {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const theme = params.get('theme');
  const color = params.get('color');

  return {
    ...DEFAULT_SETTINGS,
    type: ['wall', 'carousel', 'spotlight', 'badge', 'floating_tab', 'social_toast'].includes(type || '') ? type as WidgetType : 'wall',
    theme: theme === 'light' ? 'light' : 'dark',
    primaryColor: /^#[0-9a-fA-F]{6}$/.test(color || '') ? color as string : DEFAULT_SETTINGS.primaryColor,
    showRating: params.get('rating') !== '0',
    showAvatar: params.get('avatar') !== '0',
    showDate: params.get('date') !== '0',
    showCompany: params.get('company') !== '0',
    maxCount: Math.min(24, Math.max(1, Number(params.get('count')) || 6)),
    onlyFeatured: params.get('featured') === '1',
    tabPosition: (params.get('position') as any) || 'bottom-right',
    tabText: params.get('tabText') || undefined,
    autoAddByRating: Number(params.get('minRating')) || 0,
    autoAddByTags: params.get('tags') ? params.get('tags')!.split(',') : params.get('tag') && params.get('tag') !== 'all' ? [params.get('tag')!] : undefined,
  };
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const PublicWidgetPage = () => {
  usePageSeo({
    title: 'Customer Testimonials — Panda Praise',
    description: 'Verified customer testimonials powered by Panda Praise.',
  });

  const { publicWidgetId } = useParams<{ publicWidgetId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const settings = useMemo(parseSettings, []);

  useEffect(() => {
    analytics.widgetPageViewed();

    const load = async () => {
      if (!publicWidgetId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        let all = await storage.getReviews(publicWidgetId);
        
        // Fallback 1: Try lowercase slug if different
        if (all.length === 0 && publicWidgetId.toLowerCase() !== publicWidgetId) {
          all = await storage.getReviews(publicWidgetId.toLowerCase());
        }

        // Fallback 2: Direct Firestore query across public_reviews & testimonials
        if (all.length === 0) {
          try {
            const db = getFirebaseDb();
            const cleanSlug = publicWidgetId.toLowerCase().replace(/[^a-z0-9]/g, '');

            const pubSnap = await getDocs(
              query(collection(db, 'public_reviews'), where('status', '==', 'approved'))
            );
            const matchedPub = pubSnap.docs
              .map((d) => ({ id: d.id, ...d.data() } as any))
              .filter(
                (r) =>
                  (r.projectSlug && r.projectSlug.toLowerCase() === publicWidgetId.toLowerCase()) ||
                  (r.projectSlug && r.projectSlug.toLowerCase() === cleanSlug) ||
                  (r.projectId && r.projectId.toLowerCase() === publicWidgetId.toLowerCase()) ||
                  (r.projectId && r.projectId.toLowerCase() === cleanSlug)
              );

            if (matchedPub.length > 0) {
              all = matchedPub.map((d) => ({
                id: d.id,
                projectId: d.projectId || publicWidgetId,
                collectionFormId: d.collectionFormId || '',
                ownerId: d.ownerId || '',
                name: d.name || 'Verified Customer',
                email: '',
                role: d.role || 'Verified Customer',
                company: d.company || '',
                avatarUrl: d.avatarUrl || '',
                rating: Number(d.rating || 5),
                title: d.title || '',
                content: d.content || '',
                type: d.type || 'text',
                videoUrl: d.videoUrl || '',
                tags: d.tags || ['social-proof'],
                source: 'manual',
                status: 'approved',
                isFeatured: Boolean(d.isFeatured),
                consent: true,
                helpfulCount: 0,
                createdAt: d.createdAt || new Date().toISOString(),
                updatedAt: d.updatedAt || new Date().toISOString(),
              }));
            } else {
              // Also check testimonials collection
              const testSnap = await getDocs(
                query(collection(db, 'testimonials'), where('status', '==', 'approved'))
              );
              const matchedTest = testSnap.docs
                .map((d) => ({ id: d.id, ...d.data() } as any))
                .filter(
                  (r) =>
                    (r.workspaceSlug && r.workspaceSlug.toLowerCase() === publicWidgetId.toLowerCase()) ||
                    (r.workspaceSlug && r.workspaceSlug.toLowerCase() === cleanSlug) ||
                    (r.workspaceId && r.workspaceId.toLowerCase() === publicWidgetId.toLowerCase()) ||
                    (r.workspaceId && r.workspaceId.toLowerCase() === cleanSlug)
                );
              if (matchedTest.length > 0) {
                all = matchedTest.map((d) => ({
                  id: d.id,
                  projectId: publicWidgetId,
                  collectionFormId: '',
                  ownerId: '',
                  name: d.authorName || 'Verified Customer',
                  email: '',
                  role: d.authorRole || 'Customer',
                  company: '',
                  avatarUrl: '',
                  rating: Number(d.rating || 5),
                  title: '',
                  content: d.content || '',
                  type: 'text',
                  videoUrl: '',
                  tags: ['sample', 'social-proof'],
                  source: 'manual',
                  status: 'approved',
                  isFeatured: true,
                  consent: true,
                  helpfulCount: 0,
                  createdAt: d.createdAt || new Date().toISOString(),
                  updatedAt: d.createdAt || new Date().toISOString(),
                }));
              }
            }
          } catch (fbErr) {
            console.warn('[PublicWidget] Fallback query notice:', fbErr);
          }
        }

        const params = new URLSearchParams(window.location.search);
        const rules = parseFilterRulesFromParams(params);

        // Fallback to widget settings if not explicitly specified in URL params
        if (settings.onlyFeatured) rules.onlyFeatured = true;
        if (settings.autoAddByRating && (!rules.minRating || rules.minRating === 0)) {
          rules.minRating = settings.autoAddByRating;
        }

        const visible = filterTestimonials(all, rules, settings.maxCount);
        setReviews(visible);
      } catch (error) {
        console.error('[PublicWidget] Failed to load approved reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [publicWidgetId, settings]);

  const background = settings.theme === 'dark' ? '#09090b' : '#ffffff';
  const foreground = settings.theme === 'dark' ? '#f4f4f5' : '#18181b';
  const muted = settings.theme === 'dark' ? '#a1a1aa' : '#71717a';
  const border = settings.theme === 'dark' ? '#27272a' : '#e4e4e7';
  const card = settings.theme === 'dark' ? '#18181b' : '#ffffff';

  if (isLoading) {
    return (
      <div className="min-h-[100px] flex items-center justify-center" style={{ background, color: muted }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: settings.primaryColor + '55', borderTopColor: settings.primaryColor }} />
      </div>
    );
  }

  if (reviews.length === 0) {
    const rawBrand = publicWidgetId
      ? publicWidgetId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Brand';
    return (
      <div className="min-h-[360px] flex flex-col items-center justify-center px-6 py-12 text-center" style={{ background, color: foreground }}>
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mb-4">
          ⭐
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2" style={{ color: foreground }}>
          {rawBrand} Wall of Love
        </h2>
        <p className="max-w-md text-xs sm:text-sm leading-relaxed mb-6" style={{ color: muted }}>
          Authentic customer reviews and testimonials are being curated and will appear here shortly.
        </p>
        <a
          href="https://pandapraise.com/?ref=empty_wall"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs"
        >
          ⚡ Powered by Panda Praise
        </a>
      </div>
    );
  }

  const Stars = ({ rating }: { rating: number }) => settings.showRating ? (
    <div className="flex items-center gap-0.5" aria-label={String(rating) + ' out of 5 stars'}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-3.5 h-3.5"
          style={{ color: star <= rating ? '#fbbf24' : border, fill: star <= rating ? '#fbbf24' : 'none' }}
        />
      ))}
    </div>
  ) : null;

  const Reviewer = ({ review, large = false }: { review: Review; large?: boolean }) => (
    <div className={'flex items-center ' + (large ? 'gap-3' : 'gap-2.5') + ' min-w-0'}>
      {settings.showAvatar && (
        review.avatarUrl ? (
          <img
            src={review.avatarUrl}
            alt={review.name ? review.name + "'s profile photo" : 'Customer photo'}
            className={large ? 'w-10 h-10 rounded-full object-cover shrink-0' : 'w-7 h-7 rounded-full object-cover shrink-0'}
          />
        ) : (
          <div
            className={(large ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-[10px]') + ' rounded-full flex items-center justify-center font-bold text-white shrink-0'}
            style={{ backgroundColor: settings.primaryColor }}
          >
            {(review.name || 'C').charAt(0).toUpperCase()}
          </div>
        )
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className={(large ? 'text-sm' : 'text-xs') + ' font-semibold truncate'} style={{ color: foreground }}>
            {review.name}
          </div>
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            ✓ Verified
          </span>
          {review.editedByOwner && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0 border" style={{ color: foreground, opacity: 0.6 }}>
              Edited by business
            </span>
          )}
        </div>
        {settings.showCompany && (
          <div className="text-[10px] truncate" style={{ color: muted }}>
            {review.role}{review.company ? ' • ' + review.company : ''}
          </div>
        )}
        {settings.showDate && (
          <div className="text-[9px] mt-0.5" style={{ color: muted }}>{formatDate(review.createdAt)}</div>
        )}
      </div>
    </div>
  );

  const Card = ({ review }: { review: Review }) => (
    <article className="p-4 rounded-xl border shadow-sm flex flex-col gap-3" style={{ background: card, borderColor: border, color: foreground }}>
      <Stars rating={review.rating} />
      {review.title && <h3 className="text-sm font-semibold" style={{ color: foreground }}>{review.title}</h3>}
      <p className="text-xs leading-relaxed italic" style={{ color: foreground }}>"{review.content}"</p>
      <div className="pt-2 border-t" style={{ borderColor: border }}>
        <Reviewer review={review} />
      </div>
    </article>
  );

  return (
    <div className="w-full p-4 sm:p-5 font-sans" style={{ color: foreground }}>
      {settings.type === 'wall' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => <Card key={review.id} review={review} />)}
        </div>
      )}

      {settings.type === 'carousel' && (
        <div className="max-w-2xl mx-auto">
          {(() => {
            const review = reviews[carouselIndex % reviews.length];
            return (
              <article className="p-6 rounded-2xl border shadow-sm" style={{ background: card, borderColor: border }}>
                <Quote className="w-8 h-8 mb-4" style={{ color: settings.primaryColor }} />
                <Stars rating={review.rating} />
                <p className="text-sm sm:text-base leading-relaxed italic my-5" style={{ color: foreground }}>"{review.content}"</p>
                <Reviewer review={review} large />
                {reviews.length > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    <button type="button" aria-label="Previous testimonial" onClick={() => setCarouselIndex((i) => i > 0 ? i - 1 : reviews.length - 1)} className="p-2 rounded-full border" style={{ borderColor: border, color: foreground }}>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs" style={{ color: muted }}>{(carouselIndex % reviews.length) + 1} of {reviews.length}</span>
                    <button type="button" aria-label="Next testimonial" onClick={() => setCarouselIndex((i) => (i + 1) % reviews.length)} className="p-2 rounded-full border" style={{ borderColor: border, color: foreground }}>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </article>
            );
          })()}
        </div>
      )}

      {settings.type === 'spotlight' && (
        <div className="max-w-xl mx-auto">
          <article className="p-6 sm:p-7 rounded-2xl border shadow-sm relative overflow-hidden" style={{ background: card, borderColor: border }}>
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: settings.primaryColor }} />
            <Stars rating={reviews[0].rating} />
            {reviews[0].title && <h3 className="text-lg font-semibold mt-3" style={{ color: foreground }}>{reviews[0].title}</h3>}
            <p className="text-sm sm:text-base leading-relaxed italic my-5" style={{ color: foreground }}>"{reviews[0].content}"</p>
            <Reviewer review={reviews[0]} large />
          </article>
        </div>
      )}

      {settings.type === 'badge' && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full border shadow-sm" style={{ background: card, borderColor: border }}>
            <Award className="w-5 h-5 shrink-0" style={{ color: settings.primaryColor }} />
            <div>
              <div className="flex items-center gap-1">
                <Stars rating={5} />
                <span className="text-xs font-bold" style={{ color: foreground }}>
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
              </div>
              <div className="text-[10px]" style={{ color: muted }}>
                {reviews.length} verified testimonial{reviews.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </div>
      )}

      {settings.type === 'floating_tab' && (
        <FloatingReviewDrawer
          reviews={reviews}
          tabText={settings.tabText}
          primaryColor={settings.primaryColor}
          position={settings.tabPosition || 'bottom-right'}
          defaultOpen={true}
        />
      )}

      {settings.type === 'social_toast' && (
        <SocialProofToast
          reviews={reviews}
          position={settings.tabPosition === 'bottom-right' ? 'bottom-right' : 'bottom-left'}
        />
      )}

      <div className="text-center mt-3">
        <a 
          href="https://pandapraise.com/?ref=embed_widget&utm_source=widget_badge&utm_medium=referral&utm_campaign=powered_by_badge" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[9px] opacity-50 hover:opacity-80 transition-opacity" 
          style={{ color: muted }}
        >
          ⚡ Powered by Panda Praise
        </a>
      </div>
    </div>
  );
};
