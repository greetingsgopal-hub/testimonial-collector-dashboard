import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardSidebar, DashboardTab } from '../components/dashboard/DashboardSidebar';
import { ReviewDetailModal } from '../components/dashboard/ReviewDetailModal';
import { SocialCardModal } from '../components/dashboard/SocialCardModal';
import { DatabaseConfigModal } from '../components/dashboard/DatabaseConfigModal';
import { CollectionConfigModal } from '../components/dashboard/CollectionConfigModal';
import { ConnectedAccountsModal } from '../components/dashboard/ConnectedAccountsModal';
import { PublishHistoryModal } from '../components/dashboard/PublishHistoryModal';
import { WelcomeView } from '../components/dashboard/views/WelcomeView';
import { FormsView } from '../components/dashboard/views/FormsView';
import { AccountBillingView } from '../components/dashboard/views/AccountBillingView';
import { IntegrateView } from '../components/dashboard/views/IntegrateView';
import { CampaignsHub } from '../components/dashboard/CampaignsHub';
import ProofSection from '../components/dashboard/ProofSection';
import { EmbedsPostStudio } from '../components/dashboard/ProofToEmbedsFlow';
import { storage } from '../lib/storage';
import { Review, ReviewStatus, ReviewStats, CollectionForm } from '../types';
import { getSampleReviews, isSampleDataCleared, setSampleDataCleared } from '../lib/mockData';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { EmailVerificationBanner } from '../components/auth/EmailVerificationBanner';
import { PlanLimitBanner } from '../components/dashboard/PlanLimitBanner';
import { UpgradeModal } from '../components/dashboard/UpgradeModal';
import { ReferralHub } from '../components/dashboard/ReferralHub';
import { Menu } from 'lucide-react';
const TAB_LABEL_MAP: Record<string, string> = {
  welcome: 'Welcome Hub',
  forms: 'Forms',
  proof: 'Proof',
  widgets: 'Embeds',
  social: 'Post on internet',
  campaigns: 'Campaigns',
  integrate: 'Billing & Plans',
  settings: 'Billing & Plans',
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
    if (paramTab) {
      if (paramTab === 'tags' || paramTab === 'feedback' || paramTab === 'analyze') return 'proof';
      if ((paramTab as string) === 'import') return 'forms';
      return paramTab;
    }
    const windowTab = new URLSearchParams(window.location.search).get('tab') as DashboardTab;
    if (windowTab) {
      if (windowTab === 'tags' || windowTab === 'feedback' || windowTab === 'analyze') return 'proof';
      if ((windowTab as string) === 'import') return 'forms';
      return windowTab;
    }
    return 'welcome';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedForEmbeds, setSelectedForEmbeds] = useState<any[]>([]);

  const setActiveTab = useCallback((tab: DashboardTab) => {
    const resolvedTab = (tab as string) === 'import' ? 'forms' : tab;
    setActiveTabState(resolvedTab);
    setSidebarOpen(false);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', resolvedTab);
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

  // Handle immediate shift navigation event from ImportTestimonialsHub
  useEffect(() => {
    const handleShiftNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.tab === 'proof') {
        setActiveTab('proof');
      }
    };
    window.addEventListener('pandapraise:navigate', handleShiftNav);
    return () => window.removeEventListener('pandapraise:navigate', handleShiftNav);
  }, [setActiveTab]);

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
      const [fetchedReviews, fetchedStats] = await Promise.all([
        storage.getReviews(activeProjectId),
        storage.getStats(activeProjectId),
      ]);
      setReviews(fetchedReviews);
      setStats(fetchedStats);
    } catch (e) {
      console.error('[Dashboard] Failed to fetch project reviews:', e);
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
              onImport={() => setActiveTab('forms')}
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

          {/* Post on internet (Embeds & Social Post Studio) */}
          {(activeTab === 'social' || activeTab === 'widgets') && (
            <div className="max-w-6xl mx-auto font-sans">
              <EmbedsPostStudio
                workspaceName={impersonatedWorkspace?.name || workspace?.name || project?.name || 'reallygreatsite'}
                selectedTestimonials={selectedForEmbeds}
                onBackToProof={() => setActiveTab('proof')}
              />
            </div>
          )}

          {/* Automated Review Request Drip Campaigns (Stage 5) */}
          {activeTab === 'campaigns' && (
            <div className="max-w-5xl mx-auto font-sans">
              <CampaignsHub onNavigateToProof={() => setActiveTab('proof')} />
            </div>
          )}

          {/* MAIN PROOF SECTION (Matches Stitch Design Exactly - Replaces Cluttered Pipeline & KPI Strip) */}
          {activeTab === 'proof' && (
            <div className="font-sans animate-fade-in">
              <ProofSection
                workspaceId={impersonatedWorkspace?.id || workspace?.id || project?.id || 'besteample'}
                workspaceName={impersonatedWorkspace?.name || workspace?.name || project?.name || 'besteample'}
                onPostOnInternet={(chosen) => {
                  setSelectedForEmbeds(chosen);
                  setActiveTab('widgets');
                }}
              />
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
