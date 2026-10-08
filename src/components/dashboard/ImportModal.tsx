import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Link as LinkIcon,
  AlertCircle,
  Sliders,
  ChevronDown,
  CheckCircle2,
  Star,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { getFirebaseAuth } from '../../lib/firebase';
import { socialClient } from '../../lib/socialClient';

export interface PlatformConfig {
  id: string;
  name: string;
  title: string;
  inputLabel: string;
  placeholder: string;
  icon: string | React.ReactNode;
  brandColor: string;
  hasOAuth?: boolean;
}

export const PLATFORM_REGISTRY: Record<string, PlatformConfig> = {
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    title: 'Import from Facebook',
    inputLabel: 'Facebook Page URL or Reviews Link',
    placeholder: 'https://facebook.com/your-page or https://facebook.com/your-page/reviews',
    brandColor: '#1877F2',
    hasOAuth: true,
    icon: (
      <svg className="w-5 h-5 text-[#1877F2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    title: 'Import from Twitter / X',
    inputLabel: 'Tweet or Post Link',
    placeholder: 'https://x.com/username/status/1234567890',
    brandColor: '#000000',
    icon: (
      <svg className="w-5 h-5 text-gray-900 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  x: {
    id: 'x',
    name: 'Twitter / X',
    title: 'Import from Twitter / X',
    inputLabel: 'Tweet or Post Link',
    placeholder: 'https://x.com/username/status/1234567890',
    brandColor: '#000000',
    icon: (
      <svg className="w-5 h-5 text-gray-900 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    title: 'Import from LinkedIn',
    inputLabel: 'LinkedIn Post or Recommendation URL',
    placeholder: 'https://www.linkedin.com/posts/username_...',
    brandColor: '#0A66C2',
    icon: (
      <svg className="w-5 h-5 text-[#0A66C2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    title: 'Import from Instagram',
    inputLabel: 'Instagram Post or Reel URL',
    placeholder: 'https://www.instagram.com/p/... or https://www.instagram.com/reel/...',
    brandColor: '#E4405F',
    icon: (
      <svg className="w-5 h-5 text-[#E4405F] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  g2: {
    id: 'g2',
    name: 'G2 Reviews',
    title: 'Import from G2',
    inputLabel: 'G2 Product Reviews Link',
    placeholder: 'https://www.g2.com/products/your-product/reviews',
    brandColor: '#FF492C',
    icon: (
      <svg className="w-5 h-5 text-[#FF492C] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  capterra: {
    id: 'capterra',
    name: 'Capterra',
    title: 'Import from Capterra',
    inputLabel: 'Capterra Vendor Profile Link',
    placeholder: 'https://www.capterra.com/p/123456/Your-Product/',
    brandColor: '#00587C',
    icon: (
      <svg className="w-5 h-5 text-[#00587C] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  yelp: {
    id: 'yelp',
    name: 'Yelp',
    title: 'Import from Yelp',
    inputLabel: 'Yelp Business Page Link',
    placeholder: 'https://www.yelp.com/biz/your-business-name',
    brandColor: '#D32323',
    icon: (
      <svg className="w-5 h-5 text-[#D32323] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    title: 'Import from Reddit',
    inputLabel: 'Reddit Post or Comment Link',
    placeholder: 'https://www.reddit.com/r/saas/comments/...',
    brandColor: '#FF4500',
    icon: (
      <svg className="w-5 h-5 text-[#FF4500] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.56 8 13.25c0 .689.56 1.25 1.25 1.25.689 0 1.25-.561 1.25-1.25 0-.69-.561-1.25-1.25-1.25zm5.5 0c-.69 0-1.25.56-1.25 1.25 0 .689.56 1.25 1.25 1.25.689 0 1.25-.561 1.25-1.25 0-.69-.561-1.25-1.25-1.25zm-5.465 4.417a.36.36 0 0 0-.256.108.358.358 0 0 0 0 .51c.883.884 2.138 1.326 3.471 1.326 1.333 0 2.588-.442 3.471-1.326a.358.358 0 0 0 0-.51.36.36 0 0 0-.51 0c-.754.755-1.848 1.118-2.961 1.118-1.114 0-2.207-.363-2.961-1.118a.358.358 0 0 0-.254-.108z"/>
      </svg>
    ),
  },
  google: {
    id: 'google',
    name: 'Google Reviews',
    title: 'Import from Google Reviews',
    inputLabel: 'Google Maps Business Link or Place ID',
    placeholder: 'https://maps.app.goo.gl/... or https://maps.google.com/...',
    brandColor: '#4285F4',
    hasOAuth: true,
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
  },
  google_reviews: {
    id: 'google_reviews',
    name: 'Google Reviews',
    title: 'Import from Google Reviews',
    inputLabel: 'Google Maps Business Link or Place ID',
    placeholder: 'https://maps.app.goo.gl/... or https://maps.google.com/...',
    brandColor: '#4285F4',
    hasOAuth: true,
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
  },
  trustpilot: {
    id: 'trustpilot',
    name: 'Trustpilot',
    title: 'Import from Trustpilot',
    inputLabel: 'Trustpilot Business Link or Domain',
    placeholder: 'https://www.trustpilot.com/review/company.com or company.com',
    brandColor: '#00B67A',
    icon: (
      <svg className="w-5 h-5 text-[#00B67A] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0l3.708 7.514L24 8.729l-6 5.848 1.417 8.258L12 18.934l-7.417 3.901L6 14.577 0 8.729l8.292-1.215z" />
      </svg>
    ),
  },
};

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformId: string;
  projectId?: string;
  onSuccess?: (count: number, locationName: string) => void;
  onBack?: () => void;
  initialUrl?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  platformId,
  projectId,
  onSuccess,
  onBack,
  initialUrl = '',
}) => {
  // Normalize platform key
  const normalizedKey = (platformId || 'google').toLowerCase().replace(/[^a-z0-9_]/g, '');
  const platform: PlatformConfig = PLATFORM_REGISTRY[normalizedKey] || {
    id: normalizedKey,
    name: platformId.charAt(0).toUpperCase() + platformId.slice(1),
    title: `Import from ${platformId.charAt(0).toUpperCase() + platformId.slice(1)}`,
    inputLabel: `${platformId} Page or Reviews Link`,
    placeholder: 'https://...',
    brandColor: '#6701e6',
    icon: <LinkIcon className="w-5 h-5 text-gray-500 shrink-0" />,
  };

  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importError, setImportError] = useState<string>('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Workflow steps
  const [step, setStep] = useState<'input' | 'preview' | 'profile_capture' | 'success'>('input');
  const [extractedReviews, setExtractedReviews] = useState<any[]>([]);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [resolvedEntity, setResolvedEntity] = useState<any>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [importedCount, setImportedCount] = useState<number>(0);
  const [detectedLocationName, setDetectedLocationName] = useState<string>('');

  // Profile Capture Fallback state
  const [customAuthor, setCustomAuthor] = useState('');
  const [customQuote, setCustomQuote] = useState('');
  const [customRating, setCustomRating] = useState(5);

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setInputUrl(initialUrl);
      setImportError('');
      setIsProcessing(false);
      setIsAdvancedOpen(false);
      setExtractedReviews([]);
      setSelectedReviewIds([]);
      setResolvedEntity(null);
    }
  }, [isOpen, initialUrl, platformId]);

  if (!isOpen) return null;

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
          platform: platform.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract reviews from this link. Please verify the URL.');
      }

      setResolvedEntity(data.entity || { name: platform.name, url: inputUrl });
      const reviews = Array.isArray(data.reviews) ? data.reviews : [];
      setExtractedReviews(reviews);
      setSelectedReviewIds(reviews.map((r: any) => r.id));
      setIsProcessing(false);

      if (reviews.length > 0) {
        setStep('preview');
      } else {
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
          platform: platform.id,
          sourceUrl: inputUrl.trim(),
          reviews: reviewsToCommit,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to import reviews into canonical store.');
      }

      const count = data.importedCount || reviewsToCommit.length;
      const location = resolvedEntity?.name || platform.name;
      setImportedCount(count);
      setDetectedLocationName(location);
      setStep('success');
      if (onSuccess) onSuccess(count, location);
    } catch (err: any) {
      setImportError(err.message || 'Failed to save testimonials. Please try again.');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleSaveProfileQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuote.trim()) {
      setImportError('Please enter the testimonial text or customer feedback.');
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
          platform: platform.id,
          sourceUrl: inputUrl.trim(),
          reviews: [
            {
              id: `${platform.id}_quote_${Date.now()}`,
              authorName: customAuthor.trim() || 'Verified Customer',
              authorAvatar: resolvedEntity?.avatar,
              rating: customRating,
              text: customQuote.trim(),
              date: new Date().toISOString(),
              platformUrl: inputUrl.trim(),
              source: platform.id,
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save testimonial.');
      }

      const count = data.importedCount || 1;
      const location = resolvedEntity?.name || platform.name;
      setImportedCount(count);
      setDetectedLocationName(location);
      setStep('success');
      if (onSuccess) onSuccess(count, location);
    } catch (err: any) {
      setImportError(err.message || 'Failed to save testimonial. Please try again.');
    } finally {
      setIsCommitting(false);
    }
  };

  const handleFacebookOAuth = async () => {
    setIsProcessing(true);
    const res = await socialClient.initOAuth('facebook');
    if (res.error) {
      setIsProcessing(false);
      setImportError(res.error);
      return;
    }
    if (res.authUrl) {
      try {
        window.location.href = res.authUrl;
      } catch {
        // jsdom environment fallback
      }
    } else {
      setIsProcessing(false);
      setImportError('Failed to start Facebook OAuth flow.');
    }
  };

  const handleGoogleOAuth = async () => {
    setIsProcessing(true);
    const res = await socialClient.initOAuth('google');
    if (res.error) {
      setIsProcessing(false);
      setImportError(res.error);
      return;
    }
    if (res.authUrl) {
      try {
        window.location.href = res.authUrl;
      } catch {
        // jsdom environment fallback
      }
    } else {
      setIsProcessing(false);
      setImportError('Failed to start Google OAuth flow.');
    }
  };

  const toggleSelectReview = (id: string) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviewIds.length === extractedReviews.length) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(extractedReviews.map((r) => r.id));
    }
  };

  return (
    <div
      id="import-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing && !isCommitting) {
          onClose();
        }
      }}
    >
      <div
        id="import-modal-container"
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-7 text-left space-y-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          {/* Sleek Zero-Auth Badge (Cleaned up redundant copy) */}
          <span
            id="zero-auth-badge"
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 shadow-2xs"
          >
            <span>⚡ Instant Zero-Auth Link Scraper</span>
          </span>

          <button
            type="button"
            id="import-modal-close-btn"
            onClick={onClose}
            disabled={isProcessing || isCommitting}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── STEP 1: UNIFIED URL INPUT & ADVANCED ACCORDION ── */}
        {step === 'input' && (
          <div className="space-y-4">
            {/* Header: Platform Logo & Title */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
              <div className="w-11 h-11 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2 shadow-2xs shrink-0">
                {typeof platform.icon === 'string' ? (
                  <img src={platform.icon} alt={platform.name} className="w-6 h-6 object-contain" />
                ) : (
                  platform.icon
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="import-modal-title" className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                  {platform.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Extract authentic customer reviews in seconds
                </p>
              </div>
            </div>

            {/* Error Message */}
            {importError && (
              <div
                id="import-modal-error"
                className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 leading-relaxed flex items-start gap-2 animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>{importError}</span>
              </div>
            )}

            {/* Primary Form */}
            <form onSubmit={handleExecuteImport} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="import-url-input" className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                  <span>{platform.inputLabel}</span>
                </label>
                <input
                  id="import-url-input"
                  type="text"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder={platform.placeholder}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono placeholder:font-sans placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all shadow-2xs"
                />
              </div>

              {/* Standardized Action Buttons */}
              <div className="pt-1 flex items-center justify-between gap-3">
                <button
                  type="button"
                  id="modal-back-btn"
                  onClick={onBack || onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  id="fetch-reviews-btn"
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scraping reviews...</span>
                    </>
                  ) : (
                    <>
                      <span>Fetch Reviews 🚀</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Collapsible Advanced Connection Options Accordion */}
            <div className="border border-gray-200 dark:border-gray-700/80 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-gray-800/40 transition-all">
              <button
                type="button"
                id="toggle-advanced-options-btn"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100/50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Advanced Connection Options
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                    {platform.hasOAuth ? 'OAuth & Webhooks' : 'Webhooks & Clipper'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isAdvancedOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isAdvancedOpen && (
                <div id="advanced-options-content" className="px-4 pb-4 pt-1 space-y-3 text-xs border-t border-gray-100 dark:border-gray-700/60 animate-in fade-in">
                  {platform.id === 'facebook' ? (
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-950 dark:text-blue-200">Official Meta OAuth Sync</span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-100/80 dark:bg-blue-900/60 px-2 py-0.5 rounded">Real-time Webhook</span>
                      </div>
                      <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80 leading-relaxed">
                        Connect your verified Meta Business Page to receive real-time webhook updates automatically whenever customers leave a recommendation.
                      </p>
                      <button
                        type="button"
                        id="meta-oauth-btn"
                        onClick={handleFacebookOAuth}
                        className="w-full py-2 px-3 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Connect via Meta OAuth</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : platform.id === 'google' || platform.id === 'google_reviews' ? (
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-950 dark:text-blue-200">Google Business Profile OAuth</span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-100/80 dark:bg-blue-900/60 px-2 py-0.5 rounded">Verified Owner</span>
                      </div>
                      <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80 leading-relaxed">
                        Authenticate directly with Google to continuously sync new 5-star ratings without manual scraping.
                      </p>
                      <button
                        type="button"
                        id="google-oauth-btn"
                        onClick={handleGoogleOAuth}
                        className="w-full py-2 px-3 rounded-lg bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Connect Business Profile OAuth</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-950 dark:text-purple-200">1-Click Clipper & Webhook Ingestion</span>
                        <span className="text-[10px] font-semibold text-purple-600 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded">Browser Extension</span>
                      </div>
                      <p className="text-[11px] text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
                        Clip social praise directly while browsing with the Panda Praise browser extension, or stream updates using incoming webhooks.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: PREVIEW & SELECTION ── */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Link</span>
              </button>

              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {selectedReviewIds.length} of {extractedReviews.length} selected
              </span>
            </div>

            {resolvedEntity && (
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-3">
                {resolvedEntity.avatar && (
                  <img
                    src={resolvedEntity.avatar}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
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
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#6701e6] dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
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
                        ? 'bg-purple-50/50 dark:bg-purple-950/30 border-[#6701e6]/40'
                        : 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100'
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
                        <span className="font-bold text-gray-900 dark:text-white truncate">{rev.authorName}</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed text-[11px]">
                        {rev.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Commit Buttons */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold transition-colors cursor-pointer"
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

        {/* ── STEP 3: PROFILE / POST TESTIMONIAL CAPTURE FALLBACK ── */}
        {step === 'profile_capture' && (
          <form onSubmit={handleSaveProfileQuote} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Try Another Link</span>
              </button>

              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                1-Click Profile Testimonial
              </span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed space-y-1">
              <span className="font-bold block">
                💡 Personal profile or specific post detected
              </span>
              <span>
                Capture customer comments, timeline recommendations, or message feedback received directly on this link below:
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                Client / Reviewer Name:
              </label>
              <input
                type="text"
                required
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
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
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 ml-1.5">{customRating} Stars</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                Testimonial / Praise Text:
              </label>
              <textarea
                required
                rows={3}
                value={customQuote}
                onChange={(e) => setCustomQuote(e.target.value)}
                placeholder="Paste the recommendation or feedback received on this profile..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all resize-none"
              />
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold transition-colors cursor-pointer"
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

        {/* ── STEP 4: SUCCESS CONFIRMATION ── */}
        {step === 'success' && (
          <div className="space-y-4 text-center py-2 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Testimonials Imported Successfully!
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
                Imported <strong className="text-emerald-700 dark:text-emerald-400">{importedCount} verified {importedCount === 1 ? 'testimonial' : 'testimonials'}</strong> {detectedLocationName ? `from "${detectedLocationName}"` : `via ${platform.name}`}.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-left text-xs space-y-1.5">
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-[11px]">
                <span>Source Platform:</span>
                <span className="font-bold text-gray-800 dark:text-white">{platform.name}</span>
              </div>
              {detectedLocationName && (
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-[11px]">
                  <span>Source Reference:</span>
                  <span className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{detectedLocationName}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-[11px]">
                <span>Target Inbox:</span>
                <span className="font-bold text-[#6701e6] dark:text-purple-400">Canonical Proof Vault (/reviews)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                id="finish-import-flow-btn"
                onClick={onClose}
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
