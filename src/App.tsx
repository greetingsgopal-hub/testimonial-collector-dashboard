import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TestimonialForm } from './components/collector/TestimonialForm';
import { LivePreviewCard } from './components/collector/LivePreviewCard';
import { SuccessModal } from './components/collector/SuccessModal';
import { MetricsCards } from './components/dashboard/MetricsCards';
import { ReviewFilters } from './components/dashboard/ReviewFilters';
import { ReviewCard } from './components/dashboard/ReviewCard';
import { ReviewTable } from './components/dashboard/ReviewTable';
import { ReviewDetailModal } from './components/dashboard/ReviewDetailModal';
import { WidgetStudio } from './components/dashboard/WidgetStudio';
import { DatabaseConfigModal } from './components/dashboard/DatabaseConfigModal';
import { storage } from './lib/storage';
import { Review, ReviewInput, ReviewFilters as FilterType, ReviewStatus, ReviewStats } from './types';
import { exportReviewsToJSON, exportReviewsToCSV } from './lib/exportUtils';
import { Sparkles, MessageSquareHeart, ShieldCheck } from 'lucide-react';

const INITIAL_FORM_STATE: ReviewInput = {
  name: '',
  email: '',
  role: '',
  company: '',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  rating: 5,
  title: '',
  content: '',
  type: 'text',
  tags: ['SaaS', 'UI/UX'],
  consent: true,
};

