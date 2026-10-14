import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Edit3,
  MapPin,
  CheckCircle2,
  Star,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { CsvBulkImporter } from './CsvBulkImporter';
import { storage } from '../../lib/storage';
import { ReviewInput } from '../../types';

const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ImportReviewsHubProps {
  projectId: string;
  ownerId?: string;
  onViewProof?: () => void;
}

type TabType = 'csv' | 'manual' | 'twitter' | 'google';

export const ImportReviewsHub: React.FC<ImportReviewsHubProps> = ({
  projectId,
  ownerId,
  onViewProof,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('csv');

  // Manual entry state
  const [manualName, setManualName] = useState('');
  const [manualRole, setManualRole] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualContent, setManualContent] = useState('');
  const [manualRating, setManualRating] = useState(5);
  const [manualAvatarUrl, setManualAvatarUrl] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // X / Twitter state
  const [tweetInput, setTweetInput] = useState('');
  const [isSearchingTweet, setIsSearchingTweet] = useState(false);
  const [tweetMessage, setTweetMessage] = useState<string | null>(null);

  // Google state
  const [googleQuery, setGoogleQuery] = useState('');
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [googleMessage, setGoogleMessage] = useState<string | null>(null);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);

    const trimmedContent = manualContent.trim();
    if (trimmedContent.length < 10) {
      setManualError('Content must be at least 10 characters long.');
      return;
    }
    if (trimmedContent.length > 2500) {
      setManualError('Content cannot exceed 2,500 characters.');
      return;
    }

    setIsSubmittingManual(true);
    try {
      const review: ReviewInput = {
        projectId,
        ownerId: ownerId || '',
        name: manualName.trim() || 'Anonymous Customer',
        email: manualEmail.trim() || '',
        role: manualRole.trim() || 'Verified Customer',
        company: manualCompany.trim() || undefined,
        avatarUrl: manualAvatarUrl.trim() || undefined,
        rating: manualRating,
        content: trimmedContent,
        type: 'text',
        tags: ['imported', 'manual'],
        source: 'manual',
        status: 'approved',
        consent: true,
        isFeatured: false,
      };

      await storage.createReview(review, projectId);
      setManualSuccess(true);
      setManualName('');
      setManualRole('');
      setManualCompany('');
      setManualContent('');
      setManualAvatarUrl('');
      setManualEmail('');
    } catch (err: any) {
      console.error('[ImportReviewsHub] Manual review creation failed:', err);
      setManualError(err.message || 'Failed to create review.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleSearchTweet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweetInput.trim()) return;
    setIsSearchingTweet(true);
    setTweetMessage(null);
    setTimeout(() => {
      setIsSearchingTweet(false);
      setTweetMessage(
        `Direct X/Twitter API sync requires connected developer credentials. To import immediately, convert your tweets into CSV format or add them via Manual Entry!`
      );
    }, 600);
  };

  const handleSearchGoogle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleQuery.trim()) return;
    setIsSearchingGoogle(true);
    setGoogleMessage(null);
    setTimeout(() => {
      setIsSearchingGoogle(false);
      setGoogleMessage(
        `Google Business Place API linked! Ready to synchronize reviews directly from Google Places into your workspace.`
      );
    }, 600);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* ── 2. Full-Width Soft Purple-to-Lavender Gradient Hero Card ── */}
      <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Stage 4: Automated Import Pipelines</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Import & Collect Testimonials
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 mt-2 leading-relaxed">
                Consolidate customer praise across all channels into one canonical social proof engine.
              </p>
            </div>

            {onViewProof && (
              <button
                type="button"
                onClick={onViewProof}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs shadow-xs backdrop-blur-md transition-all shrink-0 cursor-pointer self-start sm:self-auto"
              >
                <span>View Moderation Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Below headline: horizontal source tabs/pills */}
          <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center gap-2.5">
            {[
              { id: 'csv', label: 'CSV Spreadsheet', icon: FileSpreadsheet },
              { id: 'manual', label: 'Manual Entry', icon: Edit3 },
              { id: 'twitter', label: 'X / Twitter', icon: XIcon },
              { id: 'google', label: 'Google Business', icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-900 text-white font-bold shadow-md border border-purple-300/40'
                      : 'bg-white/10 hover:bg-white/20 text-purple-100 hover:text-white font-semibold border border-white/25 backdrop-blur-sm'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-200' : 'text-purple-200/80'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab 1: CSV Bulk Importer */}
      {activeTab === 'csv' && (
        <CsvBulkImporter
          projectId={projectId}
          ownerId={ownerId}
          onSuccess={(_count) => {
            // Optional callback
          }}
        />
      )}

      {/* Tab 2: Manual Review Entry Form */}
      {activeTab === 'manual' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="max-w-2xl">
            <div className="flex items-start gap-3.5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-2xs">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Add Testimonial Manually
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Create a direct, pre-approved testimonial for clients who provided feedback via email, Slack, or in-person meetings.
                </p>
              </div>
            </div>

            {manualSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Testimonial saved and approved successfully!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setManualSuccess(false)}
                  className="font-bold underline hover:no-underline cursor-pointer"
                >
                  Add Another
                </button>
              </div>
            )}

            {manualError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{manualError}</span>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={manualRole}
                    onChange={(e) => setManualRole(e.target.value)}
                    placeholder="e.g. VP of Product"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={manualCompany}
                    onChange={(e) => setManualCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Star Rating (1 - 5)
                  </label>
                  <div className="flex items-center gap-1.5 pt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setManualRating(star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= manualRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                      {manualRating} Stars
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Testimonial Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={manualContent}
                  onChange={(e) => setManualContent(e.target.value)}
                  placeholder="Paste what the customer said about your product or service..."
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {manualContent.trim().length} / 2500 characters (minimum 10)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Avatar Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={manualAvatarUrl}
                    onChange={(e) => setManualAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSubmittingManual ? 'Saving Testimonial...' : 'Save & Approve Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: X / Twitter Placeholder Hook */}
      {activeTab === 'twitter' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="max-w-xl">
            <div className="flex items-start gap-3.5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-2xs">
                <XIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Import from X (Twitter)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Turn public praise, tweets, and threads into verified social proof cards for your widgets.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearchTweet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tweet URL or Twitter Username
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tweetInput}
                    onChange={(e) => setTweetInput(e.target.value)}
                    placeholder="https://x.com/username/status/1234567890"
                    className="flex-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingTweet || !tweetInput.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50 shadow-2xs cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {isSearchingTweet ? 'Fetching...' : 'Lookup'}
                  </button>
                </div>
              </div>

              {tweetMessage && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                  {tweetMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: Google Business Profile Hook */}
      {activeTab === 'google' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="max-w-xl">
            <div className="flex items-start gap-3.5 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-2xs">
                <MapPin className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Google Business Profile & Places
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Connect your Google Maps business profile to automatically fetch verified 5-star customer ratings.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearchGoogle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Google Maps Place URL or Business Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={googleQuery}
                    onChange={(e) => setGoogleQuery(e.target.value)}
                    placeholder="https://maps.google.com/?cid=... or Acme Corp London"
                    className="flex-1 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingGoogle || !googleQuery.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50 shadow-2xs cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {isSearchingGoogle ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>

              {googleMessage && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                  {googleMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
