import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Star, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { GoogleIcon } from '../components/auth/GoogleIcon';

export const LoginPage: React.FC = () => {
  usePageSeo({
    title: 'Login to Panda Praise',
    description: 'Log in to your Panda Praise account to manage and moderate customer testimonials.',
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { signIn, signInWithGoogle, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectQuery = queryParams.get('redirect');
  const emailQuery = queryParams.get('email');
  const redirectPath = (location.state as any)?.from?.pathname || redirectQuery || '/dashboard';

  React.useEffect(() => {
    if (emailQuery && !email) {
      setEmail(emailQuery);
    }
  }, [emailQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(email, password);
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setLocalError(res.error || 'Failed to sign in. Please verify credentials.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleSubmitting) {
      setIsGoogleSubmitting(false);
      return;
    }
    setLocalError(null);
    setIsGoogleSubmitting(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        navigate(redirectPath, { replace: true });
      } else {
        setLocalError(res.error || 'Failed to sign in with Google.');
      }
    } catch (err: any) {
      setLocalError(err.message || 'An error occurred during Google sign-in.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex font-sans selection:bg-purple-500/20 selection:text-purple-900">
      
      {/* ── Left Column: Clean & Centered Auth Card ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 py-8 sm:py-12 overflow-y-auto min-h-screen">
        <div className="w-full max-w-[420px] mx-auto text-left">
          
          {/* Brand Purple Heart Logo */}
          <div className="mb-4">
            <Link to="/" className="inline-block transition-transform hover:scale-105" title="Panda Praise Home">
              <svg width="34" height="32" viewBox="0 0 24 24" fill="#6701e6" className="text-[#6701e6]">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-950 font-display">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
            Sign in to manage, moderate, and publish your customer testimonials.
          </p>

          {/* Error Banner */}
          {(localError || authError) && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{localError || authError}</span>
            </div>
          )}

          {/* Social Sign-In Primary Section (Reduced Friction) */}
          <div className="mt-6 space-y-4">
            <button
              id="google-signin-btn"
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/80 text-gray-800 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>{isGoogleSubmitting ? 'Signing in with Google... (Click to cancel)' : 'Sign in with Google'}</span>
            </button>

            {/* Clear Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-gray-400 font-semibold uppercase tracking-wider absolute">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] text-sm text-gray-900 placeholder-gray-400 transition-all shadow-2xs"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6701e6]/20 focus:border-[#6701e6] text-sm text-gray-900 placeholder-gray-400 transition-all shadow-2xs"
              />

              {/* Forgot password explicit text link beneath input box */}
              <div className="flex justify-end pt-1.5">
                <Link
                  id="forgot-password-link"
                  to="/forgot-password"
                  className="text-xs font-medium text-[#6701e6] hover:text-[#5200bd] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-950 hover:bg-gray-800 text-white font-semibold text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Welcoming bottom signup prompt */}
          <div className="mt-8 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-600">
              Don't have an account?{' '}
              <Link
                id="signup-prompt-link"
                to="/signup"
                className="text-[#6701e6] font-bold hover:underline transition-colors inline-flex items-center gap-0.5 ml-1"
              >
                Sign up for free →
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* ── Right Column: Modern, Distraction-Free Customer Success Showcase ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1e1035] via-[#2d1254] to-[#0f0728] p-10 xl:p-16 flex-col justify-between relative overflow-hidden text-white select-none">
        
        {/* Soft ambient background glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-900/30 blur-3xl" />

        {/* Top: Brand Value Statement */}
        <div className="relative z-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-xs font-bold text-purple-200 border border-purple-400/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Panda Praise Proof Engine</span>
          </div>
          <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-white font-display mt-4 leading-tight max-w-md">
            Turn customer praise into your highest-converting sales asset.
          </h2>
        </div>

        {/* Middle: Featured Customer Success Card */}
        <div className="relative z-10 my-auto text-left max-w-lg">
          <div className="p-6 sm:p-7 rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-2xl space-y-4">
            
            {/* 5 Gold Stars */}
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Testimonial Quote */}
            <p className="text-sm sm:text-base text-purple-100 font-medium leading-relaxed">
              "Panda Praise helped us collect over 140 authentic customer testimonials in our first two weeks. Conversion on our SaaS landing page jumped by 32% within 3 days of embedding the Wall of Love."
            </p>

            {/* Author Profile */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-300 flex items-center justify-center font-bold text-gray-950 text-sm shadow-sm shrink-0">
                SJ
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Sarah Jenkins</span>
                <span className="text-[11px] text-purple-200/80 block">Head of Growth at OrbitSaaS</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom: Live Social Proof Metrics */}
        <div className="relative z-10 flex items-center justify-between text-xs text-purple-200/80 border-t border-white/10 pt-4">
          <span>4,200+ Testimonials Collected</span>
          <span>•</span>
          <span>99.9% Widget Uptime</span>
          <span>•</span>
          <span>Zero-Code Setup</span>
        </div>

      </div>

    </div>
  );
};
