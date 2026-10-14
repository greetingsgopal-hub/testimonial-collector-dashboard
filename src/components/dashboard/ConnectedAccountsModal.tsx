import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, Unlink, ExternalLink } from 'lucide-react';
import { SocialPlatform } from '../../types';
import { socialClient, SocialStatusResponse } from '../../lib/socialClient';
import { analytics } from '../../lib/analytics';

interface ConnectedAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const ConnectedAccountsModal: React.FC<ConnectedAccountsModalProps> = ({
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<SocialStatusResponse | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    const data = await socialClient.getStatus();
    setStatusData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (platform: SocialPlatform) => {
    setConnecting(platform);
    setError(null);
    analytics.socialConnectStarted(platform);

    const res = await socialClient.initOAuth(platform);
    setConnecting(null);

    if (res.error) {
      setError(res.error);
      analytics.socialConnectFailed(platform, res.error);
    } else if (res.authUrl) {
      window.location.href = res.authUrl;
    }
  };

  const handleDisconnect = async (platform: SocialPlatform) => {
    if (!confirm(`Are you sure you want to disconnect your ${platform} account? Your historical publication records will be preserved.`)) {
      return;
    }

    setDisconnecting(platform);
    const res = await socialClient.disconnect(platform);
    setDisconnecting(null);

    if (res.success) {
      analytics.socialAccountDisconnected(platform);
      await fetchStatus();
      if (onStatusUpdated) onStatusUpdated();
    } else {
      setError(res.error || 'Failed to disconnect account');
    }
  };

  const platforms: {
    id: SocialPlatform;
    name: string;
    connectLabel: string;
    description: string;
    iconColor: string;
    isBottomLight?: boolean;
    note?: string;
  }[] = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      connectLabel: 'Connect LinkedIn',
      description: 'Direct 1-click publishing to personal member profile and company page feeds via the official Posts API.',
      iconColor: '#0a66c2',
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      connectLabel: 'Connect X (Twitter)',
      description: 'Publish text and high-res cards directly to your X timeline.',
      iconColor: '#1d9bf0',
      note: 'Requires X Developer Portal credentials (API v2).',
    },
    {
      id: 'facebook',
      name: 'Facebook Pages',
      connectLabel: 'Connect Facebook Pages',
      description: 'Direct publishing to verified Facebook business and brand pages.',
      iconColor: '#1877f2',
      note: 'Requires Meta App Review for pages_manage_posts.',
    },
    {
      id: 'instagram',
      name: 'Instagram Business',
      connectLabel: 'Connect Instagram Business',
      description: 'Publish square posts and stories to connected Instagram Professional accounts.',
      iconColor: '#e1306c',
      note: 'Restricted by Meta to Business/Creator accounts linked to a Facebook Page.',
    },
    {
      id: 'google',
      name: 'Google Business Profile',
      connectLabel: 'Connect Google Business',
      description: 'Import verified Google reviews from your Business Profile locations.',
      iconColor: '#4285F4',
      isBottomLight: true,
      note: 'Import-only: connects Google Business Profile for review sync, not social publishing.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Connected Social Accounts
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 font-bold">
                OAuth 2.0 Secure
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Connect once to unlock instant 1-click social distribution for all approved customer wins.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Connection Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            /* Loading State */
            <div className="py-14 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-purple-600" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Checking account connection status…
              </p>
            </div>
          ) : (
            /* List State: Vertical list of clean white rows */
            <div className="space-y-3">
              {platforms.map((p) => {
                const conn = statusData?.connections[p.id];
                const isConnected = conn?.connected;
                const isExpired = conn?.status === 'expired';

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                      p.isBottomLight
                        ? 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-purple-200/80 dark:hover:border-purple-800/80'
                    }`}
                  >
                    <div className="space-y-1 sm:max-w-[65%]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {p.name}
                        </span>
                        {isConnected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Connected</span>
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
                            <AlertCircle className="w-3 h-3" />
                            <span>Expired</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                        {p.description}
                      </p>

                      {isConnected && conn?.accountName && (
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium pt-0.5">
                          Account: <span className="font-bold text-slate-900 dark:text-white">{conn.accountName}</span>
                          {conn.connectedAt && (
                            <span className="text-slate-400 font-normal">
                              {' '}
                              • Connected {new Date(conn.connectedAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      )}

                      {p.note && !isConnected && (
                        <p className="text-[11px] text-slate-400 italic">{p.note}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isConnected ? (
                        <button
                          type="button"
                          onClick={() => handleDisconnect(p.id)}
                          disabled={disconnecting === p.id}
                          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400 border border-slate-200/80 dark:border-slate-700 hover:border-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          <span>{disconnecting === p.id ? 'Disconnecting...' : 'Disconnect'}</span>
                        </button>
                      ) : isExpired ? (
                        <button
                          type="button"
                          onClick={() => handleConnect(p.id)}
                          disabled={connecting === p.id}
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${connecting === p.id ? 'animate-spin' : ''}`} />
                          <span>{connecting === p.id ? 'Redirecting...' : `Reconnect ${p.name}`}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConnect(p.id)}
                          disabled={connecting === p.id}
                          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs active:scale-95"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{connecting === p.id ? 'Redirecting...' : p.connectLabel}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Soft Purple Privacy Box */}
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 shadow-2xs">
            <p className="font-bold text-purple-700 dark:text-purple-300">
              Panda Praise Privacy & Security Guarantee:
            </p>
            <p>
              • Panda Praise never stores client secrets or raw tokens in the browser or public databases.
            </p>
            <p>
              • Customer emails, internal document IDs, and reviewer IPs are strictly stripped before reaching social media.
            </p>
            <p>
              • Disconnecting an account immediately removes tokens on the server without deleting historical publications.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
