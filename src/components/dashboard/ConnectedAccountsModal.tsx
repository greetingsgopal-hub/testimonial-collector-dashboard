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
    description: string;
    iconColor: string;
    requiresApproval?: boolean;
    note?: string;
  }[] = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Direct 1-click publishing to personal member profile and company page feeds via the official Posts API.',
      iconColor: '#0a66c2',
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      description: 'Publish text and high-res cards directly to your X timeline.',
      iconColor: '#1d9bf0',
      note: 'Requires X Developer Portal credentials (API v2).',
    },
    {
      id: 'facebook',
      name: 'Facebook Pages',
      description: 'Direct publishing to verified Facebook business and brand pages.',
      iconColor: '#1877f2',
      note: 'Requires Meta App Review for pages_manage_posts.',
    },
    {
      id: 'instagram',
      name: 'Instagram Business',
      description: 'Publish square posts and stories to connected Instagram Professional accounts.',
      iconColor: '#e1306c',
      note: 'Restricted by Meta to Business/Creator accounts linked to a Facebook Page.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Connected Social Accounts</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                OAuth 2.0 Secure
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Connect once to unlock instant 1-click social distribution for all approved customer wins.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Connection Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
              <p className="text-xs">Checking account connection status...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {platforms.map((p) => {
                const conn = statusData?.connections[p.id];
                const isConnected = conn?.connected;
                const isExpired = conn?.status === 'expired';

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700/80 transition-colors"
                  >
                    <div className="space-y-1 sm:max-w-[65%]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{p.name}</span>
                        {isConnected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Connected</span>
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertCircle className="w-3 h-3" />
                            <span>Expired</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400">{p.description}</p>

                      {isConnected && conn?.accountName && (
                        <p className="text-xs text-zinc-300 font-medium pt-0.5">
                          Account: <span className="text-white">{conn.accountName}</span>
                          {conn.connectedAt && (
                            <span className="text-zinc-500 font-normal">
                              {' '}
                              • Connected {new Date(conn.connectedAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      )}

                      {p.note && !isConnected && (
                        <p className="text-[11px] text-zinc-500 italic">{p.note}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isConnected ? (
                        <button
                          onClick={() => handleDisconnect(p.id)}
                          disabled={disconnecting === p.id}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950/40 text-zinc-300 hover:text-rose-300 border border-zinc-700 hover:border-rose-700/50 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          <span>{disconnecting === p.id ? 'Disconnecting...' : 'Disconnect'}</span>
                        </button>
                      ) : isExpired ? (
                        <button
                          onClick={() => handleConnect(p.id)}
                          disabled={connecting === p.id}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${connecting === p.id ? 'animate-spin' : ''}`} />
                          <span>{connecting === p.id ? 'Redirecting...' : `Reconnect ${p.name}`}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(p.id)}
                          disabled={connecting === p.id}
                          className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{connecting === p.id ? 'Redirecting...' : `Connect ${p.name}`}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/60 text-[11px] text-zinc-500 space-y-1">
            <p className="font-semibold text-zinc-400">Panda Praise Privacy & Security Guarantee:</p>
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
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
