import React, { useState } from 'react';

export const IntegrateView: React.FC = () => {
  const [autoCaseStudies, setAutoCaseStudies] = useState(true);
  const [activeTab, setActiveTab] = useState<'slack' | 'stripe' | 'zapier' | 'webhook' | 'api' | 'mcp'>('slack');

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

      {/* Integration Tabs (Matches Senja 04:03) */}
      <div className="flex items-center gap-1 border-b border-gray-200 pb-1 overflow-x-auto">
        {[
          { id: 'slack', label: 'Slack' },
          { id: 'stripe', label: 'Stripe' },
          { id: 'zapier', label: 'Zapier' },
          { id: 'webhook', label: 'Webhook' },
          { id: 'api', label: 'API' },
          { id: 'mcp', label: 'MCP' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-purple-50 text-[#6701e6] font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Cards */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
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
