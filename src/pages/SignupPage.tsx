import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { GoogleIcon } from '../components/auth/GoogleIcon';
import { ScrollingTestimonials } from '../components/auth/ScrollingTestimonials';

export const SignupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isViral = searchParams.get('source') === 'testimonial';

  usePageSeo({
    title: isViral
      ? 'Get Your Free Panda Praise Link — Sign Up'
      : 'Welcome to Panda Praise — Sign up',
    description: 'Panda Praise helps you start collecting, managing and sharing your testimonials in minutes, not days.',
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isExistingAccount, setIsExistingAccount] = useState(false);

  const { 
    user, 
    signUp, 
    signInWithGoogle, 
    enableDemoMode, 
    updateProjectDetails, 
    updateCollectionFormDetails, 
    project, 
    collectionForm 
  } = useAuth();
  const navigate = useNavigate();

  // Read viral context from sessionStorage if available
  const [viralContext, setViralContext] = useState<{
    customerFirstName?: string;
    customerName?: string;
    customerEmail?: string;
    referredFromProjectId?: string;
    referredFromFormId?: string;
  } | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('pandapraise_viral_origin');
      if (stored) {
        const parsed = JSON.parse(stored);
        setViralContext(parsed);
        if (parsed.customerEmail) {
          setEmail(parsed.customerEmail);
        }
      }
    } catch (e) {
      // Ignore
    }

    if (isViral) {
      analytics.viralSignupStarted({ source: 'testimonial' });
    }
  }, [isViral]);

  const handlePostSignupRedirect = async (userEmail: string) => {
    if (isViral || viralContext) {
      analytics.viralSignupCompleted();
      analytics.viralWorkspaceCreated();
      analytics.viralCollectionLinkGenerated();

      // Ensure project name is neutral or based on the new user (Requirement 10: NEVER name Customer B after Business A!)
      const rawName = viralContext?.customerFirstName || viralContext?.customerName || userEmail.split('@')[0] || 'My';
      const cleanFirstName = rawName.trim().split(' ')[0];
      const newBusinessName = `${cleanFirstName}'s Testimonials`;
      const formTitle = `Share your experience with ${newBusinessName}`;

      if (project?.id && updateProjectDetails) {
        try {
          await updateProjectDetails(project.id, {
            name: newBusinessName,
          });
          if (collectionForm?.id && updateCollectionFormDetails) {
            await updateCollectionFormDetails(collectionForm.id, {
              title: formTitle,
            });
          }
        } catch (e) {
          // Non-blocking
        }
      }

      navigate('/ready');
    } else {
      analytics.signupCompleted();
      navigate('/onboarding');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsExistingAccount(false);

    if (!email.trim() || !password) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signUp(email, password);
      if (res.success) {
        await handlePostSignupRedirect(email);
      } else {
        const errMsg = res.error || 'Failed to create account.';
        if (errMsg.includes('auth/email-already-in-use') || errMsg.toLowerCase().includes('already in use') || errMsg.toLowerCase().includes('already exists')) {
          setIsExistingAccount(true);
          setLocalError('An account with this email already exists.');
        } else {
          setLocalError(errMsg);
        }
      }
    } catch (err: any) {
      const errMsg = err.message || 'An error occurred during registration.';
      if (errMsg.includes('auth/email-already-in-use') || errMsg.toLowerCase().includes('already in use')) {
        setIsExistingAccount(true);
        setLocalError('An account with this email already exists.');
      } else {
        setLocalError(errMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignup = async () => {
    enableDemoMode();
    await handlePostSignupRedirect('demo@pandapraise.dev');
  };

  const handleGoogleSignup = async () => {
    setLocalError(null);
    setIsGoogleSubmitting(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        await handlePostSignupRedirect(email || 'user@pandapraise.dev');
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
    <div className="min-h-screen bg-white text-gray-900 flex font-sans selection:bg-purple-500/20 selection:text-purple-900">
      
      {/* ── Left Column: Sign up Form ── */}
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

          {/* Account already exists recovery prompt (Priority 8) */}
          {isExistingAccount && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2 animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>An account with this email already exists!</span>
              </div>
              <p className="text-amber-800">
                You already have a Panda Praise account. Log in with your password to access your existing collection link and dashboard without creating duplicate workspaces.
              </p>
              <Link
                to={`/login?redirect=/ready&email=${encodeURIComponent(email)}`}
                className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white font-bold text-xs transition-all shadow-xs"
              >
                <span>Log in to your account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Existing Logged-in Account Banner (Requirement 6 & 15) */}
          {user && (
            <div className="mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-2 animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-[#6701e6]" />
                <span>You are already signed in as {user.email}</span>
              </div>
              <p className="text-gray-600">
                You already have a Panda Praise account. Skip signup and proceed to your dashboard.
              </p>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="mt-1 px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>Continue to Your Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Viral Signup Badge */}
          {(isViral || viralContext) && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#6701e6] text-xs font-bold mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>⚡ Your Testimonial Link is 30 Seconds Away</span>
            </div>
          )}

          {/* Heading & Subtitle */}
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-gray-950 tracking-tight">
            {isViral || viralContext ? 'Start Collecting Testimonials' : 'Welcome to Panda Praise'}
          </h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {isViral || viralContext
              ? 'Create your free account. Your personalized testimonial collection link will be ready immediately.'
              : 'Panda Praise helps you start collecting, managing and sharing your testimonials in minutes, not days.'}
          </p>

          {/* Error Message Alert */}
          {localError && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError}</span>
            </div>
          )}

          {/* Form */}
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
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6701e6] focus:border-[#6701e6] text-sm text-gray-900 placeholder-gray-400 bg-white transition-all shadow-xs"
              />
            </div>

            {/* Terms & Privacy Acknowledgement */}
            <p className="text-[11px] text-gray-500 text-center leading-normal pt-1">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-[#6701e6] hover:underline font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-[#6701e6] hover:underline font-medium">
                Privacy Policy
              </Link>
              .
            </p>

            {/* Solid Black Sign up Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-black hover:bg-gray-800 text-white font-bold text-sm transition-colors shadow-xs cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Creating account...' : 'Sign up'}
            </button>

            {/* Sign up with Google Button */}
            <button
              type="button"
              disabled={isSubmitting || isGoogleSubmitting}
              onClick={handleGoogleSignup}
              className="w-full py-2.5 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>{isGoogleSubmitting ? 'Connecting...' : 'Sign up with Google'}</span>
            </button>

            {/* Instant Demo Sandbox Option */}
            <button
              type="button"
              onClick={handleDemoSignup}
              className="w-full py-2 px-4 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>⚡ Explore with Instant Demo Account</span>
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-8 text-xs text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6701e6] font-bold hover:underline">
              Login to your account
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Column: Continuous Auto-scrolling Testimonials (Senja Exact) ── */}
      <ScrollingTestimonials />

    </div>
  );
};
