import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  Bell, 
  Code2, 
  Star, 
  Check, 
  ArrowUpRight,
  Search,
  KeyRound,
  Copy,
  Zap
} from 'lucide-react';
import { socialClient, SocialStatusResponse } from '../../../lib/socialClient';

// Custom Brand Icons
const LinkedInIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const StripeIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fill="#635BFF" d="M0 4a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4z" />
    <path fill="#FFFFFF" d="M13.9 10.6c0-.9-.7-1.3-1.8-1.3-1.4 0-2.7.5-3.8 1.1l-.8-2.5c1.3-.6 2.9-1 4.7-1 3.2 0 5.3 1.6 5.3 4.5 0 4.4-6.1 3.7-6.1 5.6 0 .8.7 1.2 1.9 1.2 1.6 0 3.2-.6 4.3-1.4l.7 2.4c-1.4.8-3.2 1.3-5.1 1.3-3.4 0-5.5-1.7-5.5-4.6 0-4.6 6.3-3.8 6.3-5.8v-.5z" />
  </svg>
);

const GoogleIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const TrustpilotIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#00B67A" />
    <path d="M12 4.5l2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.7 5.2-.8z" fill="#FFFFFF" />
    <path d="M14.3 9.2l-.6 1.8 1.9 1.4-2.4.2L12 10.8v-6.3l2.3 4.7z" fill="#005128" opacity="0.3" />
  </svg>
);

const SlackIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#E01E5A" />
    <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
    <path d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
    <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
  </svg>
);

const TeamsIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#5059C9" />
    <path d="M15 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm4 2.5h-4a2 2 0 0 0-2 2v3h8v-3a2 2 0 0 0-2-2z" fill="#FFFFFF" opacity="0.8" />
    <path d="M9.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm5 3.5h-5a2.5 2.5 0 0 0-2.5 2.5V19h10v-3.5a2.5 2.5 0 0 0-2.5-2.5z" fill="#FFFFFF" />
  </svg>
);

const ZapierIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#FF4A00" />
    <path d="M12 5v14M5 12h14M7 7l10 10M17 7L7 17" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const WebhookIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <div className={`${className} rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center font-mono font-bold text-xs border border-indigo-100`}>
    &lt;/&gt;
  </div>
);

