import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { SentimentDashboard } from '../components/dashboard/SentimentDashboard';
import { WelcomeView } from '../components/dashboard/views/WelcomeView';
import { FormsView } from '../components/dashboard/views/FormsView';
import { ImportPage } from './ImportPage';
import { SocialPostView } from '../components/dashboard/views/SocialPostView';
import { FeedbackView } from '../components/dashboard/views/FeedbackView';
import { AnalyzeView } from '../components/dashboard/views/AnalyzeView';
import { AccountBillingView } from '../components/dashboard/views/AccountBillingView';
import { IntegrateView } from '../components/dashboard/views/IntegrateView';
import { TagsView } from '../components/dashboard/views/TagsView';
import { CampaignsHub } from '../components/dashboard/CampaignsHub';
import { ReviewPipelineHero } from '../components/dashboard/ReviewPipelineHero';
import { storage } from '../lib/storage';
import { Review, ReviewFilters as FilterType, ReviewStatus, ReviewStats, CollectionForm } from '../types';
import { exportReviewsToJSON, exportReviewsToCSV } from '../lib/exportUtils';
import { getSampleReviews, isSampleDataCleared, setSampleDataCleared } from '../lib/mockData';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { EmailVerificationBanner } from '../components/auth/EmailVerificationBanner';
import { PlanLimitBanner } from '../components/dashboard/PlanLimitBanner';
import { UpgradeModal } from '../components/dashboard/UpgradeModal';
import { ReferralHub } from '../components/dashboard/ReferralHub';
import { 
  Check,
  X,
  Trash2,
  Archive,
MailCheck,
Menu,
Sparkles
} from 'lucide-react';
const TAB_LABEL_MAP: Record<string, string> = {
  welcome: 'Welcome Hub',
  forms: 'Forms',
  import: 'Import',
  proof: 'Proof',
  widgets: 'Embeds',
  social: 'Post on internet',
  campaigns: 'Thank Yous',
  integrate: 'Billing & Plans',
  settings: 'Billing & Plans',
  feedback: 'Feedback',
  tags: 'Tags',
  analyze: 'Analytics',
  referral: 'Referral Program (Give 1M / Get 1M)',
};

