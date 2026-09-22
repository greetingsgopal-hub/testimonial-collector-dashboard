import { useState, useEffect, useMemo } from 'react';
import { Navbar, DashboardView } from '../components/Navbar';
import { MetricsCards } from '../components/dashboard/MetricsCards';
import { ReviewFilters } from '../components/dashboard/ReviewFilters';
import { ReviewCard } from '../components/dashboard/ReviewCard';
import { ReviewTable } from '../components/dashboard/ReviewTable';
import { ReviewDetailModal } from '../components/dashboard/ReviewDetailModal';
import { SocialCardModal } from '../components/dashboard/SocialCardModal';
import { CarouselStudioModal } from '../components/dashboard/CarouselStudioModal';
import { WidgetStudio } from '../components/dashboard/WidgetStudio';
import { DatabaseConfigModal } from '../components/dashboard/DatabaseConfigModal';
import { CollectionConfigModal } from '../components/dashboard/CollectionConfigModal';
import { ConnectedAccountsModal } from '../components/dashboard/ConnectedAccountsModal';
import { PublishHistoryModal } from '../components/dashboard/PublishHistoryModal';
import { ImportPage } from './ImportPage';
import { WorkspaceSettings } from '../components/dashboard/WorkspaceSettings';
import { SentimentDashboard } from '../components/dashboard/SentimentDashboard';
import { WelcomeCelebrationModal } from '../components/dashboard/WelcomeCelebrationModal';
import { storage } from '../lib/storage';
import { Review, ReviewFilters as FilterType, ReviewStatus, ReviewStats, CollectionForm } from '../types';
import { exportReviewsToJSON, exportReviewsToCSV } from '../lib/exportUtils';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { 
  Sparkles, 
  Send, 
  Copy, 
  ExternalLink,
  Settings,
  Clock,
  Link as LinkIcon,
  History,
  CheckCircle2,
  AlertCircle,
  X,
  Layers
} from 'lucide-react';

