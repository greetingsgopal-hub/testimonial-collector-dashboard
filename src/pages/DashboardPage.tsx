import { useState, useEffect, useMemo } from 'react';
import { DashboardSidebar, DashboardTab } from '../components/dashboard/DashboardSidebar';
import { MetricsCards } from '../components/dashboard/MetricsCards';
import { ReviewFilters } from '../components/dashboard/ReviewFilters';
import { ReviewCard } from '../components/dashboard/ReviewCard';
import { ReviewTable } from '../components/dashboard/ReviewTable';
import { ReviewDetailModal } from '../components/dashboard/ReviewDetailModal';
import { SocialCardModal } from '../components/dashboard/SocialCardModal';
import { DatabaseConfigModal } from '../components/dashboard/DatabaseConfigModal';
import { CollectionConfigModal } from '../components/dashboard/CollectionConfigModal';
import { ConnectedAccountsModal } from '../components/dashboard/ConnectedAccountsModal';
import { PublishHistoryModal } from '../components/dashboard/PublishHistoryModal';
import { ImportPage } from './ImportPage';
import { WorkspaceSettings } from '../components/dashboard/WorkspaceSettings';
import { SentimentDashboard } from '../components/dashboard/SentimentDashboard';
import { WelcomeView } from '../components/dashboard/views/WelcomeView';
import { FormsView } from '../components/dashboard/views/FormsView';
import { FeedbackView } from '../components/dashboard/views/FeedbackView';
import { TagsView } from '../components/dashboard/views/TagsView';
import { RichSnippetView } from '../components/dashboard/views/RichSnippetView';
import { AnalyzeView } from '../components/dashboard/views/AnalyzeView';
import { IntegrateView } from '../components/dashboard/views/IntegrateView';
import { storage } from '../lib/storage';
import { Review, ReviewFilters as FilterType, ReviewStatus, ReviewStats, CollectionForm } from '../types';
import { exportReviewsToJSON, exportReviewsToCSV } from '../lib/exportUtils';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { EmailVerificationBanner } from '../components/auth/EmailVerificationBanner';
import { 
  Send, 
  Settings, 
  Clock, 
  Link as LinkIcon, 
  History
} from 'lucide-react';
const TAB_LABEL_MAP: Record<string, string> = {
  welcome: 'Welcome Hub',
  forms: 'Collect',
  import: 'Import',
  proof: 'Customize',
  'rich-snippet': 'Post Online',
  integrate: 'Integrations',
  settings: 'Settings',
  feedback: 'Feedback',
  tags: 'Tags',
  analyze: 'Analytics',
};

