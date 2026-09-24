import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { Check, ArrowRight } from 'lucide-react';

const SELLING_OPTIONS = [
  'Courses',
  'SaaS subscriptions',
  'Physical products (ecom)',
  'Coaching calls',
  'Digital products',
  'Live events',
];

const ONBOARDING_TESTIMONIALS = [
  {
    name: 'LaShonda Brown',
    role: 'Tech Educator & YouTuber',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: 'Effective tech tools are great. Effective tools run by incredibly supportive humans, even better.',
    badge: '𝕏',
  },
  {
    name: 'femke',
    role: '@femkesvs',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: "I switched to @PandaPraise to collect testimonials and it's my fav tool of the year! A+ all around from their design to their support, speed & innovation 🦄 🔥",
    badge: '𝕏',
    highlight: "it's my fav tool of the year",
  },
  {
    name: 'Devin Lee',
    role: 'Systems Strategist',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: 'I thooouugghhtt I had a great system for collecting testimonials. It wasn’t until I started using Panda Praise that I realized how much better it could be!',
  },
  {
    name: 'Anke V.',
    role: 'Web Designer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
    stars: 5,
    text: 'Super easy to set up and start collecting testimonials with video or text. I highly recommend it to all my clients.',
    highlight: 'recommend it to all',
  },
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
  const [countdown, setCountdown] = useState(4);

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (websiteUrl.trim()) {
      setStep(4);
    }
  };

  const setupRanRef = useRef(false);

  // Step 4: Multi-stage setup pipeline with tangible feedback
  useEffect(() => {
    if (step === 4 && !setupRanRef.current) {
      setupRanRef.current = true;
      let isMounted = true;

      const runSetup = async () => {
        try {
          // Stage 1: Workspace Initialization
          if (isMounted) {
            setSetupProgress(35);
            setSetupStatusText('Configuring workspace & permissions...');
          }
          await new Promise((r) => setTimeout(r, 450));

          // Stage 2: Project persistence
          if (isMounted) {
            setSetupProgress(70);
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
                new Promise((resolve) => setTimeout(resolve, 800)),
              ]);
            } catch (err) {
              console.warn('[Onboarding] Non-blocking project update error:', err);
            }
          }
          await new Promise((r) => setTimeout(r, 450));

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

  // Step 4: Transparent, user-controlled countdown once setup completes
  useEffect(() => {
    if (step === 4 && isSetupComplete) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, isSetupComplete, navigate]);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-purple-500/20 selection:text-purple-900 pb-16">
      
      {/* ── 1. Top Colorful Mesh Gradient Banner (Screenshots 2-5 Exact) ── */}
      <div className="h-28 sm:h-32 w-full bg-gradient-to-r from-[#e11d48] via-[#a855f7] to-[#6701e6] relative">
        
        {/* Top-left Sign out Link */}
        <button
          type="button"
          onClick={handleSignOut}
          className="absolute top-5 left-6 text-white/85 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Sign out</span>
          <span className="text-sm">→</span>
        </button>

        {/* Center Intersecting Avatar Badge */}
        <div className="absolute left-1/2 -bottom-9 -translate-x-1/2 flex items-center justify-center">
          <div
            className="relative cursor-pointer group"
            onClick={fireCelebrationBomb}
            title="Click for celebration bomb!"
          >
            {/* Gray avatar silhouette circle */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform">
              <svg className="w-9 h-9 sm:w-10 sm:h-10 fill-gray-400" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>

            {/* Overlapping white circle with purple heart */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border-2 border-gray-100 shadow-lg absolute -bottom-1 -right-1 flex items-center justify-center text-[#6701e6] group-hover:scale-115 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#6701e6">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Onboarding Steps Container ── */}
      <div className="flex-1 flex flex-col justify-start pt-14 sm:pt-16 px-4 sm:px-6 max-w-3xl mx-auto w-full">
        
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
                type="url"
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
        {step === 4 && (
          <div className="text-center animate-fade-in w-full">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 tracking-tight max-w-xl mx-auto leading-snug">
              {isSetupComplete ? (
                <span>Your workspace is ready, {firstName || 'there'}! 🎉</span>
              ) : (
                <span>Setting up your workspace for {websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'your business'}...</span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {isSetupComplete ? (
                <span>Your project, collection form, and Wall of Love have been successfully generated.</span>
              ) : (
                <span>We're preparing your collection form, embed widgets, and Wall of Love.</span>
              )}
            </p>

            {/* Setup Progress & Action Card */}
            <div className="max-w-md mx-auto mt-8 p-5 sm:p-6 rounded-2xl bg-gray-50/95 border border-gray-200/90 text-left shadow-sm">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 transition-all ${
                    isSetupComplete ? 'bg-emerald-600' : 'bg-[#6701e6] animate-pulse'
                  }`}
                >
                  {isSetupComplete ? (
                    <Check className="w-6 h-6 text-white stroke-[2.5]" />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 text-sm">
                      {isSetupComplete ? 'Account & Project Ready' : 'Setting up your account'}
                    </p>
                    <span className="text-xs font-semibold text-gray-500 font-mono">
                      {setupProgress}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {setupStatusText}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isSetupComplete ? 'bg-emerald-500' : 'bg-[#6701e6]'
                  }`}
                  style={{ width: `${setupProgress}%` }}
                />
              </div>

              {/* Ready Checklist */}
              {isSetupComplete && (
                <div className="mt-4 pt-3 border-t border-gray-200/80 space-y-1.5 text-xs text-gray-600 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Workspace initialized for {websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'your brand'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Public testimonial collection form created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Wall of Love publishing live</span>
                  </div>
                </div>
              )}

              {/* Direct Action Button: Always available so user can proceed without waiting or getting stuck */}
              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    analytics.signupCompleted();
                    navigate('/dashboard');
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isSetupComplete ? 'Go to My Dashboard' : 'Proceed to Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 pt-0.5">
                  <span>
                    {isSetupComplete
                      ? `Continuing automatically in ${countdown}s...`
                      : 'Setting up your workspace...'}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/onboarding/upgrade')}
                    className="text-[#6701e6] hover:underline font-semibold cursor-pointer"
                  >
                    See Formats & Plans →
                  </button>
                </div>
              </div>
            </div>

            {/* Join 1000s of happy users Testimonial Carousel */}
            <div className="mt-14 w-full">
              <h3 className="text-sm font-bold text-gray-900 mb-5">
                Join 1000s of happy users
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left max-w-5xl mx-auto px-2">
                {ONBOARDING_TESTIMONIALS.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={t.avatar}
                            alt={t.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-gray-900 truncate">{t.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{t.role}</p>
                          </div>
                        </div>
                        {t.badge && (
                          <span className="text-[11px] font-mono text-gray-400 font-bold">{t.badge}</span>
                        )}
                      </div>

                      <div className="flex text-amber-500 text-xs mb-2">★★★★★</div>

                      <p className="text-xs text-gray-700 leading-relaxed">
                        {t.highlight ? (
                          <>
                            {t.text.split(t.highlight)[0]}
                            <mark className="bg-amber-100/90 text-gray-950 px-1 py-0.5 rounded font-medium">
                              {t.highlight}
                            </mark>
                            {t.text.split(t.highlight)[1]}
                          </>
                        ) : (
                          t.text
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
