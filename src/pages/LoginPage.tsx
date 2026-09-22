import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, BookOpen } from 'lucide-react';
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

  const { signIn, signInWithGoogle, enableDemoMode, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as any)?.from?.pathname || '/dashboard';

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

  const handleDemoLogin = () => {
    enableDemoMode();
    navigate('/dashboard', { replace: true });
  };

  const handleGoogleSignIn = async () => {
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
      
      {/* ── Left Column: Login Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 xl:px-24 py-12">
        <div className="w-full max-w-md mx-auto">
          
          {/* Brand Purple Heart Symbol */}
          <div className="mb-6">
            <Link to="/" className="inline-block transition-transform hover:scale-105" title="Panda Praise Home">
              <svg width="38" height="36" viewBox="0 0 24 24" fill="#6701e6" className="text-[#6701e6]">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-gray-950 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Sign in to manage and share your customer testimonials.
          </p>

          {(localError || authError) && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6701e6] focus:border-[#6701e6] text-sm text-gray-900 placeholder-gray-400 bg-white transition-all shadow-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#6701e6] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6701e6] focus:border-[#6701e6] text-sm text-gray-900 placeholder-gray-400 bg-white transition-all shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-black hover:bg-gray-800 text-white font-bold text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50 mt-5"
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>

            <button
              type="button"
              disabled={isSubmitting || isGoogleSubmitting}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>{isGoogleSubmitting ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 px-4 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>⚡ Open Demo Workspace</span>
            </button>
          </form>

          <p className="mt-8 text-xs text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#6701e6] font-bold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Column: Testimonials Showcase ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#6701e6] p-10 xl:p-14 flex-col justify-center relative overflow-hidden text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-900/40 blur-3xl" />

        <div className="relative z-10 max-w-lg mx-auto w-full space-y-6">
          <div className="rounded-3xl bg-white/10 border border-white/15 p-6 xl:p-7 backdrop-blur-md shadow-2xl">
            <div className="flex items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                alt="Devin Lee"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shrink-0"
              />
              <div>
                <div className="flex text-amber-400 text-sm mb-1.5">★★★★★</div>
                <p className="text-base sm:text-lg font-bold leading-snug">
                  It took mere minutes to get set up and add GORGEOUS testimonials to my website
                </p>
                <p className="text-xs text-white/80 mt-2">
                  Devin Lee <span className="text-emerald-400 font-medium">/ Systems Strategist</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 border border-white/15 p-6 xl:p-7 backdrop-blur-md shadow-2xl">
            <div className="flex items-start gap-4">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80"
                alt="Jamie Northrup"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shrink-0"
              />
              <div>
                <div className="flex text-amber-400 text-sm mb-1.5">★★★★★</div>
                <p className="text-base sm:text-lg font-bold leading-snug">
                  Took me less than 5 minutes to start collecting
                </p>
                <p className="text-xs text-white/80 mt-2">
                  Jamie Northrup <span className="text-emerald-400 font-medium">/ Minimalist Hustler</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-lg">
          <BookOpen className="w-4 h-4" />
        </div>
      </div>

    </div>
  );
};