export function App() {
  const [activeView, setActiveView] = useState<'collector' | 'dashboard' | 'widgets'>('dashboard');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    total: 0,
    averageRating: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    archivedCount: 0,
    featuredCount: 0,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Collector Form State
  const [formData, setFormData] = useState<ReviewInput>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterType>({
    search: '',
    status: 'all',
    rating: 'all',
    tag: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals State
  const [inspectingReview, setInspectingReview] = useState<Review | null>(null);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);

  // Load reviews on mount
  const refreshReviews = async () => {
    try {
      setIsLoading(true);
      const [fetchedReviews, fetchedStats] = await Promise.all([
        storage.getReviews(),
        storage.getStats(),
      ]);
      setReviews(fetchedReviews);
      setStats(fetchedStats);
    } catch (e) {
      console.error('Failed to load reviews from storage adapter:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshReviews();
  }, []);

  // Compute available tags from all reviews
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    reviews.forEach(r => r.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [reviews]);

  // Form submission handler
  const handleFormSubmit = async (data: ReviewInput) => {
    setIsSubmitting(true);
    try {
      const created = await storage.createReview(data);
      setSubmittedReview(created);
      await refreshReviews();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Moderation handlers
  const handleUpdateStatus = async (id: string, status: ReviewStatus) => {
    await storage.updateReview(id, { status });
    await refreshReviews();
    if (inspectingReview && inspectingReview.id === id) {
      setInspectingReview(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    await storage.updateReview(id, { isFeatured: !current });
    await refreshReviews();
    if (inspectingReview && inspectingReview.id === id) {
      setInspectingReview(prev => prev ? { ...prev, isFeatured: !current } : null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    await storage.deleteReview(id);
    await refreshReviews();
    if (inspectingReview && inspectingReview.id === id) {
      setInspectingReview(null);
    }
  };

  const handleSaveTags = async (id: string, tags: string[]) => {
    await storage.updateReview(id, { tags });
    await refreshReviews();
  };

  const handleResetSeedData = async () => {
    if (storage.resetToSampleData) {
      await storage.resetToSampleData();
      await refreshReviews();
    }
  };

  // Filtered & Sorted reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Status filter
      if (filters.status !== 'all' && r.status !== filters.status) return false;

      // Rating filter
      if (filters.rating !== 'all' && r.rating !== filters.rating) return false;

      // Tag filter
      if (filters.tag !== 'all' && (!r.tags || !r.tags.includes(filters.tag))) return false;

      // Search filter (name, email, company, content, title)
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCompany = r.company?.toLowerCase().includes(q);
        const matchesContent = r.content.toLowerCase().includes(q);
        const matchesTitle = r.title?.toLowerCase().includes(q);
        const matchesRole = r.role.toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesContent && !matchesTitle && !matchesRole) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'createdAt') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return filters.sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
      if (filters.sortBy === 'rating') {
        return filters.sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
      }
      if (filters.sortBy === 'name') {
        return filters.sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [reviews, filters]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 relative">
      
      {/* Background ambient ambient lighting */}
      <div className="ambient-glow" />

      {/* Top Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        pendingCount={stats.pendingCount}
        onOpenDatabaseConfig={() => setShowDatabaseModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* VIEW 1: COLLECTOR MODE (Dual panel Form & Live Preview) */}
        {activeView === 'collector' && (
          <div className="space-y-8 animate-fade-in">
            {/* Collector Banner */}
            <div className="text-center max-w-2xl mx-auto mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-semibold mb-3 border border-brand-500/20">
                <MessageSquareHeart className="w-3.5 h-3.5" />
                <span>Public Testimonial Collector</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
                Turn Happy Customers Into Unstoppable Social Proof
              </h1>
              <p className="text-sm sm:text-base text-zinc-400 mt-2">
                This responsive collection form can be shared directly with your customers or embedded anywhere on your site.
              </p>
            </div>

            {/* Split View: Form & Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Input Form */}
              <div className="lg:col-span-7">
                <TestimonialForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleFormSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>

              {/* Right: Real-time Live Preview Card */}
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <LivePreviewCard data={formData} />

                {/* Helpful tips panel */}
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                  <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-400" />
                    How It Works
                  </div>
                  <p className="leading-relaxed">
                    Once submitted, new reviews enter the <strong>Pending</strong> moderation queue in your Dashboard. You can approve, feature, or edit them before they go live on your widgets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DASHBOARD MODE (KPIs, Filters, Review Cards / Table) */}
        {activeView === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Top KPIs & Distribution Bar */}
            <MetricsCards
              stats={stats}
              onFilterByStatus={(status) => setFilters(prev => ({ ...prev, status }))}
              onFilterByRating={(rating) => setFilters(prev => ({ ...prev, rating }))}
            />

            {/* Search, Filters, and Actions */}
            <ReviewFilters
              filters={filters}
              setFilters={setFilters}
              stats={stats}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onExportJSON={() => exportReviewsToJSON(reviews)}
              onExportCSV={() => exportReviewsToCSV(reviews)}
              onResetSeedData={handleResetSeedData}
              availableTags={availableTags}
            />

            {/* Content List: Grid or Table */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-3" />
                <p className="text-xs">Loading testimonials from storage...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-20 glass-panel rounded-2xl border border-white/10 text-center p-8 space-y-3">
                <Sparkles className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="text-base font-semibold text-white">No reviews found</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Try adjusting your search criteria, reset status filters, or submit a new review using the Collector Form.
                </p>
                <button
                  onClick={() => setFilters({
                    search: '',
                    status: 'all',
                    rating: 'all',
                    tag: 'all',
                    sortBy: 'createdAt',
                    sortOrder: 'desc',
                  })}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onUpdateStatus={handleUpdateStatus}
                    onToggleFeatured={handleToggleFeatured}
                    onDelete={handleDeleteReview}
                    onOpenDetails={(rev) => setInspectingReview(rev)}
                  />
                ))}
              </div>
            ) : (
              <ReviewTable
                reviews={filteredReviews}
                onUpdateStatus={handleUpdateStatus}
                onToggleFeatured={handleToggleFeatured}
                onDelete={handleDeleteReview}
                onOpenDetails={(rev) => setInspectingReview(rev)}
              />
            )}
          </div>
        )}

        {/* VIEW 3: WIDGET STUDIO */}
        {activeView === 'widgets' && (
          <div className="animate-fade-in">
            <WidgetStudio reviews={reviews} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800/80 glass-panel mt-16 py-6 text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-zinc-300">ReviewVault</span>
            <span>•</span>
            <span>Architected on <a href="https://github.com/reviews-kits-team/reviews-kits" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">reviews-kits</a></span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDatabaseModal(true)}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Database Setup
            </button>
            <a
              href="https://docs.netlify.com/get-started/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors"
            >
              Netlify Guide
            </a>
            <a
              href="https://github.com/reviews-kits-team/reviews-kits"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Submission Success Modal with Confetti */}
      {submittedReview && (
        <SuccessModal
          review={submittedReview}
          onClose={() => setSubmittedReview(null)}
          onGoToDashboard={() => {
            setSubmittedReview(null);
            setActiveView('dashboard');
          }}
          onResetForm={() => setFormData(INITIAL_FORM_STATE)}
        />
      )}

      {/* Review Inspector & Detail Modal */}
      {inspectingReview && (
        <ReviewDetailModal
          review={inspectingReview}
          onClose={() => setInspectingReview(null)}
          onUpdateStatus={handleUpdateStatus}
          onToggleFeatured={handleToggleFeatured}
          onDelete={handleDeleteReview}
          onSaveTags={handleSaveTags}
        />
      )}

      {/* Database Setup & Netlify Deploy Guide Modal */}
      {showDatabaseModal && (
        <DatabaseConfigModal onClose={() => setShowDatabaseModal(false)} />
      )}
    </div>
  );
}

export default App;
