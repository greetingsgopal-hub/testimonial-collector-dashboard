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
  Maximize2,
  MessageSquarePlus,
  Bell
} from 'lucide-react';
import { Review, WidgetType, WidgetSettings } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { FloatingReviewDrawer } from '../widgets/FloatingReviewDrawer';
import { SocialProofToast } from '../widgets/SocialProofToast';

interface WidgetStudioProps {
  reviews: Review[];
}

export const WidgetStudio: React.FC<WidgetStudioProps> = ({ reviews }) => {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#6701e6] text-xs font-bold uppercase tracking-wider mb-2 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5" />
            Social Proof Studio
          </div>
          <h2 className="text-2xl font-bold font-display text-gray-950 tracking-tight">
            Embeddable Testimonial Widgets
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Showcase your best customer feedback on your landing pages, docs, or checkout flow with zero performance hit.
          </p>
        </div>

        {/* Widget Type Selector */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200 self-start md:self-auto">
          {[
            { id: 'floating_tab', label: '⭐ Floating Tab', icon: MessageSquarePlus },
            { id: 'social_toast', label: '🔔 Social Toast', icon: Bell },
            { id: 'wall', label: 'Wall of Love', icon: Layers },
            { id: 'carousel', label: 'Carousel', icon: Maximize2 },
            { id: 'spotlight', label: 'Single Card', icon: Sparkles },
            { id: 'badge', label: 'Trust Badge', icon: Award },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = settings.type === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSettings(prev => ({ ...prev, type: item.id as WidgetType }))}
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

      {/* Grid: Preview & Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Customizer & Code Snippet Generator */}
        <div className="space-y-6">
          
          {/* Customizer Controls */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#6701e6]" />
              Customize Layout
            </h3>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Widget Theme</span>
              <div className="flex items-center p-0.5 bg-gray-100 rounded-lg border border-gray-200">
                <button
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    settings.theme === 'dark' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    settings.theme === 'light' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
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
                  <span className="font-semibold text-gray-700">Maximum Reviews</span>
                  <span className="text-[#6701e6] font-bold">{settings.maxCount}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={settings.maxCount}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxCount: Number(e.target.value) }))}
                  className="w-full accent-[#6701e6] cursor-pointer"
                />
              </div>
            )}

            {/* Checkbox Options */}
            <div className="space-y-2.5 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.onlyFeatured}
                  onChange={(e) => setSettings(prev => ({ ...prev, onlyFeatured: e.target.checked }))}
                  className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6]"
                />
                <span>Show only Featured reviews</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showRating}
                  onChange={(e) => setSettings(prev => ({ ...prev, showRating: e.target.checked }))}
                  className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6]"
                />
                <span>Display Star Ratings</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showAvatar}
                  onChange={(e) => setSettings(prev => ({ ...prev, showAvatar: e.target.checked }))}
                  className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6]"
                />
                <span>Display Reviewer Avatars</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCompany}
                  onChange={(e) => setSettings(prev => ({ ...prev, showCompany: e.target.checked }))}
                  className="rounded border-gray-300 text-[#6701e6] focus:ring-[#6701e6]"
                />
                <span>Display Company & Role</span>
              </label>
            </div>
          </div>

          {/* Copy Embed Code Panel */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#6701e6]" />
                Embed Code
              </h4>

              {/* Code type tabs */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  onClick={() => setCodeType('html')}
                  className={`px-2.5 py-0.5 rounded cursor-pointer ${codeType === 'html' ? 'bg-purple-100 text-[#6701e6] font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setCodeType('react')}
                  className={`px-2.5 py-0.5 rounded cursor-pointer ${codeType === 'react' ? 'bg-purple-100 text-[#6701e6] font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  React
                </button>
              </div>
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
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
            </button>
          </div>
        </div>

        {/* Right: Live Interactive Widget Preview Canvas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col min-h-[460px]">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#6701e6]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Interactive Preview Canvas
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Displaying {slicedReviews.length} approved testimonials
            </span>
          </div>

          {/* Canvas Wrapper */}
          <div className={`flex-1 rounded-2xl p-6 transition-colors overflow-hidden ${
            settings.theme === 'dark' 
              ? 'bg-gray-950 border border-gray-800 text-white' 
              : 'bg-gray-50/80 border border-gray-200 text-gray-900'
          }`}>
            
            {slicedReviews.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Sparkles className="w-8 h-8 text-gray-400 mb-2" />
                <h4 className="text-sm font-bold text-gray-800">No approved reviews match the filters</h4>
                <p className="text-xs text-gray-500 mt-1">
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
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        : 'bg-white border-gray-200 text-gray-800 shadow-xs'
                    }`}
                  >
                    {settings.showRating && (
                      <div className="flex items-center gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-xs leading-relaxed italic mb-3">"{review.content}"</p>
                    <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
                      {settings.showAvatar && review.avatarUrl && (
                        <img
                          src={review.avatarUrl}
                          alt={review.name ? `${review.name}'s profile photo` : 'Customer avatar'}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      )}
                      <div className="text-[11px]">
                        <div className={`font-semibold ${settings.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{review.name}</div>
                        {settings.showCompany && (
                          <div className="text-gray-500">{review.role} {review.company ? `• ${review.company}` : ''}</div>
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
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        : 'bg-white border-gray-200 text-gray-900 shadow-xs'
                    }`}>
                      <Quote className="w-8 h-8 text-[#6701e6]/40 mb-3" />
                      {settings.showRating && (
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= currentReview.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed mb-5 italic">
                        "{currentReview.content}"
                      </p>
                      <div className="flex items-center gap-3">
                        {settings.showAvatar && currentReview.avatarUrl && (
                          <img
                            src={currentReview.avatarUrl}
                            alt={currentReview.name ? `${currentReview.name}'s profile photo` : 'Customer avatar'}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200"
                          />
                        )}
                        <div>
                          <div className="font-bold text-sm text-gray-900">{currentReview.name}</div>
                          {settings.showCompany && (
                            <div className="text-xs text-gray-500">
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
                    className="p-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-500 font-medium">
                    {(carouselIndex % slicedReviews.length) + 1} of {slicedReviews.length}
                  </span>
                  <button
                    onClick={() => setCarouselIndex((prev) => (prev + 1) % slicedReviews.length)}
                    className="p-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 transition-colors shadow-2xs cursor-pointer"
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
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-200'
                        : 'bg-white border-gray-200 text-gray-900 shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${
                                s <= feat.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
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
                          <div className="font-bold text-sm text-gray-900">{feat.name}</div>
                          <div className="text-xs text-gray-500">{feat.role} • {feat.company}</div>
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
                <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-full border shadow-sm ${
                  settings.theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}>
                  <div className="flex -space-x-2">
                    {approvedReviews.slice(0, 4).map((r, i) => (
                      <img
                        key={i}
                        src={r.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={r.name ? `${r.name}'s avatar` : 'Customer avatar'}
                        className="w-6 h-6 rounded-full ring-2 ring-white object-cover"
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

                  <span className="text-xs text-gray-500">
                    Loved by <strong className="text-gray-900">{approvedReviews.length}+</strong> customers
                  </span>
                </div>
              </div>
            )}

            {/* 5. Senja Floating Review Tab & Drawer */}
            {settings.type === 'floating_tab' && (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-8 relative min-h-[380px]">
                <div className="text-center max-w-md space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#6701e6] text-xs font-bold uppercase tracking-wider border border-purple-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    Senja-Class Interactive Floating Tab
                  </div>
                  <h4 className="text-base font-bold text-gray-900">
                    Click the floating button below to test the drawer!
                  </h4>
                  <p className="text-xs text-gray-500">
                    Visitors see this anchored on your site. Clicking it pops open your wall of reviews & collection form without leaving your page.
                  </p>
                </div>

                <FloatingReviewDrawer
                  reviews={reviews}
                  project={project}
                  tabText={settings.tabText || 'Reviews'}
                  primaryColor={settings.primaryColor}
                  position={settings.tabPosition || 'bottom-right'}
                  allowSubmit={true}
                />
              </div>
            )}

            {/* 6. Social Proof Toast */}
            {settings.type === 'social_toast' && (
              <div className="h-full flex flex-col items-center justify-center gap-4 py-8 relative min-h-[380px]">
                <div className="text-center max-w-md space-y-2 mb-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                    <Bell className="w-3.5 h-3.5 text-emerald-600" />
                    Real-Time Social Proof Popups
                  </div>
                  <h4 className="text-base font-bold text-gray-900">
                    Live Testimonial Notification Toast
                  </h4>
                  <p className="text-xs text-gray-500">
                    Subtly pops up in the corner of your website every few seconds to show real verified buyer feedback.
                  </p>
                </div>

                <SocialProofToast
                  reviews={reviews}
                  position="bottom-left"
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
