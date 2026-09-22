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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>Connected Social Accounts</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                OAuth 2.0 Secure
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Connect once to unlock instant 1-click social distribution for all approved customer wins.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Connection Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin text-[#6701e6]" />
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
                    className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-300 transition-colors"
                  >
                    <div className="space-y-1 sm:max-w-[65%]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{p.name}</span>
                        {isConnected && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Connected</span>
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Expired</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600">{p.description}</p>

                      {isConnected && conn?.accountName && (
                        <p className="text-xs text-gray-800 font-medium pt-0.5">
                          Account: <span className="font-bold text-gray-950">{conn.accountName}</span>
                          {conn.connectedAt && (
                            <span className="text-gray-500 font-normal">
                              {' '}
                              • Connected {new Date(conn.connectedAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      )}

                      {p.note && !isConnected && (
                        <p className="text-[11px] text-gray-500 italic">{p.note}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isConnected ? (
                        <button
                          onClick={() => handleDisconnect(p.id)}
                          disabled={disconnecting === p.id}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-gray-700 hover:text-rose-700 border border-gray-300 hover:border-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          <span>{disconnecting === p.id ? 'Disconnecting...' : 'Disconnect'}</span>
                        </button>
                      ) : isExpired ? (
                        <button
                          onClick={() => handleConnect(p.id)}
                          disabled={connecting === p.id}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${connecting === p.id ? 'animate-spin' : ''}`} />
                          <span>{connecting === p.id ? 'Redirecting...' : `Reconnect ${p.name}`}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(p.id)}
                          disabled={connecting === p.id}
                          className="px-3.5 py-1.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
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

          <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] text-gray-600 space-y-1">
            <p className="font-bold text-[#6701e6]">Panda Praise Privacy & Security Guarantee:</p>
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
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
