import React, { useState, useEffect } from 'react';
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Star,
  Check,
  Send,
  ExternalLink,
  MessageSquare,
  CheckSquare,
  Square,
  Smartphone
} from 'lucide-react';
import { Review, SocialPlatform } from '../../../types';
import { socialClient, SocialStatusResponse } from '../../../lib/socialClient';
import { useAuth } from '../../../context/AuthContext';

interface SocialPostViewProps {
  reviews: Review[];
  onOpenAccountsModal?: () => void;
}

export const SocialPostView: React.FC<SocialPostViewProps> = ({
  reviews,
  onOpenAccountsModal,
}) => {
  const { project } = useAuth();
  const [socialStatus, setSocialStatus] = useState<SocialStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [selectedReviewIds, setSelectedReviewIds] = useState<Set<string>>(new Set());
  const [targetPlatforms, setTargetPlatforms] = useState<Set<SocialPlatform>>(new Set(['linkedin']));
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4'>('all');
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<{
    success: boolean;
    message: string;
    publishedCount?: number;
    error?: string;
  } | null>(null);

  // Load connected accounts status
  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const data = await socialClient.getStatus();
      setSocialStatus(data);
      if (data?.connections) {
        // Auto-select connected platforms
        const connected = new Set<SocialPlatform>();
        Object.entries(data.connections).forEach(([platform, info]) => {
          if (info.connected) {
            connected.add(platform as SocialPlatform);
          }
        });
        if (connected.size > 0) {
          setTargetPlatforms(connected);
        }
      }
    } catch (err) {
      console.error('Failed to load social status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Filter approved reviews only
  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const displayedReviews = approvedReviews.filter((r) => {
    if (filterRating === '5') return r.rating === 5;
    if (filterRating === '4') return (r.rating || 0) >= 4;
    return true;
  });

  // Handle Tick Selection
  const handleToggleReview = (id: string) => {
    setSelectedReviewIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedReviewIds.size === displayedReviews.length && displayedReviews.length > 0) {
      setSelectedReviewIds(new Set());
    } else {
      setSelectedReviewIds(new Set(displayedReviews.map((r) => r.id)));
    }
  };

  const handleTogglePlatform = (platform: SocialPlatform) => {
    setTargetPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(platform)) {
        if (next.size > 1) next.delete(platform);
      } else {
        next.add(platform);
      }
      return next;
    });
  };

  const handleConnect = async (platform: SocialPlatform) => {
    try {
      const res = await socialClient.initOAuth(platform);
      if (res.authUrl) {
        window.location.href = res.authUrl;
      } else if (res.error) {
        setPublishResults({
          success: false,
          message: res.error,
        });
      }
    } catch (err) {
      console.error('Connect error:', err);
    }
  };

  const handlePublishSelected = async () => {
    if (selectedReviewIds.size === 0) return;
    if (targetPlatforms.size === 0) {
      setPublishResults({
        success: false,
        message: 'Please select at least one social media platform.',
      });
      return;
    }

    setPublishing(true);
    setPublishResults(null);

    const selectedList = approvedReviews.filter((r) => selectedReviewIds.has(r.id));
    let successCount = 0;
    let failCount = 0;
    let lastError: string | undefined;

    for (const review of selectedList) {
      const authorName = review.name || 'Verified Customer';
      const quote = review.content || '';
      const caption = `"${quote}"\n\n— ${authorName}${project?.name ? ` on ${project.name}` : ''}\n\n#CustomerLove #SocialProof #PandaPraise`;

      for (const platform of Array.from(targetPlatforms)) {
        try {
          const res = await socialClient.publish({
            reviewId: review.id,
            platform,
            caption,
          });

          if (res.success) {
            successCount++;
          } else {
            failCount++;
            lastError = res.error;
          }
        } catch (err: any) {
          failCount++;
          lastError = err?.message || 'Publishing request failed';
        }
      }
    }

    setPublishing(false);

    if (successCount > 0) {
      setPublishResults({
        success: true,
        message: `Successfully posted ${successCount} testimonial publication(s) to ${Array.from(targetPlatforms).join(', ')}!`,
        publishedCount: successCount,
      });
      // Deselect published reviews
      setSelectedReviewIds(new Set());
      loadStatus();
    } else {
      setPublishResults({
        success: false,
        message: lastError || 'Failed to publish to selected social accounts. Please check your credentials.',
        error: lastError,
      });
    }
  };

  // Pre-configured platform descriptors
  const platformList: {
    id: SocialPlatform;
    name: string;
    iconColor: string;
    bgHover: string;
  }[] = [
    { id: 'linkedin', name: 'LinkedIn', iconColor: 'text-[#0a66c2]', bgHover: 'hover:bg-blue-50' },
    { id: 'twitter', name: 'X (Twitter)', iconColor: 'text-[#1d9bf0]', bgHover: 'hover:bg-sky-50' },
    { id: 'facebook', name: 'Facebook', iconColor: 'text-[#1877f2]', bgHover: 'hover:bg-indigo-50' },
    { id: 'instagram', name: 'Instagram', iconColor: 'text-[#e4405f]', bgHover: 'hover:bg-rose-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Post on Internet
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight font-display">
            On Social Media
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect your brand accounts and broadcast customer praise directly across social networks in 1 click.
          </p>
        </div>

        {onOpenAccountsModal && (
          <button
            type="button"
            onClick={onOpenAccountsModal}
            className="apple-touch px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
          >
            <Share2 className="w-4 h-4 text-violet-600" />
            <span>Manage Accounts</span>
          </button>
        )}
      </div>

      {/* 2. Integrated Accounts Status Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Connected Social Accounts
            </h3>
          </div>
          <button
            type="button"
            onClick={loadStatus}
            disabled={loadingStatus}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {platformList.map((p) => {
            const info = socialStatus?.connections?.[p.id];
            const isConnected = Boolean(info?.connected);
            const isSelectedForPublish = targetPlatforms.has(p.id);

            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isConnected
                    ? isSelectedForPublish
                      ? 'bg-violet-50/50 dark:bg-violet-950/20 border-violet-400 dark:border-violet-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${p.iconColor}`}>●</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                  </div>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Not Connected</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  {isConnected ? (
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSelectedForPublish}
                        onChange={() => handleTogglePlatform(p.id)}
                        className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
                      />
                      <span>Post target</span>
                    </label>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(p.id)}
                      className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Connect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  {info?.accountName && (
                    <span className="text-[11px] font-mono text-slate-500 truncate max-w-[100px]">
                      @{info.accountName}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Notification Results Banner */}
      {publishResults && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-medium border animate-fade-in ${
            publishResults.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {publishResults.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{publishResults.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setPublishResults(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. Action Command Bar & Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Tick Filters & Selection */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleSelectAll}
            className="apple-touch flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            {selectedReviewIds.size > 0 && selectedReviewIds.size === displayedReviews.length ? (
              <CheckSquare className="w-4 h-4 text-violet-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {selectedReviewIds.size > 0
                ? `${selectedReviewIds.size} Selected`
                : 'Select All'}
            </span>
          </button>

          {/* Rating filter pills */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterRating('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterRating === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({approvedReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRating('5')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                filterRating === '5'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>5 Stars</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterRating('4')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterRating === '4'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              4+ Stars
            </button>
          </div>
        </div>

        {/* Right: 1-Click Multi-Channel Publisher Button */}
        <button
          type="button"
          data-testid="publish-social-btn"
          disabled={publishing || selectedReviewIds.size === 0}
          onClick={handlePublishSelected}
          className={`apple-touch flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            selectedReviewIds.size > 0 && !publishing
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white cursor-pointer active:scale-95'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
        >
          {publishing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Broadcasting to Social Networks...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                {selectedReviewIds.size > 0
                  ? `Post ${selectedReviewIds.size} Testimonial${selectedReviewIds.size > 1 ? 's' : ''} to Social Media`
                  : 'Select Testimonials to Post'}
              </span>
            </>
          )}
        </button>
      </div>

      {/* 5. Selectable Testimonials Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Approved Testimonials ({displayedReviews.length})
          </h3>
          <span className="text-xs text-slate-500">
            {selectedReviewIds.size} queued for broadcast
          </span>
        </div>

        {displayedReviews.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No Approved Testimonials Yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Once you approve testimonials in the Evaluate tab, they will appear here ready to broadcast across your social media channels in a single click.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayedReviews.map((review) => {
              const isSelected = selectedReviewIds.has(review.id);
              const author = review.name || 'Happy Customer';
              const rating = review.rating || 5;

              return (
                <div
                  key={review.id}
                  data-testid={`review-card-${review.id}`}
                  onClick={() => handleToggleReview(review.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-violet-50/40 dark:bg-violet-950/20 border-violet-500 shadow-sm ring-1 ring-violet-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          data-testid={`review-checkbox-${review.id}`}
                          checked={isSelected}
                          onChange={() => handleToggleReview(review.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
                        />
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-3 leading-relaxed italic">
                      "{review.content || 'Great product and wonderful customer support!'}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {author.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {author}
                        </p>
                        {review.role && (
                          <p className="text-[10px] text-slate-400 truncate">
                            {review.role}{review.company ? ` at ${review.company}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      Approved
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
