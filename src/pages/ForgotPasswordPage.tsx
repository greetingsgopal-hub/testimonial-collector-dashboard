import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageSeo } from '../lib/seo';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';

export const ForgotPasswordPage = () => {
  usePageSeo({
    title: 'Reset Password — Panda Praise',
    description: 'Reset your Panda Praise password to regain access to your dashboard.',
  });

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(email.trim());
      if (res.success) {
        setSuccessMessage('If an account exists with this email address, a password recovery link has been sent. Please check your inbox and spam folder.');
      } else {
        // If an unexpected system error occurred (e.g. network failure), display friendly error; otherwise neutral
        if (res.error?.toLowerCase().includes('network')) {
          setLocalError(res.error);
        } else {
          setSuccessMessage('If an account exists with this email address, a password recovery link has been sent. Please check your inbox and spam folder.');
        }
      }
    } catch (err: any) {
      setSuccessMessage('If an account exists with this email address, a password recovery link has been sent. Please check your inbox and spam folder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="ambient-glow" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center gap-3 mb-4">
          <PandaPraiseIcon size={40} colorMode="gradient" className="shrink-0" />
          <span className="font-display font-extrabold text-xl text-white tracking-tight">
            Panda <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Praise</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
          Reset your password
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Enter your email and we will send you a recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-5">
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
                Email Address
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-zinc-400 border-t border-zinc-800">
            <Link to="/login" className="text-zinc-400 hover:text-white flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
