import { useState, useEffect, useMemo } from 'react';
import { DashboardSidebar, DashboardTab } from '../components/dashboard/DashboardSidebar';
import { MetricsCards } from '../components/dashboard/MetricsCards';
import { ReviewFilters } from '../components/dashboard/ReviewFilters';
import { ReviewCard } from '../components/dashboard/ReviewCard';
import { ReviewTable } from '../components/dashboard/ReviewTable';
import { ReviewDetailModal } from '../components/dashboard/ReviewDetailModal';
import { SocialCardModal } from '../components/dashboard/SocialCardModal';
import { CarouselStudioModal } from '../components/dashboard/CarouselStudioModal';
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
import { StudioView } from '../components/dashboard/views/StudioView';
import { WidgetStudio } from '../components/dashboard/WidgetStudio';
import { ProofReelsView } from '../components/dashboard/views/ProofReelsView';
import { ThankYousView } from '../components/dashboard/views/ThankYousView';
import { BrandKitView } from '../components/dashboard/views/BrandKitView';
import { RichSnippetView } from '../components/dashboard/views/RichSnippetView';
import { AnalyzeView } from '../components/dashboard/views/AnalyzeView';
import { IntegrateView } from '../components/dashboard/views/IntegrateView';
import { storage, getActiveBackendInfo } from '../lib/storage';
import { Review, ReviewFilters as FilterType, ReviewStatus, ReviewStats, CollectionForm } from '../types';
import { exportReviewsToJSON, exportReviewsToCSV } from '../lib/exportUtils';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { EmailVerificationBanner } from '../components/auth/EmailVerificationBanner';
import { 
  Sparkles, 
  Send, 
  Copy, 
  ExternalLink,
  Settings,
  Clock,
  Link as LinkIcon,
  History,
  Layers,
  Star,
  LayoutGrid,
  Database,
  Check
} from 'lucide-react';

