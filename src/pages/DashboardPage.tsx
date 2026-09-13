import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '../components/Navbar';
import { MetricsCards } from '../components/dashboard/MetricsCards';
import { ReviewFilters } from '../components/dashboard/ReviewFilters';
import { ReviewCard } from '../components/dashboard/ReviewCard';
import { ReviewTable } from '../components/dashboard/ReviewTable';
import { ReviewDetailModal } from '../components/dashboard/ReviewDetailModal';
import { WidgetStudio } from '../components/dashboard/WidgetStudio';
import { DatabaseConfigModal } from '../components/dashboard/DatabaseConfigModal';
import { CollectionConfigModal } from '../components/dashboard/CollectionConfigModal';
import { storage } from '../lib/storage';
import { Review, ReviewFilters as FilterType, ReviewStatus, ReviewStats, CollectionForm } from '../types';
import { exportReviewsToJSON, exportReviewsToCSV } from '../lib/exportUtils';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  ExternalLink,
  Settings,
  Clock
} from 'lucide-react';

export const DashboardPage = () => {
  usePageSeo({
    title: 'Dashboard — ReviewVault',
    description: 'ReviewVault customer review management and moderation dashboard.',
  });

  const { project, collectionForm } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'widgets'>('dashboard');

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

  // Modals
  const [inspectingReview, setInspectingReview] = useState<Review | null>(null);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [currentCollectionForm, setCurrentCollectionForm] = useState<CollectionForm | null>(collectionForm);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeProjectId = project?.id;

  // Load collection form for project if not already provided
  useEffect(() => {
    if (collectionForm) {
      setCurrentCollectionForm(collectionForm);
    } else if (activeProjectId) {
      storage.getCollectionForm(activeProjectId).then(form => {
        if (form) setCurrentCollectionForm(form);
      });
    }
  }, [collectionForm, activeProjectId]);

  const refreshReviews = async () => {
    try {
      setIsLoading(true);
      const [fetchedReviews, fetchedStats] = await Promise.all([
        storage.getReviews(activeProjectId),
        storage.getStats(activeProjectId),
      ]);
      setReviews(fetchedReviews);
      setStats(fetchedStats);
    } catch (e) {
      console.error('[Dashboard] Failed to fetch project reviews:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshReviews();
  }, [activeProjectId]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    reviews.forEach(r => r.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [reviews]);

  // Moderation handlers
  const handleUpdateStatus = async (id: string, status: ReviewStatus) => {
    const updates: Partial<Review> = { status, projectId: activeProjectId };
    // Rule: if non-approved, un-feature
    if (status !== 'approved') {
      updates.isFeatured = false;
    }
    await storage.updateReview(id, updates);
    await refreshReviews();
    if (inspectingReview && inspectingReview.id === id) {
      setInspectingReview(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    const rev = reviews.find(r => r.id === id);
    if (!rev) return;

    // Rule: Pending or Rejected reviews cannot be marked as featured
    if (!current && rev.status !== 'approved') {
      alert('Only approved testimonials can be marked as featured. Please approve this testimonial first.');
      return;
    }

    await storage.updateReview(id, { isFeatured: !current, projectId: activeProjectId });
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

  const handleEditReview = async (id: string, updates: Partial<Review>) => {
    const updated = await storage.updateReview(id, { ...updates, projectId: activeProjectId });
    await refreshReviews();
    if (inspectingReview && inspectingReview.id === id) {
      setInspectingReview(updated);
    }
  };

  const handleSaveTags = async (id: string, tags: string[]) => {
    await storage.updateReview(id, { tags, projectId: activeProjectId });
    await refreshReviews();
  };

  const handleSeedDemoData = async () => {
    if (storage.resetToSampleData) {
      await storage.resetToSampleData(activeProjectId);
      await refreshReviews();
    }
  };

  const collectionUrl = currentCollectionForm
    ? `${window.location.origin}/c/${currentCollectionForm.publicSlug}`
    : `${window.location.origin}/c/pulse-feedback`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(collectionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filtered & Sorted reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (filters.rating !== 'all' && r.rating !== filters.rating) return false;
      if (filters.tag !== 'all' && (!r.tags || !r.tags.includes(filters.tag))) return false;

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
      <div className="ambient-glow" />

      {/* Navigation Header */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        pendingCount={stats.pendingCount}
        onOpenDatabaseConfig={() => setShowDatabaseModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6">
        
        {/* Tenant Project Action Banner */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display text-white">
                {project?.name || 'Primary Project'}
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                slug: {project?.slug || 'pulse-ai'}
              </span>
              {currentCollectionForm && !currentCollectionForm.isActive && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400">
                  Form Closed
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Testimonials collected from your public form automatically route to this project moderation queue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Configure Collection Form */}
            <button
              onClick={() => setShowCollectionModal(true)}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Configure collection form title, slug, and status"
            >
              <Settings className="w-3.5 h-3.5 text-brand-400" />
              <span>Configure Form</span>
            </button>

            <div className="flex items-center gap-2 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl flex-1 md:flex-initial">
              <span className="text-xs font-mono text-zinc-400 px-2 truncate max-w-[200px]">
                {collectionUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                title="Copy public link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <a
              href={collectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title="Open public form"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Priority Pending Moderation Alert */}
        {stats.pendingCount > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 animate-fade-in">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>
                <strong>{stats.pendingCount}</strong> customer testimonial(s) awaiting moderation in this project.
              </span>
            </div>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold transition-colors"
            >
              Filter Pending Queue
            </button>
          </div>
        )}

        {/* VIEW 1: REVIEWS MODERATION */}
        {activeView === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top KPIs & Distribution */}
            <MetricsCards
              stats={stats}
              onFilterByStatus={(status) => setFilters(prev => ({ ...prev, status }))}
              onFilterByRating={(rating) => setFilters(prev => ({ ...prev, rating }))}
            />

            {/* Filters, View Switcher & Export */}
            <ReviewFilters
              filters={filters}
              setFilters={setFilters}
              stats={stats}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onExportJSON={() => exportReviewsToJSON(reviews)}
              onExportCSV={() => exportReviewsToCSV(reviews)}
              onResetSeedData={handleSeedDemoData}
              availableTags={availableTags}
            />

            {/* Content Display */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-3" />
                <p className="text-xs">Loading project testimonials...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-16 glass-panel rounded-2xl border border-white/10 text-center p-8 space-y-4 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-white">No Testimonials Yet</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Share your public collection form link with customers to collect feedback, or load sample reviews to test your widgets.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Form Link</span>
                  </button>

                  {/* Only show seed button in demo/local mode — not in Firebase production */}
                  {storage.resetToSampleData && (
                    <button
                      onClick={handleSeedDemoData}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Load 6 Demo Reviews</span>
                    </button>
                  )}
                </div>
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

        {/* VIEW 2: EMBED WIDGET STUDIO */}
        {activeView === 'widgets' && (
          <div className="animate-fade-in">
            <WidgetStudio reviews={reviews} />
          </div>
        )}
      </main>

      {/* Review Inspector Modal */}
      {inspectingReview && (
        <ReviewDetailModal
          review={inspectingReview}
          onClose={() => setInspectingReview(null)}
          onUpdateStatus={handleUpdateStatus}
          onToggleFeatured={handleToggleFeatured}
          onDelete={handleDeleteReview}
          onSaveTags={handleSaveTags}
          onEditReview={handleEditReview}
        />
      )}

      {/* Collection Form Config Modal */}
      {showCollectionModal && (
        <CollectionConfigModal
          collectionForm={currentCollectionForm}
          projectId={activeProjectId}
          onClose={() => setShowCollectionModal(false)}
          onSaved={(updated) => {
            setCurrentCollectionForm(updated);
          }}
        />
      )}

      {/* Database Config Modal */}
      {showDatabaseModal && (
        <DatabaseConfigModal onClose={() => setShowDatabaseModal(false)} />
      )}
    </div>
  );
};