export const DashboardPage = () => {
  usePageSeo({
    title: 'Dashboard — Panda Praise',
    description: 'Panda Praise customer review management and moderation dashboard.',
  });

  const { project, collectionForm, workspace } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTabState] = useState<DashboardTab>(() => {
    const paramTab = searchParams.get('tab') as DashboardTab;
    if (paramTab) return paramTab;
    const windowTab = new URLSearchParams(window.location.search).get('tab') as DashboardTab;
    if (windowTab) return windowTab;
    return 'welcome';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setActiveTab = useCallback((tab: DashboardTab) => {
    setActiveTabState(tab);
    setSidebarOpen(false);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

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

  const impersonatedWorkspace = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('impersonated_workspace');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Modals
  const [inspectingReview, setInspectingReview] = useState<Review | null>(null);
  const [socialCardReview, setSocialCardReview] = useState<Review | null>(null);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [socialNotification, setSocialNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentCollectionForm, setCurrentCollectionForm] = useState<CollectionForm | null>(collectionForm);
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

  // Sample Data Activation for Brand New Accounts (0 real reviews)
  const [sampleDataCleared, setSampleDataClearedState] = useState(() =>
    isSampleDataCleared(activeProjectId)
  );

  useEffect(() => {
    setSampleDataClearedState(isSampleDataCleared(activeProjectId));
  }, [activeProjectId]);

  const handleClearSampleData = useCallback(() => {
    if (activeProjectId) {
      setSampleDataCleared(activeProjectId, true);
      setSampleDataClearedState(true);
    }
  }, [activeProjectId]);

  const isViewingSampleData = reviews.length === 0 && !sampleDataCleared;
  const sampleReviews = useMemo(
    () => (isViewingSampleData ? getSampleReviews(activeProjectId) : []),
    [isViewingSampleData, activeProjectId]
  );
  const effectiveReviews = isViewingSampleData ? sampleReviews : reviews;

  const effectiveStats = useMemo(() => {
    if (isViewingSampleData) {
      return {
        total: sampleReviews.length,
        averageRating: 5.0,
        approvedCount: sampleReviews.length,
        pendingCount: 0,
        rejectedCount: 0,
        archivedCount: 0,
        featuredCount: sampleReviews.filter((r) => r.isFeatured).length,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: sampleReviews.length },
      };
    }
    return stats;
  }, [isViewingSampleData, sampleReviews, stats]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    effectiveReviews.forEach(r => r.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [effectiveReviews]);

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
    setSocialNotification({
      type: 'success',
      message: 'Direct intake review invite link copied to clipboard!',
    });
  };

  // Filtered & Sorted reviews
  const filteredReviews = useMemo(() => {
    return effectiveReviews.filter(r => {
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
  }, [effectiveReviews, filters]);

  // Bulk Selection for fast one-click moderation
  const [selectedReviewIds, setSelectedReviewIds] = useState<Set<string>>(new Set());

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedReviewIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedReviewIds.size === filteredReviews.length && filteredReviews.length > 0) {
      setSelectedReviewIds(new Set());
    } else {
      setSelectedReviewIds(new Set(filteredReviews.map(r => r.id)));
    }
  }, [selectedReviewIds, filteredReviews]);

  const handleBulkApprove = async () => {
    const ids = Array.from(selectedReviewIds);
    await Promise.all(ids.map(id => storage.updateReview(id, { status: 'approved', projectId: activeProjectId })));
    setSelectedReviewIds(new Set());
    await refreshReviews();
  };

  const handleBulkReject = async () => {
    const ids = Array.from(selectedReviewIds);
    await Promise.all(ids.map(id => storage.updateReview(id, { status: 'rejected', isFeatured: false, projectId: activeProjectId })));
    setSelectedReviewIds(new Set());
    await refreshReviews();
  };

  const handleBulkArchive = async () => {
    const ids = Array.from(selectedReviewIds);
    await Promise.all(ids.map(id => storage.updateReview(id, { status: 'archived', isFeatured: false, projectId: activeProjectId })));
    setSelectedReviewIds(new Set());
    await refreshReviews();
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedReviewIds);
    await Promise.all(ids.map(id => storage.deleteReview(id)));
    setSelectedReviewIds(new Set());
    await refreshReviews();
  };

  const feedbackList = useMemo(() => {
    return effectiveReviews.filter(r => r.rating <= 3);
  }, [effectiveReviews]);

  const handleUpdateCollectionForm = async (updates: Partial<CollectionForm>) => {
    try {
      const targetForm = currentCollectionForm || (activeProjectId ? await storage.getCollectionForm(activeProjectId) : null);
      if (targetForm) {
        const updated = await storage.updateCollectionForm(targetForm.id, updates);
        setCurrentCollectionForm(updated);
      }
    } catch (err) {
      console.error('Failed to update collection form:', err);
    }
  };

  return (
    <div className="min-h-screen flex apple-canvas text-zinc-900 font-sans selection:bg-violet-100 selection:text-violet-900">
      
      {/* ── Apple HIG Left Vertical Sidebar ── */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        proofCount={effectiveReviews.length}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Superadmin Impersonation Banner */}
        {impersonatedWorkspace && (
          <div className="bg-purple-950 text-purple-200 border-b border-purple-800 px-6 py-2.5 flex items-center justify-between text-xs z-30 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Superadmin Mode: Viewing workspace <strong>{impersonatedWorkspace.name}</strong> ({impersonatedWorkspace.id})
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('impersonated_workspace');
                window.location.href = '/admin';
              }}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Exit Impersonation
            </button>
          </div>
        )}

        {/* Top Browser Header Bar with macOS Controls & URL Pill (Stitch Design) */}
        <header className="h-12 border-b border-slate-200/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-5 flex items-center justify-between sticky top-0 z-20 select-none">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="lg:hidden p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-2xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-2xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-2xs" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{TAB_LABEL_MAP[activeTab] || activeTab}</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-[200px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="truncate font-medium text-slate-600 dark:text-slate-400">{project?.name || 'Main Product'}</span>
              </div>
            </div>
          </div>

          {/* Centered URL Pill matching Stitch screenshot */}
          <div className="hidden md:flex items-center justify-center">
            <div className="bg-white/95 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-normal py-1 px-4 rounded-md shadow-2xs flex items-center gap-2 max-w-sm">
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span className="truncate tracking-wide text-slate-600 dark:text-slate-300">app.pandapraise.com/{activeTab}</span>
            </div>
          </div>
        </header>

        {/* Firebase Email Verification Notification Gate */}
        <EmailVerificationBanner />

        {/* Free Plan Limits & Upgrade Funnel */}
        <PlanLimitBanner
          workspace={workspace}
          testimonialCount={effectiveReviews.length}
          onUpgrade={() => setShowUpgradeModal(true)}
        />

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
              onWidgets={() => setActiveTab('social')}
              reviews={effectiveReviews}
              publishComplete={publishComplete}
              isViewingSampleData={isViewingSampleData}
              onClearSampleData={handleClearSampleData}
            />
          )}

          {/* Forms View (Dedicated to review collection forms, form studio & templates) */}
          {activeTab === 'forms' && (
            <FormsView
              onConfigureForm={() => setShowCollectionModal(true)}
              onSendInvites={handleCopyLink}
              onViewProof={() => setActiveTab('proof')}
              onNavigateToCampaigns={() => setActiveTab('campaigns')}
              onNavigateToWidgets={() => setActiveTab('social')}
              onUpdateForm={handleUpdateCollectionForm}
              reviews={effectiveReviews}
              stats={effectiveStats}
            />
          )}

          {/* Import Section (Collection form completely removed, dedicated strictly to importing praise) */}
          {activeTab === 'import' && (
            <div className="max-w-5xl mx-auto font-sans animate-fade-in">
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
              onAddTag={(t: string) => handleSaveTags(reviews[0]?.id || '', [...availableTags, t])}
            />
          )}

          {/* AI Sentiment Analysis */}
          {activeTab === 'analyze' && (
            <AnalyzeView reviews={effectiveReviews} />
          )}

          {/* In-App Referral Hub ("Give 1 Month / Get 1 Month") */}
          {activeTab === 'referral' && (
            <div className="max-w-6xl mx-auto">
              <ReferralHub workspace={workspace} />
            </div>
          )}

          {/* Social integrations */}
          {activeTab === 'integrate' && (
            <div className="max-w-6xl mx-auto font-sans">
              <IntegrateView />
            </div>
          )}

          {/* Accounts & Billing Management */}
          {activeTab === 'settings' && (
            <div className="max-w-6xl mx-auto font-sans">
              <AccountBillingView
                workspace={workspace}
                onUpgrade={() => setShowUpgradeModal(true)}
              />
            </div>
          )}

          {/* Post on internet (Social Broadcast & Studio) */}
          {(activeTab === 'social' || activeTab === 'widgets') && (
            <div className="max-w-5xl mx-auto font-sans">
              <SocialPostView
                reviews={effectiveReviews}
                workspaceId={impersonatedWorkspace?.id || workspace?.id || project?.id}
                workspaceName={impersonatedWorkspace?.name || workspace?.name || project?.name}
                onOpenAccountsModal={() => setShowAccountsModal(true)}
              />
            </div>
          )}

          {/* Automated Review Request Drip Campaigns (Stage 5) */}
          {activeTab === 'campaigns' && (
            <div className="max-w-5xl mx-auto font-sans">
              <CampaignsHub onNavigateToProof={() => setActiveTab('proof')} />
            </div>
          )}

          {/* MAIN MODERATION QUEUE & PROOF DASHBOARD VIEW */}
          {activeTab === 'proof' && (
            <div className="space-y-6 max-w-5xl mx-auto font-sans">
              
              {/* Stitch Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Your Proof</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {effectiveReviews.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all shadow-2xs gap-1.5 cursor-pointer"
                >
                  <span className="text-base leading-none text-slate-500">+</span>
                  <span>Invite customer</span>
                </button>
              </div>

              {/* Praise Attributes & Quick Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span className="text-slate-500 font-normal mr-1">Customers praise:</span>
                {[
                  { label: 'Ease of use', count: 42 },
                  { label: 'Time saved', count: 38 },
                  { label: 'Support', count: 29 },
                ].map((item) => {
                  const isActive = filters.tag === item.label;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, tag: isActive ? 'all' : item.label }))}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                        isActive
                          ? 'border-purple-400 bg-purple-50 text-purple-900 ring-2 ring-purple-300 font-semibold dark:bg-purple-950/50 dark:text-purple-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Highlighted AI Case Study Card (Stitch Design) */}
              <div className="p-4 sm:p-5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-[#fbf9fe] dark:bg-purple-950/20 hover:border-purple-300 transition-colors">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                  How Hartley Plumbing cut missed jobs to zero in one month
                </h3>
                <p className="mt-1 text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Case study generated with Panda Praise AI · 1 metric</span>
                </p>
              </div>

              {/* Luminous Review Pipeline Hero & Command Center */}
              <ReviewPipelineHero
                stats={effectiveStats}
                reviews={effectiveReviews}
                projectName={project?.name}
                isBatchActive={selectedReviewIds.size > 0}
                onBatchToggle={handleSelectAll}
                onInspectSentiment={() => {
                  const sentimentElem = document.getElementById('sentiment-dashboard-section');
                  if (sentimentElem) {
                    sentimentElem.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setActiveTab('analyze');
                  }
                }}
                onInviteCustomer={handleCopyLink}
                onOpenSocialCard={() => {
                  const topApproved = effectiveReviews.find(r => r.status === 'approved') || effectiveReviews[0];
                  if (topApproved) setSocialCardReview(topApproved);
                }}
                onConfigure={() => setShowCollectionModal(true)}
                onOpenHistory={() => setShowHistoryModal(true)}
                onOpenAccounts={() => setShowAccountsModal(true)}
              />

              {/* Sample Reviews Notice for New Accounts */}
              {isViewingSampleData && (
                <div className="apple-glass-card border-violet-500/30 bg-violet-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in shadow-2xs rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                        You are viewing sample reviews
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Real customer reviews will appear here automatically as they come in.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClearSampleData}
                    className="apple-touch px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
                  >
                    Clear Sample Data
                  </button>
                </div>
              )}

              {/* Top KPIs & Distribution (Horizontal Luminous Strip) */}
              <MetricsCards
                stats={effectiveStats}
                onFilterByStatus={(status) => setFilters(prev => ({ ...prev, status }))}
                onFilterByRating={(rating) => setFilters(prev => ({ ...prev, rating }))}
              />

              {/* AI Sentiment Analysis */}
              {effectiveReviews.length > 0 && (
                <div id="sentiment-dashboard-section">
                  <SentimentDashboard reviews={effectiveReviews} />
                </div>
              )}

              {/* Filters, View Switcher & Export */}
              <ReviewFilters
                filters={filters}
                setFilters={setFilters}
                stats={effectiveStats}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onExportJSON={() => exportReviewsToJSON(effectiveReviews)}
                onExportCSV={() => exportReviewsToCSV(effectiveReviews)}
                onResetSeedData={handleSeedDemoData}
                availableTags={availableTags}
              />

              {/* Bulk Selection Header Toolbar */}
              {filteredReviews.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs shadow-2xs">
                  <label className="flex items-center gap-2.5 font-semibold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="bulk-select-all"
                      checked={selectedReviewIds.size > 0 && selectedReviewIds.size === filteredReviews.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-0 accent-indigo-600 cursor-pointer"
                    />
                    <span>
                      {selectedReviewIds.size > 0
                        ? `${selectedReviewIds.size} of ${filteredReviews.length} selected`
                        : `Select all for bulk moderation (${filteredReviews.length})`}
                    </span>
                  </label>

                  {selectedReviewIds.size > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        id="bulk-approve-btn"
                        onClick={handleBulkApprove}
                        className="apple-touch px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                        title="Bulk Approve Selected"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve ({selectedReviewIds.size})</span>
                      </button>
                      <button
                        type="button"
                        id="bulk-reject-btn"
                        onClick={handleBulkReject}
                        className="apple-touch px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                        title="Bulk Reject Selected"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        id="bulk-archive-btn"
                        onClick={handleBulkArchive}
                        className="apple-touch px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer shadow-xs active:scale-95 transition-all"
                        title="Bulk Archive Selected"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive</span>
                      </button>
                      <button
                        type="button"
                        id="bulk-delete-btn"
                        onClick={handleBulkDelete}
                        className="apple-touch p-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                        title="Delete Selected"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State / Queue Clears Fast Delight Card */}
              {filteredReviews.length === 0 && !isLoading && (
                <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-3 my-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800">
                    <MailCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-display">
                    Queue Clears Fast!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                    Approved items instantly populate your Wall of Love embed code & API feed.
                  </p>
                </div>
              )}

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
                      isSelected={selectedReviewIds.has(review.id)}
                      onToggleSelect={() => handleToggleSelect(review.id)}
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
                  selectedIds={selectedReviewIds}
                  onToggleSelect={handleToggleSelect}
                  onUpdateStatus={handleUpdateStatus}
                  onToggleFeatured={handleToggleFeatured}
                  onDelete={handleDeleteReview}
                  onOpenDetails={(rev) => setInspectingReview(rev)}
                  onOpenSocialCard={setSocialCardReview}
                />
              )}

              {/* Sticky Mobile Bulk Float Bar (Luminous Proof) */}
              {selectedReviewIds.size > 0 && (
                <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slide-up">
                  <div className="rounded-2xl bg-slate-950/95 dark:bg-slate-900/95 text-white p-3.5 shadow-2xl backdrop-blur-xl border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 pl-1">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold">
                        {selectedReviewIds.size}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">Selected</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleBulkApprove}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold active:scale-95 transition-transform cursor-pointer shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve All</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkReject}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold active:scale-95 transition-transform cursor-pointer shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedReviewIds(new Set())}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Dismiss Selection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
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

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

    </div>
  );
};
export default DashboardPage;
