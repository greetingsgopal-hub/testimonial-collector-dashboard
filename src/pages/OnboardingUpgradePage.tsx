import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Crown,
  Grid,
  Gem,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';

export const OnboardingUpgradePage: React.FC = () => {
  usePageSeo({
    title: 'Choose Your Plan — Panda Praise',
    description: 'Lifetime access for $150 or subscribe monthly. Pick the option that works for you.',
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'showcase' | 'plans'>('showcase');

  const userInitial = (user?.displayName || user?.email || 'G').charAt(0).toUpperCase();

  const handleContinueToDashboard = () => {
    analytics.signupCompleted();
    navigate('/dashboard');
  };

  const handleSelectPlan = (plan: 'free' | 'founding' | 'subscription') => {
    analytics.ctaClicked(`select_plan_${plan}`, '/dashboard');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 flex flex-col font-sans selection:bg-purple-500/20 selection:text-purple-900 pb-28">
      
      {/* Top Ribbon */}
      <div className="h-20 sm:h-24 w-full bg-[#6701e6] relative">
        <div className="absolute left-1/2 -bottom-7 sm:-bottom-8 -translate-x-1/2 flex items-center justify-center">
          <div className="flex items-center">
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-gray-400 z-10">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-gray-400" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gray-300 border-4 border-white shadow-md -ml-4 flex items-center justify-center z-20">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-gray-500" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#6701e6] border-4 border-white shadow-md -ml-4 flex items-center justify-center text-white font-bold text-sm sm:text-base z-30">
              {userInitial}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-14 sm:pt-16 px-6 max-w-4xl mx-auto">
        {viewMode === 'showcase' ? (
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mb-3">
              Share testimonials in more ways
            </h1>
            <p className="text-sm text-gray-600 mb-8 max-w-lg mx-auto">
              Create beautiful Walls of Love, embed widgets, generate social cards, and showcase video testimonials everywhere.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { icon: Grid, label: 'Wall of Love' },
                { icon: Crown, label: 'Widget Embeds' },
                { icon: Gem, label: 'Social Cards' },
                { icon: Crown, label: 'Video Widgets' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center gap-2 shadow-xs">
                  <Icon className="w-7 h-7 text-[#6701e6]" />
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setViewMode('plans')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              See Pricing Options
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mb-3">
              Choose your plan
            </h1>
            <p className="text-sm text-gray-600 mb-8">
              Pay once for lifetime access, or subscribe month-to-month.
            </p>

            {/* Founding Member */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative rounded-3xl bg-gradient-to-b from-violet-100 to-purple-50 border-2 border-[#6701e6] p-6 shadow-lg">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Gem size={10} />
                    Founding Member
                  </span>
                </div>

                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-black text-gray-950">$150</span>
                  <span className="text-base font-bold text-gray-600">ONE TIME</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Lifetime access. No recurring charges.</p>

                <button
                  type="button"
                  onClick={() => handleSelectPlan('founding')}
                  className="w-full py-3 rounded-xl bg-[#6701e6] hover:bg-[#5400bd] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Crown size={14} className="text-amber-400" />
                  Become a Founding Member
                </button>
              </div>
            </div>

            {/* Subscription Options */}
            <div className="flex items-center gap-3 max-w-md mx-auto mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Or subscribe</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-8">
              <div className="rounded-2xl bg-white border border-gray-200 p-4 text-left">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Best Value</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black text-gray-950">$5</span>
                  <span className="text-xs text-gray-500">/mo</span>
                </div>
                <p className="text-[10px] text-gray-500">$60 billed annually</p>
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 p-4 text-left">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Monthly</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black text-gray-950">$10</span>
                  <span className="text-xs text-gray-500">/mo</span>
                </div>
                <p className="text-[10px] text-gray-500">Billed monthly</p>
              </div>
            </div>

            {/* Free Option */}
            <button
              type="button"
              onClick={() => handleSelectPlan('free')}
              className="text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
            >
              Continue with Free Plan
            </button>
          </div>
        )}
      </div>

      {/* Bottom Sticky Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={handleContinueToDashboard}
          className="px-6 sm:px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-bold text-sm sm:text-base rounded-full shadow-2xl flex items-center gap-2 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer border border-white/20"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default OnboardingUpgradePage;
