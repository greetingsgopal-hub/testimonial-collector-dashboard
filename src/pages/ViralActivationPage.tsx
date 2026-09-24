import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  Check, 
  Copy, 
  Share2, 
  ExternalLink, 
  ArrowRight, 
  MessageSquare, 
  Mail, 
  Send,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';

export const ViralActivationPage: React.FC = () => {
  usePageSeo({
    title: 'Your Testimonial Link is Ready! — Panda Praise',
    description: 'Start collecting customer testimonials right away with your own shareable Panda Praise link.',
  });

  const navigate = useNavigate();
  const { user, project, collectionForm } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Derive collection URL for new customer
  const publicSlug = collectionForm?.publicSlug || `${project?.slug || 'feedback'}-feedback`;
  const collectionUrl = `${window.location.origin}/c/${publicSlug}`;

  useEffect(() => {
    // Fire celebration confetti
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#6701e6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
    });

    analytics.viralCollectionLinkGenerated({
      slug: publicSlug,
    });
  }, [publicSlug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(collectionUrl);
    setCopied(true);
    analytics.viralCollectionLinkCopied({
      slug: publicSlug,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    analytics.viralShareStarted({
      slug: publicSlug,
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Share your experience with ${project?.name || 'us'}`,
          text: `We'd love to hear your feedback! Please take 60 seconds to share your experience with us:`,
          url: collectionUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to modal
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const shareText = encodeURIComponent(
    `We'd love to hear your thoughts! Could you take a moment to share your experience with us? ${collectionUrl}`
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans flex flex-col selection:bg-purple-100 selection:text-purple-900 pb-16">
      
      {/* Top Banner Ribbon */}
      <div className="h-24 sm:h-28 w-full bg-gradient-to-r from-[#e11d48] via-[#a855f7] to-[#6701e6] relative">
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="font-extrabold text-lg tracking-tight font-display">Panda Praise</span>
          </div>
          {user && (
            <span className="text-xs font-medium text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
              {user.email}
            </span>
          )}
        </div>
      </div>

      {/* Main Activation Card */}
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-12 w-full z-10">
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl p-6 sm:p-10 text-center relative overflow-hidden">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-4 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live & Ready to Collect</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-950 tracking-tight leading-snug">
            You're ready to collect testimonials!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-lg mx-auto leading-relaxed">
            Your personal Panda Praise collection page is live. Send this link to your clients and customers to start collecting social proof.
          </p>

          {/* Collection Link Box */}
          <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 text-left">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
              Your Shareable Testimonial Link
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 bg-white px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono text-xs sm:text-sm text-gray-800 truncate shadow-2xs select-all">
                {collectionUrl}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#6701e6] hover:bg-[#5200bd] text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <a
                  href={collectionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors shadow-2xs"
                  title="Preview your live link in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Sharing Channels */}
          <div className="mt-8 text-left space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              3 fast ways to get your first testimonial:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => analytics.viralShareStarted({ channel: 'whatsapp' })}
                className="p-3.5 rounded-2xl border border-gray-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all flex items-start gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900 group-hover:text-emerald-700">WhatsApp</span>
                  <span className="text-[11px] text-gray-500">Send to a recent client</span>
                </div>
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent('Quick question regarding your experience')}&body=${shareText}`}
                onClick={() => analytics.viralShareStarted({ channel: 'email' })}
                className="p-3.5 rounded-2xl border border-gray-200/80 hover:border-purple-300 hover:bg-purple-50/40 transition-all flex items-start gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6701e6] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900 group-hover:text-[#6701e6]">Email</span>
                  <span className="text-[11px] text-gray-500">Add to receipt or invoice</span>
                </div>
              </a>

              <div 
                onClick={handleCopyLink}
                className="p-3.5 rounded-2xl border border-gray-200/80 hover:border-blue-300 hover:bg-blue-50/40 transition-all flex items-start gap-3 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-gray-900 group-hover:text-blue-700">Bio Link</span>
                  <span className="text-[11px] text-gray-500">Paste in bio or website</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation to Dashboard */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left text-xs text-gray-500">
              <span className="font-semibold text-gray-800">Want to customize your form or view received reviews?</span>
              <p className="text-[11px] text-gray-400">You can create widgets and Walls of Love from your dashboard anytime.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </main>

      {/* Share Modal Dialog (Fallback when Web Share is unsupported) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-200 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-[#6701e6]" />
                Share Testimonial Link
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Share your link directly with your customers:
            </p>

            <div className="space-y-2">
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Share via WhatsApp</span>
              </a>

              <a
                href={`mailto:?subject=${encodeURIComponent('Review our service')}&body=${shareText}`}
                className="w-full py-2.5 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6701e6] text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Mail className="w-4 h-4 text-[#6701e6]" />
                <span>Share via Email</span>
              </a>

              <button
                onClick={() => {
                  handleCopyLink();
                  setShowShareModal(false);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4 text-gray-600" />
                <span>Copy Link to Clipboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ViralActivationPage;