export const DashboardPage = () => {
  usePageSeo({
    title: 'Proof Dashboard — Panda Praise',
    description: 'Panda Praise customer review management and moderation dashboard.',
  });

  const { project, collectionForm } = useAuth();
  const [activeView, setActiveView] = useState<DashboardView>('dashboard');
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(() => {
    // Show automatically on first visit after onboarding
    return localStorage.getItem('pp_welcome_celebrated') !== 'true';
  });

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
  const [socialCardReview, setSocialCardReview] = useState<Review | null>(null);
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [socialNotification, setSocialNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentCollectionForm, setCurrentCollectionForm] = useState<CollectionForm | null>(collectionForm);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeProjectId = project?.id;

  // Handle OAuth callback redirects in query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const socialConnected = params.get('social_connected');
    const accountName = params.get('account_name');
    const socialError = params.get('social_error');

    if (socialConnected) {
      setSocialNotification({
        type: 'success',
        message: `✓ Successfully connected ${socialConnected.toUpperCase()}${accountName ? ` as ${accountName}` : ''}! 1-Click Social Publishing is now enabled.`
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (socialError) {
      setSocialNotification({
        type: 'error',
        message: `Social Connection Notice: ${socialError}`
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[#f9fafb] text-gray-900 relative font-sans">
      
      {/* Navigation Header */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        pendingCount={stats.pendingCount}
        onOpenDatabaseConfig={() => setShowDatabaseModal(true)}
        onOpenWelcomeModal={() => setShowWelcomeModal(true)}
      />

      {/* Welcoming Celebration Modal (Senja Exact) */}
      <WelcomeCelebrationModal
        isOpen={showWelcomeModal}
        onClose={() => {
          localStorage.setItem('pp_welcome_celebrated', 'true');
          setShowWelcomeModal(false);
        }}
        onOpenWidgetStudio={() => setActiveView('widgets')}
        onOpenImport={() => setActiveView('import')}
        onOpenSocialStudio={() => setShowCarouselModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-6">
        
        {/* Clean Senja Proof Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold font-display text-gray-950 tracking-tight">
                Your Proof
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                {reviews.length}
              </span>
              <span className="hidden sm:inline text-xs text-gray-400 font-medium">
                • {project?.name || 'Primary Project'}
              </span>
            </div>
            
            {/* Quick Share collection link chip */}
            <div className="flex items-center gap-2 mt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 font-mono">
                <LinkIcon className="w-3 h-3 text-[#6701e6]" />
                <span className="truncate max-w-[220px] sm:max-w-[320px]">{collectionUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="ml-1 text-[#6701e6] hover:text-[#5200bd] font-sans font-bold cursor-pointer"
                  title="Copy link"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <a
                href={collectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Open collection form"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Invite a Customer CTA */}
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.01]"
              title="Copy customer invitation link"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : '+ Invite a customer'}</span>
            </button>

            {/* Social Studio */}
            <button
              id="dashboard-carousel-studio-btn"
              onClick={() => setShowCarouselModal(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open Social Carousel Studio"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Studio</span>
            </button>

            {/* Configure Form */}
            <button
              onClick={() => setShowCollectionModal(true)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Configure collection form settings"
            >
              <Settings className="w-3.5 h-3.5 text-gray-500" />
              <span>Configure Form</span>
            </button>

            {/* History */}
            <button
              id="dashboard-publish-history-btn"
              onClick={() => setShowHistoryModal(true)}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer shadow-xs"
              title="Social Publishing Audit History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Connected Accounts */}
            <button
              id="dashboard-connected-accounts-btn"
              onClick={() => setShowAccountsModal(true)}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer shadow-xs"
              title="Connected Social Accounts"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Topic Chips (Screenshot media_1790044572034.png Exact) */}
        <div className="flex flex-wrap items-center gap-2 py-0.5">
          <span className="text-xs font-semibold text-gray-500 mr-1">Your customers talk about:</span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, search: 'scheduling' }))}
            className="px-3 py-1 rounded-full bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 text-xs font-medium text-gray-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Ease of scheduling</span>
            <span className="text-xs font-bold text-gray-900">42</span>
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, search: 'time saved' }))}
            className="px-3 py-1 rounded-full bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 text-xs font-medium text-gray-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Time saved</span>
            <span className="text-xs font-bold text-gray-900">38</span>
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, search: 'support' }))}
            className="px-3 py-1 rounded-full bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 text-xs font-medium text-gray-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Customer support</span>
            <span className="text-xs font-bold text-gray-900">29</span>
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, search: 'onboarding' }))}
            className="px-3 py-1 rounded-full bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 text-xs font-medium text-gray-700 shadow-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Onboarding</span>
            <span className="text-xs font-bold text-gray-900">21</span>
          </button>
        </div>

        {/* Social Connection Feedback Notification */}
        {socialNotification && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-fade-in ${
              socialNotification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {socialNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{socialNotification.message}</span>
            </div>
            <button
              onClick={() => setSocialNotification(null)}
              className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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

            {/* AI Sentiment Analysis */}
            {reviews.length > 0 && (
              <SentimentDashboard reviews={reviews} />
            )}

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
              <div className="py-16 bg-white rounded-2xl border border-gray-200 shadow-xs text-center p-8 space-y-4 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6701e6] flex items-center justify-center mx-auto border border-purple-100">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold font-display text-gray-950">No Testimonials Yet</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Share your public collection form link with customers to collect feedback, or load sample reviews to test your widgets.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleCopyLink}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Form Link</span>
                  </button>

                  {/* Only show seed button in demo/local mode — not in Firebase production */}
                  {storage.resetToSampleData && (
                    <button
                      onClick={handleSeedDemoData}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
                    onOpenSocialCard={setSocialCardReview}
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
                onOpenSocialCard={setSocialCardReview}
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

        {/* VIEW 3: IMPORT HUB */}
        {activeView === 'import' && (
          <div className="animate-fade-in">
            <ImportPage />
          </div>
        )}

        {/* VIEW 4: WORKSPACE SETTINGS */}
        {activeView === 'settings' && (
          <div className="animate-fade-in">
            <WorkspaceSettings />
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
          onOpenSocialCard={(rev) => {
            setSocialCardReview(rev);
          }}
        />
      )}

      {/* Social Media Card Generator Modal */}
      {socialCardReview && (
        <SocialCardModal
          review={socialCardReview}
          projectName={project?.name || 'Panda Praise'}
          onClose={() => setSocialCardReview(null)}
        />
      )}

      {/* Multi-Review Social Carousel Studio Modal */}
      {showCarouselModal && (
        <CarouselStudioModal
          approvedReviews={reviews.filter((r) => r.status === 'approved')}
          projectName={project?.name || 'Panda Praise'}
          websiteUrl={project?.websiteUrl || 'pandapraise.dev'}
          onClose={() => setShowCarouselModal(false)}
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

      {/* Connected Social Accounts Modal */}
      {showAccountsModal && (
        <ConnectedAccountsModal
          isOpen={showAccountsModal}
          onClose={() => setShowAccountsModal(false)}
        />
      )}

      {/* Social Publishing Audit History Modal */}
      {showHistoryModal && (
        <PublishHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};