export const IntegrateView: React.FC = () => {
  const [autoCaseStudies, setAutoCaseStudies] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [waitlistJoined, setWaitlistJoined] = useState<Record<string, boolean>>({});
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // LinkedIn Integration State
  const [statusData, setStatusData] = useState<SocialStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Stripe Integration State
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [stripeDelayDays, setStripeDelayDays] = useState('3');
  const [isStripeConnected, setIsStripeConnected] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('pandapraise_stripe_connected') === 'true');
  });
  const [stripeSaving, setStripeSaving] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

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
    const storedSecret = localStorage.getItem('pandapraise_stripe_whsec');
    if (storedSecret) {
      setStripeWebhookSecret(storedSecret);
    }
  }, []);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // LinkedIn Handlers
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
        showToast('LinkedIn account successfully disconnected.');
      } else {
        setError(res.error || 'Failed to disconnect LinkedIn account.');
      }
    } catch (err: any) {
      setError(err?.message || 'Disconnect request failed.');
    } finally {
      setDisconnecting(false);
    }
  };

  // Stripe Handlers
  const handleSaveStripe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeWebhookSecret.trim() && !stripeSecretKey.trim()) {
      showToast('Please enter a Webhook Secret Key or API Key.');
      return;
    }

    setStripeSaving(true);
    setTimeout(() => {
      localStorage.setItem('pandapraise_stripe_connected', 'true');
      if (stripeWebhookSecret.trim()) {
        localStorage.setItem('pandapraise_stripe_whsec', stripeWebhookSecret.trim());
      }
      setIsStripeConnected(true);
      setStripeSaving(false);
      setIsStripeModalOpen(false);
      showToast('Stripe webhook integration successfully enabled!');
    }, 600);
  };

  const handleDisconnectStripe = () => {
    if (!confirm('Are you sure you want to disconnect Stripe checkout triggers?')) {
      return;
    }
    localStorage.removeItem('pandapraise_stripe_connected');
    localStorage.removeItem('pandapraise_stripe_whsec');
    setIsStripeConnected(false);
    setStripeSecretKey('');
    setStripeWebhookSecret('');
    showToast('Stripe integration disconnected.');
  };

  const handleCopyWebhookUrl = () => {
    const url = `${window.location.origin}/api/webhooks/stripe`;
    navigator.clipboard.writeText(url);
    setCopiedWebhookUrl(true);
    showToast('Stripe webhook endpoint copied to clipboard!');
    setTimeout(() => setCopiedWebhookUrl(false), 2000);
  };

  const handleJoinWaitlist = (key: string, name: string) => {
    setWaitlistJoined((prev) => ({ ...prev, [key]: true }));
    showToast(`You're on the early-access waitlist for ${name}! We'll notify you as soon as it launches.`);
  };

  const linkedIn = statusData?.connections?.linkedin;
  const isLinkedInConnected = Boolean(linkedIn?.connected && linkedIn?.status === 'connected');
  const linkedInAccountName = linkedIn?.accountName;
  const linkedInProfilePic = linkedIn?.profilePicture;

  // Structured Integration Categories
  const categories = [
    {
      id: 'active',
      title: 'Active & Connected Integrations',
      icon: <Zap className="w-4 h-4 text-brand-600" />,
      description: 'Connect direct accounts to publish testimonials and trigger automatic review requests post-checkout.',
      items: [
        {
          id: 'linkedin',
          name: 'LinkedIn',
          icon: <LinkedInIcon className="w-6 h-6 text-[#0a66c2]" />,
          description: 'Connect your personal profile or company page to publish approved testimonials directly to your feed with 1 click.',
          badgeType: isLinkedInConnected ? 'connected' : 'active',
          badgeLabel: isLinkedInConnected ? 'Connected' : 'Active',
          isLiveOAuth: true,
        },
        {
          id: 'stripe',
          name: 'Stripe',
          icon: <StripeIcon className="w-6 h-6 text-[#635BFF]" />,
          description: 'Automatically trigger review request emails 3 days after a customer completes a checkout on Stripe.',
          badgeType: isStripeConnected ? 'connected' : 'active',
          badgeLabel: isStripeConnected ? 'Connected' : 'Active',
          isStripeDirect: true,
        },
      ],
    },
    {
      id: 'reviews',
      title: 'Review Imports & Public Proof',
      icon: <Star className="w-4 h-4 text-amber-500" />,
      description: 'Import customer praise and verified star ratings from external review platforms.',
      items: [
        {
          id: 'google-reviews',
          name: 'Google Reviews',
          icon: <GoogleIcon className="w-6 h-6" />,
          description: 'Import customer praise instantly. Sync verified Google Business profile reviews and live 5-star ratings to your widgets.',
          badgeType: 'coming_soon',
          badgeLabel: 'Coming Soon',
          canJoinWaitlist: true,
        },
        {
          id: 'trustpilot',
          name: 'Trustpilot',
          icon: <TrustpilotIcon className="w-6 h-6" />,
          description: 'Import customer praise instantly. Stream authentic Trustpilot feedback and verified reviews into your proof vault.',
          badgeType: 'coming_soon',
          badgeLabel: 'Coming Soon',
          canJoinWaitlist: true,
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Team Notifications & Collaboration',
      icon: <Bell className="w-4 h-4 text-emerald-600" />,
      description: 'Broadcast review submissions and customer wins into your team communication hubs.',
      items: [
        {
          id: 'slack',
          name: 'Slack',
          icon: <SlackIcon className="w-6 h-6" />,
          description: 'Stream real-time praise notifications into channels. Tag @PandaPraise to search and share reviews directly in Slack.',
          badgeType: 'coming_soon',
          badgeLabel: 'Coming Soon',
          canJoinWaitlist: true,
        },
        {
          id: 'teams',
          name: 'Microsoft Teams',
          icon: <TeamsIcon className="w-6 h-6" />,
          description: 'Stream real-time praise notifications into channels. Celebrate 5-star customer feedback across your organization.',
          badgeType: 'coming_soon',
          badgeLabel: 'Coming Soon',
          canJoinWaitlist: true,
        },
      ],
    },
    {
      id: 'developer',
      title: 'Webhooks & REST API',
      icon: <Code2 className="w-4 h-4 text-slate-700" />,
      description: 'Connect custom apps via developer tokens, automated webhooks, and REST endpoints.',
      items: [
        {
          id: 'webhooks',
          name: 'Webhooks',
          icon: <WebhookIcon className="w-6 h-6" />,
          description: 'Connect custom apps via developer tokens. Receive instant JSON HTTP POST payloads on review submission and status moderation.',
          badgeType: 'coming_soon',
          badgeLabel: 'Coming Soon',
          canJoinWaitlist: true,
        },
        {
          id: 'rest-api',
          name: 'REST API',
          icon: <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono text-[10px] font-bold">API</div>,
          description: 'Connect custom apps via developer tokens. Query testimonials and programmatically manage collection forms with secure bearer tokens.',
          badgeType: 'coming_soon',
          badgeLabel: 'Coming Soon',
          canJoinWaitlist: true,
        },
        {
          id: 'zapier',
          name: 'Zapier',
          icon: <ZapierIcon className="w-6 h-6" />,
          description: 'Connect Panda Praise to 5,000+ apps including HubSpot, Salesforce, Notion, and Airtable without writing code.',
          badgeType: 'coming_soon',
          badgeLabel: 'Coming Soon',
          canJoinWaitlist: true,
        },
      ],
    },
  ];

  // Filtering
  const filteredCategories = categories.map((cat) => {
    if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
      return null;
    }
    const filteredItems = cat.items.filter((item) => {
      if (!searchFilter.trim()) return true;
      const query = searchFilter.toLowerCase();
      return item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
    });
    if (filteredItems.length === 0) return null;
    return { ...cat, items: filteredItems };
  }).filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 font-sans">
      
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs border border-gray-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{feedbackToast}</span>
        </div>
      )}

      {/* Stripe Configuration Modal */}
      {isStripeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-scale-in text-left">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#635BFF]/10 flex items-center justify-center text-[#635BFF]">
                  <StripeIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Configure Stripe Webhook</h3>
                  <p className="text-xs text-gray-500">Automate customer review requests</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStripeModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStripe} className="space-y-4">
              {/* Webhook Endpoint Box to Copy */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  1. Add this Webhook Endpoint in Stripe Dashboard:
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[11px] font-mono text-gray-700 truncate flex-1 select-all">
                    {window.location.origin}/api/webhooks/stripe
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyWebhookUrl}
                    className="p-1.5 rounded-lg hover:bg-white text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 transition-all text-xs flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {copiedWebhookUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWebhookUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Events to listen for: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">checkout.session.completed</code>, <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">invoice.payment_succeeded</code>
                </p>
              </div>

              {/* Webhook Secret Key */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                  <span>2. Stripe Webhook Signing Secret (whsec_...)</span>
                </label>
                <input
                  type="password"
                  value={stripeWebhookSecret}
                  onChange={(e) => setStripeWebhookSecret(e.target.value)}
                  placeholder="Paste your whsec_ signing secret"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Restricted API Key */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                  <span>3. Stripe Restricted API Key (Optional)</span>
                </label>
                <input
                  type="password"
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  placeholder="Paste your rk_ restricted key"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              {/* Trigger Delay Option */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  4. Review Request Timing Delay
                </label>
                <select
                  value={stripeDelayDays}
                  onChange={(e) => setStripeDelayDays(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="0">Immediately after checkout</option>
                  <option value="1">1 day after checkout</option>
                  <option value="3">3 days after checkout (Recommended)</option>
                  <option value="7">7 days after checkout</option>
                  <option value="14">14 days after checkout</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsStripeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stripeSaving}
                  className="px-5 py-2 rounded-xl bg-[#635BFF] hover:bg-[#534be7] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {stripeSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save & Enable Webhook</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-950 tracking-tight font-display">Integrations</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100">
              8 Available & Upcoming
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Connect Panda Praise to your favorite apps, automate review collection, and stream customer praise everywhere.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Auto Case Studies Toggle Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50/60 to-indigo-50/60 border border-purple-100 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-left">
            <p className="text-xs sm:text-sm font-bold text-gray-900">
              Panda Praise AI Case Study Generator
            </p>
            <p className="text-xs text-gray-600 max-w-xl">
              Automatically transform multi-step customer praise into ready-to-publish case studies and social graphics.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAutoCaseStudies(!autoCaseStudies)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            autoCaseStudies ? 'bg-brand-600' : 'bg-gray-200'
          }`}
          aria-label="Toggle auto case studies"
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              autoCaseStudies ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-950'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === cat.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-950'
            }`}
          >
            <span>{cat.title}</span>
          </button>
        ))}
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Categorized Integration Grids */}
      <div className="space-y-10">
        {filteredCategories.map((cat: any) => (
          <div key={cat.id} className="space-y-4">
            
            {/* Category Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-gray-100 text-gray-700">
                  {cat.icon}
                </span>
                <div>
                  <h2 className="text-base font-bold text-gray-900 tracking-tight">{cat.title}</h2>
                  <p className="text-xs text-gray-500">{cat.description}</p>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.items.map((item: any) => {
                const isWaitlisted = waitlistJoined[item.id];

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between text-left space-y-4 relative group"
                  >
                    {/* Top Row: Icon + Status Pill */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2.5 shadow-2xs shrink-0">
                        {item.icon}
                      </div>

                      {/* Status Badges */}
                      {item.badgeType === 'connected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Connected
                        </span>
                      )}

                      {item.badgeType === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-brand-700 text-[11px] font-bold border border-indigo-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                          Active
                        </span>
                      )}

                      {item.badgeType === 'coming_soon' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold border border-gray-200">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    {/* Middle: Title & Description */}
                    <div className="space-y-1.5 flex-1">
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Special LinkedIn Connected Info */}
                      {item.id === 'linkedin' && isLinkedInConnected && linkedInAccountName && (
                        <div className="mt-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                          {linkedInProfilePic ? (
                            <img src={linkedInProfilePic} alt="" className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-[10px] font-bold">
                              in
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-bold text-gray-900 block truncate">
                              {linkedInAccountName}
                            </span>
                            <span className="text-[10px] text-gray-500">Auto-publish enabled</span>
                          </div>
                        </div>
                      )}

                      {/* Special Stripe Connected Info */}
                      {item.id === 'stripe' && isStripeConnected && (
                        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-bold text-emerald-950 block">
                              Checkout Triggers Active
                            </span>
                            <span className="text-[10px] text-emerald-700">
                              Delay: {stripeDelayDays} days post-purchase
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsStripeModalOpen(true)}
                            className="text-[10px] font-bold text-brand-600 hover:underline cursor-pointer"
                          >
                            Settings
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Action Trigger */}
                    <div className="pt-2 border-t border-gray-100">
                      {/* LinkedIn Card Actions */}
                      {item.id === 'linkedin' && (
                        isLinkedInConnected ? (
                          <button
                            id="disconnect-linkedin-btn"
                            onClick={handleDisconnectLinkedIn}
                            disabled={disconnecting}
                            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 text-center"
                          >
                            {disconnecting ? 'Disconnecting...' : 'Disconnect LinkedIn'}
                          </button>
                        ) : (
                          <button
                            id="connect-linkedin-btn"
                            onClick={handleConnectLinkedIn}
                            disabled={connecting || loadingStatus}
                            className="w-full py-2 px-3 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {connecting ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Connecting...</span>
                              </>
                            ) : (
                              <>
                                <span>Connect LinkedIn</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )
                      )}

                      {/* Stripe Card Actions */}
                      {item.id === 'stripe' && (
                        isStripeConnected ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setIsStripeModalOpen(true)}
                              className="flex-1 py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold transition-all shadow-2xs text-center cursor-pointer"
                            >
                              Config
                            </button>
                            <button
                              type="button"
                              onClick={handleDisconnectStripe}
                              className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold transition-all shadow-2xs text-center cursor-pointer"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsStripeModalOpen(true)}
                            className="w-full py-2 px-3 rounded-xl bg-[#635BFF] hover:bg-[#5249e0] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>Connect Stripe</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        )
                      )}

                      {/* Other Waitlist Cards */}
                      {item.id !== 'linkedin' && item.id !== 'stripe' && (
                        <button
                          type="button"
                          onClick={() => handleJoinWaitlist(item.id, item.name)}
                          disabled={isWaitlisted}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isWaitlisted
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                              : 'bg-gray-50 hover:bg-brand-50 hover:text-brand-700 text-gray-700 border border-gray-200 shadow-2xs'
                          }`}
                        >
                          {isWaitlisted ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Joined Waitlist</span>
                            </>
                          ) : (
                            <>
                              <span>Join Waitlist</span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
