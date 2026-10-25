import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Film,
  CreditCard,
  Check,
  Search,
  ArrowRight,
  Bell,
  Video,
  Clock,
  Sparkles,
  Download,
  ArrowUpDown,
  Play,
  CheckCircle2,
  ShoppingBag,
  Quote,
  Eye,
  Archive,
  X,
  Sliders,
  Copy,
  FileText,
  ExternalLink,
} from 'lucide-react';
import {
  CustomerVideoReview,
  ToastItem,
  INITIAL_MERCHANT_REVIEWS,
} from './merchantData';

type MainTab = 'inbox' | 'library' | 'billing';
type StatusFilter = 'all' | 'pending' | 'ready';
type SortOrder = 'latest' | 'oldest';
type AspectRatio = '9:16' | '1:1' | '4:5';
type EditMode = 'before' | 'after';

export const MerchantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('inbox');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [selectedReview, setSelectedReview] = useState<CustomerVideoReview | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Drawer states
  const [activeHook, setActiveHook] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [editMode, setEditMode] = useState<EditMode>('after');

  // Customer reviews state
  const [reviews, setReviews] = useState<CustomerVideoReview[]>(INITIAL_MERCHANT_REVIEWS);

  useEffect(() => {
    if (selectedReview) {
      setActiveHook(selectedReview.hooks[0]);
      setEditMode('after');
    }
  }, [selectedReview]);

  const addToast = (title: string, msg: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const filteredReviews = reviews
    .filter((r) => {
      if (statusFilter === 'all') return true;
      return r.status === statusFilter;
    })
    .sort((a, b) => (sortOrder === 'latest' ? b.id - a.id : a.id - b.id));

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const readyCount = reviews.filter((r) => r.status === 'ready').length;

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReviews.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReviews.map((r) => r.id));
    }
  };

  const handleApprove = (review: CustomerVideoReview) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, status: 'ready' } : r))
    );
    addToast(
      'Approved',
      `${review.name}'s video converted to 3 ads • Ready to download`
    );
  };

  const handleTriggerReward = (review: CustomerVideoReview) => {
    addToast(
      'Reward sent',
      `₹200 UPI sent to ${review.name} • ${review.phone}`
    );
  };

  const handleReject = (review: CustomerVideoReview) => {
    setReviews((prev) => prev.filter((r) => r.id !== review.id));
    addToast('Rejected', `${review.name}'s video moved to archive`);
  };

  const handleBulkApprove = () => {
    const count = selectedIds.length || pendingCount;
    setReviews((prev) =>
      prev.map((r) =>
        selectedIds.length === 0 || selectedIds.includes(r.id)
          ? { ...r, status: 'ready' }
          : r
      )
    );
    setSelectedIds([]);
    addToast(
      'Bulk approved',
      `Approved ${count} videos • ₹${count * 200} disbursed via UPI`
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-[#F8F6F1] flex overflow-x-clip selection:bg-[#FFE600] selection:text-black font-sans">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex w-[280px] shrink-0 flex-col bg-[#141416] border-r border-white/[0.06] fixed top-0 left-0 bottom-0 z-30">
        {/* Brand Header */}
        <div className="h-[64px] px-6 flex items-center gap-3 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-[8px] bg-[#FFE600] flex items-center justify-center text-black font-bold text-[14px]">
            P
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-[14px] tracking-[-0.01em] text-white">
              PandaPraise
            </span>
            <span className="text-[10px] uppercase tracking-[0.12em] text-[#8A8A90] font-medium mt-[2px] font-mono">
              Merchant OS
            </span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-3 py-5 space-y-6">
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'inbox') {
                  addToast(
                    'Inbox refreshed',
                    `${pendingCount} pending videos • pulled latest from WhatsApp`
                  );
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setActiveTab('inbox');
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-[10px] rounded-[8px] text-[13px] font-medium transition-all relative ${
                activeTab === 'inbox'
                  ? 'bg-white/[0.03] text-[#F8F6F1] border-l-2 border-[#FFE600]'
                  : 'text-[#8A8A90] hover:text-[#F8F6F1] hover:bg-white/[0.02]'
              }`}
            >
              <Inbox size={18} strokeWidth={1.8} />
              <span>Inbox</span>
              <span className="ml-auto text-[11px] bg-[#FFE600] text-black px-1.5 py-0.5 rounded font-bold font-mono">
                {pendingCount} new
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`w-full flex items-center gap-3 px-3 py-[10px] rounded-[8px] text-[13px] font-medium transition-all ${
                activeTab === 'library'
                  ? 'bg-white/[0.03] text-[#F8F6F1] border-l-2 border-[#FFE600]'
                  : 'text-[#8A8A90] hover:text-[#F8F6F1] hover:bg-white/[0.02]'
              }`}
            >
              <Film size={18} strokeWidth={1.8} />
              <span>Ad Library</span>
              <span className="ml-auto text-[11px] text-[#8A8A90] font-mono">
                {readyCount + 10}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center gap-3 px-3 py-[10px] rounded-[8px] text-[13px] font-medium transition-all ${
                activeTab === 'billing'
                  ? 'bg-white/[0.03] text-[#F8F6F1] border-l-2 border-[#FFE600]'
                  : 'text-[#8A8A90] hover:text-[#F8F6F1] hover:bg-white/[0.02]'
              }`}
            >
              <CreditCard size={18} strokeWidth={1.8} />
              <span>Billing</span>
              <span className="ml-auto text-[11px] text-[#8A8A90] font-mono">
                Usage 60%
              </span>
            </button>
          </div>
        </nav>

        {/* Bottom Store Connection Card */}
        <div className="p-3 space-y-3 border-t border-white/[0.06]">
          <div className="rounded-[12px] bg-[#0A0A0B] border border-white/[0.06] p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_8px_rgba(37,211,102,0.5)]" />
              <span className="text-[11px] font-medium text-[#F8F6F1]">
                Shopify Connected
              </span>
              <Check size={12} className="text-[#25D366] ml-auto" />
            </div>
            <div className="text-[11px] text-[#8A8A90] font-mono truncate">
              kalyansilks.myshopify.com
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
              <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span className="text-[11px] text-[#8A8A90]">
                WhatsApp Active • 99.98%
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 lg:pl-[280px] min-w-0 w-full">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-[64px] bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 lg:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 rounded-[8px] bg-[#FFE600] flex items-center justify-center text-black font-bold text-[14px]">
              P
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141416] border border-white/[0.06]">
              <div className="w-2 h-2 rounded-full bg-[#25D366]" />
              <span className="text-[12px] font-medium text-white">
                Kalyan Silks
              </span>
              <span className="text-[11px] text-[#8A8A90] font-mono">
                • Shopify Plus
              </span>
            </div>
          </div>

          {/* Quick Search */}
          <div
            className="flex-1 max-w-[360px] hidden md:flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#141416] border border-white/[0.06] text-[#8A8A90] cursor-pointer hover:border-white/20 transition"
            onClick={() => addToast('Search', 'Search across 248 videos, hooks, orders')}
          >
            <Search size={16} />
            <span className="text-[13px] flex-1 text-left text-zinc-400">
              Search videos, hooks...
            </span>
            <span className="text-[10px] font-mono bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-400">
              ⌘K
            </span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                addToast('Buy more credits', 'Redirecting to billing • 500 credits for ₹4,999')
              }
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-[8px] bg-[#FFE600] text-black text-[13px] font-semibold hover:brightness-105 transition"
            >
              <span>Buy More</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => addToast('Notifications', `${pendingCount} new videos pending review`)}
              className="w-9 h-9 rounded-[8px] bg-[#141416] border border-white/[0.06] flex items-center justify-center text-[#8A8A90] hover:text-white relative"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FFE600] rounded-full" />
            </button>

            <div className="w-9 h-9 rounded-[8px] bg-white text-black flex items-center justify-center font-bold text-[13px]">
              RK
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="px-4 lg:px-8 py-6 space-y-6 max-w-[1280px] mx-auto">
          {activeTab === 'inbox' && (
            <>
              {/* Header with Title and Status Switcher */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div>
                  <h1 className="text-[24px] tracking-[-0.02em] font-semibold leading-none text-white">
                    Inbox
                  </h1>
                  <p className="text-[14px] text-[#8A8A90] mt-2 max-w-[520px]">
                    Real customer videos from WhatsApp. Auto-collected 7 days after delivery.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 p-1 rounded-full bg-[#141416] border border-white/[0.06]">
                    {(['all', 'pending', 'ready'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium capitalize transition ${
                          statusFilter === status
                            ? 'bg-white text-black shadow-sm font-bold'
                            : 'text-[#8A8A90] hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSortOrder((prev) => (prev === 'latest' ? 'oldest' : 'latest'))
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#141416] border border-white/[0.06] text-[12px] text-[#8A8A90] hover:text-white transition"
                  >
                    <ArrowUpDown size={14} />
                    <span>{sortOrder === 'latest' ? 'Latest' : 'Oldest'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Videos Received */}
                <div className="rounded-[12px] bg-[#141416] border border-white/[0.06] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[#8A8A90] font-mono font-medium">
                      Videos Received
                    </span>
                    <Video size={16} className="text-[#8A8A90]" />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-[44px] leading-none tracking-[-0.02em] text-white">
                      248
                    </span>
                    <span className="text-[12px] font-mono text-[#25D366] flex items-center gap-0.5 font-bold">
                      <Sparkles size={12} />
                      34% WoW
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] text-[#8A8A90] mb-1.5 font-mono">
                      <span>Submission Rate</span>
                      <span className="text-[#F8F6F1]">89.2%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFE600] w-[89%]" />
                    </div>
                  </div>
                </div>

                {/* Ads Ready */}
                <div className="rounded-[12px] bg-[#141416] border border-white/[0.06] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[#8A8A90] font-mono font-medium">
                      Ads Ready
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#25D366]/15 text-[#25D366] font-bold font-mono">
                      High-Converting
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-serif text-[44px] leading-none text-white">
                      42
                    </span>
                    <span className="text-[11px] text-[#8A8A90] font-mono">
                      auto-edited
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[11px] text-[#8A8A90] bg-[#0A0A0B] rounded-[8px] px-3 py-2 border border-white/[0.04] font-mono">
                    <Clock size={12} />
                    <span>Avg render</span>
                    <span className="text-white ml-auto font-bold">7m 44s</span>
                  </div>
                </div>

                {/* Time Saved */}
                <div className="rounded-[12px] bg-[#141416] border border-white/[0.06] p-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[#8A8A90] font-mono font-medium">
                      Time Saved
                    </span>
                    <Sparkles size={16} className="text-[#FFE600]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-[44px] leading-none text-white">
                      18h
                    </span>
                    <span className="text-[12px] text-[#8A8A90]">this month</span>
                  </div>
                  <p className="text-[12px] text-[#8A8A90] mt-1">
                    vs manual editing &amp; subtitling
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      addToast('Download all', `Downloading ${readyCount} ready ads as ZIP`)
                    }
                    className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] bg-white text-black text-[13px] font-semibold hover:bg-[#F8F6F1] transition"
                  >
                    <Download size={16} />
                    <span>Download All</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Pending Review vs Ready */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 p-1 rounded-full bg-[#141416] border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('pending')}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition ${
                      statusFilter === 'pending'
                        ? 'bg-white text-black font-bold'
                        : 'text-[#8A8A90] hover:text-white'
                    }`}
                  >
                    Pending Review ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ready')}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition ${
                      statusFilter === 'ready'
                        ? 'bg-white text-black font-bold'
                        : 'text-[#8A8A90] hover:text-white'
                    }`}
                  >
                    Ready ({readyCount + 10})
                  </button>
                </div>

                <span className="hidden md:block text-[11px] text-[#8A8A90] font-mono">
                  {filteredReviews.length} videos • Sorted by {sortOrder}
                </span>
              </div>

              {/* Customer Video Review Cards List */}
              <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                  <div className="rounded-[12px] bg-[#141416] border border-dashed border-white/[0.08] p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                      <Video size={24} className="text-[#8A8A90]" />
                    </div>
                    <h3 className="text-[16px] font-medium text-white">
                      No videos in this view
                    </h3>
                    <p className="text-[13px] text-[#8A8A90] mt-1 max-w-[320px] mx-auto">
                      We auto-DM customers 7 days after delivery. Next DM batch in 3h • 14 orders queued.
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[#8A8A90]">
                      <span className="w-1.5 h-1.5 bg-[#FFE600] rounded-full animate-pulse" />
                      <span>Waiting for WhatsApp customer replies</span>
                    </div>
                  </div>
                ) : (
                  filteredReviews.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedReview(item)}
                      className="group rounded-[12px] bg-[#141416] border border-white/[0.06] p-3 md:p-4 flex flex-col md:flex-row gap-4 md:gap-6 hover:border-white/[0.12] transition cursor-pointer"
                    >
                      {/* Left 9:16 Video Canvas Box */}
                      <div className="relative w-full md:w-[220px] h-[320px] md:h-[390px] shrink-0 rounded-[16px] overflow-hidden bg-[#1E1E22] flex flex-col">
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(180deg, ${item.colorFrom}, ${item.colorTo})`,
                          }}
                        />

                        {/* Top Badges */}
                        <div className="relative z-10 flex items-center justify-between p-3">
                          <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-black/60 backdrop-blur text-white border border-white/10 flex items-center gap-1">
                            <span className="w-1 h-1 bg-[#FFE600] rounded-full" />
                            {item.duration} • VIDEO
                          </span>
                          <span className="text-[10px] font-mono font-medium px-2 py-1 rounded-full bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20">
                            {item.sentiment}
                          </span>
                        </div>

                        {/* Center Play Button */}
                        <div className="relative z-10 flex-1 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <Play size={18} className="text-black ml-0.5 fill-black" />
                          </div>
                        </div>

                        {/* Bottom Hook Pill Overlay */}
                        <div className="relative z-10 p-2.5 space-y-2 mt-auto">
                          <div className="rounded-[8px] bg-[#FFE600] text-black px-2.5 py-1.5 text-[11px] font-bold leading-tight line-clamp-2">
                            {item.hooks[0].toUpperCase()}
                          </div>
                          <div className="flex gap-1.5 font-mono">
                            <span className="text-[9px] px-1.5 py-1 rounded bg-black/60 text-white/70 border border-white/10">
                              HOOK 0-3s
                            </span>
                            <span className="text-[9px] px-1.5 py-1 rounded bg-black/60 text-white/70 border border-white/10">
                              SUBTITLES AUTO
                            </span>
                          </div>
                        </div>

                        {/* Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(item.id);
                          }}
                          className={`absolute top-3 left-3 z-20 w-5 h-5 rounded-[6px] border flex items-center justify-center transition ${
                            selectedIds.includes(item.id)
                              ? 'bg-[#FFE600] border-[#FFE600] text-black'
                              : 'bg-black/40 border-white/20 backdrop-blur'
                          }`}
                        >
                          {selectedIds.includes(item.id) && <Check size={12} />}
                        </button>
                      </div>

                      {/* Right Video Info & Controls */}
                      <div className="flex-1 flex flex-col min-w-0">
                        {/* Customer Header */}
                        <div className="flex flex-wrap items-center gap-2 text-[12px]">
                          <span className="font-semibold text-white">
                            {item.name}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/15 font-mono">
                            <CheckCircle2 size={10} /> Verified Buyer
                          </span>
                          <span className="text-[#8A8A90] font-mono text-[11px]">
                            #{item.order}
                          </span>
                          <span className="text-[#8A8A90]">•</span>
                          <span className="text-[#8A8A90] text-[11px]">
                            {item.location}
                          </span>
                          <span className="text-[#8A8A90]">•</span>
                          <span className="text-[#8A8A90] text-[11px]">
                            {item.timeAgo}
                          </span>
                        </div>

                        {/* Product Bar */}
                        <div className="mt-3 flex items-center gap-2">
                          <ShoppingBag size={14} className="text-[#8A8A90]" />
                          <span className="text-[13px] font-medium text-white">
                            {item.product}
                          </span>
                          <span className="text-[12px] text-[#8A8A90] font-mono">
                            {item.price}
                          </span>
                        </div>

                        {/* Quote Box */}
                        <div className="mt-3 rounded-[8px] bg-[#0F0F0F] border border-white/[0.04] p-3 flex gap-2.5">
                          <Quote size={14} className="text-[#8A8A90] shrink-0 mt-0.5" />
                          <p className="text-[14px] italic leading-[1.4] text-white/90 line-clamp-2">
                            "{item.quote}"
                          </p>
                        </div>

                        {/* Suggested Hooks */}
                        <div className="mt-4">
                          <div className="flex items-center gap-1.5 text-[11px] text-[#8A8A90] uppercase tracking-[0.06em] font-medium font-mono">
                            <Sparkles size={12} className="text-[#FFE600]" />
                            <span>Panda AI Suggested Hooks</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.hooks.map((hook, idx) => (
                              <button
                                key={hook}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedReview(item);
                                  setActiveHook(hook);
                                }}
                                className={`px-2.5 py-1 rounded-full text-[12px] font-medium border transition ${
                                  idx === 0
                                    ? 'bg-[#FFE600] text-black border-[#FFE600] font-bold'
                                    : 'bg-white/[0.04] text-[#8A8A90] border-white/[0.06] hover:text-white hover:border-white/10'
                                }`}
                              >
                                {hook}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="mt-auto pt-5 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(item);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-white text-black text-[13px] font-semibold hover:bg-[#F8F6F1] transition shadow-sm"
                          >
                            <Download size={16} />
                            <span>Approve &amp; Download 3 Ads</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTriggerReward(item);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2.5 rounded-[8px] bg-[#0A0A0B] border border-white/[0.08] text-[13px] text-[#25D366] hover:border-[#25D366]/30 transition font-mono font-medium"
                          >
                            <span>Trigger ₹200 Reward</span>
                          </button>

                          <div className="ml-auto flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedReview(item);
                              }}
                              className="w-9 h-9 rounded-[8px] bg-[#0A0A0B] border border-white/[0.06] flex items-center justify-center text-[#8A8A90] hover:text-white transition"
                              title="Inspect Creative"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReject(item);
                              }}
                              className="w-9 h-9 rounded-[8px] bg-[#0A0A0B] border border-white/[0.06] flex items-center justify-center text-[#8A8A90] hover:text-rose-400 transition"
                              title="Archive Review"
                            >
                              <Archive size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Floating Bottom Sticky Bar */}
              <div className="sticky bottom-4 z-10 mt-6 rounded-[12px] bg-[#141416]/90 backdrop-blur-xl border border-white/[0.08] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
                <label className="flex items-center gap-2.5 cursor-pointer px-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredReviews.length &&
                      filteredReviews.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded-[4px] bg-[#0A0A0B] border-white/20 accent-[#FFE600]"
                  />
                  <span className="text-[13px] text-zinc-300">
                    Select All {pendingCount} Pending
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addToast(
                        'Bulk caption',
                        `Generated captions for ${selectedIds.length || pendingCount} videos`
                      )
                    }
                    className="px-3.5 py-2 rounded-[8px] bg-white/[0.06] border border-white/[0.06] text-[13px] hover:bg-white/[0.08] transition text-zinc-200"
                  >
                    Bulk AI Caption
                  </button>

                  <button
                    type="button"
                    onClick={handleBulkApprove}
                    className="px-4 py-2 rounded-[8px] bg-[#FFE600] text-black text-[13px] font-semibold flex items-center gap-1.5 hover:brightness-105 transition"
                  >
                    <span>
                      Approve All &amp; Disburse ₹
                      {(selectedIds.length || pendingCount) * 200}
                    </span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Ad Library Tab */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-[24px] tracking-[-0.02em] font-semibold text-white">
                  Ad Library
                </h1>
                <p className="text-[14px] text-[#8A8A90] mt-1">
                  12 ready ads • Auto-hooked, captioned, and formatted for Meta + TikTok.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="rounded-[12px] bg-[#141416] border border-white/[0.06] p-3"
                  >
                    <div className="aspect-[9/16] rounded-[12px] bg-[#1E1E22] relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
                      <div className="absolute top-2 left-2 text-[10px] font-mono px-2 py-1 rounded-full bg-black/60 text-white border border-white/10">
                        9:16 • {['POV: POCKETS', '₹2899 HACK', 'SABYASACHI? NO'][i % 3]}
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                        <span className="text-[9px] px-1.5 py-1 rounded bg-[#FFE600] text-black font-bold font-mono">
                          HOOK 0-3s
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[12px] font-medium text-white font-mono">
                        Ad #{i} • Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => addToast('Download', `Ad #${i} downloaded`)}
                        className="w-7 h-7 rounded-[8px] bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6 max-w-[720px]">
              <div>
                <h1 className="text-[24px] tracking-[-0.02em] font-semibold text-white">
                  Billing &amp; Usage
                </h1>
                <p className="text-[14px] text-[#8A8A90] mt-1 font-mono">
                  60% of monthly quota used • Resets in 12 days.
                </p>
              </div>

              <div className="rounded-[12px] bg-[#141416] border border-white/[0.06] p-6 space-y-5">
                <div>
                  <div className="flex justify-between text-[13px] mb-2 font-mono">
                    <span className="text-zinc-300">Videos processed</span>
                    <span className="text-white">248 / 400</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFE600] w-[62%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[13px] mb-2 font-mono">
                    <span className="text-zinc-300">AI renders</span>
                    <span className="text-white">42 / 100</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[42%]" />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-medium text-white">
                      PandaPraise Growth
                    </div>
                    <div className="text-[12px] text-[#8A8A90]">
                      ₹2,999/mo • 400 videos, 100 renders
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToast('Upgrade', 'Opening billing portal')}
                    className="px-4 py-2 rounded-[8px] bg-white text-black text-[13px] font-semibold hover:bg-zinc-200 transition"
                  >
                    Manage Plan
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Slide-out Video Inspector Drawer */}
      {selectedReview && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedReview(null)}
          />

          <div className="relative w-full max-w-[480px] bg-[#141416] border-l border-white/[0.08] h-full overflow-y-auto flex flex-col shadow-2xl animate-[slideIn_0.25s_ease]">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 bg-[#141416]/90 backdrop-blur-xl border-b border-white/[0.06] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-[#0A0A0B] border border-white/[0.06] flex items-center justify-center">
                  <Video size={16} className="text-[#FFE600]" />
                </div>
                <div>
                  <div className="text-[13px] font-medium leading-none text-white">
                    {selectedReview.name}
                  </div>
                  <div className="text-[11px] text-[#8A8A90] font-mono mt-1">
                    {selectedReview.phone} • {selectedReview.location}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="w-8 h-8 rounded-[8px] bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.10] text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-6">
              {/* Before/After Toggle + Video Canvas */}
              <div>
                <div className="flex items-center gap-1 p-1 rounded-full bg-[#0A0A0B] border border-white/[0.06] w-fit">
                  <button
                    type="button"
                    onClick={() => setEditMode('before')}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition ${
                      editMode === 'before'
                        ? 'bg-white text-black font-bold'
                        : 'text-[#8A8A90]'
                    }`}
                  >
                    Before
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode('after')}
                    className={`px-3 py-1 rounded-full text-[11px] font-medium transition ${
                      editMode === 'after'
                        ? 'bg-[#FFE600] text-black font-bold'
                        : 'text-[#8A8A90]'
                    }`}
                  >
                    After • AI Edit
                  </button>
                </div>

                <div className="mt-3 relative aspect-[9/16] rounded-[16px] overflow-hidden bg-[#1E1E22] border border-white/[0.06]">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, ${selectedReview.colorFrom}, ${selectedReview.colorTo})`,
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Play size={20} className="ml-0.5 fill-black text-black" />
                    </div>
                    <span className="text-[11px] font-mono text-white/70">
                      {editMode === 'before'
                        ? 'RAW • No subtitles'
                        : 'HOOK + SUBTITLES + CROP'}
                    </span>
                  </div>

                  {/* Overlay for after mode */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-[13px] font-bold bg-[#FFE600] text-black px-2 py-1 rounded-[6px] inline-block">
                      {activeHook.toUpperCase()}
                    </div>
                    <div className="mt-2 text-[12px] text-white/80 leading-snug bg-black/50 backdrop-blur px-2 py-1 rounded">
                      "{selectedReview.quote}"
                    </div>
                  </div>
                </div>

                {/* Aspect Ratio Switcher */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(['9:16', '1:1', '4:5'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 rounded-[8px] border text-[12px] font-medium transition ${
                        aspectRatio === ratio
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-[#0A0A0B] text-[#8A8A90] border-white/[0.06] hover:text-white'
                      }`}
                    >
                      {ratio} {ratio === '9:16' ? '• Story' : ratio === '1:1' ? '• Feed' : '• Reel'}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    addToast('Downloaded', `${aspectRatio} ad • ${activeHook}.mp4 saved`)
                  }
                  className="mt-3 w-full py-2.5 rounded-[8px] bg-white text-black text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-zinc-200 transition"
                >
                  <Download size={16} />
                  <span>Download {aspectRatio} Video</span>
                </button>
              </div>

              {/* Hook Editor */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[12px] font-medium text-white">
                  <Sliders size={14} className="text-[#FFE600]" />
                  <span>Hook Editor</span>
                </div>
                <div className="rounded-[12px] bg-[#0A0A0B] border border-white/[0.06] p-3">
                  <textarea
                    value={activeHook}
                    onChange={(e) => setActiveHook(e.target.value)}
                    className="w-full bg-transparent text-[14px] font-medium text-white resize-none outline-none min-h-[48px]"
                    rows={2}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#8A8A90] font-mono">
                      {activeHook.length}/40 chars • 0-3s hook
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText?.(activeHook);
                        addToast('Copied', 'Hook copied to clipboard');
                      }}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.10] text-zinc-300"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedReview.hooks.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setActiveHook(h)}
                      className={`px-2.5 py-1 rounded-full text-[11px] border transition ${
                        activeHook === h
                          ? 'bg-[#FFE600] text-black border-[#FFE600] font-bold'
                          : 'bg-white/[0.04] text-[#8A8A90] border-white/[0.06] hover:text-white'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Transcript */}
              <div className="space-y-2">
                <div className="text-[12px] font-medium flex items-center gap-2 text-white">
                  <FileText size={12} className="text-[#8A8A90]" />
                  <span>Full Transcript</span>
                </div>
                <div className="rounded-[8px] bg-[#0A0A0B] border border-white/[0.06] p-3 text-[13px] leading-[1.5] text-[#F8F6F1]/80">
                  {selectedReview.fullTranscript}
                </div>
              </div>

              {/* Product Reference */}
              <div className="rounded-[12px] bg-[#0A0A0B] border border-white/[0.06] p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-[8px] bg-[#1E1E22] border border-white/[0.06] flex items-center justify-center text-[#8A8A90]">
                  <ShoppingBag size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white truncate">
                    {selectedReview.product}
                  </div>
                  <div className="text-[11px] text-[#8A8A90] font-mono">
                    {selectedReview.price} • Order #{selectedReview.order}
                  </div>
                </div>
                <ExternalLink size={14} className="text-[#8A8A90]" />
              </div>

              {/* Drawer Actions */}
              <div className="flex gap-2 pb-6">
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(selectedReview);
                    setSelectedReview(null);
                  }}
                  className="flex-1 py-2.5 rounded-[8px] bg-[#FFE600] text-black text-[13px] font-semibold hover:brightness-105 transition"
                >
                  Approve &amp; Download
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerReward(selectedReview)}
                  className="px-3 py-2.5 rounded-[8px] bg-white/[0.06] border border-white/[0.08] text-[13px] text-[#25D366] hover:bg-white/[0.1] transition font-mono font-medium"
                >
                  ₹200 Reward
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-[#141416]/95 backdrop-blur-xl border-t border-white/[0.06] flex">
        <button
          type="button"
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'inbox' ? 'text-[#FFE600]' : 'text-[#8A8A90]'
          }`}
        >
          <Inbox size={18} />
          <span>Inbox</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'library' ? 'text-[#FFE600]' : 'text-[#8A8A90]'
          }`}
        >
          <Film size={18} />
          <span>Library</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('billing')}
          className={`flex-1 py-3 flex flex-col items-center gap-1 text-[11px] ${
            activeTab === 'billing' ? 'text-[#FFE600]' : 'text-[#8A8A90]'
          }`}
        >
          <CreditCard size={18} />
          <span>Billing</span>
        </button>
      </div>

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[60] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto min-w-[300px] max-w-[380px] rounded-[12px] bg-[#1E1E22] border border-white/[0.08] shadow-2xl p-3.5 flex gap-3 animate-[slideUp_0.2s_ease]"
          >
            <div className="w-8 h-8 rounded-full bg-[#FFE600] flex items-center justify-center shrink-0">
              <Check size={16} className="text-black" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium leading-none text-white">
                {toast.title}
              </div>
              <div className="text-[12px] text-[#8A8A90] mt-1 leading-snug">
                {toast.msg}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
