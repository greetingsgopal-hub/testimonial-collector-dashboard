import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Quote, 
  Eye, 
  Sliders,
  Layers,
  Award,
  Maximize2
} from 'lucide-react';
import { Review, WidgetType, WidgetSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface WidgetStudioProps {
  reviews: Review[];
}

export const WidgetStudio: React.FC<WidgetStudioProps> = ({ reviews }) => {
  const { project } = useAuth();
  const projectWidgetId = project?.id || '';
  const [settings, setSettings] = useState<WidgetSettings>({
    type: 'wall',
    theme: 'dark',
    primaryColor: '#8b5cf6',
    showRating: true,
    showAvatar: true,
    showDate: true,
    showCompany: true,
    maxCount: 6,
    onlyFeatured: false,
  });

  const [codeType, setCodeType] = useState<'html' | 'react'>('html');
  const [copied, setCopied] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Filter reviews for widget preview: must be approved
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const displayReviews = settings.onlyFeatured 
    ? approvedReviews.filter(r => r.isFeatured) 
    : approvedReviews;
  const slicedReviews = displayReviews.slice(0, settings.maxCount);

  const avgRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '5.0';

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
    return window.location.origin + '/w/' + projectWidgetId + '?' + params.toString();
  };

  const getEmbedSnippet = () => {
    const url = getEmbedUrl();
    if (codeType === 'react') {
      return '<iframe src="' + url + '" width="100%" height="480" style={{border: 0, borderRadius: 16}} loading="lazy" title="Customer testimonials" />';
    }
    return '<iframe src="' + url + '" width="100%" height="480" frameborder="0" loading="lazy" title="Customer testimonials" style="border:0;border-radius:16px;"></iframe>';
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

  return (
    <div className="space-y-6">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-brand-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Social Proof Studio
          </div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">
            Embeddable Testimonial Widgets
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Showcase your best customer feedback on your landing pages, docs, or checkout flow with zero performance hit.
          </p>
        </div>

        {/* Widget Type Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800 self-start md:self-auto">
          {[
            { id: 'wall', label: 'Wall of Love', icon: Layers },
            { id: 'carousel', label: 'Carousel Slider', icon: Maximize2 },
            { id: 'spotlight', label: 'Single Card', icon: Sparkles },
            { id: 'badge', label: 'Trust Badge', icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = settings.type === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSettings(prev => ({ ...prev, type: item.id as WidgetType }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Preview & Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Customizer & Code Snippet Generator */}
        <div className="space-y-6">
          
          {/* Customizer Controls */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-400" />
              Customize Layout
            </h3>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-300">Widget Theme</span>
              <div className="flex items-center p-0.5 bg-zinc-900 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    settings.theme === 'dark' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    settings.theme === 'light' ? 'bg-zinc-200 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Light
                </button>
              </div>
            </div>

            {/* Max Items */}
            {settings.type === 'wall' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300">Maximum Reviews</span>
                  <span className="text-brand-400 font-semibold">{settings.maxCount}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={settings.maxCount}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxCount: Number(e.target.value) }))}
                  className="w-full accent-brand-500 cursor-pointer"
                />
              </div>
            )}

            {/* Checkbox Options */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.onlyFeatured}
                  onChange={(e) => setSettings(prev => ({ ...prev, onlyFeatured: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-900 text-brand-600 focus:ring-brand-500"
                />
                <span>Show only Featured reviews</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showRating}
                  onChange={(e) => setSettings(prev => ({ ...prev, showRating: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-900 text-brand-600 focus:ring-brand-500"
                />
                <span>Display Star Ratings</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showAvatar}
                  onChange={(e) => setSettings(prev => ({ ...prev, showAvatar: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-900 text-brand-600 focus:ring-brand-500"
                />
                <span>Display Reviewer Avatars</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCompany}
                  onChange={(e) => setSettings(prev => ({ ...prev, showCompany: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-900 text-brand-600 focus:ring-brand-500"
                />
                <span>Display Company & Role</span>
              </label>
            </div>
          </div>

          {/* Copy Embed Code Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-brand-400" />
                Embed Code
              </h4>

              {/* Code type tabs */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setCodeType('html')}
                  className={`px-2 py-0.5 rounded ${codeType === 'html' ? 'bg-brand-500/20 text-brand-300 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setCodeType('react')}
                  className={`px-2 py-0.5 rounded ${codeType === 'react' ? 'bg-brand-500/20 text-brand-300 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  React
                </button>
              </div>

            {/* Code Box */}
            <div className="p-3 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-400 border border-zinc-800/80 overflow-x-auto">
              <code>{getEmbedSnippet()}</code>
            </div>

            <button
              onClick={handleCopyCode}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
            </button>
          </div>
        </div>

        {/* Right: Live Interactive Widget Preview Canvas */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Interactive Preview Canvas
              </span>
            </div>
            <span className="text-xs text-zinc-500">
              Displaying {slicedReviews.length} approved testimonials
            </span>
          </div>

          {/* Canvas Wrapper */}
          <div className={`flex-1 rounded-2xl p-6 transition-colors overflow-hidden ${
            settings.theme === 'dark' 
              ? 'bg-zinc-950/80 border border-zinc-800/80 text-white' 
              : 'bg-zinc-50 border border-zinc-200 text-zinc-900'
          }`}>
            
            {slicedReviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Sparkles className="w-8 h-8 text-zinc-600 mb-2" />
                <h4 className="text-sm font-semibold">No approved reviews match the filters</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Approve or feature testimonials in the Dashboard to display them in this widget.
                </p>
              </div>
            ) : null}

            {/* 1. Wall of Love Grid */}
            {settings.type === 'wall' && slicedReviews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slicedReviews.map((review) => (
                  <div 
                    key={review.id}
                    className={`rounded-xl p-4 border transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-zinc-900/70 border-zinc-800 text-zinc-200'
                        : 'bg-white border-zinc-200 text-zinc-800 shadow-sm'
                    }`}
                  >
                    {settings.showRating && (
                      <div className="flex items-center gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-xs leading-relaxed italic mb-3">"{review.content}"</p>
                    <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-800/40">
                      {settings.showAvatar && review.avatarUrl && (
                        <img
                          src={review.avatarUrl}
                          alt={review.name ? `${review.name}'s profile photo` : 'Customer avatar'}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      )}
                      <div className="text-[11px]">
                        <div className="font-semibold text-white">{review.name}</div>
                        {settings.showCompany && (
                          <div className="text-zinc-500">{review.role} {review.company ? `• ${review.company}` : ''}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Carousel Slider */}
            {settings.type === 'carousel' && slicedReviews.length > 0 && (
              <div className="h-full flex flex-col justify-between max-w-lg mx-auto py-6">
                {(() => {
                  const currentReview = slicedReviews[carouselIndex % slicedReviews.length];
                  return (
                    <div className={`p-6 rounded-2xl border ${
                      settings.theme === 'dark'
                        ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200'
                        : 'bg-white border-zinc-200 text-zinc-900 shadow-md'
                    }`}>
                      <Quote className="w-8 h-8 text-brand-400/50 mb-3" />
                      {settings.showRating && (
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= currentReview.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sm sm:text-base leading-relaxed mb-5 italic">
                        "{currentReview.content}"
                      </p>
                      <div className="flex items-center gap-3">
                        {settings.showAvatar && currentReview.avatarUrl && (
                          <img
                            src={currentReview.avatarUrl}
                            alt={currentReview.name ? `${currentReview.name}'s profile photo` : 'Customer avatar'}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/40"
                          />
                        )}
                        <div>
                          <div className="font-bold text-sm">{currentReview.name}</div>
                          {settings.showCompany && (
                            <div className="text-xs text-zinc-400">
                              {currentReview.role} {currentReview.company ? `• ${currentReview.company}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Carousel Navigation buttons */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev > 0 ? prev - 1 : slicedReviews.length - 1))}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-zinc-500">
                    {(carouselIndex % slicedReviews.length) + 1} of {slicedReviews.length}
                  </span>
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev + 1) % slicedReviews.length)}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. Single Spotlight Card */}
            {settings.type === 'spotlight' && slicedReviews.length > 0 && (
              <div className="h-full flex items-center justify-center py-6">
                {(() => {
                  const feat = slicedReviews[0];
                  return (
                    <div className={`w-full max-w-md p-6 rounded-2xl border relative overflow-hidden ${
                      settings.theme === 'dark'
                        ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200'
                        : 'bg-white border-zinc-200 text-zinc-900 shadow-lg'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= feat.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300">
                          Spotlight
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed mb-5 italic">
                        "{feat.content}"
                      </p>
                      <div className="flex items-center gap-3">
                        {feat.avatarUrl && (
                          <img
                            src={feat.avatarUrl}
                            alt={feat.name ? `${feat.name}'s profile photo` : 'Customer avatar'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-sm">{feat.name}</div>
                          <div className="text-xs text-zinc-400">{feat.role} • {feat.company}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. Trust Rating Badge */}
            {settings.type === 'badge' && (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-8">
                {/* Horizontal Floating Trust Pill */}
                <div className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-full border shadow-lg ${
                  settings.theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 text-white'
                    : 'bg-white border-zinc-200 text-zinc-900'
                }`}>
                  {/* Overlapping mini avatars */}
                  <div className="flex -space-x-2">
                    {approvedReviews.slice(0, 4).map((r, i) => (
                      <img
                        key={i}
                        src={r.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={r.name ? `${r.name}'s avatar` : 'Customer avatar'}
                        className="w-6 h-6 rounded-full ring-2 ring-zinc-900 object-cover"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-bold">{avgRating} / 5.0</span>
                  </div>

                  <span className="text-xs text-zinc-400">
                    Loved by <strong>{approvedReviews.length}+</strong> customers
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
