import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Mail, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';

export const VerifyEmailPage: React.FC = () => {
  usePageSeo({
    title: 'Verify Your Email — Panda Praise',
    description: 'Verify your email address to unlock full publishing, 1-click social broadcasting, and review collection with Panda Praise.',
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isEmailVerified, sendVerificationEmail, verifyEmailWithCode, checkVerificationStatus } = useAuth();

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manual code or link input
  const [manualCode, setManualCode] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Resend cooldown timer
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Auto redirect countdown on success
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Cooldown countdown effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Auto redirect effect on success
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (status === 'success' && redirectCountdown > 0) {
      timer = setTimeout(() => setRedirectCountdown((prev) => prev - 1), 1000);
    } else if (status === 'success' && redirectCountdown === 0) {
      navigate('/dashboard');
    }
    return () => clearTimeout(timer);
  }, [status, redirectCountdown, navigate]);

  // If user is already verified and no oobCode in URL, redirect or show success
  useEffect(() => {
    if (isEmailVerified && !searchParams.get('oobCode') && status !== 'success') {
      setStatus('success');
      setSuccessMessage('Your email address is already verified!');
    }
  }, [isEmailVerified, searchParams, status]);

  // Trigger confetti on success
  const triggerSuccessCelebration = () => {
    try {
      const testCanvas = document.createElement('canvas');
      if (typeof testCanvas.getContext === 'function' && testCanvas.getContext('2d')) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#3b82f6', '#8b5cf6'],
        });
      }
    } catch {
      // Ignored in headless tests
    }
  };

  // Helper to extract oobCode from URL or raw text
  const extractCode = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    try {
      if (trimmed.includes('oobCode=')) {
        const url = new URL(trimmed.startsWith('http') ? trimmed : `https://pandapraise.com/${trimmed}`);
        const code = url.searchParams.get('oobCode');
        if (code) return code;
      }
    } catch {
      // Not a valid URL, treat as raw code
    }
    return trimmed;
  };

  // 1. Automatic link verification from URL params
  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    const mode = searchParams.get('mode');

    // Only process email verification mode or direct oobCode
    if (oobCode && (!mode || mode === 'verifyEmail')) {
      const runVerification = async () => {
        setStatus('verifying');
        setErrorMessage(null);

        const res = await verifyEmailWithCode(oobCode);
        if (res.success) {
          setStatus('success');
          setSuccessMessage('Email verified successfully! Full publishing and broadcasting features unlocked.');
          triggerSuccessCelebration();
        } else {
          setStatus('error');
          setErrorMessage(res.error || 'The verification link is invalid or has expired. Please request a new link below.');
        }
      };

      runVerification();
    }
  }, [searchParams, verifyEmailWithCode]);

  // Handle manual code or link submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = extractCode(manualCode);
    if (!code) {
      setErrorMessage('Please paste your verification link or code.');
      return;
    }

    setIsSubmittingManual(true);
    setErrorMessage(null);
    try {
      const res = await verifyEmailWithCode(code);
      if (res.success) {
        setStatus('success');
        setSuccessMessage('Email verified successfully! Full publishing features unlocked.');
        triggerSuccessCelebration();
      } else {
        setErrorMessage(res.error || 'Invalid or expired verification code. Please check and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to verify code.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Handle resending verification email
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setErrorMessage(null);

    try {
      const res = await sendVerificationEmail();
      if (res.success) {
        setSuccessMessage('Fresh verification email sent! Please check your inbox and spam folder.');
        setCooldown(60);
      } else {
        setErrorMessage(res.error || 'Failed to send verification email. Please try again shortly.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error sending verification email.');
    } finally {
      setResending(false);
    }
  };

  // Handle checking verification status (e.g. if verified in another tab)
  const handleCheckStatus = async () => {
    if (checking) return;
    setChecking(true);
    setErrorMessage(null);

    try {
      const verified = await checkVerificationStatus();
      if (verified) {
        setStatus('success');
        setSuccessMessage('Email verified successfully! Full publishing features unlocked.');
        triggerSuccessCelebration();
      } else {
        setErrorMessage('Email is not yet verified. Please click the link in your email, then click refresh again.');
      }
    } catch {
      setErrorMessage('Failed to refresh status. Please check your network connection.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-violet-100 selection:text-violet-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              🐼
            </span>
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Panda Praise
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content Funnel */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 relative">
          {/* Subtle top brand gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-500" />

          {/* ── STATE 1: Verifying in progress ── */}
          {status === 'verifying' && (
            <div className="text-center py-8 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto shadow-inner">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Verifying Your Email...
                </h1>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Connecting to Panda Praise authentication to confirm your account credentials.
                </p>
              </div>
            </div>
          )}

          {/* ── STATE 2: Verification Success ── */}
          {status === 'success' && (
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Email Confirmed</span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Email Verified Successfully! 🎉
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-sm mx-auto">
                  {successMessage || 'Your email address is verified. You now have full access to automated review collection, 1-click social broadcasting, and live Wall of Love publishing.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Continue to Dashboard ({redirectCountdown}s)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STATE 3: Default Verification Hub / Error State ── */}
          {(status === 'idle' || status === 'error') && (
            <div className="space-y-6">
              {/* Header Icon & Title */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto shadow-inner border border-amber-500/20">
                  <Mail className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Verify Your Email Address
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  We sent a secure verification email to:
                  <br />
                  <span className="font-bold text-slate-900 text-sm mt-0.5 inline-block">
                    {user?.email || 'your registered email'}
                  </span>
                </p>
              </div>

              {/* Status Alert Messages */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              {successMessage && !errorMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">{successMessage}</div>
                </div>
              )}

              {/* 3 Step Guidance Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <span>How to Complete Verification</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Check your email inbox (and spam/promotions folder if not seen).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Click the <strong>Verify Email</strong> button in the email, or paste your verification link/code below.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Return to the dashboard to unlock 1-click social broadcasting and publishing.</span>
                  </li>
                </ul>
              </div>

              {/* Manual Code / Link Entry Form */}
              <form onSubmit={handleManualSubmit} className="space-y-2.5">
                <label htmlFor="manual-verification-code" className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-violet-600" />
                  <span>Paste Verification Link or Code</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="manual-verification-code"
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="https://pandapraise.com/verify-email?oobCode=... or code"
                    className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10 text-slate-900 transition-all font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingManual || !manualCode.trim()}
                    className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
                  >
                    {isSubmittingManual ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </form>

              {/* Action Buttons: Resend & Refresh Status */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  id="resend-verification-btn"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="w-full sm:flex-1 py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}</span>
                </button>

                <button
                  type="button"
                  id="check-status-btn"
                  onClick={handleCheckStatus}
                  disabled={checking}
                  className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 text-emerald-400 ${checking ? 'animate-spin' : ''}`} />
                  <span>{checking ? 'Checking...' : "I've Verified"}</span>
                </button>
              </div>

              {/* Back to Dashboard Footer Link */}
              <div className="text-center pt-1">
                <Link
                  to="/dashboard"
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
                >
                  <span>Skip for now and continue to Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200/60 bg-white/50">
        <span>Panda Praise 🐾 • Enterprise-Grade Social Proof Verification</span>
      </footer>
    </div>
  );
};

export default VerifyEmailPage;
