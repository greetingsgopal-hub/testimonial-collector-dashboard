import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Review } from '../types';
import { storage } from '../lib/storage';
import { Star } from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';

export const PublicWidgetPage = () => {
  usePageSeo({
    title: 'Customer Testimonials — Panda Praise',
    description: 'Verified customer testimonials powered by Panda Praise.',
  });

  const { publicWidgetId } = useParams<{ publicWidgetId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analytics.widgetPageViewed();
    const fetchWidgetReviews = async () => {
      try {
        setIsLoading(true);
        // Load approved reviews for project
        const allReviews = await storage.getReviews(publicWidgetId);
        setReviews(allReviews.filter((r) => r.status === 'approved'));
      } catch (e) {
        console.error('Failed to load widget reviews:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWidgetReviews();
  }, [publicWidgetId]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center text-zinc-500">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-zinc-500 bg-transparent">
        No approved testimonials to display yet.
      </div>
    );
  }

  return (
    <div className="p-4 bg-transparent font-sans text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed italic mb-3">
                "{r.content}"
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-800/80">
              {r.avatarUrl ? (
                <img
                  src={r.avatarUrl}
                  alt={r.name ? `${r.name}'s profile photo` : 'Customer photo'}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {r.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">{r.name}</div>
                <div className="text-[10px] text-zinc-400 truncate">{r.role} {r.company ? `• ${r.company}` : ''}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
