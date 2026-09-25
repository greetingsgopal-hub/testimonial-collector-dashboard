import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Link as LinkIcon, 
  KeyRound, 
  CheckCircle2, 
  Search,
  ShieldCheck
} from 'lucide-react';

interface PlatformItem {
  id: string;
  name: string;
  category: string;
  type: 'url' | 'api';
  icon: string;
  color: string;
  sampleUrl?: string;
  inputLabel?: string;
  placeholder?: string;
}

const PLATFORMS: PlatformItem[] = [
  { id: 'google', name: 'Google', category: 'Reviews', type: 'api', icon: 'https://www.google.com/favicon.ico', color: '#4285F4', inputLabel: 'Google Business Place ID / Profile URL', placeholder: 'e.g. ChIJN1t_tDeuEmsRUsoyG83frY4 or https://maps.google.com/...' },
  { id: 'facebook', name: 'Facebook', category: 'Social', type: 'url', icon: 'https://facebook.com/favicon.ico', color: '#1877F2', inputLabel: 'Public Post or Recommendation URL', placeholder: 'https://facebook.com/page/posts/12345...' },
  { id: 'twitter', name: 'Twitter / X', category: 'Social', type: 'url', icon: 'https://twitter.com/favicon.ico', color: '#000000', inputLabel: 'Tweet / Post URL', placeholder: 'https://x.com/username/status/1234567890' },
  { id: 'g2', name: 'G2', category: 'B2B Software', type: 'api', icon: 'https://www.g2.com/favicon.ico', color: '#FF492C', inputLabel: 'G2 Product URL or API Token', placeholder: 'https://www.g2.com/products/your-product/reviews' },
  { id: 'trustpilot', name: 'Trustpilot', category: 'Reviews', type: 'api', icon: 'https://www.trustpilot.com/favicon.ico', color: '#00B67A', inputLabel: 'Trustpilot Business Domain / API Key', placeholder: 'e.g. yourcompany.com or API Token' },
  { id: 'producthunt', name: 'Product Hunt', category: 'Launches', type: 'url', icon: 'https://www.producthunt.com/favicon.ico', color: '#DA552F', inputLabel: 'Product Hunt Review / Comment URL', placeholder: 'https://www.producthunt.com/posts/your-product#reviews' },
  { id: 'capterra', name: 'Capterra', category: 'B2B Software', type: 'api', icon: 'https://www.capterra.com/favicon.ico', color: '#00587C', inputLabel: 'Capterra Vendor Profile URL', placeholder: 'https://www.capterra.com/p/123456/Your-Product/' },
  { id: 'yelp', name: 'Yelp', category: 'Local', type: 'api', icon: 'https://www.yelp.com/favicon.ico', color: '#D32323', inputLabel: 'Yelp Business URL', placeholder: 'https://www.yelp.com/biz/your-business-name' },
  { id: 'shopify', name: 'Shopify', category: 'Ecommerce', type: 'api', icon: 'https://www.shopify.com/favicon.ico', color: '#96bf48', inputLabel: 'Shopify Store URL & App API Key', placeholder: 'your-store.myshopify.com' },
  { id: 'udemy', name: 'Udemy', category: 'Courses', type: 'api', icon: 'https://www.udemy.com/favicon.ico', color: '#A435F0', inputLabel: 'Udemy Course URL', placeholder: 'https://www.udemy.com/course/your-course-name/' },
  { id: 'amazon', name: 'Amazon', category: 'Ecommerce', type: 'api', icon: 'https://www.amazon.com/favicon.ico', color: '#FF9900', inputLabel: 'Amazon ASIN / Product Review URL', placeholder: 'https://www.amazon.com/dp/B000XXXXXX' },
  { id: 'airbnb', name: 'Airbnb', category: 'Hospitality', type: 'api', icon: 'https://www.airbnb.com/favicon.ico', color: '#FF5A5F', inputLabel: 'Airbnb Listing URL', placeholder: 'https://www.airbnb.com/rooms/12345678' },
  { id: 'appstore', name: 'App Store', category: 'Mobile Apps', type: 'api', icon: 'https://www.apple.com/favicon.ico', color: '#0070c9', inputLabel: 'App Store App ID / URL', placeholder: 'https://apps.apple.com/app/id123456789' },
  { id: 'playstore', name: 'Google Play', category: 'Mobile Apps', type: 'api', icon: 'https://play.google.com/favicon.ico', color: '#01875f', inputLabel: 'Google Play Package Name / URL', placeholder: 'com.yourcompany.app' },
  { id: 'whop', name: 'Whop', category: 'Communities', type: 'api', icon: 'https://whop.com/favicon.ico', color: '#FF5C00', inputLabel: 'Whop Experience / Store URL', placeholder: 'https://whop.com/your-store' },
  { id: 'wordpress', name: 'WordPress', category: 'CMS', type: 'api', icon: 'https://wordpress.org/favicon.ico', color: '#21759B', inputLabel: 'WordPress Plugin / Theme Slug', placeholder: 'https://wordpress.org/plugins/your-plugin/' },
  { id: 'discourse', name: 'Discourse', category: 'Forums', type: 'url', icon: 'https://www.discourse.org/favicon.ico', color: '#2B3B48', inputLabel: 'Discourse Topic / Post URL', placeholder: 'https://community.yourcompany.com/t/topic/1234' },
  { id: 'reddit', name: 'Reddit', category: 'Social', type: 'url', icon: 'https://www.reddit.com/favicon.ico', color: '#FF4500', inputLabel: 'Reddit Post or Comment URL', placeholder: 'https://www.reddit.com/r/saas/comments/...' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Social', type: 'url', icon: 'https://www.linkedin.com/favicon.ico', color: '#0A66C2', inputLabel: 'LinkedIn Post or Recommendation URL', placeholder: 'https://www.linkedin.com/posts/username_...' },
  { id: 'tripadvisor', name: 'TripAdvisor', category: 'Travel', type: 'api', icon: 'https://www.tripadvisor.com/favicon.ico', color: '#34E0A1', inputLabel: 'TripAdvisor Business Listing URL', placeholder: 'https://www.tripadvisor.com/Restaurant_Review-...' },
  { id: 'tiktok', name: 'TikTok', category: 'Video', type: 'url', icon: 'https://www.tiktok.com/favicon.ico', color: '#000000', inputLabel: 'TikTok Video URL', placeholder: 'https://www.tiktok.com/@username/video/123456789' },
];

interface ConnectSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlatform: (platformId: string) => void;
}

