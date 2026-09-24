import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { socialClient, SocialStatusResponse } from '../../../lib/socialClient';

const LinkedInIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export const IntegrateView: React.FC = () => {
  const [autoCaseStudies, setAutoCaseStudies] = useState(true);
  const [activeTab, setActiveTab] = useState<'linkedin' | 'slack' | 'stripe' | 'zapier' | 'webhook' | 'api' | 'mcp'>('linkedin');

  // LinkedIn Integration State
  const [statusData, setStatusData] = useState<SocialStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      setError(null);
      const data = await socialClient.getStatus();
      setStatusData(data);
    } catch (err: any) {
      console.error('[IntegrateView] Failed to fetch social status:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnectLinkedIn = async () => {
    setConnecting(true);
    setError(null);
    try {
      const res = await socialClient.initOAuth('linkedin');
      if (res.error) {
        setError(res.error);
        setConnecting(false);
      } else if (res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        setError('Failed to initiate LinkedIn authorization. Please try again.');
        setConnecting(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Connection request failed.');
      setConnecting(false);
    }
  };

  const handleDisconnectLinkedIn = async () => {
    if (!confirm('Are you sure you want to disconnect your LinkedIn account? Your previous publication records will be preserved.')) {
      return;
    }

    setDisconnecting(true);
    setError(null);
    try {
      const res = await socialClient.disconnect('linkedin');
      if (res.success) {
        await fetchStatus();
      } else {
        setError(res.error || 'Failed to disconnect LinkedIn account.');
      }
    } catch (err: any) {
      setError(err?.message || 'Disconnect request failed.');
    } finally {
      setDisconnecting(false);
    }
  };

  const linkedIn = statusData?.connections?.linkedin;
  const isLinkedInConnected = Boolean(linkedIn?.connected && linkedIn?.status === 'connected');
  const linkedInAccountName = linkedIn?.accountName;
  const linkedInProfilePic = linkedIn?.profilePicture;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* Header (Matches Senja 04:03) */}
      <div className="space-y-1 pb-2 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">Integrations</h1>
        <p className="text-xs text-gray-500">
          Connect Panda Praise to your favorite tools and automate your testimonial workflow.
        </p>
      </div>

      {/* Auto Case Studies Toggle (Matches Senja 04:03) */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-gray-900">
            Panda Praise should automatically generate case studies for me.
          </p>
          <p className="text-[11px] text-gray-500">
            We will automatically turn multi-step testimonial notes into case studies for you.
          </p>
        </div>

        <button
          onClick={() => setAutoCaseStudies(!autoCaseStudies)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            autoCaseStudies ? 'bg-[#6701e6]' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              autoCaseStudies ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Integration Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 pb-1 overflow-x-auto">
        {[
          { id: 'linkedin', label: 'LinkedIn', isConnected: isLinkedInConnected },
          { id: 'slack', label: 'Slack' },
          { id: 'stripe', label: 'Stripe' },
          { id: 'zapier', label: 'Zapier' },
          { id: 'webhook', label: 'Webhook' },
          { id: 'api', label: 'API' },
          { id: 'mcp', label: 'MCP' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5 transition-colors ${
              activeTab === tab.id
                ? 'bg-purple-50 text-[#6701e6] font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.isConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Cards */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        {activeTab === 'linkedin' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">LinkedIn</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
              Connect your LinkedIn profile to publish approved customer testimonials directly to your personal or company feed with one click.
            </p>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0a66c2]/10 flex items-center justify-center text-[#0a66c2]">
                  <LinkedInIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">LinkedIn</p>
                  {loadingStatus ? (
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Checking connection...
                    </p>
                  ) : isLinkedInConnected ? (
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Connected
                      </p>
                      {linkedInAccountName && (
                        <p className="text-[11px] text-gray-700 font-medium flex items-center gap-1.5 mt-0.5">
                          {linkedInProfilePic && (
                            <img
                              src={linkedInProfilePic}
                              alt=""
                              className="w-3.5 h-3.5 rounded-full object-cover"
                            />
                          )}
                          <span>
                            Account: <strong className="text-gray-950 font-bold">{linkedInAccountName}</strong>
                          </span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400">Not connected</p>
                  )}
                </div>
              </div>

              {isLinkedInConnected ? (
                <button
                  id="disconnect-linkedin-btn"
                  onClick={handleDisconnectLinkedIn}
                  disabled={disconnecting}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {disconnecting ? 'Disconnecting...' : 'Disconnect LinkedIn'}
                </button>
              ) : (
                <button
                  id="connect-linkedin-btn"
                  onClick={handleConnectLinkedIn}
                  disabled={connecting}
                  className="px-4 py-2 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {connecting ? 'Connecting...' : 'Connect LinkedIn'}
                </button>
              )}
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 max-w-xl">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'slack' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">Slack</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
              Connect Slack to receive notifications when new testimonials are submitted. Once connected, you can choose which channel to notify on each form's settings page, and tag @PandaPraise in any channel to search your testimonials.
            </p>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 max-w-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-xs">
                  #
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Slack</p>
                  <p className="text-[10px] text-gray-400">Not connected</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
                Connect
              </button>
            </div>
          </div>
        )}

        {activeTab === 'stripe' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">Stripe</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
              Trigger automated testimonial requests after successful customer checkouts and invoice payments.
            </p>
            <button className="px-4 py-2 rounded-xl bg-purple-50 text-[#6701e6] hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all cursor-pointer">
              Connect Stripe
            </button>
          </div>
        )}

        {activeTab === 'zapier' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">Zapier</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
              Connect Panda Praise to 5,000+ apps including HubSpot, Salesforce, Notion, and Airtable.
            </p>
            <button className="px-4 py-2 rounded-xl bg-purple-50 text-[#6701e6] hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all cursor-pointer">
              Use Zapier Template
            </button>
          </div>
        )}

        {activeTab === 'webhook' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">Webhooks</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
              Receive instant JSON HTTP POST payloads on review submission and status moderation events.
            </p>
            <input
              type="url"
              placeholder="https://your-api.com/webhooks/testimonials"
              className="w-full max-w-lg px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
            />
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">Developer API</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
              Query testimonials and programmatically manage collection forms using REST endpoints.
            </p>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 max-w-lg font-mono text-xs text-gray-600">
              Authorization: Bearer pp_live_sec_****************
            </div>
          </div>
        )}

        {activeTab === 'mcp' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900">Model Context Protocol (MCP)</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
              Access your testimonials directly in AI assistants, Claude Desktop, and Antigravity IDE via standard MCP servers.
            </p>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 max-w-lg font-mono text-xs text-gray-600">
              mcp://pandapraise.io/testimonials/v1
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
