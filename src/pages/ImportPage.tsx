import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Globe,
  Star,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  X,
  Download,
  Search,
  ChevronDown,
  PenTool,
  Clock,
  MapPin,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Plus,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { ImportPlatform, ReviewInput, CsvColumnMapping, PLAN_LIMITS } from '../types';
import { storage } from '../lib/storage';
import { getFirebaseAuth } from '../lib/firebase';
import { socialClient } from '../lib/socialClient';
import { ConnectSourceModal } from '../components/dashboard/views/ConnectSourceModal';
import { compressScreenshot, detectChatPlatform, ScreenshotPlatform } from '../lib/screenshotUtils';

export type SourceStatus = 'available' | 'coming_soon';

export interface SourceDefinition {
  id: string;
  name: string;
  status: SourceStatus;
  statusLabel?: string;
  description: string;
  unsupportedReason?: string;
  keywords: string[];
  icon: React.ReactNode;
  actionType: 'google' | 'facebook' | 'url' | 'csv' | 'manual' | 'screenshot' | 'unsupported';
}

const IMPORT_SOURCES: SourceDefinition[] = [
  {
    id: 'google_reviews',
    name: 'Google Reviews',
    status: 'available',
    description: 'Import verified ratings and customer reviews from your Google Business Profile.',
    keywords: ['google', 'reviews', 'business', 'maps', 'places', 'gmb'],
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
    actionType: 'google',
  },
  {
    id: 'facebook',
    name: 'Facebook Reviews',
    status: 'available',
    description: 'Import page recommendations and verified ratings from your Facebook Page.',
    keywords: ['facebook', 'reviews', 'fb', 'meta', 'page', 'recommendations'],
    icon: (
      <svg className="w-5 h-5 text-[#1877F2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    actionType: 'facebook',
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    status: 'available',
    description: 'Import public praise, customer tweets, and mentions directly from X / Twitter.',
    keywords: ['twitter', 'x', 'tweet', 'social', 'post'],
    icon: (
      <svg className="w-5 h-5 text-gray-900 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    status: 'available',
    description: 'Import community praise, discussions, and reviews from any public Reddit post or thread.',
    keywords: ['reddit', 'sub', 'subreddit', 'community', 'thread'],
    icon: (
      <svg className="w-5 h-5 text-[#FF4500] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.56 8 13.25c0 .689.56 1.25 1.25 1.25.689 0 1.25-.561 1.25-1.25 0-.69-.561-1.25-1.25-1.25zm5.5 0c-.69 0-1.25.56-1.25 1.25 0 .689.56 1.25 1.25 1.25.689 0 1.25-.561 1.25-1.25 0-.69-.561-1.25-1.25-1.25zm-5.465 4.417a.36.36 0 0 0-.256.108.358.358 0 0 0 0 .51c.883.884 2.138 1.326 3.471 1.326 1.333 0 2.588-.442 3.471-1.326a.358.358 0 0 0 0-.51.36.36 0 0 0-.51 0c-.754.755-1.848 1.118-2.961 1.118-1.114 0-2.207-.363-2.961-1.118a.358.358 0 0 0-.254-.108z"/>
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    status: 'available',
    description: 'Import professional recommendations and praise posts directly from LinkedIn.',
    keywords: ['linkedin', 'in', 'recommendations', 'posts', 'profile'],
    icon: (
      <svg className="w-5 h-5 text-[#0A66C2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    status: 'available',
    description: 'Import customer comments, reels praise, and mentions directly from Instagram.',
    keywords: ['instagram', 'insta', 'ig', 'reels', 'posts', 'comments'],
    icon: (
      <svg className="w-5 h-5 text-[#E4405F] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'g2',
    name: 'G2 Reviews',
    status: 'available',
    description: 'Import verified B2B software ratings and customer reviews from G2.',
    keywords: ['g2', 'software', 'b2b', 'enterprise', 'reviews'],
    icon: (
      <svg className="w-5 h-5 text-[#FF492C] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'capterra',
    name: 'Capterra',
    status: 'available',
    description: 'Import Gartner Digital Markets verified buyer reviews from Capterra.',
    keywords: ['capterra', 'gartner', 'software', 'reviews'],
    icon: (
      <svg className="w-5 h-5 text-[#00587C] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'yelp',
    name: 'Yelp',
    status: 'available',
    description: 'Import local business ratings and customer feedback directly from Yelp.',
    keywords: ['yelp', 'local', 'food', 'business', 'ratings'],
    icon: (
      <svg className="w-5 h-5 text-[#D32323] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'playstore',
    name: 'Google Play',
    status: 'available',
    description: 'Import Android app reviews and star ratings from Google Play Store.',
    keywords: ['play', 'store', 'google play', 'android', 'app'],
    icon: (
      <svg className="w-5 h-5 text-[#01875f] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'shopify',
    name: 'Shopify Reviews',
    status: 'available',
    description: 'Import e-commerce app and store customer reviews directly from Shopify.',
    keywords: ['shopify', 'ecommerce', 'store', 'app'],
    icon: (
      <svg className="w-5 h-5 text-[#96bf48] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'amazon',
    name: 'Amazon Reviews',
    status: 'available',
    description: 'Import verified purchase ratings and customer feedback from Amazon product pages.',
    keywords: ['amazon', 'product', 'ecommerce', 'reviews', 'asin'],
    icon: (
      <svg className="w-5 h-5 text-[#FF9900] shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    status: 'available',
    description: 'Import verified ratings and customer reviews from Trustpilot without login.',
    keywords: ['trustpilot', 'reviews', 'ratings', 'trust', 'verified'],
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#00B67A" />
        <path d="M12 4.5l2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.7 5.2-.8z" fill="#FFFFFF" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'appstore',
    name: 'App Store',
    status: 'available',
    description: 'Import iOS app customer reviews and 5-star ratings via public App Store link.',
    keywords: ['app store', 'apple', 'ios', 'app', 'iphone', 'itunes'],
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#0070c9">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.66 1.37-.56.65-1.06 1.71-.92 2.74 1.03.08 2.06-.52 2.66-1.26z"/>
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'producthunt',
    name: 'Product Hunt',
    status: 'available',
    description: 'Import community praise, upvotes, and reviews directly from Product Hunt.',
    keywords: ['product hunt', 'ph', 'launch', 'tech', 'community'],
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#DA552F">
        <circle cx="12" cy="12" r="10" />
        <path d="M10 8h3a2.5 2.5 0 0 1 0 5h-3v3H8V8h2zm0 3.5h3a1 1 0 0 0 0-2h-3v2z" fill="#FFFFFF" />
      </svg>
    ),
    actionType: 'url',
  },
  {
    id: 'csv',
    name: 'CSV',
    status: 'available',
    description: 'Upload a CSV file containing your customer reviews or testimonials.',
    keywords: ['csv', 'spreadsheet', 'upload', 'file', 'table'],
    icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    actionType: 'csv',
  },
  {
    id: 'web',
    name: 'Web page / Any Link',
    status: 'available',
    description: 'Paste any public review URL or webpage to extract testimonials automatically.',
    keywords: ['web', 'page', 'url', 'website', 'link', 'scrape', 'online', 'g2', 'capterra', 'yelp'],
    icon: <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />,
    actionType: 'url',
  },
  {
    id: 'screenshot',
    name: 'Screenshot / Chat Proof',
    status: 'available',
    description: 'Upload WhatsApp, iMessage, Slack, Stripe, or DM screenshots with instant canvas compression.',
    keywords: ['screenshot', 'image', 'chat', 'whatsapp', 'slack', 'dm', 'stripe', 'email', 'imessage', 'twitter'],
    icon: (
      <svg className="w-5 h-5 text-indigo-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
    actionType: 'screenshot',
  },
  {
    id: 'manual',
    name: 'Manual testimonial',
    status: 'available',
    description: 'Create a custom testimonial with customer details, star rating, and text.',
    keywords: ['manual', 'testimonial', 'write', 'entry', 'type', 'custom'],
    icon: <PenTool className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />,
    actionType: 'manual',
  },
];

const CSV_SAMPLE = `name,email,rating,content,company,role
"Jane Smith","jane@example.com",5,"Amazing product! Totally transformed our workflow.","Acme Inc","CTO"
"John Doe","john@example.com",4,"Great tool, highly recommend it.","StartupXYZ","Founder"`;

interface GoogleImportReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  text: string;
  date?: string;
  platformUrl?: string;
}

interface GoogleResolvedPlace {
  id: string;
  name: string;
  address?: string;
  googleMapsUri?: string;
  rating?: number;
  totalReviews?: number;
}

interface GoogleDiscoveredBusiness {
  id: string;
  name: string;
  address?: string;
  accountName: string;
  storeCode?: string;
}

interface ImportPageProps {
  onViewProof?: () => void;
}

export const ImportPage: React.FC<ImportPageProps> = ({ onViewProof }) => {
  usePageSeo({
    title: 'Import Testimonials — Panda Praise',
    description: 'Bring your existing customer proof into Panda Praise from Google, Facebook, CSV, or manual entry.',
  });

  const { project, workspace } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<ImportPlatform | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectPlatform, setConnectPlatform] = useState<string>('google');
  const [unsupportedModalSource, setUnsupportedModalSource] = useState<SourceDefinition | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; count: number; errors?: string[] } | null>(null);

  // ── Google Reviews Flow State ──
  const [googleStep, setGoogleStep] = useState<
    | 'choose'
    | 'business_flow'
    | 'business_select'
    | 'business_preview'
    | 'maps_input'
    | 'maps_confirm'
    | 'maps_preview'
    | 'done'
  >('choose');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [resolvedPlace, setResolvedPlace] = useState<GoogleResolvedPlace | null>(null);
  const [discoveredBusinesses, setDiscoveredBusinesses] = useState<GoogleDiscoveredBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<GoogleDiscoveredBusiness | null>(null);
  const [googleReviews, setGoogleReviews] = useState<GoogleImportReview[]>([]);
  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleImporting, setIsGoogleImporting] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [googleImportResult, setGoogleImportResult] = useState<{ count: number } | null>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean | null>(null);
  const [customGoogleApiKey, setCustomGoogleApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  // CSV state (strict .csv only)
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<CsvColumnMapping>({});
  const [csvStep, setCsvStep] = useState<'upload' | 'map' | 'preview' | 'done'>('upload');
  const [isDragOver, setIsDragOver] = useState(false);

  // Manual entry state
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualRating, setManualRating] = useState(5);
  const [manualCompany, setManualCompany] = useState('');
  const [manualRole, setManualRole] = useState('');
  const [manualScreenshot, setManualScreenshot] = useState<string | null>(null);

  // Dedicated Screenshot / Chat Proof state
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null);
  const [screenshotPlatformType, setScreenshotPlatformType] = useState<ScreenshotPlatform>('whatsapp');
  const [screenshotName, setScreenshotName] = useState('');
  const [screenshotCompany, setScreenshotCompany] = useState('');
  const [screenshotRole, setScreenshotRole] = useState('');
  const [screenshotKeyQuote, setScreenshotKeyQuote] = useState('');
  const [screenshotRating, setScreenshotRating] = useState(5);
  const [isProcessingScreenshot, setIsProcessingScreenshot] = useState(false);
  const [screenshotFileSize, setScreenshotFileSize] = useState<number | null>(null);

  const filteredSources = IMPORT_SOURCES.filter((s) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(query) ||
      s.keywords.some((k) => k.toLowerCase().includes(query))
    );
  });

  // ── Google Reviews Flow Handlers ──

  const checkGoogleConnectionAndDiscover = async () => {
    setIsGoogleLoading(true);
    setGoogleError('');
    setGoogleStep('business_flow');

    try {
      const statusRes = await socialClient.getStatus();
      const connected = Boolean(statusRes?.connections?.google?.connected);
      setIsGoogleConnected(connected);

      if (!connected) {
        setIsGoogleLoading(false);
        return;
      }

      // If connected, discover business locations
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const res = await fetch('/api/google/discover-businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to discover Google Business Profile locations.');
      }

      const list: GoogleDiscoveredBusiness[] = data.businesses || [];
      setDiscoveredBusinesses(list);
      setGoogleStep('business_select');
    } catch (err: any) {
      setGoogleError(err.message || 'Google Business Profile discovery error.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSelectBusiness = async (business: GoogleDiscoveredBusiness) => {
    setSelectedBusiness(business);
    setIsGoogleLoading(true);
    setGoogleError('');

    try {
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const res = await fetch('/api/google/preview-business-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          accountName: business.accountName,
          locationName: business.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch reviews for this business.');
      }

      const reviews: GoogleImportReview[] = data.reviews || [];
      setGoogleReviews(reviews);
      setSelectedReviewIds(reviews.map((r) => r.id));
      setGoogleStep('business_preview');
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to load reviews.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleImportBusinessReviews = async () => {
    if (!project || selectedReviewIds.length === 0 || !selectedBusiness) return;
    setIsGoogleImporting(true);
    setGoogleError('');

    try {
      const maxTestimonials = workspace ? PLAN_LIMITS[workspace.plan].maxTestimonials : -1;
      if (maxTestimonials !== -1) {
        const existing = await storage.getReviews(project.id);
        const remaining = maxTestimonials - existing.length;
        if (remaining <= 0) {
          setGoogleError(`Free plan is limited to ${maxTestimonials} testimonials. Upgrade to import more.`);
          setIsGoogleImporting(false);
          return;
        }
        if (selectedReviewIds.length > remaining) {
          setGoogleError(
            `You selected ${selectedReviewIds.length} testimonials, but your Free plan only has ${remaining} slots left (limit ${maxTestimonials}).`
          );
          setIsGoogleImporting(false);
          return;
        }
      }

      const reviewsToSave = googleReviews.filter((r) => selectedReviewIds.includes(r.id));
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const res = await fetch('/api/google/import-business-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          selectedReviews: reviewsToSave,
          projectId: project.id,
          locationName: selectedBusiness.name,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to import reviews.');
      }

      setGoogleImportResult({
        count: data.importedCount || reviewsToSave.length,
      });
      setGoogleStep('done');
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to import reviews.');
    } finally {
      setIsGoogleImporting(false);
    }
  };

  const handleResolveGoogleMapsPlace = async () => {
    if (!googleMapsUrl.trim()) {
      setGoogleError('Please paste a Google Maps link.');
      return;
    }

    setIsGoogleLoading(true);
    setGoogleError('');

    try {
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const res = await fetch('/api/google/resolve-place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          url: googleMapsUrl.trim(),
          apiKey: customGoogleApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.place) {
        throw new Error(data.error || 'Could not resolve this Google Maps link. Please verify the link or enter the business name.');
      }

      setResolvedPlace(data.place);
      const reviews: GoogleImportReview[] = data.reviews || [];
      setGoogleReviews(reviews);
      setSelectedReviewIds(reviews.map((r) => r.id));
      setGoogleStep('maps_confirm');
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to resolve Google Maps place.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAddNewManualGoogleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const newRev: GoogleImportReview = {
      id: `manual_g_${Date.now()}`,
      authorName: newReviewAuthor.trim() || 'Verified Customer',
      rating: newReviewRating,
      text: newReviewText.trim(),
      date: new Date().toISOString(),
      platformUrl: resolvedPlace?.googleMapsUri || googleMapsUrl,
    };

    setGoogleReviews((prev) => [newRev, ...prev]);
    setSelectedReviewIds((prev) => [...prev, newRev.id]);
    setNewReviewAuthor('');
    setNewReviewText('');
    setNewReviewRating(5);
    setShowAddReviewForm(false);
  };

  const handleImportMapsReviews = async () => {
    if (!project || selectedReviewIds.length === 0 || !resolvedPlace) return;
    setIsGoogleImporting(true);
    setGoogleError('');

    try {
      const maxTestimonials = workspace ? PLAN_LIMITS[workspace.plan].maxTestimonials : -1;
      if (maxTestimonials !== -1) {
        const existing = await storage.getReviews(project.id);
        const remaining = maxTestimonials - existing.length;
        if (remaining <= 0) {
          setGoogleError(`Free plan is limited to ${maxTestimonials} testimonials. Upgrade to import more.`);
          setIsGoogleImporting(false);
          return;
        }
        if (selectedReviewIds.length > remaining) {
          setGoogleError(
            `You selected ${selectedReviewIds.length} testimonials, but your Free plan only has ${remaining} slots left (limit ${maxTestimonials}).`
          );
          setIsGoogleImporting(false);
          return;
        }
      }

      const reviewsToSave = googleReviews.filter((r) => selectedReviewIds.includes(r.id));
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const res = await fetch('/api/google/import-place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          placeId: resolvedPlace.id || googleMapsUrl,
          selectedReviews: reviewsToSave,
          projectId: project.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to save Google Maps reviews.');
      }

      setGoogleImportResult({
        count: data.importedCount || reviewsToSave.length,
      });
      setGoogleStep('done');
    } catch (err: any) {
      setGoogleError(err.message || 'Failed to import reviews.');
    } finally {
      setIsGoogleImporting(false);
    }
  };

  const handleGoogleOAuthRedirect = async () => {
    setIsGoogleLoading(true);
    setGoogleError('');
    try {
      const res = await socialClient.initOAuth('google');
      if (res.error) {
        setIsGoogleLoading(false);
        setGoogleError(res.error);
        return;
      }
      if (res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        setIsGoogleLoading(false);
        setGoogleError('Failed to initialize Google sign-in. Please try again.');
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setGoogleError(err.message || 'Google authentication error.');
    }
  };

  const toggleSelectReview = (id: string) => {
    setSelectedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllReviews = () => {
    if (selectedReviewIds.length === googleReviews.length) {
      setSelectedReviewIds([]);
    } else {
      setSelectedReviewIds(googleReviews.map((r) => r.id));
    }
  };

  const resetGoogleFlow = () => {
    setGoogleStep('choose');
    setGoogleMapsUrl('');
    setResolvedPlace(null);
    setDiscoveredBusinesses([]);
    setSelectedBusiness(null);
    setGoogleReviews([]);
    setSelectedReviewIds([]);
    setGoogleError('');
    setGoogleImportResult(null);
  };

  // ── CSV Parsing & Import ──
  const parseCsv = useCallback((text: string) => {
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length === 0) {
      setImportResult({
        success: false,
        count: 0,
        errors: ['This file is empty. Please upload a CSV with a header row and at least one testimonial.'],
      });
      return;
    }
    if (lines.length < 2) {
      setImportResult({
        success: false,
        count: 0,
        errors: ['This CSV has no data rows. Please include a header row plus at least one testimonial row.'],
      });
      return;
    }

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    if (headers.length < 2) {
      setImportResult({
        success: false,
        count: 0,
        errors: [
          'This does not look like a valid CSV: only one column was found. Make sure your file is comma-separated with a header row (e.g. name,email,rating,content).',
        ],
      });
      return;
    }
    const rows = lines.slice(1).map(parseLine);

    setCsvHeaders(headers);
    setCsvData(rows);

    const autoMap: CsvColumnMapping = {};
    const mapField = (field: keyof CsvColumnMapping, ...aliases: string[]) => {
      const idx = headers.findIndex((h) =>
        aliases.some((a) => h.toLowerCase().replace(/[_\s-]/g, '') === a.toLowerCase().replace(/[_\s-]/g, ''))
      );
      if (idx >= 0) (autoMap as any)[field] = headers[idx];
    };

    mapField('name', 'name', 'fullname', 'full_name', 'author', 'reviewer');
    mapField('email', 'email', 'emailaddress', 'email_address');
    mapField('rating', 'rating', 'stars', 'score');
    mapField('content', 'content', 'review', 'text', 'testimonial', 'body', 'message', 'feedback');
    mapField('title', 'title', 'headline', 'subject');
    mapField('company', 'company', 'organization', 'org', 'business');
    mapField('role', 'role', 'jobtitle', 'job_title', 'position');
    mapField('avatarUrl', 'avatar', 'avatarurl', 'avatar_url', 'photo', 'image');
    mapField('date', 'date', 'createdat', 'created_at', 'timestamp');

    setColumnMapping(autoMap);
    setCsvStep('map');
  }, []);

  const handleFileUpload = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
        setImportResult({
          success: false,
          count: 0,
          errors: [
            'Only CSV (.csv) files are supported. Excel spreadsheets (.xlsx, .xls) must be saved or exported as CSV before uploading.',
          ],
        });
        return;
      }

      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCsv(text);
      };
      reader.readAsText(file);
    },
    [parseCsv]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleCsvImport = useCallback(async () => {
    if (!project || csvData.length === 0) return;
    setIsImporting(true);

    try {
      const getVal = (row: string[], field: keyof CsvColumnMapping): string => {
        const col = columnMapping[field];
        if (!col) return '';
        const idx = csvHeaders.indexOf(col);
        return idx >= 0 ? (row[idx] || '').replace(/^"|"$/g, '') : '';
      };

      const reviews: ReviewInput[] = csvData
        .map((row) => ({
          projectId: project.id,
          name: getVal(row, 'name') || 'Anonymous',
          email: getVal(row, 'email') || 'imported@example.com',
          rating: Math.min(5, Math.max(1, parseInt(getVal(row, 'rating')) || 5)),
          content: getVal(row, 'content'),
          title: getVal(row, 'title') || undefined,
          company: getVal(row, 'company') || undefined,
          role: getVal(row, 'role') || '',
          avatarUrl: getVal(row, 'avatarUrl') || undefined,
          tags: ['imported', 'csv'],
          source: 'csv' as const,
          type: 'text' as const,
          consent: true,
          status: 'approved' as const,
        }))
        .filter((r) => r.content.trim().length > 0);

      // Load existing reviews once: used for both duplicate detection and the
      // free-plan limit check.
      const existingReviews = await storage.getReviews(project.id);

      // Duplicate detection: skip rows whose content matches an existing
      // review (normalized) so re-importing the same CSV is idempotent.
      const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
      const existingContent = new Set(existingReviews.map((r) => normalize(r.content)));
      const seenInFile = new Set<string>();
      let duplicatesSkipped = 0;
      const newReviews = reviews.filter((r) => {
        const key = normalize(r.content);
        if (existingContent.has(key) || seenInFile.has(key)) {
          duplicatesSkipped++;
          return false;
        }
        seenInFile.add(key);
        return true;
      });

      if (newReviews.length === 0) {
        setImportResult({
          success: true,
          count: 0,
          errors: [
            `All ${reviews.length} testimonial${reviews.length === 1 ? '' : 's'} in this CSV already exist in your project. No duplicates were imported.`,
          ],
        });
        setCsvStep('done');
        return;
      }

      // Free-plan limit: "Up to 15 testimonials" (pricing page + PLAN_LIMITS).
      // Owner-initiated imports are capped; anonymous form submissions are not.
      const maxTestimonials = workspace ? PLAN_LIMITS[workspace.plan].maxTestimonials : -1;
      if (maxTestimonials !== -1) {
        const remaining = maxTestimonials - existingReviews.length;
        if (remaining <= 0) {
          setImportResult({
            success: false,
            count: 0,
            errors: [`Free plan is limited to ${maxTestimonials} testimonials. Upgrade to import more.`],
          });
          setCsvStep('done');
          return;
        }
        if (newReviews.length > remaining) {
          setImportResult({
            success: false,
            count: 0,
            errors: [
              `This CSV contains ${newReviews.length} new testimonials but your Free plan only has ${remaining} slots left (limit ${maxTestimonials}). Upgrade to import more.`,
            ],
          });
          setCsvStep('done');
          return;
        }
      }

      let imported = 0;
      for (const r of newReviews) {
        await storage.createReview(r);
        imported++;
      }

      setImportResult({
        success: true,
        count: imported,
        errors: duplicatesSkipped > 0 ? [`${duplicatesSkipped} duplicate${duplicatesSkipped === 1 ? '' : 's'} skipped.`] : undefined,
      });
      setCsvStep('done');
    } catch (err: any) {
      setImportResult({ success: false, count: 0, errors: [err.message] });
    }

    setIsImporting(false);
  }, [project, workspace, csvData, columnMapping, csvHeaders]);

  const handleManualImport = useCallback(async () => {
    if (!project || !manualName.trim() || !manualContent.trim()) return;
    setIsImporting(true);

    try {
      // Free-plan limit: "Up to 15 testimonials" (pricing page + PLAN_LIMITS).
      const maxTestimonials = workspace ? PLAN_LIMITS[workspace.plan].maxTestimonials : -1;
      if (maxTestimonials !== -1) {
        const existing = await storage.getReviews(project.id);
        if (existing.length >= maxTestimonials) {
          setImportResult({
            success: false,
            count: 0,
            errors: [`Free plan is limited to ${maxTestimonials} testimonials. Upgrade to add more.`],
          });
          return;
        }
      }
      await storage.createReview({
        projectId: project.id,
        name: manualName.trim(),
        email: manualEmail.trim() || 'manual@example.com',
        rating: manualRating,
        content: manualContent.trim(),
        company: manualCompany.trim() || undefined,
        role: manualRole.trim() || '',
        avatarUrl: manualScreenshot || undefined,
        tags: manualScreenshot ? ['screenshot', 'chat-proof'] : ['manual-entry'],
        source: manualScreenshot ? 'import' : 'manual',
        type: 'text',
        consent: true,
        status: 'approved',
      });

      setImportResult({ success: true, count: 1 });
      setManualName('');
      setManualEmail('');
      setManualContent('');
      setManualRating(5);
      setManualCompany('');
      setManualRole('');
      setManualScreenshot(null);
    } catch (err: any) {
      setImportResult({ success: false, count: 0, errors: [err.message] });
    }

    setIsImporting(false);
  }, [project, workspace, manualName, manualEmail, manualContent, manualRating, manualCompany, manualRole]);

  const handleScreenshotFile = async (file: File) => {
    setIsProcessingScreenshot(true);
    try {
      const { dataUrl } = await compressScreenshot(file);
      setScreenshotDataUrl(dataUrl);
      setScreenshotFileSize(Math.round((dataUrl.length * 3) / 4));
      const detected = detectChatPlatform(file.name);
      if (detected !== 'other') {
        setScreenshotPlatformType(detected);
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        count: 0,
        errors: [err.message || 'Failed to process and compress screenshot.'],
      });
    } finally {
      setIsProcessingScreenshot(false);
    }
  };

  const handleScreenshotImport = async () => {
    if (!project || !screenshotDataUrl) return;
    setIsImporting(true);

    try {
      const maxTestimonials = workspace ? PLAN_LIMITS[workspace.plan].maxTestimonials : -1;
      if (maxTestimonials !== -1) {
        const existing = await storage.getReviews(project.id);
        if (existing.length >= maxTestimonials) {
          setImportResult({
            success: false,
            count: 0,
            errors: [`Free plan is limited to ${maxTestimonials} testimonials. Upgrade to add more.`],
          });
          setIsImporting(false);
          return;
        }
      }

      await storage.createReview({
        projectId: project.id,
        name: screenshotName.trim() || 'Verified Customer',
        email: 'screenshot@verified.proof',
        rating: screenshotRating,
        content: screenshotKeyQuote.trim() || 'Verified chat screenshot testimonial.',
        company: screenshotCompany.trim() || undefined,
        role: screenshotRole.trim() || '',
        avatarUrl: undefined,
        screenshotUrl: screenshotDataUrl,
        screenshotPlatform: screenshotPlatformType,
        tags: ['screenshot', 'chat-proof', screenshotPlatformType],
        source: 'screenshot',
        type: 'screenshot',
        consent: true,
        status: 'approved',
      });

      setImportResult({ success: true, count: 1 });
      setScreenshotDataUrl(null);
      setScreenshotName('');
      setScreenshotCompany('');
      setScreenshotRole('');
      setScreenshotKeyQuote('');
      setScreenshotRating(5);
      setScreenshotFileSize(null);
    } catch (err: any) {
      setImportResult({ success: false, count: 0, errors: [err.message] });
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedPlatform(null);
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setCsvStep('upload');
    setImportResult(null);
    setUnsupportedModalSource(null);
    setScreenshotDataUrl(null);
    setScreenshotName('');
    setScreenshotCompany('');
    setScreenshotRole('');
    setScreenshotKeyQuote('');
    setScreenshotRating(5);
    setScreenshotFileSize(null);
    resetGoogleFlow();
  };

  const handleSelectSource = (source: SourceDefinition) => {
    if (source.status === 'coming_soon' || source.actionType === 'unsupported') {
      setUnsupportedModalSource(source);
      return;
    }

    if (source.actionType === 'google') {
      setSelectedPlatform('google_reviews');
      setGoogleStep('choose');
    } else if (source.actionType === 'facebook' || source.actionType === 'url') {
      setConnectPlatform(source.id);
      setShowConnectModal(true);
    } else if (source.actionType === 'csv') {
      setSelectedPlatform('csv');
    } else if (source.actionType === 'manual') {
      setSelectedPlatform('manual');
    } else if (source.actionType === 'screenshot' || source.id === 'screenshot') {
      setSelectedPlatform('screenshot');
    }
  };

  return (
    <div className="py-6 sm:py-10 px-4">
      {/* Global Success/Error Banner */}
      {importResult && (
        <div
          className={`max-w-xl mx-auto mb-6 p-4 rounded-2xl border flex items-start gap-3 shadow-xs
          ${
            importResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-100'
              : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-100'
          }`}
        >
          {importResult.success ? (
            <Check size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-semibold ${importResult.success ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'}`}>
              {importResult.success
                ? `Successfully imported ${importResult.count} testimonial${importResult.count !== 1 ? 's' : ''}!`
                : 'Import failed'}
            </p>
            {importResult.errors && importResult.errors.length > 0 && (
              <ul className="mt-2 space-y-1">
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-300">
                    • {err}
                  </li>
                ))}
                {importResult.errors.length > 5 && (
                  <li className="text-xs text-gray-500">...and {importResult.errors.length - 5} more</li>
                )}
              </ul>
            )}
          </div>
          <button onClick={() => setImportResult(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── MAIN SELECTION VIEW (Capability-Driven ASCII Wireframe) ── */}
      {!selectedPlatform ? (
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight">
              Import Testimonials
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 font-normal">
              Bring your existing customer proof into Panda Praise
            </p>
          </div>

          {/* Main Card Container */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-none p-5 sm:p-7 backdrop-blur-xl">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search a source"
                className="w-full pl-11 pr-10 py-3 text-sm rounded-xl
                         bg-gray-50/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80
                         text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Source Rows */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredSources.map((source) => {
                const isAvailable = source.status === 'available';

                return (
                  <button
                    key={source.id}
                    onClick={() => handleSelectSource(source)}
                    className="w-full flex items-center justify-between px-3.5 py-3.5 rounded-xl
                             hover:bg-gray-50 dark:hover:bg-gray-800/70
                             transition-all duration-150 group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-700/50">
                        {source.icon}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-[#6701e6] dark:group-hover:text-purple-400 transition-colors truncate">
                        {source.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isAvailable && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1">
                          <Clock size={11} className="shrink-0" />
                          <span>Coming soon</span>
                        </span>
                      )}
                      <ArrowRight
                        size={18}
                        className="text-gray-400 dark:text-gray-500 group-hover:text-[#6701e6] dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </button>
                );
              })}

              {filteredSources.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  No sources found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>

          {/* Tagline */}
          <p className="text-center text-xs sm:text-sm font-medium text-gray-400 dark:text-gray-500 mt-6 tracking-wide">
            All your proof. One place.
          </p>

          {/* Connect Source Modal for Available Providers (Facebook) */}
          <ConnectSourceModal
            isOpen={showConnectModal}
            onClose={() => setShowConnectModal(false)}
            initialPlatform={connectPlatform}
            projectId={project?.id}
            onSelectPlatform={(pid) => {
              if (pid === 'csv') setSelectedPlatform('csv');
              else if (pid === 'manual') setSelectedPlatform('manual');
              else if (pid === 'google') setSelectedPlatform('google_reviews');
              else if (pid === 'facebook') setSelectedPlatform('facebook');
            }}
          />

          {/* Honest Informational Modal for Coming Soon Providers */}
          {unsupportedModalSource && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setUnsupportedModalSource(null);
                }
              }}
            >
              <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-7 text-left space-y-4">
                <button
                  type="button"
                  onClick={() => setUnsupportedModalSource(null)}
                  className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                    {unsupportedModalSource.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {unsupportedModalSource.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                      <Clock size={12} /> Coming soon
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {unsupportedModalSource.unsupportedReason}
                </p>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60 text-xs text-gray-500 dark:text-gray-400">
                  💡 In the meantime, you can upload existing reviews via a CSV file, connect Google or Facebook, or enter testimonials manually.
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUnsupportedModalSource(null);
                      setSelectedPlatform('manual');
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                  >
                    Enter Manually
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUnsupportedModalSource(null);
                      setSelectedPlatform('csv');
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                  >
                    Upload CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* ── GOOGLE REVIEWS FULL-PAGE WIZARD (Matches exact user diagram) ── */}
      {selectedPlatform === 'google_reviews' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={resetImport}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
              >
                <ArrowLeft size={16} /> Back to sources
              </button>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google Reviews Import
              </span>
            </div>

            {googleStep !== 'choose' && googleStep !== 'done' && (
              <button
                onClick={resetGoogleFlow}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                Change Method
              </button>
            )}
          </div>

          {/* Error Banner */}
          {googleError && (
            <div className="p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-100 flex items-start gap-3 text-sm">
              <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">{googleError}</div>
              <button onClick={() => setGoogleError('')} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          )}

          {/* STEP 1: METHOD SELECTION (My business OR A Google Maps business) */}
          {googleStep === 'choose' && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
                  Google Reviews
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  How do you want to import your customer proof?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Method A: My business */}
                <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#6701e6]/60 dark:hover:border-purple-500/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#4285F4]" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#6701e6] dark:group-hover:text-purple-400 transition-colors">
                          My business
                        </h3>
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          Owner Verified
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                        Connect Google to discover your Google Business Profile locations and import owner-verified customer reviews.
                      </p>
                    </div>

                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span>Connect official Google account</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span>Discover your verified locations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span>Preview & select specific reviews</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={checkGoogleConnectionAndDiscover}
                      disabled={isGoogleLoading}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isGoogleLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Checking Google...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>Connect Google</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Method B: A Google Maps business */}
                <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#6701e6]/60 dark:hover:border-purple-500/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#6701e6] dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#6701e6] dark:group-hover:text-purple-400 transition-colors">
                          A Google Maps business
                        </h3>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                          Public Reviews
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                        Paste a Google Maps link to resolve the business profile, confirm your location, and import reviews.
                      </p>
                    </div>

                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span>Paste standard or share link</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span>Confirm your business location</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span>Preview & select specific reviews</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleError('');
                        setGoogleStep('maps_input');
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Continue with Google Maps</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2A: MY BUSINESS - CONNECT OR DISCOVER */}
          {googleStep === 'business_flow' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5 text-center">
              {isGoogleLoading ? (
                <div className="py-8 space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#4285F4] animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Discovering your Google Business Profile locations...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center mx-auto text-[#4285F4]">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {isGoogleConnected ? 'Google Account Connected' : 'Connect Google Business Profile'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {isGoogleConnected
                        ? 'Your Google account is connected. Click below to search for your Google Business Profile locations and load customer reviews.'
                        : 'Sign in with the Google account that manages your business to discover your verified locations and import customer reviews.'}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGoogleStep('choose')}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                    >
                      Back
                    </button>
                    {isGoogleConnected ? (
                      <button
                        type="button"
                        onClick={checkGoogleConnectionAndDiscover}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <span>Discover My Locations</span>
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleOAuthRedirect}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Connect with Google</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2A-2: SELECT DISCOVERED BUSINESS */}
          {googleStep === 'business_select' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="text-[#4285F4]" size={20} />
                  <span>Select your business</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We found {discoveredBusinesses.length} location{discoveredBusinesses.length !== 1 ? 's' : ''} in your Google Business Profile. Select one to load reviews:
                </p>
              </div>

              <div className="space-y-3">
                {discoveredBusinesses.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBusiness(b)}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-[#6701e6] dark:hover:border-purple-500 hover:bg-purple-50/20 dark:hover:bg-purple-950/20 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#6701e6] dark:group-hover:text-purple-400">
                        {b.name}
                      </h4>
                      {b.address && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {b.address}
                        </p>
                      )}
                      {b.storeCode && (
                        <span className="text-[10px] text-gray-400">Code: {b.storeCode}</span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isGoogleLoading}
                      className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Select</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}

                {discoveredBusinesses.length === 0 && (
                  <div className="p-6 text-center bg-gray-50 dark:bg-gray-800/60 rounded-2xl space-y-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      No Google Business Profile locations were found under this Google account.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleGoogleOAuthRedirect}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4285F4] text-white hover:bg-[#3367d6] cursor-pointer"
                      >
                        Try Another Google Account
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setGoogleError('');
                          setGoogleStep('maps_input');
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        Import from Google Maps
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setGoogleStep('choose')}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 2A-3: PREVIEW & SELECT BUSINESS REVIEWS */}
          {googleStep === 'business_preview' && (
            <div className="space-y-5">
              {/* Selected Business Banner */}
              {selectedBusiness && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-2xs">
                      <Sparkles size={20} className="text-[#4285F4]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                          {selectedBusiness.name}
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Check size={10} /> Business Profile
                        </span>
                      </div>
                      {selectedBusiness.address && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {selectedBusiness.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setGoogleStep('business_select')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Selection Toolbar */}
              <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
                <button
                  type="button"
                  onClick={toggleSelectAllReviews}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  {selectedReviewIds.length === googleReviews.length && googleReviews.length > 0 ? (
                    <CheckSquare size={16} className="text-[#6701e6]" />
                  ) : (
                    <Square size={16} className="text-gray-400" />
                  )}
                  <span>
                    {selectedReviewIds.length === googleReviews.length
                      ? 'Deselect All'
                      : 'Select All Reviews'}
                  </span>
                </button>

                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <span className="text-[#6701e6] dark:text-purple-400 font-bold">
                    {selectedReviewIds.length}
                  </span>{' '}
                  of {googleReviews.length} selected
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {googleReviews.map((rev) => {
                  const isSelected = selectedReviewIds.includes(rev.id);

                  return (
                    <div
                      key={rev.id}
                      onClick={() => toggleSelectReview(rev.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left
                        ${
                          isSelected
                            ? 'bg-purple-50/40 dark:bg-purple-950/20 border-[#6701e6]/40 dark:border-purple-500/40 shadow-xs'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectReview(rev.id);
                          }}
                          className="mt-0.5 text-gray-400 hover:text-[#6701e6] cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare size={18} className="text-[#6701e6]" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {rev.authorAvatar ? (
                                <img
                                  src={rev.authorAvatar}
                                  alt={rev.authorName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                                  {rev.authorName.charAt(0) || 'G'}
                                </div>
                              )}
                              <span className="text-xs font-bold text-gray-900 dark:text-white">
                                {rev.authorName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < rev.rating ? 'fill-amber-400' : 'text-gray-200 dark:text-gray-700'}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {rev.text || <span className="italic text-gray-400">No review text.</span>}
                          </p>

                          {rev.date && (
                            <p className="text-[10px] text-gray-400">
                              {new Date(rev.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {googleReviews.length === 0 && (
                  <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 text-sm text-gray-400">
                    No customer reviews were found for this business location.
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setGoogleStep('business_select')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleImportBusinessReviews}
                  disabled={selectedReviewIds.length === 0 || isGoogleImporting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isGoogleImporting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Importing Testimonials...</span>
                    </>
                  ) : (
                    <>
                      <span>Import {selectedReviewIds.length} Testimonials</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2B: GOOGLE MAPS - PASTE URL */}
          {googleStep === 'maps_input' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="text-[#6701e6] dark:text-purple-400" size={20} />
                  <span>Paste Google Maps URL</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Paste your Google Maps link, share link, or business name. Panda Praise will resolve your business profile and retrieve customer reviews.
                </p>
              </div>

              {/* Official OAuth Tip */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
                <Sparkles className="w-4 h-4 text-[#4285F4] shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <span className="font-bold">Own this business on Google?</span> Connect your official Google account in{' '}
                  <button
                    type="button"
                    onClick={() => setGoogleStep('choose')}
                    className="font-bold underline hover:text-[#4285F4] cursor-pointer"
                  >
                    Method A (My business)
                  </button>{' '}
                  to sync all verified reviews with 100% authenticity and zero API key needed.
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                  Google Maps URL or Business Name *
                </label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={googleMapsUrl}
                    onChange={(e) => setGoogleMapsUrl(e.target.value)}
                    placeholder="e.g. https://maps.app.goo.gl/... or https://maps.google.com/... or business name"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-xl
                             bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                             text-gray-900 dark:text-white placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  💡 Tip: On Google Maps, click &quot;Share&quot; on your business listing and choose &quot;Copy link&quot;, or type your business name directly.
                </p>
              </div>

              {/* Optional Custom API Key Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                  className="text-xs font-semibold text-[#6701e6] dark:text-purple-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Key size={13} />
                  <span>{showApiKeyInput ? 'Hide Google Places API Key' : 'Have a Google Places API Key? (Optional)'}</span>
                </button>

                {showApiKeyInput && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-2">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                      Custom Google Places API Key
                    </label>
                    <input
                      type="password"
                      value={customGoogleApiKey}
                      onChange={(e) => setCustomGoogleApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                    />
                    <p className="text-[10px] text-gray-500">
                      Optional: If provided, queries your Google Cloud Places API directly. If left blank, Panda Praise resolves via Google Maps public data automatically.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setGoogleStep('choose')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResolveGoogleMapsPlace}
                  disabled={!googleMapsUrl.trim() || isGoogleLoading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Resolving business...</span>
                    </>
                  ) : (
                    <>
                      <span>Find Business</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2B-2: CONFIRMATION - IS THIS YOUR BUSINESS? */}
          {googleStep === 'maps_confirm' && resolvedPlace && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Confirmation
                </span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Is this your business?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Please verify your business information before continuing to review selection.
                </p>
              </div>

              {/* Resolved Place Confirmation Card */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-[#6701e6] dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
                    <MapPin size={24} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {resolvedPlace.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {resolvedPlace.address || 'Address not listed'}
                    </p>
                    {resolvedPlace.googleMapsUri && (
                      <a
                        href={resolvedPlace.googleMapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6701e6] dark:text-purple-400 hover:underline pt-1"
                      >
                        <span>View on Google Maps</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>

                {(typeof resolvedPlace.rating === 'number' || typeof resolvedPlace.totalReviews === 'number') && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                    {typeof resolvedPlace.rating === 'number' && (
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star size={14} className="fill-amber-400 text-amber-400" />
                        <span>{resolvedPlace.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {typeof resolvedPlace.totalReviews === 'number' && (
                      <span>• {resolvedPlace.totalReviews} total ratings on Google</span>
                    )}
                  </div>
                )}
              </div>

              {/* Confirmation Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setGoogleStep('maps_input')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  Not my business / Back
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleStep('maps_preview')}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2B-3: MAPS REVIEWS PREVIEW & SELECT */}
          {googleStep === 'maps_preview' && resolvedPlace && (
            <div className="space-y-5">
              {/* Confirmed Place Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <MapPin size={20} className="text-[#6701e6]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {resolvedPlace.name}
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <Check size={10} /> Confirmed
                      </span>
                    </div>
                    {resolvedPlace.address && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {resolvedPlace.address}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setGoogleStep('maps_confirm')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Selection Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
                <button
                  type="button"
                  onClick={toggleSelectAllReviews}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  {selectedReviewIds.length === googleReviews.length && googleReviews.length > 0 ? (
                    <CheckSquare size={16} className="text-[#6701e6]" />
                  ) : (
                    <Square size={16} className="text-gray-400" />
                  )}
                  <span>
                    {selectedReviewIds.length === googleReviews.length && googleReviews.length > 0
                      ? 'Deselect All'
                      : 'Select All Reviews'}
                  </span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddReviewForm(!showAddReviewForm)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Review</span>
                  </button>

                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <span className="text-[#6701e6] dark:text-purple-400 font-bold">
                      {selectedReviewIds.length}
                    </span>{' '}
                    of {googleReviews.length} selected
                  </div>
                </div>
              </div>

              {/* Inline Add Review Form */}
              {showAddReviewForm && (
                <form onSubmit={handleAddNewManualGoogleReview} className="p-5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-dashed border-[#6701e6]/40 dark:border-purple-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Plus size={14} className="text-[#6701e6]" />
                      <span>Add Customer Review for {resolvedPlace.name}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddReviewForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                        Reviewer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                        Star Rating
                      </label>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                        <option value={3}>⭐⭐⭐ (3 Stars)</option>
                        <option value={2}>⭐⭐ (2 Stars)</option>
                        <option value={1}>⭐ (1 Star)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                      Review Content
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Paste the customer's Google review here..."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#6701e6] resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddReviewForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Save & Add to Selection
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {googleReviews.map((rev) => {
                  const isSelected = selectedReviewIds.includes(rev.id);

                  return (
                    <div
                      key={rev.id}
                      onClick={() => toggleSelectReview(rev.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left
                        ${
                          isSelected
                            ? 'bg-purple-50/40 dark:bg-purple-950/20 border-[#6701e6]/40 dark:border-purple-500/40 shadow-xs'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectReview(rev.id);
                          }}
                          className="mt-0.5 text-gray-400 hover:text-[#6701e6] cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare size={18} className="text-[#6701e6]" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {rev.authorAvatar ? (
                                <img
                                  src={rev.authorAvatar}
                                  alt={rev.authorName}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                                  {rev.authorName.charAt(0) || 'G'}
                                </div>
                              )}
                              <span className="text-xs font-bold text-gray-900 dark:text-white">
                                {rev.authorName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < rev.rating ? 'fill-amber-400' : 'text-gray-200 dark:text-gray-700'}
                                />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {rev.text || <span className="italic text-gray-400">No review text provided.</span>}
                          </p>

                          {rev.date && (
                            <p className="text-[10px] text-gray-400">
                              {new Date(rev.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {googleReviews.length === 0 && (
                  <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        No reviews were automatically found in the public Google listing preview.
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        You can paste your customer reviews for this location below, or connect your official Google account to sync all verified reviews.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddReviewForm(true)}
                        className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Add / Paste a Google Review</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoogleStep('choose')}
                        className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Connect Google Account (Official Sync)</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setGoogleStep('maps_confirm')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleImportMapsReviews}
                  disabled={selectedReviewIds.length === 0 || isGoogleImporting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isGoogleImporting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Importing Testimonials...</span>
                    </>
                  ) : (
                    <>
                      <span>Import {selectedReviewIds.length} Testimonials</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS COMPLETION */}
          {googleStep === 'done' && (
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
                <Check size={32} />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Google Reviews Imported!
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  {googleImportResult?.count || selectedReviewIds.length} verified testimonials from{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {resolvedPlace?.name || selectedBusiness?.name || 'Google'}
                  </span>{' '}
                  have been imported into your Proof Library.
                </p>
              </div>

              <div className="flex justify-center items-center gap-3 pt-2">
                <button
                  onClick={resetGoogleFlow}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  Import More
                </button>
                {onViewProof && (
                  <button
                    onClick={onViewProof}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>View in Proof Library</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CSV IMPORT FLOW (Strictly CSV, accurate labeling) ── */}
      {selectedPlatform === 'csv' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={resetImport}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} /> Back to sources
            </button>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">CSV Import</span>
          </div>

          {csvStep === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`p-12 rounded-3xl border-2 border-dashed text-center transition-all bg-white dark:bg-gray-900 shadow-sm
                ${
                  isDragOver
                    ? 'border-[#6701e6] bg-purple-50/30'
                    : 'border-gray-200 dark:border-gray-800 hover:border-purple-400'
                }`}
            >
              <Upload size={36} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Drag & drop your CSV file here
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                or click to browse from your computer (.csv files only)
              </p>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                         bg-[#6701e6] hover:bg-[#5200bd] text-white cursor-pointer transition-colors shadow-xs"
              >
                <FileSpreadsheet size={16} />
                Choose CSV File
              </label>

              <div className="mt-8 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 text-left max-w-lg mx-auto">
                <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold mb-2">Sample CSV format:</p>
                <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono overflow-x-auto bg-white dark:bg-gray-900 p-2.5 rounded border border-gray-200 dark:border-gray-800">
                  {CSV_SAMPLE}
                </pre>
                <button
                  onClick={() => {
                    const blob = new Blob([CSV_SAMPLE], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'sample-testimonials.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="mt-2.5 text-xs text-[#6701e6] dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Download size={12} /> Download sample CSV
                </button>
              </div>
            </div>
          )}

          {csvStep === 'map' && (
            <div className="space-y-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">📄 {csvFile?.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{csvData.length} rows found</p>
                </div>
                <button
                  onClick={() => {
                    setCsvStep('upload');
                    setCsvFile(null);
                    setCsvData([]);
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  Choose different file
                </button>
              </div>

              <h4 className="text-sm font-bold text-gray-900 dark:text-white pt-2">Map Your Columns</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(['name', 'email', 'rating', 'content', 'title', 'company', 'role'] as (keyof CsvColumnMapping)[]).map(
                  (field) => (
                    <div key={field}>
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block capitalize">
                        {field} {(field === 'name' || field === 'content') && <span className="text-rose-500">*</span>}
                      </label>
                      <div className="relative">
                        <select
                          value={(columnMapping as any)[field] || ''}
                          onChange={(e) =>
                            setColumnMapping((prev) => ({ ...prev, [field]: e.target.value || undefined }))
                          }
                          className="w-full px-3 py-2 text-sm rounded-lg
                                   bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                                   text-gray-900 dark:text-white appearance-none cursor-pointer
                                   focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                        >
                          <option value="">— Not mapped —</option>
                          {csvHeaders.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Preview first 3 rows */}
              {csvData.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Preview (first 3 rows)</h4>
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                          {csvHeaders.map((h) => (
                            <th
                              key={h}
                              className="text-left py-2.5 px-3 text-gray-600 dark:text-gray-300 font-semibold"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                        {csvData.slice(0, 3).map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="py-2 px-3 text-gray-700 dark:text-gray-300 max-w-[150px] truncate"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    setCsvStep('upload');
                    setCsvFile(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCsvImport}
                  disabled={!columnMapping.name || !columnMapping.content || isImporting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                           bg-[#6701e6] hover:bg-[#5200bd] text-white
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
                >
                  {isImporting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Upload size={15} />
                  )}
                  Import {csvData.length} Testimonials
                </button>
              </div>
            </div>
          )}

          {csvStep === 'done' && (
            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
              <Check size={48} className="mx-auto text-emerald-500 mb-3" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Import Complete!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {importResult?.count || 0} testimonials imported into your dashboard.
              </p>
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={resetImport}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  Import More
                </button>
                {onViewProof && (
                  <button
                    onClick={onViewProof}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>View Proof Library</span>
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MANUAL TESTIMONIAL FLOW ── */}
      {selectedPlatform === 'manual' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={resetImport}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              <ArrowLeft size={16} /> Back to sources
            </button>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Manual Testimonial</span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Name *</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Email</label>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Company</label>
                <input
                  type="text"
                  value={manualCompany}
                  onChange={(e) => setManualCompany(e.target.value)}
                  placeholder="Acme Inc"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Role</label>
                <input
                  type="text"
                  value={manualRole}
                  onChange={(e) => setManualRole(e.target.value)}
                  placeholder="CTO"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setManualRating(r)}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      r <= manualRating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    <Star size={20} className={r <= manualRating ? 'fill-amber-400' : ''} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Testimonial Quote / Key Takeaway *</label>
              <textarea
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                rows={4}
                placeholder="Paste the testimonial quote, Slack message text, or customer feedback..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl resize-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
              />
            </div>

            {/* Optional Screenshot Attachment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                Attach Proof Screenshot (WhatsApp, Slack, Stripe, DM)
              </label>
              {manualScreenshot ? (
                <div className="relative p-2 rounded-2xl border border-purple-200 bg-purple-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={manualScreenshot} alt="Proof Screenshot" className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
                    <div>
                      <span className="text-xs font-bold text-gray-900">Screenshot Attached</span>
                      <p className="text-[10px] text-gray-500">Will be featured on your social proof cards</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualScreenshot(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 transition-colors cursor-pointer text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl hover:border-[#6701e6] hover:bg-purple-50/30 transition-all cursor-pointer">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Click to upload screenshot or image</span>
                  <span className="text-[10px] text-gray-400">PNG, JPG, WebP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setManualScreenshot(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              {onViewProof && (
                <button
                  type="button"
                  onClick={onViewProof}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  View Proof Library →
                </button>
              )}
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  onClick={handleManualImport}
                  disabled={!manualName.trim() || !manualContent.trim() || isImporting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
                           bg-[#6701e6] hover:bg-[#5200bd] text-white
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
                >
                  {isImporting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  Add Testimonial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DEDICATED SCREENSHOT / CHAT PROOF FLOW ── */}
      {selectedPlatform === 'screenshot' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={resetImport}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors"
              >
                <ArrowLeft size={16} /> Back to sources
              </button>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Screenshot / Chat Proof</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Sparkles size={11} /> Auto-Compressed WebP
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
            {/* Screenshot Dropzone */}
            {!screenshotDataUrl ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleScreenshotFile(file);
                }}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-[#6701e6] bg-purple-50/50 dark:bg-purple-950/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-[#6701e6] hover:bg-purple-50/20'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-[#6701e6] flex items-center justify-center mb-3">
                  <Upload size={22} />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {isProcessingScreenshot ? 'Compressing & Optimizing...' : 'Upload or Drag Screenshot Here'}
                </h4>
                <p className="text-xs text-gray-500 text-center max-w-sm mb-3">
                  WhatsApp, iMessage, Slack, Stripe notifications, or Instagram DMs. Auto-downscaled client-side under 250KB.
                </p>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  Select PNG, JPG, or WebP
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={isProcessingScreenshot}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleScreenshotFile(file);
                  }}
                />
              </label>
            ) : (
              <div className="space-y-4">
                {/* Screenshot Preview Card */}
                <div className="relative p-3 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative max-h-48 max-w-[200px] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs bg-black/5">
                    <img
                      src={screenshotDataUrl}
                      alt="Uploaded Proof"
                      className="object-contain max-h-48 w-auto mx-auto"
                    />
                  </div>
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">Screenshot Loaded</span>
                      {screenshotFileSize && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {Math.round(screenshotFileSize / 1024)} KB WebP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Optimized for instant page loads and widgets.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotDataUrl(null);
                        setScreenshotFileSize(null);
                      }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer pt-1"
                    >
                      Replace Screenshot
                    </button>
                  </div>
                </div>

                {/* Platform Selection Pills */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">
                    Detected Source Platform
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { id: 'whatsapp', label: 'WhatsApp', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' },
                        { id: 'imessage', label: 'iMessage', color: 'bg-blue-500/10 text-blue-700 border-blue-500/30' },
                        { id: 'slack', label: 'Slack', color: 'bg-purple-500/10 text-purple-700 border-purple-500/30' },
                        { id: 'instagram', label: 'Instagram', color: 'bg-pink-500/10 text-pink-700 border-pink-500/30' },
                        { id: 'stripe', label: 'Stripe', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30' },
                        { id: 'twitter', label: 'Twitter / X', color: 'bg-gray-500/10 text-gray-800 border-gray-500/30' },
                        { id: 'other', label: 'Direct Chat', color: 'bg-zinc-500/10 text-zinc-700 border-zinc-500/30' },
                      ] as const
                    ).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setScreenshotPlatformType(p.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          screenshotPlatformType === p.id
                            ? `${p.color} ring-2 ring-[#6701e6]/40 shadow-xs`
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metadata Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                      Customer / Client Name
                    </label>
                    <input
                      type="text"
                      value={screenshotName}
                      onChange={(e) => setScreenshotName(e.target.value)}
                      placeholder="e.g. Alex Rivera (or leave blank)"
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                      Company / Role / Handle
                    </label>
                    <input
                      type="text"
                      value={screenshotCompany}
                      onChange={(e) => setScreenshotCompany(e.target.value)}
                      placeholder="e.g. Growth Lead / @alex"
                      className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                    />
                  </div>
                </div>

                {/* Key Quote / Headline Highlight */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                    Key Quote / Highlight Text
                  </label>
                  <textarea
                    rows={2}
                    value={screenshotKeyQuote}
                    onChange={(e) => setScreenshotKeyQuote(e.target.value)}
                    placeholder='e.g. "Just hit $14,200 this week from your system!" (appears as quote next to screenshot)'
                    className="w-full px-3.5 py-2 text-sm rounded-xl resize-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setScreenshotRating(r)}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          r <= screenshotRating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
                        }`}
                      >
                        <Star size={18} className={r <= screenshotRating ? 'fill-amber-400' : ''} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={resetImport}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleScreenshotImport}
                    disabled={isImporting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white disabled:opacity-50 cursor-pointer shadow-xs transition-colors"
                  >
                    {isImporting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    Save Screenshot Proof
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zero-Auth & Direct URL Connect Modal */}
      <ConnectSourceModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSelectPlatform={() => {
          setShowConnectModal(false);
          if (onViewProof) onViewProof();
        }}
        projectId={project?.id}
        initialPlatform={connectPlatform}
      />
    </div>
  );
};
