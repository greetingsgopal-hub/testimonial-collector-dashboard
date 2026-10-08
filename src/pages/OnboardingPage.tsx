import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const SELLING_OPTIONS = [
  'Courses',
  'SaaS subscriptions',
  'Physical products (ecom)',
  'Coaching calls',
  'Digital products',
  'Live events',
];

export const OnboardingPage: React.FC = () => {
  usePageSeo({
    title: 'Welcome to Panda Praise — Get Started',
    description: 'Set up your Panda Praise account and start collecting testimonials.',
  });

  const navigate = useNavigate();
  const { user, project, updateProjectDetails, signOut } = useAuth();

  // Step 1: First Name | Step 2: Selling | Step 3: Website URL | Step 4: Loading & Testimonials
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [firstName, setFirstName] = useState(user?.displayName?.split(' ')[0] || '');
  const [sellingCategory, setSellingCategory] = useState('SaaS subscriptions');
  const [websiteUrl, setWebsiteUrl] = useState(project?.websiteUrl || '');

  // Multi-cannon celebration bomb with colorful paper cuttings
  const fireCelebrationBomb = useCallback(() => {
    // 1. Center burst
    confetti({
      particleCount: 110,
      spread: 100,
      startVelocity: 50,
      origin: { x: 0.5, y: 0.4 },
      colors: ['#6701e6', '#e11d48', '#a855f7', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#f97316'],
      shapes: ['square', 'circle'],
      scalar: 1.25,
      ticks: 280,
    });

    // 2. Left side cannon
    setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 60,
        spread: 75,
        origin: { x: 0.05, y: 0.6 },
        colors: ['#6701e6', '#a855f7', '#f59e0b', '#3b82f6', '#ec4899'],
        scalar: 1.15,
        ticks: 250,
      });
    }, 180);

    // 3. Right side cannon
    setTimeout(() => {
      confetti({
        particleCount: 65,
        angle: 120,
        spread: 75,
        origin: { x: 0.95, y: 0.6 },
        colors: ['#6701e6', '#e11d48', '#10b981', '#f59e0b', '#ec4899'],
        scalar: 1.15,
        ticks: 250,
      });
    }, 320);
  }, []);

  // Fire celebration bomb on Step 1 load
  useEffect(() => {
    if (step === 1) {
      const timer = setTimeout(() => {
        fireCelebrationBomb();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [step, fireCelebrationBomb]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim()) {
      fireCelebrationBomb();
      setTimeout(() => {
        setStep(2);
      }, 250);
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSellingCategory(cat);
  };

  const handleStep2Proceed = () => {
    if (sellingCategory) {
      setStep(3);
    }
  };

  // Step 4 progressive setup states
  const [setupProgress, setSetupProgress] = useState(25);
  const [setupStatusText, setSetupStatusText] = useState('Initializing project workspace...');
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = websiteUrl.trim();
    if (!trimmed) return;
    // Accept bare domains (e.g. "mycompany.com") as well as full URLs.
    // type="url" silently blocked bare domains with no user-visible error.
    const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    setWebsiteUrl(normalized);
    setStep(4);
  };

  const setupRanRef = useRef(false);

  // Step 4: Streamlined setup pipeline with instantaneous feedback
  useEffect(() => {
    if (step === 4 && !setupRanRef.current) {
      setupRanRef.current = true;
      let isMounted = true;

      const runSetup = async () => {
        try {
          // Stage 1: Workspace Initialization
          if (isMounted) {
            setSetupProgress(45);
            setSetupStatusText('Configuring workspace & permissions...');
          }
          await new Promise((r) => setTimeout(r, 120));

          // Stage 2: Project persistence
          if (isMounted) {
            setSetupProgress(85);
            setSetupStatusText('Generating testimonial collection form & Wall of Love...');
          }
          if (project?.id) {
            const domainName = websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            try {
              await Promise.race([
                updateProjectDetails(project.id, {
                  name: domainName ? domainName.split('.')[0] : (firstName ? `${firstName}'s Project` : project.name),
                  websiteUrl: websiteUrl.trim(),
                }),
                new Promise((resolve) => setTimeout(resolve, 350)),
              ]);
            } catch (err) {
              console.warn('[Onboarding] Non-blocking project update error:', err);
            }
          }
          await new Promise((r) => setTimeout(r, 120));

          // Stage 3: Ready
          if (isMounted) {
            setSetupProgress(100);
            setSetupStatusText('Workspace ready!');
            setIsSetupComplete(true);
            fireCelebrationBomb();
            analytics.signupCompleted();
          }
        } catch (err) {
          console.error('Failed to update project during onboarding:', err);
          if (isMounted) {
            setSetupProgress(100);
            setSetupStatusText('Workspace ready!');
            setIsSetupComplete(true);
          }
        }
      };

      runSetup();

      return () => {
        isMounted = false;
      };
    }
  }, [step, project?.id, websiteUrl, firstName, updateProjectDetails, fireCelebrationBomb]);

  // Step 4: Instantaneous auto-redirect within 1.2 seconds once setup completes
  useEffect(() => {
    if (step === 4 && isSetupComplete) {
      const redirectTimer = setTimeout(() => {
        navigate('/dashboard');
      }, 1200);

      return () => clearTimeout(redirectTimer);
    }
  }, [step, isSetupComplete, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/20 to-white text-gray-900 flex flex-col font-sans selection:bg-purple-500/20 selection:text-purple-900 pb-4">
      
      {/* ── 1. Top Colorful Mesh Gradient Banner (Screenshots 2-5 Exact) ── */}
      <div className="h-14 sm:h-16 w-full bg-gradient-to-r from-[#e11d48] via-[#a855f7] to-[#6701e6] relative shrink-0">
        
        {/* Top-left Sign out Link */}
        <button
          type="button"
          onClick={handleSignOut}
          className="absolute top-2.5 left-5 text-white/85 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Sign out</span>
          <span className="text-xs">→</span>
        </button>

        {/* Center Intersecting Avatar Badge */}
        <div className="absolute left-1/2 -bottom-5 -translate-x-1/2 flex items-center justify-center">
          <div
            className="relative cursor-pointer group"
            onClick={fireCelebrationBomb}
            title="Click for celebration bomb!"
          >
            {/* Gray avatar silhouette circle */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 fill-gray-400" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>

            {/* Overlapping white circle with purple heart */}
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border border-gray-100 shadow-sm absolute -bottom-0.5 -right-0.5 flex items-center justify-center text-[#6701e6] group-hover:scale-115 transition-transform">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#6701e6">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Onboarding Steps Container ── */}
      <div className="flex-1 flex flex-col justify-start pt-7 sm:pt-8 px-4 max-w-5xl mx-auto w-full">
        
        {/* ── STEP 1: First Name (Screenshot 2 Exact) ── */}
        {step === 1 && (
          <div className="text-center animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 tracking-tight">
              Welcome to Panda Praise!
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              What's your first name? We'll use this to personalize your experience.
            </p>

            <form onSubmit={handleStep1Submit} className="max-w-md mx-auto mt-8">
              <input
                type="text"
                autoFocus
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your First Name"
                className="w-full px-5 py-3.5 rounded-xl border-2 border-[#6701e6] focus:outline-none focus:ring-4 focus:ring-[#6701e6]/15 text-sm sm:text-base text-gray-900 font-medium placeholder-gray-400 text-left shadow-xs transition-all"
              />
              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer"
              >
                Continue →
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: What do you want to sell more of? (Screenshot 3 Exact) ── */}
        {step === 2 && (
          <div className="text-center animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 tracking-tight">
              What do you want to sell more of?
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              We'll send you tips to grow faster with Panda Praise.
            </p>

            <div className="max-w-md mx-auto mt-8 space-y-2.5 text-left">
              {SELLING_OPTIONS.map((opt) => {
                const isSelected = sellingCategory === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectCategory(opt)}
                    className={`w-full px-4 py-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-[#6701e6] bg-purple-50/40 ring-2 ring-[#6701e6]/10'
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#6701e6] bg-[#6701e6]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {opt}
                    </span>
                  </button>
                );
              })}

              {/* Proceed / Continue Button */}
              <button
                type="button"
                id="onboarding-step2-proceed-btn"
                onClick={handleStep2Proceed}
                className="w-full mt-5 py-3.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue</span>
                <span className="text-base">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Website URL (Screenshot 4 Exact) ── */}
        {step === 3 && (
          <div className="text-center animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 tracking-tight max-w-xl mx-auto leading-snug">
              Hi {firstName || 'there'}! What website, product or service do you want to collect testimonials for?
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              We'll create a project for you.
            </p>

            <form onSubmit={handleStep3Submit} className="max-w-md mx-auto mt-8 text-left">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Website URL
              </label>
              <input
                type="text"
                inputMode="url"
                autoFocus
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-[#6701e6] focus:outline-none focus:ring-4 focus:ring-[#6701e6]/15 text-sm text-gray-900 font-medium placeholder-gray-400 shadow-xs transition-all"
              />
              <button
                type="submit"
                className="w-full mt-4 py-3.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer"
              >
                Create Project & Setup Account →
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 4: Setting up your account Animation & Ready State ── */}
        {/* ── STEP 4: Setting up your account Animation & Ready State ── */}
        {step === 4 && (
          <div className="text-center animate-fade-in w-full max-w-xl mx-auto my-auto py-2 sm:py-4">
            <h1 className="text-xl sm:text-2xl font-extrabold font-display text-gray-900 tracking-tight leading-tight">
              {isSetupComplete ? (
                <span>Your workspace is ready, {firstName || 'there'}! 🎉</span>
              ) : (
                <span>Setting up your workspace for {websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'your business'}...</span>
              )}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isSetupComplete ? (
                <span>Your project, collection form, and Wall of Love are live. Launching your dashboard...</span>
              ) : (
                <span>We're preparing your collection form, embed widgets, and Wall of Love.</span>
              )}
            </p>

            {/* Setup Progress & Dominant Action Card */}
            <div className="max-w-md mx-auto mt-4 sm:mt-5 p-5 rounded-3xl bg-white border border-gray-200/90 text-left shadow-xl shadow-purple-950/5 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0 transition-all ${
                    isSetupComplete ? 'bg-emerald-600' : 'bg-[#6701e6] animate-pulse'
                  }`}
                >
                  {isSetupComplete ? (
                    <Check className="w-5 h-5 text-white stroke-[2.5]" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 text-xs sm:text-sm">
                      {isSetupComplete ? 'Account & Project Ready' : 'Setting up your account'}
                    </p>
                    <span className="text-xs font-semibold text-gray-500 font-mono">
                      {setupProgress}%
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {setupStatusText}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isSetupComplete ? 'bg-emerald-500' : 'bg-[#6701e6]'
                  }`}
                  style={{ width: `${setupProgress}%` }}
                />
              </div>

              {/* Ready Checklist */}
              {isSetupComplete && (
                <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs text-gray-600 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Workspace initialized for {websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'your brand'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Public collection form live</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                    <span>Wall of Love publishing enabled</span>
                  </div>
                </div>
              )}

              {/* Dominant Primary Action Button */}
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  id="onboarding-dashboard-cta"
                  onClick={() => {
                    analytics.signupCompleted();
                    navigate('/dashboard');
                  }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#6701e6] hover:bg-[#5200bd] text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-900/20 hover:shadow-purple-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2 group ring-2 ring-[#6701e6]/30"
                >
                  <span>{isSetupComplete ? 'Go to My Dashboard 🚀' : 'Proceed to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="text-center text-[11px] text-gray-500">
                  {isSetupComplete ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Redirecting to dashboard automatically...
                    </span>
                  ) : (
                    <span>Finishing background setup...</span>
                  )}
                </div>
              </div>
            </div>

            {/* Welcome Hub Quick-Start Tip (Replaces the 4 redundant cards) */}
            <div className="mt-4 sm:mt-5 max-w-md mx-auto p-3.5 rounded-2xl bg-purple-50/80 border border-purple-100/90 shadow-2xs flex items-center gap-3 text-left animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#6701e6] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-purple-950 leading-tight">
                  Interactive Welcome Hub Ready
                </p>
                <p className="text-[11px] text-purple-900/80 leading-tight mt-0.5">
                  Your collection link, review importer, and embed widgets are waiting inside your dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
