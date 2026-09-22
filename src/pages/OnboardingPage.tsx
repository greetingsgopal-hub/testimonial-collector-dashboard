import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';

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
  const [websiteUrl, setWebsiteUrl] = useState(project?.websiteUrl || 'https://senja.io');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim()) {
      setStep(2);
    }
  };

  const handleSelectCategory = (cat: string) => {
    setSellingCategory(cat);
    // Smooth advance to Step 3
    setTimeout(() => {
      setStep(3);
    }, 150);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (websiteUrl.trim()) {
      setStep(4);
    }
  };

  // Step 4: Countdown / Setup animation then redirect to Dashboard
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(async () => {
        try {
          if (project?.id) {
            const domainName = websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            await updateProjectDetails(project.id, {
              name: domainName ? domainName.split('.')[0] : (firstName ? `${firstName}'s Project` : project.name),
              websiteUrl: websiteUrl.trim(),
            });
          }
        } catch (err) {
          console.error('Failed to update project during onboarding:', err);
        } finally {
          analytics.signupCompleted();
          navigate('/onboarding/upgrade');
        }
      }, 2400);

      return () => clearTimeout(timer);
    }
  }, [step, project?.id, websiteUrl, firstName, updateProjectDetails, navigate]);

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
          <div className="relative">
            {/* Gray avatar silhouette circle */}
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-gray-400">
              <svg className="w-9 h-9 sm:w-10 sm:h-10 fill-gray-400" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>

            {/* Overlapping white circle with purple heart */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border-2 border-gray-100 shadow-lg absolute -bottom-1 -right-1 flex items-center justify-center text-[#6701e6]">
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
                placeholder="https://senja.io"
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

        {/* ── STEP 4: Setting up your account Animation (Screenshot 5 Exact) ── */}
        {step === 4 && (
          <div className="text-center animate-fade-in w-full">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 tracking-tight max-w-xl mx-auto leading-snug">
              Hi {firstName || 'there'}! What website, product or service do you want to collect testimonials for?
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              We'll create a project for you.
            </p>

            {/* Pulsing Setup Card (Screenshot 5 Exact) */}
            <div className="max-w-md mx-auto mt-8 p-4 sm:p-5 rounded-full bg-gray-50/90 border border-gray-200/80 flex items-center gap-4 shadow-sm">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#6701e6] flex items-center justify-center text-white shadow-md animate-pulse shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm">Setting up your account</p>
                <p className="text-xs text-gray-500">This should take less than a minute.</p>
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