export const DashboardPage = () => {
  usePageSeo({
    title: 'Dashboard — Panda Praise',
    description: 'Panda Praise customer review management and moderation dashboard.',
  });

  const { project, collectionForm } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('welcome');

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
  const [studioSubView, setStudioSubView] = useState<'overview' | 'widget'>('overview');

  const backend = getActiveBackendInfo();
  const activeProjectId = project?.id;

  // Handle OAuth callback redirects in query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const socialConnected = params.get('social_connected');
    const accountName = params.get('account_name');
    const socialError = params.get('social_error');
    const requestedTab = params.get('tab');
    const pathname = window.location.pathname;
    if (socialConnected || requestedTab === 'integrate' || pathname.includes('/integrate')) {
      setActiveTab('integrate');
    }

    if (socialConnected) {
      setSocialNotification({
        type: 'success',
        message: `✓ Successfully connected ${socialConnected.toUpperCase()}${accountName ? ` as ${accountName}` : ''}! 1-Click Social Publishing is now enabled.`
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
    <div className="min-h-screen flex bg-[#f9fafb] text-gray-900 font-sans selection:bg-purple-100 selection:text-purple-900">
      
      {/* ── Senja Left Vertical Sidebar ── */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        proofCount={reviews.length}
        feedbackCount={feedbackList.length}
      />

      {/* ── Main Content Area ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Top Slim Header Bar */}
        <header className="h-14 border-b border-gray-200/80 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800 capitalize">{activeTab}</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-500 truncate max-w-[200px]">{project?.name || 'Main Product'}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Share Form Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer whitespace-nowrap"
                title="Copy public collector link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
              </button>

              <a
                href={collectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm whitespace-nowrap cursor-pointer"
                title="Open live collector form in new tab"
              >
                <span>Share Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Database indicator button */}
            <button
              id="database-config-btn"
              onClick={() => setShowDatabaseModal(true)}
              title="Database Connection Status"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700 transition-colors cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  backend.type === 'firebase' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  backend.type === 'firebase' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <Database className="w-3 h-3 text-gray-500" />
              <span className="hidden md:inline text-[11px]">{backend.type === 'firebase' ? 'Firebase' : 'Demo DB'}</span>
            </button>
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
              onSendInvites={handleCopyLink}
            />
          )}

          {/* Forms Management */}
          {activeTab === 'forms' && (
            <FormsView
              onConfigureForm={() => setShowCollectionModal(true)}
              onSendInvites={handleCopyLink}
              onViewProof={() => setActiveTab('proof')}
            />
          )}

          {/* Import Page */}
          {activeTab === 'import' && (
            <div className="max-w-6xl mx-auto">
              <ImportPage />
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

          {/* Social Proof Studio */}
          {activeTab === 'studio' && (
            studioSubView === 'widget' ? (
              <WidgetStudio
                reviews={reviews}
                onBack={() => setStudioSubView('overview')}
              />
            ) : (
              <StudioView
                onOpenWidgetCreator={() => setStudioSubView('widget')}
                onOpenSocialCard={() => setShowCarouselModal(true)}
                onOpenWallOfLove={() => setStudioSubView('widget')}
              />
            )
          )}

          {/* Proof Reels */}
          {activeTab === 'proof-reels' && (
            <ProofReelsView onCollectVideo={() => window.open(collectionUrl, '_blank')} />
          )}

          {/* Thank Yous Center */}
          {activeTab === 'thank-yous' && (
            <ThankYousView />
          )}

          {/* Brand Kit */}
          {activeTab === 'brand-kit' && (
            <BrandKitView />
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
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* Carousel Banner: "Add testimonials to your website" (Matches Senja 01:38) */}
              <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Add testimonials to your website</h3>
                    <p className="text-xs text-gray-500">Pick one of these widgets to add them to your website.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('studio')}
                    className="text-xs font-bold text-[#6701e6] hover:underline cursor-pointer"
                  >
                    View all widgets →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  {/* Widget Preset 1: Testimonial Card */}
                  <div
                    onClick={() => setActiveTab('studio')}
                    className="p-3 rounded-2xl bg-gray-50 hover:bg-purple-50/50 border border-gray-200/80 hover:border-purple-300 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">New</span>
                      <LayoutGrid className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#6701e6]" />
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200 text-[10px] text-gray-600 line-clamp-2 italic">
                      "Panda Praise is hands down the easiest tool for social proof."
                    </div>
                    <span className="block mt-2 text-xs font-bold text-gray-900 group-hover:text-[#6701e6]">Testimonial Card</span>
                  </div>

                  {/* Widget Preset 2: Star Badge */}
                  <div
                    onClick={() => setActiveTab('studio')}
                    className="p-3 rounded-2xl bg-gray-50 hover:bg-purple-50/50 border border-gray-200/80 hover:border-purple-300 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Popular</span>
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900">5.0 ★</span>
                      <span className="text-[10px] text-gray-400">from 154 reviews</span>
                    </div>
                    <span className="block mt-2 text-xs font-bold text-gray-900 group-hover:text-[#6701e6]">Star Rating Badge</span>
                  </div>

                  {/* Widget Preset 3: Wall of Love */}
                  <div
                    onClick={() => {
                      setActiveTab('studio');
                      setStudioSubView('widget');
                    }}
                    className="p-3 rounded-2xl bg-gray-50 hover:bg-purple-50/50 border border-gray-200/80 hover:border-purple-300 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">Wall of Love</span>
                      <Sparkles className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#6701e6]" />
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200 text-[10px] text-gray-600 line-clamp-2">
                      Interactive grid of masonry testimonial cards
                    </div>
                    <span className="block mt-2 text-xs font-bold text-gray-900 group-hover:text-[#6701e6]">Wall of Love Builder</span>
                  </div>

                  {/* Widget Preset 4: Carousel */}
                  <div
                    onClick={() => setShowCarouselModal(true)}
                    className="p-3 rounded-2xl bg-gray-50 hover:bg-purple-50/50 border border-gray-200/80 hover:border-purple-300 transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">Dynamic</span>
                      <Layers className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#6701e6]" />
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200 text-[10px] text-gray-600 line-clamp-2">
                      Auto-sliding interactive horizontal carousel
                    </div>
                    <span className="block mt-2 text-xs font-bold text-gray-900 group-hover:text-[#6701e6]">Carousel Studio</span>
                  </div>
                </div>
              </div>

              {/* Clean Proof Header */}
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
                  <p className="text-xs text-gray-500 mt-1">All your testimonials and case studies.</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.01]"
                    title="Copy customer invitation link"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Link Copied!' : '+ Invite a customer'}</span>
                  </button>

                  <button
                    onClick={() => setShowCarouselModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Studio</span>
                  </button>

                  <button
                    onClick={() => setShowCollectionModal(true)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Settings className="w-3.5 h-3.5 text-gray-500" />
                    <span>Configure Form</span>
                  </button>

                  <button
                    onClick={() => setShowHistoryModal(true)}
                    className="p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer shadow-xs"
                    title="Publish History"
                  >
                    <History className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowAccountsModal(true)}
                    className="p-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer shadow-xs"
                    title="Connected Accounts"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Topic Chips */}
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

              {/* Priority Pending Moderation Alert */}
              {stats.pendingCount > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-800 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>
                      <strong>{stats.pendingCount}</strong> customer testimonial(s) awaiting moderation in this project.
                    </span>
                  </div>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
                    className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold transition-colors"
                  >
                    Filter Pending Queue
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

              {/* Natural Language Filters, View Switcher & Export */}
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
              ) : filteredReviews.length === 0 ? (
                <div className="py-20 bg-white rounded-2xl border border-gray-200 shadow-xs text-center p-8 space-y-4 max-w-lg mx-auto">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#6701e6] flex items-center justify-center mx-auto border border-purple-100">
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-gray-900">No Testimonials Yet</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Testimonials you collect will show up here. Already got testimonials? Import them from 30+ sources.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('import')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Import Testimonials</span>
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Form Link</span>
                    </button>
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

      {showCarouselModal && (
        <CarouselStudioModal
          approvedReviews={reviews.filter(r => r.status === 'approved')}
          projectName={project?.name}
          websiteUrl={project?.websiteUrl}
          onClose={() => setShowCarouselModal(false)}
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
