import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertTriangle, RefreshCw, CheckCircle, Clock, KeyRound, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const EmailVerificationBanner: React.FC = () => {
  const { user, isEmailVerified, isDemoMode, sendVerificationEmail, verifyEmailWithCode, checkVerificationStatus } = useAuth();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [submittingCode, setSubmittingCode] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // If there is no user, user is in demo mode, or email is verified, hide the banner
  if (!user || isDemoMode || isEmailVerified) {
    return null;
  }

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setNotice(null);

    try {
      const res = await sendVerificationEmail();
      if (res.success) {
        setNotice({
          type: 'success',
          text: 'Verification link sent! Please check your inbox and spam folder.',
        });
        setCooldown(60); // 60s cooldown to prevent email spam
      } else {
        setNotice({
          type: 'error',
          text: res.error || 'Failed to send verification email. Please try again shortly.',
        });
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err?.message || 'An error occurred while sending verification email.',
      });
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    if (checking) return;
    setChecking(true);
    setNotice(null);

    try {
      const verified = await checkVerificationStatus();
      if (verified) {
        setNotice({
          type: 'success',
          text: 'Email verified successfully! Full publishing features unlocked.',
        });
      } else {
        setNotice({
          type: 'info',
          text: 'Email is not yet verified. Please click the link received in your email, then click here again.',
        });
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: 'Failed to refresh verification status. Please check your network connection.',
      });
    } finally {
      setChecking(false);
    }
  };

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

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = extractCode(manualCode);
    if (!code) {
      setNotice({ type: 'error', text: 'Please enter a valid verification code or link.' });
      return;
    }

    setSubmittingCode(true);
    setNotice(null);
    try {
      const res = await verifyEmailWithCode(code);
      if (res.success) {
        setNotice({
          type: 'success',
          text: 'Email verified successfully! Full publishing features unlocked.',
        });
        setShowCodeInput(false);
      } else {
        setNotice({
          type: 'error',
          text: res.error || 'Invalid or expired verification code.',
        });
      }
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err?.message || 'Failed to verify code.',
      });
    } finally {
      setSubmittingCode(false);
    }
  };

  return (
    <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 transition-all animate-fade-in shadow-2xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 shrink-0 mt-0.5">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-amber-950">Verify your email address</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200/80 text-amber-800">
                <AlertTriangle className="w-3 h-3" /> Unverified
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
              We sent a verification link to <span className="font-semibold text-amber-950">{user.email}</span>. Please verify your email to secure your account and unlock 1-click social broadcasting.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className="px-2.5 py-1.5 rounded-xl border border-amber-400/40 bg-white/60 hover:bg-white text-amber-900 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
            <span>{showCodeInput ? 'Hide Code Input' : 'Enter Code'}</span>
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="px-3 py-1.5 rounded-xl border border-amber-400/40 bg-white/80 hover:bg-white text-amber-900 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            {cooldown > 0 ? (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Resend ({cooldown}s)</span>
              </>
            ) : resending ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <span>Resend Email</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={checking}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {checking ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>I've Verified</span>
              </>
            )}
          </button>

          <Link
            to="/verify-email"
            className="p-1.5 rounded-xl text-amber-700 hover:text-amber-950 hover:bg-amber-500/20 transition-colors"
            title="Open Verification Center"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Expandable Manual Code Entry Input */}
      {showCodeInput && (
        <form onSubmit={handleManualVerify} className="mt-3 pt-3 border-t border-amber-500/20 flex items-center gap-2 animate-fade-in">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Paste verification link or oobCode..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
          />
          <button
            type="submit"
            disabled={submittingCode || !manualCode.trim()}
            className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {submittingCode ? 'Verifying...' : 'Submit Code'}
          </button>
        </form>
      )}

      {notice && (
        <div className={`mt-3 pt-2.5 border-t border-amber-500/20 text-xs flex items-center justify-between ${
          notice.type === 'success' ? 'text-emerald-700 font-semibold' : notice.type === 'error' ? 'text-rose-700' : 'text-amber-800'
        }`}>
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-amber-700/60 hover:text-amber-950 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
