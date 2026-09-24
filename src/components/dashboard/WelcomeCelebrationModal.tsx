import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WelcomeCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWidgetStudio?: () => void;
  onOpenImport?: () => void;
  onOpenSocialStudio?: () => void;
}

export const WelcomeCelebrationModal: React.FC<WelcomeCelebrationModalProps> = ({
  isOpen,
  onClose,
  onOpenWidgetStudio,
  onOpenImport,
  onOpenSocialStudio,
}) => {
  const { user, project, collectionForm } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  const firstName = user?.displayName?.split(' ')[0] || 'there';
  const collectionUrl = collectionForm
    ? `${window.location.origin}/c/${collectionForm.publicSlug}`
    : `${window.location.origin}/c/feedback`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(collectionUrl);
    setCopiedLink(true);
    if (!completedSteps.includes(1)) {
      setCompletedSteps(prev => [...prev, 1]);
    }
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const markStepDone = (stepNum: number) => {
    if (!completedSteps.includes(stepNum)) {
      setCompletedSteps(prev => [...prev, stepNum]);
    }
  };

  // Canvas confetti animation on open
  useEffect(() => {
    if (!isOpen) return;

    const canvas = document.getElementById('welcome-confetti-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
    }

    const colors = ['#6701e6', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e'];
    const particles: Particle[] = [];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4 - 50,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 6,
        speedY: Math.random() * 4 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
      });
    }

    let animationId: number;
    let frames = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      });

      frames++;
      if (frames < 220) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-fade-in font-sans">
      
      {/* Background Confetti Canvas */}
      <canvas
        id="welcome-confetti-canvas"
        className="pointer-events-none fixed inset-0 z-10 w-full h-full"
      />

      <div className="relative z-20 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden text-gray-900 animate-scale-in">
        
        {/* Top celebratory header */}
        <div className="bg-gradient-to-r from-[#6701e6] via-[#8b5cf6] to-[#ec4899] p-6 sm:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-3 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Account Successfully Set Up</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold font-display leading-tight">
            🎉 Welcome to Panda Praise, {firstName}!
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1.5 max-w-lg">
            Your project <strong className="text-white font-bold">{project?.name || 'Primary'}</strong> is ready. Follow these 5 quick steps to start collecting & converting social proof.
          </p>

          {/* Progress Bar */}
          <div className="mt-5 flex items-center justify-between text-xs text-white/80 mb-1.5 font-medium">
            <span>Getting Started Checklist</span>
            <span>{completedSteps.length} of 5 completed</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps.length / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* 5 Steps Ahead List */}
        <div className="p-6 sm:p-7 space-y-3 max-h-[60vh] overflow-y-auto">
          
          {/* Step 1: Share Collection Form */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6701e6] font-extrabold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    Share your collection form with customers
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Send via email, WhatsApp, or post-purchase link to start collecting text & video reviews.
                  </p>
                  
                  {/* Share URL input */}
                  <div className="mt-3 flex items-center gap-2 max-w-md">
                    <input
                      type="text"
                      readOnly
                      value={collectionUrl}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-700 font-mono select-all truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                    <a
                      href={collectionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
                      title="Test form live"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Import Existing Reviews */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6701e6] font-extrabold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    Import existing reviews from 30+ platforms
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Import existing feedback from Google, Twitter/X, Trustpilot, ProductHunt, or CSV.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  markStepDone(2);
                  onClose();
                  if (onOpenImport) onOpenImport();
                }}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <span>Import</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Step 3: Manage & Moderate Proof */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6701e6] font-extrabold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    Manage, approve, and tag your testimonials
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Moderate customer reviews, star your favorites, and organize by product or sentiment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  markStepDone(3);
                  onClose();
                }}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <span>Moderate</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Step 4: Create Embeddable Widgets & Wall of Love */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6701e6] font-extrabold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    Embed Widgets & Wall of Love on your site
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Generate customizable embeds, carousel badges, and Walls of Love in 1 click.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  markStepDone(4);
                  onClose();
                  if (onOpenWidgetStudio) onOpenWidgetStudio();
                }}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <span>Widgets</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Step 5: Studio & Social Cards */}
          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6701e6] font-extrabold text-xs flex items-center justify-center shrink-0">
                  5
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    Design social proof images in Studio
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Create eye-catching images & videos for Twitter, Instagram, and LinkedIn.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  markStepDone(5);
                  onClose();
                  if (onOpenSocialStudio) onOpenSocialStudio();
                }}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <span>Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer Action */}
        <div className="p-5 sm:p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            You can always reopen this guide from your dashboard header.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-gray-850 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Explore My Dashboard →
          </button>
        </div>

      </div>

    </div>
  );
};
export default WelcomeCelebrationModal;
