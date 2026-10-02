import React, { useState, useEffect } from 'react';
import { getFirebaseAuth } from '../../../lib/firebase';
import { socialClient } from '../../../lib/socialClient';
import { 
  X, 
  Check, 
  AlertCircle,
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Link as LinkIcon, 
  CheckCircle2, 
  MapPin, 
  Star,
  CheckSquare,
  Square
} from 'lucide-react';

const FacebookBrandIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface PlatformItem {
  id: string;
  name: string;
  category: 'Available now' | 'Coming soon';
  type: 'url' | 'api';
  icon: string;
  color: string;
  sampleUrl?: string;
  inputLabel?: string;
  placeholder?: string;
}

const PLATFORMS: PlatformItem[] = [
  { id: 'google', name: 'Google Reviews', category: 'Available now', type: 'url', icon: 'https://www.google.com/favicon.ico', color: '#4285F4', inputLabel: 'Google Maps Business Link or Place ID', placeholder: 'https://maps.app.goo.gl/... or https://maps.google.com/...' },
  { id: 'facebook', name: 'Facebook Page', category: 'Available now', type: 'url', icon: 'https://facebook.com/favicon.ico', color: '#1877F2', inputLabel: 'Facebook Page URL or Reviews Link', placeholder: 'https://facebook.com/yourpage or https://facebook.com/yourpage/reviews' },
  { id: 'trustpilot', name: 'Trustpilot', category: 'Available now', type: 'url', icon: 'https://www.trustpilot.com/favicon.ico', color: '#00B67A', inputLabel: 'Trustpilot Business Link or Domain', placeholder: 'https://www.trustpilot.com/review/company.com or company.com' },
  { id: 'appstore', name: 'App Store', category: 'Available now', type: 'url', icon: 'https://www.apple.com/favicon.ico', color: '#0070c9', inputLabel: 'App Store App Link or ID', placeholder: 'https://apps.apple.com/app/id123456789' },
  { id: 'producthunt', name: 'Product Hunt', category: 'Available now', type: 'url', icon: 'https://www.producthunt.com/favicon.ico', color: '#DA552F', inputLabel: 'Product Hunt Product Link', placeholder: 'https://www.producthunt.com/products/your-product/reviews' },
  { id: 'g2', name: 'G2', category: 'Available now', type: 'url', icon: 'https://www.g2.com/favicon.ico', color: '#FF492C', inputLabel: 'G2 Product Reviews Link', placeholder: 'https://www.g2.com/products/your-product/reviews' },
  { id: 'capterra', name: 'Capterra', category: 'Available now', type: 'url', icon: 'https://www.capterra.com/favicon.ico', color: '#00587C', inputLabel: 'Capterra Vendor Profile Link', placeholder: 'https://www.capterra.com/p/123456/Your-Product/' },
  { id: 'yelp', name: 'Yelp', category: 'Available now', type: 'url', icon: 'https://www.yelp.com/favicon.ico', color: '#D32323', inputLabel: 'Yelp Business Page Link', placeholder: 'https://www.yelp.com/biz/your-business-name' },
  { id: 'playstore', name: 'Google Play', category: 'Available now', type: 'url', icon: 'https://play.google.com/favicon.ico', color: '#01875f', inputLabel: 'Google Play Store Link or Package Name', placeholder: 'https://play.google.com/store/apps/details?id=com.app' },
  { id: 'twitter', name: 'Twitter / X', category: 'Available now', type: 'url', icon: 'https://twitter.com/favicon.ico', color: '#000000', inputLabel: 'Tweet or Post Link', placeholder: 'https://x.com/username/status/1234567890' },
  { id: 'reddit', name: 'Reddit', category: 'Available now', type: 'url', icon: 'https://www.reddit.com/favicon.ico', color: '#FF4500', inputLabel: 'Reddit Post or Comment Link', placeholder: 'https://www.reddit.com/r/saas/comments/...' },
  { id: 'instagram', name: 'Instagram', category: 'Available now', type: 'url', icon: 'https://instagram.com/favicon.ico', color: '#E4405F', inputLabel: 'Instagram Post or Reel URL', placeholder: 'https://www.instagram.com/p/... or https://www.instagram.com/reel/...' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Available now', type: 'url', icon: 'https://www.linkedin.com/favicon.ico', color: '#0A66C2', inputLabel: 'LinkedIn Post or Recommendation URL', placeholder: 'https://www.linkedin.com/posts/username_...' },
  { id: 'shopify', name: 'Shopify', category: 'Available now', type: 'url', icon: 'https://www.shopify.com/favicon.ico', color: '#96bf48', inputLabel: 'Shopify App or Store Reviews URL', placeholder: 'https://apps.shopify.com/your-app or your-store.myshopify.com' },
  { id: 'amazon', name: 'Amazon', category: 'Available now', type: 'url', icon: 'https://www.amazon.com/favicon.ico', color: '#FF9900', inputLabel: 'Amazon Product Reviews URL', placeholder: 'https://www.amazon.com/dp/B000XXXXXX' },
  { id: 'udemy', name: 'Udemy', category: 'Available now', type: 'url', icon: 'https://www.udemy.com/favicon.ico', color: '#A435F0', inputLabel: 'Udemy Course URL', placeholder: 'https://www.udemy.com/course/your-course-name/' },
  { id: 'airbnb', name: 'Airbnb', category: 'Available now', type: 'url', icon: 'https://www.airbnb.com/favicon.ico', color: '#FF5A5F', inputLabel: 'Airbnb Listing URL', placeholder: 'https://www.airbnb.com/rooms/12345678' },
  { id: 'whop', name: 'Whop', category: 'Available now', type: 'url', icon: 'https://whop.com/favicon.ico', color: '#FF5C00', inputLabel: 'Whop Product or Reviews URL', placeholder: 'https://whop.com/your-store' },
  { id: 'wordpress', name: 'WordPress', category: 'Available now', type: 'url', icon: 'https://wordpress.org/favicon.ico', color: '#21759B', inputLabel: 'WordPress Plugin or Theme URL', placeholder: 'https://wordpress.org/plugins/your-plugin/' },
  { id: 'discourse', name: 'Discourse', category: 'Available now', type: 'url', icon: 'https://www.discourse.org/favicon.ico', color: '#2B3B48', inputLabel: 'Discourse Topic or Post URL', placeholder: 'https://community.yourcompany.com/t/topic/1234' },
  { id: 'web', name: 'Web Page / Any Link', category: 'Available now', type: 'url', icon: 'https://www.google.com/s2/favicons?domain=example.com', color: '#4F46E5', inputLabel: 'Website or Testimonials Page URL', placeholder: 'https://example.com/testimonials or any public review link' },
];

interface ConnectSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlatform: (platformId: string) => void;
  projectId?: string;
  initialPlatform?: string;
}