export const DashboardPage = () => {
  usePageSeo({
    title: 'Dashboard — Panda Praise',
    description: 'Panda Praise customer review management and moderation dashboard.',
  });

  const { project, collectionForm } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('proof');

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
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [socialNotification, setSocialNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentCollectionForm, setCurrentCollectionForm] = useState<CollectionForm | null>(collectionForm);
  const [copiedLink, setCopiedLink] = useState(false);
  const [publishComplete, setPublishComplete] = useState(false);
  const activeProjectId = project?.id;

  useEffect(() => {
    if (!activeProjectId) return;
    const key = `panda-praise:publish-complete:${activeProjectId}`;
    setPublishComplete(Boolean(localStorage.getItem(key)));
    const handlePublishComplete = () => setPublishComplete(true);
    window.addEventListener('panda-praise:publish-complete', handlePublishComplete);
    return () => window.removeEventListener('panda-praise:publish-complete', handlePublishComplete);
  }, [activeProjectId]);

  // Handle OAuth callback redirects in query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const socialConnected = params.get('social_connected');
    const accountName = params.get('account_name');
    const socialError = params.get('social_error');
    const requestedTab = params.get('tab');
    const fbOutcome = params.get('fb_outcome');
    const platform = params.get('platform');
    const provider = params.get('provider');
    const pathname = window.location.pathname;

    // Facebook OAuth callback parameters must be exclusively owned by IntegrateView.
    // DashboardPage must NOT consume, display, or remove Facebook fb_outcome or social_error parameters.
    const isFacebookCallback = Boolean(
      fbOutcome ||
      socialConnected === 'facebook' ||
      platform === 'facebook' ||
      provider === 'facebook' ||
      (socialError && (
        params.has('fb_outcome') ||
        (requestedTab === 'integrate' && socialError.toLowerCase().includes('facebook')) ||
        (pathname.includes('/integrate') && socialError.toLowerCase().includes('facebook'))
      ))
    );

    if (isFacebookCallback) {
      setActiveTab('integrate');
      return;
    }

    if (socialConnected || requestedTab === 'integrate' || pathname.includes('/integrate')) {
      setActiveTab('integrate');
    }

    if (socialConnected) {
      const isImportOnly = socialConnected === 'google';
      // Facebook/Instagram connections enable review/comment import only —
      // direct API publishing is not live for them (see worker providers.ts),
      // so never claim publishing is enabled for those platforms.
      const isPublishEnabled = socialConnected === 'linkedin';
      setSocialNotification({
        type: 'success',
        message: `✓ Successfully connected ${socialConnected.toUpperCase()}${accountName ? ` as ${accountName}` : ''}!${isImportOnly ? ' Your reviews will now sync automatically.' : isPublishEnabled ? ' 1-Click Social Publishing is now enabled.' : ' Your reviews and comments will now sync automatically.'}`
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (socialError) {
      if (requestedTab === 'integrate') {
        setActiveTab('integrate');
      }
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
    : `${window.location.origin}/c/feedback`;

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
      if (filters.type && filters.type !== 'all' && r.type !== filters.type) return false;
      if (filters.source && filters.source !== 'all' && r.source !== filters.source) return false;
      if (filters.formId && filters.formId !== 'all' && r.collectionFormId !== filters.formId) return false;

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

  const feedbackList = useMemo(() => {
    return reviews.filter(r => r.rating <= 3);
  }, [reviews]);

  return (
    <div className="min-h-screen flex apple-canvas text-zinc-900 font-sans selection:bg-violet-100 selection:text-violet-900">
      
      {/* ── Apple HIG Left Vertical Sidebar ── */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        proofCount={reviews.length}
      />

      {/* ── Main Content Area ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Top Slim Header Bar */}
        <header className="h-12 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-900 tracking-tight">{TAB_LABEL_MAP[activeTab] || activeTab}</span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-[240px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="truncate font-medium text-slate-600">{project?.name || 'Main Product'}</span>
            </div>
          </div>
        </header>

        {/* Firebase Email Verification Notification Gate */}
        <EmailVerificationBanner />

        {socialNotification && (
          <div className={`mx-6 mt-4 p-3 rounded-xl flex items-center justify-between text-xs font-semibold ${
            socialNotification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{socialNotification.message}</span>
            <button onClick={() => setSocialNotification(null)} className="text-gray-400 hover:text-gray-600 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Dynamic View Router */}
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          
          {/* Welcome Hub */}
          {activeTab === 'welcome' && (
            <WelcomeView
              onOpenForm={() => window.open(collectionUrl, '_blank')}
              onCollect={() => setActiveTab('forms')}
              onImport={() => setActiveTab('import')}
              onProof={() => setActiveTab('proof')}
              onOpenWall={() => window.open(`${window.location.origin}/love/${project?.slug || 'feedback'}`, '_blank')}
              onRichSnippet={() => setActiveTab('rich-snippet')}
              reviews={reviews}
              publishComplete={publishComplete}
            />
          )}

          {/* Forms Management */}
          {activeTab === 'forms' && (
            <FormsView
              onConfigureForm={() => setShowCollectionModal(true)}
              onSendInvites={handleCopyLink}
              onViewProof={() => setActiveTab('proof')}
              reviews={reviews}
              stats={stats}
            />
          )}

          {/* Import Page */}
          {activeTab === 'import' && (
            <div className="max-w-6xl mx-auto">
              <ImportPage onViewProof={() => setActiveTab('proof')} />
            </div>
          )}

          {/* Feedback Queue (Unsatisfied 1-3 star ratings) */}
          {activeTab === 'feedback' && (
            <FeedbackView
              feedbackList={feedbackList}
              onDeleteFeedback={handleDeleteReview}
            />
          )}

          {/* Tags Organizer */}
          {activeTab === 'tags' && (
            <TagsView
              tags={availableTags}
              onAddTag={(t) => handleSaveTags(reviews[0]?.id || '', [...availableTags, t])}
            />
          )}

          {/* Rich Snippet (SEO Schema) */}
          {activeTab === 'rich-snippet' && (
            <RichSnippetView reviews={reviews} />
          )}

          {/* AI Sentiment Analysis */}
          {activeTab === 'analyze' && (
            <AnalyzeView reviews={reviews} />
          )}

          {/* Integrations */}
          {activeTab === 'integrate' && (
            <IntegrateView />
          )}

          {/* Project & Workspace Settings */}
          {activeTab === 'settings' && (
            <div className="max-w-6xl mx-auto">
              <WorkspaceSettings />
            </div>
          )}

          {/* MAIN PROOF DASHBOARD VIEW */}
          {activeTab === 'proof' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              
              {/* Apple Unified Command Center */}
              <div className="apple-glass-card p-5 sm:p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                        Your Proof
                      </h1>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-700 border border-violet-500/20 shadow-2xs">
                        {reviews.length} {reviews.length === 1 ? 'Entry' : 'Entries'}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {project?.name || 'Primary Project'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-normal">
                      Collect, approve, and showcase customer testimonials.
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="apple-touch apple-btn-primary px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      title="Copy customer invitation link"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{copiedLink ? 'Link Copied!' : '+ Invite Customer'}</span>
                    </button>

                    <button
                      onClick={() => setShowCollectionModal(true)}
                      className="apple-touch apple-btn-secondary px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Configure</span>
                    </button>

                    <button
                      onClick={() => setShowHistoryModal(true)}
                      className="apple-touch apple-btn-secondary p-2 rounded-xl cursor-pointer"
                      title="Publish History"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    <button
                      onClick={() => setShowAccountsModal(true)}
                      className="apple-touch apple-btn-secondary p-2 rounded-xl text-emerald-600 cursor-pointer"
                      title="Connected Accounts"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Moderation Guidance Banner */}
              {reviews.length > 0 && stats.approvedCount === 0 && (
                <div className="apple-glass-card border-violet-500/20 bg-violet-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 tracking-tight">Your proof is waiting for approval</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Approve at least one testimonial before broadcasting it to widgets or publishing publicly.</p>
                  </div>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
                    className="apple-touch apple-btn-primary shrink-0 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Review testimonials
                  </button>
                </div>
              )}

              {/* Priority Pending Moderation Alert */}
              {stats.pendingCount > 0 && (
                <div className="apple-glass-card p-3 border-amber-400/50 bg-amber-50/80 flex items-center justify-between text-xs text-amber-900 animate-fade-in shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-medium">
                      <strong>{stats.pendingCount}</strong> testimonial{stats.pendingCount === 1 ? '' : 's'} awaiting your review.
                    </span>
                  </div>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
                    className="apple-touch px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 font-bold transition-all cursor-pointer"
                  >
                    Review Queue
                  </button>
                </div>
              )}

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
                <div className="py-20 flex flex-col items-center justify-center text-gray-500">
                  <div className="w-8 h-8 border-2 border-[#6701e6]/30 border-t-[#6701e6] rounded-full animate-spin mb-3" />
                  <p className="text-xs">Loading project testimonials...</p>
                </div>
              ) : filteredReviews.length === 0 ? null : viewMode === 'grid' ? (
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

        </main>
      </div>

      {/* ── Modals & Overlays ── */}
      <ReviewDetailModal
        review={inspectingReview}
        onClose={() => setInspectingReview(null)}
        onUpdateStatus={handleUpdateStatus}
        onToggleFeatured={handleToggleFeatured}
        onDelete={handleDeleteReview}
        onSaveTags={handleSaveTags}
        onEditReview={handleEditReview}
        onOpenSocialCard={setSocialCardReview}
      />

      {socialCardReview && (
        <SocialCardModal
          review={socialCardReview}
          onClose={() => setSocialCardReview(null)}
        />
      )}

      {showDatabaseModal && (
        <DatabaseConfigModal
          onClose={() => setShowDatabaseModal(false)}
        />
      )}

      {showCollectionModal && (
        <CollectionConfigModal
          collectionForm={currentCollectionForm}
          projectId={activeProjectId}
          projectName={project?.name}
          onClose={() => setShowCollectionModal(false)}
          onSaved={(updated: CollectionForm) => setCurrentCollectionForm(updated)}
        />
      )}

      <ConnectedAccountsModal
        isOpen={showAccountsModal}
        onClose={() => setShowAccountsModal(false)}
      />

      <PublishHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

    </div>
  );
};
export default DashboardPage;
