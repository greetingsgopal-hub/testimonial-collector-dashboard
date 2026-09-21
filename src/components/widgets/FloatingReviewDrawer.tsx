import React, { useState } from 'react';
import { 
  Star, 
  X, 
  MessageSquarePlus, 
  ShieldCheck, 
  Sparkles, 
  Search 
} from 'lucide-react';
import { Review, ReviewInput, CollectionForm, Project } from '../../types';
import { TestimonialForm } from '../collector/TestimonialForm';
import { SuccessModal } from '../collector/SuccessModal';
import { storage } from '../../lib/storage';

interface FloatingReviewDrawerProps {
  reviews: Review[];
  project?: Project | null;
  collectionForm?: CollectionForm | null;
  position?: 'bottom-right' | 'bottom-left' | 'side-right' | 'side-left';
  primaryColor?: string;
  tabText?: string;
  allowSubmit?: boolean;
  defaultOpen?: boolean;
}

export const FloatingReviewDrawer: React.FC<FloatingReviewDrawerProps> = ({
  reviews = [],
  project,
  collectionForm,
  position = 'bottom-right',
  primaryColor = '#8b5cf6',
  tabText,
  allowSubmit = true,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<'reviews' | 'write'>('reviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default empty form payload
  const [formData, setFormData] = useState<ReviewInput>({
    name: '',
    email: '',
    role: '',
    company: '',
    content: '',
    rating: 5,
    type: 'text',
    tags: [],
    consent: true,
    projectId: project?.id || '',
    collectionFormId: collectionForm?.id || '',
  });

  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const avgRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '5.0';

  const filteredReviews = approvedReviews.filter((r) => {
    if (selectedRatingFilter && r.rating !== selectedRatingFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q) ||
        (r.company && r.company.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleFormSubmit = async (data: ReviewInput) => {
    setIsSubmitting(true);
    try {
      const created = await storage.createReview({
        ...data,
        projectId: project?.id || data.projectId,
        collectionFormId: collectionForm?.id || data.collectionFormId,
      });
      setSubmittedReview(created);
      setShowSuccessModal(true);
      setActiveTab('reviews');
    } catch (err) {
      console.error('[FloatingReviewDrawer] Submission failed:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine floating button positioning classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'side-right':
        return 'top-1/2 right-0 -translate-y-1/2 rounded-r-none rounded-l-2xl shadow-2xl';
      case 'side-left':
        return 'top-1/2 left-0 -translate-y-1/2 rounded-l-none rounded-r-2xl shadow-2xl';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  return (
    <>
      {/* ── 1. Floating Action Button / Tab ── */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`fixed ${getPositionClasses()} z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-zinc-900/95 hover:bg-zinc-800 text-white font-medium text-xs sm:text-sm border border-white/15 shadow-2xl backdrop-blur-xl transition-all duration-200 transform hover:scale-105 active:scale-95 group cursor-pointer`}
          style={{
            boxShadow: `0 10px 25px -5px ${primaryColor}40, 0 8px 10px -6px rgba(0, 0, 0, 0.5)`,
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-inner shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <Star className="w-4 h-4 fill-white text-white drop-shadow-sm" />
          </div>

          <div className="flex flex-col text-left leading-none">
            <span className="font-semibold text-white tracking-tight">
              {tabText || 'Reviews'}
            </span>
            <span className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
              <span className="text-amber-400 font-bold">{avgRating}</span>
              <span>★</span>
              <span>({approvedReviews.length || '15+'})</span>
            </span>
          </div>

          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </button>
      )}

      {/* ── 2. Slide-Over Drawer / Popup ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-lg bg-zinc-950/95 text-zinc-100 border-l border-white/10 shadow-2xl flex flex-col h-full z-10 backdrop-blur-2xl">
            
            {/* Header */}
            <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Star className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                    {project?.name || 'Customer Reviews'}
                    <span title="Verified Testimonials" className="inline-flex">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1">
                    <span className="text-amber-400 font-semibold">{avgRating} / 5.0</span>
                    <span>•</span>
                    <span>{approvedReviews.length} verified reviews</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-zinc-800/80 px-5 pt-3 gap-3 bg-zinc-900/20">
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'text-white border-brand-500'
                    : 'text-zinc-400 border-transparent hover:text-zinc-200'
                }`}
              >
                Wall of Reviews ({approvedReviews.length})
              </button>

              {allowSubmit && (
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'write'
                      ? 'text-white border-brand-500'
                      : 'text-zinc-400 border-transparent hover:text-zinc-200'
                  }`}
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 text-purple-400" />
                  Leave a Review
                </button>
              )}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTab === 'reviews' && (
                <>
                  {/* Search and Star Filter */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search reviews by keyword, name, or company..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-input w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedRatingFilter(null)}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          selectedRatingFilter === null
                            ? 'bg-purple-600 text-white'
                            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        All Stars
                      </button>
                      {[5, 4, 3].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setSelectedRatingFilter(selectedRatingFilter === star ? null : star)}
                          className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                            selectedRatingFilter === star
                              ? 'bg-purple-600 text-white'
                              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <span>{star}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reviews List */}
                  {filteredReviews.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-xs">
                      No matching reviews found.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="glass-card p-4 rounded-xl border border-white/10 relative hover:border-purple-500/30 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-zinc-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          {rev.title && (
                            <h5 className="text-xs font-semibold text-white">
                              "{rev.title}"
                            </h5>
                          )}

                          <p className="text-xs text-zinc-300 leading-relaxed italic">
                            "{rev.content}"
                          </p>

                          <div className="flex items-center gap-2.5 pt-1.5 border-t border-zinc-800/60">
                            {rev.avatarUrl ? (
                              <img
                                src={rev.avatarUrl}
                                alt={rev.name}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center text-[10px] font-bold">
                                {rev.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-white leading-none">
                                {rev.name}
                              </p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">
                                {rev.role} {rev.company ? `• ${rev.company}` : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'write' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs text-purple-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Your testimonial will appear on our live wall once approved!</span>
                  </div>

                  <TestimonialForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleFormSubmit}
                    isSubmitting={isSubmitting}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/50 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Customer Feedback
              </span>
              <span className="font-semibold text-zinc-400">
                Powered by Panda Praise
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          review={submittedReview}
          onClose={() => setShowSuccessModal(false)}
          onResetForm={() => {
            setShowSuccessModal(false);
            setActiveTab('reviews');
          }}
          isPublicView={true}
        />
      )}
    </>
  );
};