export const ConnectSourceModal: React.FC<ConnectSourceModalProps> = ({
  isOpen,
  onClose,
  onSelectPlatform,
}) => {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedId, setSelectedId] = useState<string>('google');
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  // Configure Step State
  const [inputUrl, setInputUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [foundCount, setFoundCount] = useState<number>(0);

  if (!isOpen) return null;

  const currentPlatform = PLATFORMS.find((p) => p.id === selectedId) || PLATFORMS[0];

  const handleSelectPlatform = (id: string) => {
    setSelectedId(id);
    setSyncSuccess(false);
    setInputUrl('');
    setApiKey('');
  };

  const handleContinue = () => {
    setStep('configure');
    setSyncSuccess(false);
    setIsProcessing(false);
  };

  const handleBackToSelect = () => {
    setStep('select');
    setSyncSuccess(false);
    setIsProcessing(false);
  };

  const handleClose = () => {
    setStep('select');
    setSyncSuccess(false);
    setIsProcessing(false);
    setInputUrl('');
    setApiKey('');
    onClose();
  };

  const handleExecuteImport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setSyncSuccess(true);
      setFoundCount(currentPlatform.type === 'url' ? 1 : Math.floor(Math.random() * 12) + 6);
    }, 900);
  };

  const handleCompleteFlow = () => {
    onSelectPlatform(selectedId);
    handleClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-8 animate-slide-up flex flex-col text-left">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── STEP 1: SELECT PLATFORM ── */}
        {step === 'select' && (
          <div className="space-y-6">
            {/* Modal Header */}
            <div className="text-center space-y-1.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6701e6] flex items-center justify-center mx-auto mb-2 border border-purple-100 shadow-2xs">
                <Sparkles className="w-5 h-5 fill-[#6701e6]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight font-display">
                Connect Source
              </h2>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Where are you currently collecting testimonials? Select your platform to continue.
              </p>
            </div>

            {/* Platform Grid (21 items, 7 per row on desktop) */}
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2.5 p-1">
              {PLATFORMS.map((platform) => {
                const isSelected = selectedId === platform.id;
                return (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => handleSelectPlatform(platform.id)}
                    onMouseEnter={() => setHoveredName(platform.name)}
                    onMouseLeave={() => setHoveredName(null)}
                    className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#6701e6] bg-purple-50/90 shadow-sm border border-[#6701e6]/30 scale-105'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200/80 hover:border-gray-300'
                    }`}
                    title={platform.name}
                  >
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className="w-5 h-5 object-contain pointer-events-none"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-[11px] font-bold text-gray-700 sr-only">{platform.name}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6701e6] text-white rounded-full flex items-center justify-center text-[10px] shadow-2xs">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected or Hovered Label */}
            <div className="py-2.5 px-4 text-center text-xs font-semibold text-gray-600 bg-gray-50 rounded-2xl border border-gray-100 transition-all flex items-center justify-center gap-1.5">
              <span>Selected:</span>
              <span className="text-[#6701e6] font-bold">
                {hoveredName || currentPlatform.name}
              </span>
              <span className="text-gray-400 font-normal">
                ({(PLATFORMS.find((p) => p.name === (hoveredName || currentPlatform.name)) || currentPlatform).category})
              </span>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => alert('Platform source sync imports reviews via public links, direct APIs, or CSV files. All testimonials are synced directly into your inbox.')}
                className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <span>Need help? Source guide</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={handleContinue}
                className="px-6 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 hover:scale-[1.02]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: CONFIGURE & IMPORT ── */}
        {step === 'configure' && (
          <div className="space-y-5">
            {/* Header with Back button */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <button
                type="button"
                onClick={handleBackToSelect}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Platforms</span>
              </button>

              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {currentPlatform.type === 'url' ? 'Direct URL Import' : 'API & Store Sync'}
              </span>
            </div>

            {/* Platform Banner */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center p-2 shadow-2xs">
                <img
                  src={currentPlatform.icon}
                  alt={currentPlatform.name}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <span>{currentPlatform.name}</span>
                  <span className="text-[10px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                    {currentPlatform.category}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 truncate">
                  {currentPlatform.type === 'url'
                    ? 'Paste the public link to capture customer praise instantly.'
                    : 'Connect your public profile or API key to sync verified ratings.'}
                </p>
              </div>
            </div>

            {/* Form Content */}
            {!syncSuccess ? (
              <form onSubmit={handleExecuteImport} className="space-y-4">
                {currentPlatform.type === 'url' ? (
                  /* URL-based Source Input */
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>Paste the public URL of the review/post:</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder={currentPlatform.placeholder || 'https://...'}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all"
                    />
                    <p className="text-[11px] text-gray-500">
                      We'll extract the author's avatar, name, star rating, and review text automatically.
                    </p>
                  </div>
                ) : (
                  /* API / Account Connection Inputs */
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        <span>{currentPlatform.inputLabel || 'Enter Profile ID or URL:'}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder={currentPlatform.placeholder || 'e.g. your-business-slug'}
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                        <span>Enter your API Key or connect account (Optional):</span>
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="API Token / Secret Key (if required)"
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all"
                      />
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Encrypted read-only access. We never post on your behalf.</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleBackToSelect}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting & Fetching...</span>
                      </>
                    ) : (
                      <>
                        <span>{currentPlatform.type === 'url' ? 'Import Review' : 'Connect & Sync Reviews'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success State */
              <div className="space-y-4 text-center py-2 animate-scale-in">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-gray-900">
                    Connection Successful!
                  </h4>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                    Found <strong className="text-emerald-700">{foundCount} verified {foundCount === 1 ? 'testimonial' : 'testimonials'}</strong> ready to import from {currentPlatform.name}.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-left text-xs space-y-1">
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span>Source:</span>
                    <span className="font-bold text-gray-800">{currentPlatform.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span>Target Inbox:</span>
                    <span className="font-bold text-[#6701e6]">Pending Moderation (Private)</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCompleteFlow}
                    className="w-full py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    Finish & View In Proof Vault
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
