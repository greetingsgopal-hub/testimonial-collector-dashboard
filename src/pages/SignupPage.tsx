import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../lib/firebase';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';
import { GoogleIcon } from '../components/auth/GoogleIcon';

export const SignupPage = () => {
  usePageSeo({
    title: 'Create Your Panda Praise Account',
    description: 'Sign up for Panda Praise to create your testimonial collection link and embed social proof on your website.',
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signUp, signInWithGoogle, enableDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signUp(email, password);
      if (res.success) {
        analytics.signupCompleted();
        setSuccessMessage('Account created successfully! Initializing workspace...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setLocalError(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'An error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignup = () => {
    enableDemoMode();
    navigate('/dashboard');
  };

  const handleGoogleSignup = async () => {
    setLocalError(null);
    setSuccessMessage(null);
    setIsGoogleSubmitting(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        analytics.signupCompleted();
        setSuccessMessage('Google account connected! Initializing workspace...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        setLocalError(res.error || 'Failed to sign up with Google.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'An error occurred during Google sign-up.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="ambient-glow" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-3 mb-4">
          <PandaPraiseIcon size={40} colorMode="gradient" className="shrink-0" />
          <span className="font-display font-extrabold text-xl text-white tracking-tight">
            Panda <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Praise</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
          Create your account
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Start collecting and publishing social proof in minutes.
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-5">
          
          {!isFirebaseConfigured && (
            <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/25 text-xs text-brand-300 space-y-2">
              <div className="font-semibold flex items-center gap-1.5 text-white">
                <AlertCircle className="w-4 h-4 text-brand-400" />
                <span>Firebase Cloud Not Configured</span>
              </div>
              <p className="leading-relaxed text-zinc-300">
                To enable live cloud user registration, add your Firebase credentials in <code className="text-brand-300 font-mono">.env</code>. Or start immediately in <strong>Demo Mode</strong>.
              </p>
              <button
                type="button"
                onClick={handleDemoSignup}
                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-brand-400" />
                <span>Explore with Demo Workspace</span>
              </button>
            </div>
          )}

          {/* Google Sign-up */}
          <button
            id="google-signup-btn"
            type="button"
            disabled={isSubmitting || isGoogleSubmitting}
            onClick={handleGoogleSignup}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer disabled:opacity-50 hover:shadow-lg"
          >
            {isGoogleSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-zinc-900 px-3 text-[11px] uppercase tracking-wider text-zinc-500 font-medium absolute">
              or continue with email
            </span>
          </div>

          {localError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  placeholder="founder@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password <span className="text-[10px] text-zinc-500 lowercase">(min 6 characters)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
