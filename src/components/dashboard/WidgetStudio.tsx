import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Sliders,
  Layers,
  Award,
  Maximize2,
  MessageSquarePlus,
  Bell,
  ArrowLeft,
  Filter,
  CheckSquare,
  Square,
  SlidersHorizontal
} from 'lucide-react';
import { Review, WidgetType, WidgetSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';

export type CmsPlatform = 'html' | 'webflow' | 'wordpress' | 'shopify' | 'framer' | 'react';

interface WidgetStudioProps {
  reviews: Review[];
  onBack?: () => void;
}

export const WidgetStudio: React.FC<WidgetStudioProps> = ({ reviews, onBack }) => {
  const { project } = useAuth();
  const projectWidgetId = project?.id || '';

  const [settings, setSettings] = useState<WidgetSettings>({
    type: 'wall',
    theme: 'light',
    primaryColor: '#6701e6',
    showRating: true,
    showAvatar: true,
    showDate: true,
    showCompany: true,
    maxCount: 6,
    onlyFeatured: false,
    autoAddByRating: 0,
    autoAddByTags: [],
  });

  const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [cmsPlatform, setCmsPlatform] = useState<CmsPlatform>('html');
  const [copied, setCopied] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // All approved reviews from the project
  const approvedReviews = reviews.filter((r) => r.status === 'approved');

  // Extract all available tags
  const allTags = Array.from(
    new Set(approvedReviews.flatMap((r) => r.tags || []).filter(Boolean))
  );

  // Dynamic vs Manual filtered reviews
  const filteredReviews = approvedReviews.filter((r) => {
    if (selectionMode === 'manual') {
      return selectedReviewIds.length === 0 || selectedReviewIds.includes(r.id);
    }
    if (settings.onlyFeatured && !r.isFeatured) return false;
    if (minRating > 0 && r.rating < minRating) return false;
    if (selectedTag !== 'all' && (!r.tags || !r.tags.includes(selectedTag))) return false;
    return true;
  });

  const displayReviews = filteredReviews.slice(0, settings.maxCount);

  const avgRating =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
      : '5.0';

  const toggleManualReview = (id: string) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getEmbedUrl = () => {
    const params = new URLSearchParams({
      type: settings.type,
      theme: settings.theme,
      color: settings.primaryColor,
      rating: settings.showRating ? '1' : '0',
      avatar: settings.showAvatar ? '1' : '0',
      date: settings.showDate ? '1' : '0',
      company: settings.showCompany ? '1' : '0',
      count: String(settings.maxCount),
      featured: settings.onlyFeatured ? '1' : '0',
    });

    if (selectionMode === 'auto') {
      if (minRating > 0) params.set('minRating', String(minRating));
      if (selectedTag && selectedTag !== 'all') params.set('tag', selectedTag);
    } else if (selectedReviewIds.length > 0) {
      params.set('ids', selectedReviewIds.join(','));
    }

    return `${window.location.origin}/w/${projectWidgetId}?${params.toString()}`;
  };

  const getEmbedSnippet = () => {
    const url = getEmbedUrl();
    switch (cmsPlatform) {
      case 'react':
        return `<iframe src="${url}" width="100%" height="480" style={{ border: 0, borderRadius: 16 }} loading="lazy" title="Customer testimonials" />`;
      case 'webflow':
      case 'wordpress':
      case 'shopify':
      case 'framer':
      case 'html':
      default:
        return `<iframe src="${url}" width="100%" height="480" frameborder="0" loading="lazy" title="Customer testimonials" style="border:0;border-radius:16px;width:100%;min-height:480px;"></iframe>`;
    }
  };

  const getCmsGuide = () => {
    switch (cmsPlatform) {
      case 'webflow':
        return {
          title: 'Webflow Integration',
          step1: 'In Webflow Designer, add an "Embed" component from the Add Elements panel.',
          step2: 'Paste the iframe snippet below and click "Save & Close". Publish your site.',
        };
      case 'wordpress':
        return {
          title: 'WordPress Integration',
          step1: 'In Gutenberg or Elementor, add a "Custom HTML" block on your target page.',
          step2: 'Paste the snippet below and click "Update" or "Publish".',
        };
      case 'shopify':
        return {
          title: 'Shopify Integration',
          step1: 'In Shopify Theme Editor, click "Add section" → "Custom Liquid" or "Custom HTML".',
          step2: 'Paste the code snippet below and click "Save".',
        };
      case 'framer':
        return {
          title: 'Framer Integration',
          step1: 'In Framer, open the Insert menu (shortcut I), choose Utility → "Embed".',
          step2: 'Set embed type to "HTML", paste the snippet below, and set width to 100%.',
        };
      case 'react':
        return {
          title: 'React / Next.js',
          step1: 'Drop this JSX iframe component into your page or testimonials section.',
          step2: 'It runs dynamically on the client with zero build-time bundling overhead.',
        };
      case 'html':
      default:
        return {
          title: 'Universal HTML Embed',
          step1: 'Copy and paste this snippet anywhere in your HTML <body> where testimonials should appear.',
          step2: 'The widget updates automatically whenever new testimonials are approved.',
        };
    }
  };

  const handleCopyCode = async () => {
    if (!projectWidgetId) return;
    try {
      await navigator.clipboard.writeText(getEmbedSnippet());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const guide = getCmsGuide();

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-1 transition-colors cursor-pointer mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#6701e6] text-xs font-bold uppercase tracking-wider border border-purple-200">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic Widget Studio
            </div>
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-950 tracking-tight">
            Embeddable Testimonial Widgets
          </h2>
          <p className="text-sm text-gray-500">
            Publish once. When you approve new testimonials in Panda Praise, your live website widgets update automatically.
          </p>
        </div>

        {/* Widget Format Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 self-start md:self-auto">
          {[
            { id: 'wall', label: 'Grid / Wall', icon: Layers },
            { id: 'carousel', label: 'Carousel', icon: Maximize2 },
            { id: 'spotlight', label: 'Single Card', icon: Sparkles },
            { id: 'badge', label: 'Trust Badge', icon: Award },
            { id: 'floating_tab', label: 'Floating Tab', icon: MessageSquarePlus },
            { id: 'social_toast', label: 'Social Toast', icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = settings.type === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSettings((prev) => ({ ...prev, type: item.id as WidgetType }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#6701e6] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Customizer (Left) & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls & Dynamic Rules */}
        <div className="space-y-6">
          {/* Dynamic Selection Rules */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#6701e6]" />
              Testimonial Selection Mode
            </h3>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setSelectionMode('auto')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  selectionMode === 'auto'
                    ? 'bg-white text-[#6701e6] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ✨ Auto-Add (Dynamic)
              </button>
              <button
                onClick={() => setSelectionMode('manual')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                  selectionMode === 'manual'
                    ? 'bg-white text-[#6701e6] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎯 Manual Selection
              </button>
            </div>

            {selectionMode === 'auto' ? (
              <div className="space-y-3 pt-2">
                <p className="text-[11px] text-gray-500 leading-normal">
                  Automatically populates with all qualifying testimonials. Updates automatically without editing your website.
                </p>

                {/* Min Rating Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6]"
                  >
                    <option value={0}>All Ratings (1–5 Stars)</option>
                    <option value={4}>4+ Stars Only</option>
                    <option value={5}>5 Stars Only (Top Proof)</option>
                  </select>
                </div>

                {/* Tag Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Filter by Tag
                  </label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:border-[#6701e6]"
                  >
                    <option value="all">All Tags (Entire Library)</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>
                        #{tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2 max-h-48 overflow-y-auto pr-1">
                <p className="text-[11px] text-gray-500 mb-2">
                  Pick specific testimonials to fix permanently in this widget:
                </p>
                {approvedReviews.map((r) => {
                  const isChecked = selectedReviewIds.includes(r.id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => toggleManualReview(r.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        isChecked
                          ? 'bg-purple-50/70 border-[#6701e6]/40 text-gray-900 font-semibold'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-[#6701e6] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span className="truncate">{r.name}</span>
                      </div>
                      <span className="text-[10px] text-amber-500 font-bold shrink-0">
                        ★ {r.rating}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Layout & Styling Controls */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#6701e6]" />
              Layout & Appearance
            </h3>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Theme</span>
              <div className="flex items-center p-0.5 bg-gray-100 rounded-lg border border-gray-200">
                <button
                  onClick={() => setSettings((prev) => ({ ...prev, theme: 'light' }))}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    settings.theme === 'light'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setSettings((prev) => ({ ...prev, theme: 'dark' }))}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Primary Accent Color */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Accent Color</span>
              <div className="flex items-center gap-2">
                {['#6701e6', '#2563eb', '#10b981', '#f59e0b', '#ec4899'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSettings((prev) => ({ ...prev, primaryColor: c }))}
                    className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer ${
                      settings.primaryColor === c ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Max Items */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700">Maximum Display Count</span>
                <span className="text-[#6701e6] font-bold">{settings.maxCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={settings.maxCount}
                onChange={(e) => setSettings((prev) => ({ ...prev, maxCount: Number(e.target.value) }))}
                className="w-full accent-[#6701e6] cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-2.5 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.onlyFeatured}
                  onChange={(e) => setSettings((prev) => ({ ...prev, onlyFeatured: e.target.checked }))}
                  className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6]"
                />
                <span>Only Featured Reviews</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showRating}
                  onChange={(e) => setSettings((prev) => ({ ...prev, showRating: e.target.checked }))}
                  className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6]"
                />
                <span>Display Star Ratings</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showAvatar}
                  onChange={(e) => setSettings((prev) => ({ ...prev, showAvatar: e.target.checked }))}
                  className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6]"
                />
                <span>Display Customer Photos</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCompany}
                  onChange={(e) => setSettings((prev) => ({ ...prev, showCompany: e.target.checked }))}
                  className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6]"
                />
                <span>Display Company & Role</span>
              </label>
            </div>
          </div>

          {/* Embed Code & Platform Guidance */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-[#6701e6]" />
              Publish on Your Website
            </h4>

            {/* Platform Tabs */}
            <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-xl text-[11px] font-semibold">
              {[
                { id: 'html', label: 'HTML' },
                { id: 'webflow', label: 'Webflow' },
                { id: 'wordpress', label: 'WordPress' },
                { id: 'shopify', label: 'Shopify' },
                { id: 'framer', label: 'Framer' },
                { id: 'react', label: 'React' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCmsPlatform(p.id as CmsPlatform)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    cmsPlatform === p.id
                      ? 'bg-white text-[#6701e6] font-bold shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Platform Instructions Box */}
            <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 text-xs text-gray-700 space-y-1">
              <p className="font-bold text-[#6701e6]">{guide.title}</p>
              <p className="text-[11px] text-gray-600">1. {guide.step1}</p>
              <p className="text-[11px] text-gray-600">2. {guide.step2}</p>
            </div>

            {/* Code Box */}
            <div className="p-3 rounded-xl bg-gray-950 font-mono text-[11px] text-gray-300 border border-gray-800 overflow-x-auto">
              <code>{getEmbedSnippet()}</code>
            </div>

            <button
              onClick={handleCopyCode}
              className="w-full py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Embed Snippet'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Interactive Widget Preview Canvas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#6701e6]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Live Interactive Preview
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Matching {displayReviews.length} approved testimonials</span>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div
            className={`flex-1 rounded-2xl p-6 transition-colors overflow-hidden ${
              settings.theme === 'dark'
                ? 'bg-gray-950 border border-gray-800 text-white'
                : 'bg-gray-50/90 border border-gray-200 text-gray-900'
            }`}
          >
            {displayReviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6701e6] flex items-center justify-center mb-3">
                  <Filter className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">No Matching Testimonials</h4>
                <p className="text-xs text-gray-500 max-w-sm mb-4">
                  No approved testimonials currently meet your filter criteria (Min Rating: {minRating || 'Any'}, Tag: {selectedTag}).
                </p>
                <button
                  onClick={() => {
                    setMinRating(0);
                    setSelectedTag('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#6701e6] text-white text-xs font-bold cursor-pointer"
                >
                  Reset Filter Rules
                </button>
              </div>
            ) : settings.type === 'wall' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayReviews.map((r) => (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-gray-900 border-gray-800 text-gray-100'
                        : 'bg-white border-gray-200 text-gray-900 shadow-2xs'
                    }`}
                  >
                    {settings.showRating && (
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-xs leading-relaxed italic mb-3">"{r.content}"</p>
                    <div className="flex items-center gap-2.5">
                      {settings.showAvatar && (
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-purple-100 shrink-0">
                          {r.avatarUrl ? (
                            <img src={r.avatarUrl} alt={r.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-[#6701e6] flex items-center justify-center h-full">
                              {r.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold leading-tight">{r.name}</p>
                        {settings.showCompany && (
                          <p className="text-[10px] text-gray-500">
                            {r.role} {r.company ? `• ${r.company}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : settings.type === 'carousel' ? (
              <div className="flex flex-col items-center justify-center p-6 space-y-4">
                {displayReviews[carouselIndex % displayReviews.length] && (
                  <div
                    className={`w-full max-w-lg p-6 rounded-2xl border text-center transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-gray-900 border-gray-800 text-white'
                        : 'bg-white border-gray-200 text-gray-900 shadow-md'
                    }`}
                  >
                    {settings.showRating && (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < displayReviews[carouselIndex % displayReviews.length].rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-sm italic leading-relaxed mb-4">
                      "{displayReviews[carouselIndex % displayReviews.length].content}"
                    </p>
                    <div className="flex flex-col items-center gap-1">
                      {settings.showAvatar && (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 mb-1">
                          {displayReviews[carouselIndex % displayReviews.length].avatarUrl ? (
                            <img
                              src={displayReviews[carouselIndex % displayReviews.length].avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-[#6701e6] flex items-center justify-center h-full">
                              {displayReviews[carouselIndex % displayReviews.length].name.charAt(0)}
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs font-bold">
                        {displayReviews[carouselIndex % displayReviews.length].name}
                      </p>
                      {settings.showCompany && (
                        <p className="text-[11px] text-gray-500">
                          {displayReviews[carouselIndex % displayReviews.length].role}{' '}
                          {displayReviews[carouselIndex % displayReviews.length].company
                            ? `• ${displayReviews[carouselIndex % displayReviews.length].company}`
                            : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* Carousel Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setCarouselIndex((prev) => (prev > 0 ? prev - 1 : displayReviews.length - 1))
                    }
                    className="p-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-gray-500">
                    {(carouselIndex % displayReviews.length) + 1} / {displayReviews.length}
                  </span>
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev + 1) % displayReviews.length)}
                    className="p-2 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : settings.type === 'badge' ? (
              <div className="h-full flex items-center justify-center">
                <div
                  className={`inline-flex items-center gap-3 px-5 py-3 rounded-2xl border ${
                    settings.theme === 'dark'
                      ? 'bg-gray-900 border-gray-800 text-white'
                      : 'bg-white border-gray-200 text-gray-900 shadow-md'
                  }`}
                >
                  <div className="flex -space-x-2">
                    {displayReviews.slice(0, 3).map((r, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-purple-100"
                      >
                        {r.avatarUrl ? (
                          <img src={r.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-[#6701e6] flex items-center justify-center h-full">
                            {r.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs font-bold ml-1">{avgRating} / 5.0</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">
                      Rated by {approvedReviews.length}+ satisfied customers
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <p className="text-xs text-gray-500 mb-2">Interactive floating widget preview</p>
                <div className="p-4 rounded-xl bg-purple-50 text-[#6701e6] text-xs font-bold border border-purple-200">
                  {settings.type === 'floating_tab'
                    ? '⭐ Floating Drawer ready to embed'
                    : '🔔 Social Proof Notification Toasts active'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