export const ConnectSourceModal: React.FC<ConnectSourceModalProps> = ({
  isOpen,
  onClose,
  onSelectPlatform,
  projectId,
  initialPlatform,
}) => {
  const [step, setStep] = useState<'select' | 'configure' | 'preview' | 'profile_capture'>(initialPlatform ? 'configure' : 'select');
  const [selectedId, setSelectedId] = useState<string>(initialPlatform || 'google');
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialPlatform) {
        setSelectedId(initialPlatform);
        setStep('configure');
      } else {
        setStep('select');
      }
    }
  }, [isOpen, initialPlatform]);

  // Configure Step State
  const [inputUrl, setInputUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [importError, setImportError] = useState<string>('');
  const [foundCount, setFoundCount] = useState<number>(0);
  const [detectedLocationName, setDetectedLocationName] = useState<string>('');
  const [autoBackgroundSync] = useState<boolean>(() => {
    return localStorage.getItem('pandapraise_facebook_auto_sync') !== 'false';
  });

  // Preview & Selection State (PandaPraise Direct Universal Importer)
  const [extractedReviews, setExtractedReviews] = useState<any[]>([]);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [resolvedEntity, setResolvedEntity] = useState<any>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  // Profile Capture State (when 0 automated reviews exist on a personal profile/link)
  const [customAuthor, setCustomAuthor] = useState('');
  const [customQuote, setCustomQuote] = useState('');
  const [customRating, setCustomRating] = useState(5);

  if (!isOpen) return null;

  const currentPlatform = PLATFORMS.find((p) => p.id === selectedId) || PLATFORMS[0];

  const handleSelectPlatform = (id: string) => {
    setSelectedId(id);
    setSyncSuccess(false);
    setImportError('');
    setInputUrl('');
    setDetectedLocationName('');
    setExtractedReviews([]);
    setSelectedReviewIds([]);
    setResolvedEntity(null);
  };

  const handleContinue = () => {
    setStep('configure');
    setSyncSuccess(false);
    setImportError('');
    setIsProcessing(false);
  };

  const handleBackToSelect = () => {
    setStep('select');
    setSyncSuccess(false);
    setImportError('');
    setIsProcessing(false);
  };

  const handleClose = () => {
    setStep('select');
    setSyncSuccess(false);
    setImportError('');
    setIsProcessing(false);
    setInputUrl('');
    setDetectedLocationName('');
    setExtractedReviews([]);
    setSelectedReviewIds([]);
    setResolvedEntity(null);
    onClose();
  };

  const handleGoogleOAuthRedirect = async () => {
    setIsProcessing(true);
    const res = await socialClient.initOAuth('google');
    if (res.error) {
      setIsProcessing(false);
      setImportError(res.error);
      return;
    }
    if (res.authUrl) {
      window.location.href = res.authUrl;
    } else {
      setIsProcessing(false);
      setImportError('Failed to start Google sign-in. Please try again.');
    }
  };

  const handleFacebookOAuthRedirect = async () => {
    localStorage.setItem('pandapraise_facebook_auto_sync', autoBackgroundSync ? 'true' : 'false');
    setIsProcessing(true);
    const res = await socialClient.initOAuth('facebook');
    if (res.error) {
      setIsProcessing(false);
      setImportError(res.error);
      return;
    }
    if (res.authUrl) {
      window.location.href = res.authUrl;
    } else {
      setIsProcessing(false);
      setImportError('Failed to start Facebook sign-in. Please try again.');
    }
  };

  /**
   * Direct Zero-Auth URL Resolution
   */
  const handleExecuteImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setImportError('Please enter a valid review page or public profile link.');
      return;
    }

    setIsProcessing(true);
    setImportError('');

    try {
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const response = await fetch('/api/import/resolve-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          url: inputUrl.trim(),
          platform: selectedId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract reviews from this link. Please check the URL.');
      }

      setResolvedEntity(data.entity || { name: currentPlatform.name, url: inputUrl });
      const reviews = Array.isArray(data.reviews) ? data.reviews : [];
      setExtractedReviews(reviews);
      setSelectedReviewIds(reviews.map((r: any) => r.id));
      setIsProcessing(false);

      if (reviews.length > 0) {
        // Move to interactive review selection preview
        setStep('preview');
      } else {
        // Zero reviews found on this link (e.g. personal profile, custom page)
        // Transition to profile capture so they can capture client praise from this profile
        setCustomAuthor(data.entity?.name ? `${data.entity.name}'s Client` : 'Client');
        setCustomQuote('');
        setCustomRating(5);
        setStep('profile_capture');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setImportError(err.message || 'Failed to resolve reviews. Please check the link and try again.');
    }
  };

  /**
   * Saves a testimonial / client quote from a personal profile or post
   */
  const handleSaveProfileQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuote.trim()) {
      setImportError('Please enter the testimonial text or client praise.');
      return;
    }

    setIsCommitting(true);
    setImportError('');

    try {
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const response = await fetch('/api/import/commit-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          projectId,
          platform: selectedId,
          sourceUrl: inputUrl.trim(),
          reviews: [
            {
              id: `${selectedId}_profile_quote_${Date.now()}`,
              authorName: customAuthor.trim() || (resolvedEntity?.name ? `Client of ${resolvedEntity.name}` : 'Verified Client'),
              authorAvatar: resolvedEntity?.avatar,
              rating: customRating,
              text: customQuote.trim(),
              date: new Date().toISOString(),
              platformUrl: inputUrl.trim(),
              source: selectedId,
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save testimonial into canonical store.');
      }

      setFoundCount(data.importedCount || 1);
      setDetectedLocationName(resolvedEntity?.name || currentPlatform.name);
      setSyncSuccess(true);
    } catch (err: any) {
      setImportError(err.message || 'Failed to save testimonial. Please try again.');
    } finally {
      setIsCommitting(false);
    }
  };

  /**
   * Commit selected reviews into Panda Praise canonical store
   */
  const handleCommitReviews = async () => {
    if (selectedReviewIds.length === 0) {
      setImportError('Please select at least one review to import.');
      return;
    }

    setIsCommitting(true);
    setImportError('');

    try {
      const reviewsToCommit = extractedReviews.filter((r) => selectedReviewIds.includes(r.id));
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const response = await fetch('/api/import/commit-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          projectId,
          platform: selectedId,
          sourceUrl: inputUrl.trim(),
          reviews: reviewsToCommit,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to import reviews into canonical store.');
      }

      setFoundCount(data.importedCount || reviewsToCommit.length);
      setDetectedLocationName(resolvedEntity?.name || currentPlatform.name);
      setSyncSuccess(true);
    } catch (err: any) {
      setImportError(err.message || 'Failed to save testimonials. Please try again.');
    } finally {
      setIsCommitting(false);
    }
  };

  const toggleSelectReview = (id: string) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviewIds.length === extractedReviews.length) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(extractedReviews.map((r) => r.id));
    }
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
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-8 animate-slide-up flex flex-col text-left max-h-[90vh] overflow-y-auto">
        
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
            <div className="text-center space-y-1.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6701e6] flex items-center justify-center mx-auto mb-2 border border-purple-100 shadow-2xs">
                <Sparkles className="w-5 h-5 fill-[#6701e6]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight font-display">
                Connect Source (Zero-OAuth Import)
              </h2>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Import reviews instantly by pasting any public link — no passwords or OAuth app review required.
              </p>
            </div>

            {/* Platform Grid */}
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
              <span className="text-[11px] text-gray-400">
                Powered by Zero-Auth Extractor
              </span>

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
        {step === 'configure' && !syncSuccess && (
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

              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Zero-Auth URL Import
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
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Instant Link
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500 truncate">
                  Paste the public link to fetch verified reviews with zero authentication barriers.
                </p>
              </div>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                <span>{importError}</span>
              </div>
            )}

            {/* ── SPECIALIZED FACEBOOK VIEW ── */}
            {selectedId === 'facebook' ? (
              <div className="space-y-4">
                {/* Primary Zero-Auth URL Form */}
                <form onSubmit={handleExecuteImport} className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-blue-50/30 border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <FacebookBrandIcon className="w-3.5 h-3.5 text-[#1877F2]" />
                      <span>Instant Facebook Page Import (Zero OAuth Login)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      Direct Zero-Auth
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Paste your public Facebook Page or Reviews link. We extract public reviews and ratings without requiring Meta Business Verification.
                  </p>

                  <div className="space-y-1.5">
                    <input
                      type="url"
                      required
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://facebook.com/your-page or https://facebook.com/your-page/reviews"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-blue-200 text-gray-900 font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md active:scale-[0.99] disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Fetching Facebook Reviews...</span>
                      </>
                    ) : (
                      <>
                        <span>Fetch Facebook Reviews</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Optional Meta OAuth background sync */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-700">Need real-time background webhook sync?</span>
                    <button
                      type="button"
                      onClick={handleFacebookOAuthRedirect}
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline text-[11px]"
                    >
                      Connect Meta OAuth &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedId === 'google' ? (
              /* ── SPECIALIZED GOOGLE REVIEWS VIEW ── */
              <div className="space-y-4">
                <form onSubmit={handleExecuteImport} className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Google Maps Review Import (Zero OAuth Login)</span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                      Public Link
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800/80 leading-relaxed">
                    Paste your Google Maps link or Place ID. We fetch verified reviews directly.
                  </p>
                  <input
                    type="text"
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/... or https://maps.google.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white border border-blue-200 text-gray-900 font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#4285F4]/20 focus:border-[#4285F4] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md active:scale-[0.99] disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Resolving Google Place...</span>
                      </>
                    ) : (
                      <>
                        <span>Fetch Google Reviews</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-700">Are you the verified business owner?</span>
                    <button
                      type="button"
                      onClick={handleGoogleOAuthRedirect}
                      className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline text-[11px]"
                    >
                      Connect Business Profile OAuth &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── UNIVERSAL ZERO-AUTH URL FORM FOR TRUSTPILOT, APP STORE, PRODUCT HUNT, G2, ETC. ── */
              <form onSubmit={handleExecuteImport} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span>{currentPlatform.inputLabel || 'Enter public review page link:'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder={currentPlatform.placeholder || 'https://...'}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all"
                  />
                  <p className="text-[11px] text-gray-500">
                    Zero authentication barriers. We extract verified star ratings, customer text, and author avatars directly.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleBackToSelect}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Fetching Reviews...</span>
                      </>
                    ) : (
                      <>
                        <span>Fetch Reviews</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ── STEP 3: PREVIEW & SELECTION ── */}
        {step === 'preview' && !syncSuccess && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Link</span>
              </button>

              <span className="text-xs font-bold text-gray-700">
                {selectedReviewIds.length} of {extractedReviews.length} selected
              </span>
            </div>

            {/* Entity Header Banner */}
            {resolvedEntity && (
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
                {resolvedEntity.avatar && (
                  <img
                    src={resolvedEntity.avatar}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {resolvedEntity.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {typeof resolvedEntity.rating === 'number' && (
                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {resolvedEntity.rating.toFixed(1)}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {extractedReviews.length} reviews found
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#6701e6] bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                >
                  {selectedReviewIds.length === extractedReviews.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}

            {/* Reviews Scrollable List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {extractedReviews.map((rev) => {
                const isChecked = selectedReviewIds.includes(rev.id);
                return (
                  <div
                    key={rev.id}
                    onClick={() => toggleSelectReview(rev.id)}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-purple-50/50 border-[#6701e6]/40'
                        : 'bg-white border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="mt-0.5 text-[#6701e6]">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 fill-purple-100 text-[#6701e6]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 truncate">{rev.authorName}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 line-clamp-3 leading-relaxed text-[11px]">
                        {rev.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Commit Button */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCommitReviews}
                disabled={isCommitting || selectedReviewIds.length === 0}
                className="px-5 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
              >
                {isCommitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Import {selectedReviewIds.length} Testimonials</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3B: PROFILE & POST TESTIMONIAL CAPTURE (When 0 automated reviews exist) ── */}
        {step === 'profile_capture' && !syncSuccess && (
          <form onSubmit={handleSaveProfileQuote} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Try Another Link</span>
              </button>

              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                1-Click Profile Testimonial
              </span>
            </div>

            {/* Resolved Profile Banner */}
            {resolvedEntity && (
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
                {resolvedEntity.avatar ? (
                  <img
                    src={resolvedEntity.avatar}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1877F2] flex items-center justify-center font-bold text-xs">
                    fb
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 truncate flex items-center gap-1">
                    <span>{resolvedEntity.name}</span>
                  </h4>
                  <p className="text-[10.5px] text-gray-400 truncate">
                    {inputUrl}
                  </p>
                </div>
              </div>
            )}

            {/* Clarification banner */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 leading-relaxed space-y-1">
              <span className="font-bold block">
                💡 Personal profile detected (No public Reviews tab)
              </span>
              <span>
                Facebook only publishes automatic star ratings on <strong>Business Pages</strong>. Since you do business through your profile, you can capture customer comments, timeline recommendations, or message praise directly below:
              </span>
            </div>

            {/* Reviewer / Client Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Client / Reviewer Name:
              </label>
              <input
                type="text"
                required
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all"
              />
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Rating:
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCustomRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= customRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-600 ml-1.5">{customRating} Stars</span>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Testimonial / Praise Text:
              </label>
              <textarea
                required
                rows={3}
                value={customQuote}
                onChange={(e) => setCustomQuote(e.target.value)}
                placeholder="Paste the recommendation, comment praise, or feedback received on this profile..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStep('configure')}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isCommitting || !customQuote.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
              >
                {isCommitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Save to Proof Vault</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 4: SUCCESS STATE ── */}
        {syncSuccess && (
          <div className="space-y-4 text-center py-2 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-900">
                Testimonials Imported Successfully!
              </h4>
              <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                Imported <strong className="text-emerald-700">{foundCount} verified {foundCount === 1 ? 'testimonial' : 'testimonials'}</strong> {detectedLocationName ? `from "${detectedLocationName}"` : `via ${currentPlatform.name}`}.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between text-gray-500 text-[11px]">
                <span>Source Platform:</span>
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <img src={currentPlatform.icon} alt="" className="w-3 h-3" />
                  {currentPlatform.name}
                </span>
              </div>
              {detectedLocationName && (
                <div className="flex items-center justify-between text-gray-500 text-[11px]">
                  <span>Source Reference:</span>
                  <span className="font-bold text-gray-800 truncate max-w-[200px]">{detectedLocationName}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-gray-500 text-[11px]">
                <span>Target Inbox:</span>
                <span className="font-bold text-[#6701e6]">Canonical Proof Vault (/reviews)</span>
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
    </div>
  );
};
