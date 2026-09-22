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
  Check, 
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
        
        {/* Welcoming Celebration Banner */}
        <div className="bg-gradient-to-r from-[#6701e6] via-[#7c3aed] to-[#ec4899] rounded-2xl p-4 sm:p-5 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 text-xl shadow-xs">
              🎉
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-snug">
                Welcome to Panda Praise!
              </h3>
              <p className="text-xs text-white/90 mt-0.5">
                Your testimonial engine is ready. Follow the 5 quickstart steps to collect and share social proof.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowWelcomeModal(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-[#6701e6] font-extrabold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Open 5-Step Guide →
          </button>
        </div>

        {/* Tenant Project Action Banner */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold font-display text-gray-950">
                {project?.name || 'Primary Project'}
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-600">
                slug: {project?.slug || 'pulse-ai'}
              </span>
              {currentCollectionForm && !currentCollectionForm.isActive && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-600">
                  Form Closed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Testimonials collected from your public form automatically route to this project moderation queue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Social Carousel Studio (Canva-grade multi-review) */}
            <button
              id="dashboard-carousel-studio-btn"
              onClick={() => setShowCarouselModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
              title="Create multi-review social carousel for LinkedIn & Instagram"
            >
              <Layers className="w-3.5 h-3.5 text-white" />
              <span>Social Carousel Studio</span>
            </button>

            {/* Configure Collection Form */}
            <button
              onClick={() => setShowCollectionModal(true)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Configure collection form title, slug, and status"
            >
              <Settings className="w-3.5 h-3.5 text-[#6701e6]" />
              <span>Configure Form</span>
            </button>

            {/* Connected Social Accounts */}
            <button
              id="dashboard-connected-accounts-btn"
              onClick={() => setShowAccountsModal(true)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Manage connected social accounts (LinkedIn, X, etc.)"
            >
              <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Social Accounts</span>
            </button>

            {/* Publishing Audit History */}
            <button
              id="dashboard-publish-history-btn"
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="View social publishing audit history"
            >
              <History className="w-3.5 h-3.5 text-sky-600" />
              <span>History</span>
            </button>

            <div className="flex items-center gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl flex-1 md:flex-initial">
              <span className="text-xs font-mono text-gray-600 px-2 truncate max-w-[200px]">
                {collectionUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-[#6701e6] hover:bg-[#5200bd] text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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
              className="p-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors shadow-xs"
              title="Open public form"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
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
