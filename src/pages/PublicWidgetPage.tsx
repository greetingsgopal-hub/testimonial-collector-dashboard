import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Review, WidgetSettings, WidgetType } from '../types';
import { storage } from '../lib/storage';
import { Star, Quote, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { FloatingReviewDrawer } from '../components/widgets/FloatingReviewDrawer';
import { SocialProofToast } from '../components/widgets/SocialProofToast';

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
    maxCount: Math.min(12, Math.max(1, Number(params.get('count')) || 6)),
    onlyFeatured: params.get('featured') === '1',
    tabPosition: (params.get('position') as any) || 'bottom-right',
    tabText: params.get('tabText') || undefined,
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
        const all = await storage.getReviews(publicWidgetId);
        const approved = all.filter((r) => r.status === 'approved');
        const visible = settings.onlyFeatured ? approved.filter((r) => r.isFeatured) : approved;
        setReviews(visible.slice(0, settings.maxCount));
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
    return (
      <div className="min-h-[100px] flex items-center justify-center px-6 text-center text-xs" style={{ color: muted }}>
        No approved testimonials to display yet.
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
        <div className={(large ? 'text-sm' : 'text-xs') + ' font-semibold truncate'} style={{ color: foreground }}>
          {review.name}
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
        <a href="/" target="_blank" rel="noopener noreferrer" className="text-[9px] opacity-50 hover:opacity-80" style={{ color: muted }}>
          Powered by Panda Praise
        </a>
      </div>
    </div>
  );
};
