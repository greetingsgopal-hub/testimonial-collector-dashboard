import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Zap,
  Code2,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface WebhookConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookConfigModal: React.FC<WebhookConfigModalProps> = ({ isOpen, onClose }) => {
  const { project, collectionForm } = useAuth();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [testEmail, setTestEmail] = useState('alex.rivera@example.com');
  const [testName, setTestName] = useState('Alex Rivera');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSlug = collectionForm?.publicSlug || project?.slug || 'feedback';
  const webhookUrl = `${window.location.origin}/api/webhook/review-invite`;

  const curlExample = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerEmail": "${testEmail || 'customer@example.com'}",
    "customerName": "${testName || 'Customer Name'}",
    "spaceSlug": "${currentSlug}",
    "triggerSource": "stripe_purchase"
  }'`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlExample);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleSendTestWebhook = async () => {
    setIsTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      const res = await fetch('/api/webhook/review-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: testEmail,
          customerName: testName,
          spaceSlug: currentSlug,
          triggerSource: 'dashboard_test',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Webhook test failed');
      }
      setTestResult(data);
    } catch (err: any) {
      setTestError(err.message || 'Failed to trigger test webhook');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/80 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-slate-900 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="apple-touch absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950 tracking-tight flex items-center gap-2">
              Automated Review Collection Webhook
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automatically invite customers to review upon purchase, Stripe checkout, or sign-up.
            </p>
          </div>
        </div>

        {/* 1. Live Webhook Endpoint */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>Inbound Webhook Trigger URL</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Live & Active
              </span>
            </label>
            <span className="text-[11px] font-mono text-slate-400">POST</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700 truncate select-all">
              {webhookUrl}
            </div>
            <button
              onClick={handleCopyUrl}
              className="apple-touch px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Accepts JSON payloads with <code className="font-mono text-slate-700 bg-slate-200/60 px-1 py-0.5 rounded">customerEmail</code>, <code className="font-mono text-slate-700 bg-slate-200/60 px-1 py-0.5 rounded">customerName</code>, and optional <code className="font-mono text-slate-700 bg-slate-200/60 px-1 py-0.5 rounded">spaceSlug</code>.
          </p>
        </div>

        {/* 2. Live Interactive Test Console */}
        <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-600" />
              <span>Test Inbound Webhook</span>
            </h3>
            <span className="text-[11px] text-slate-400">Instant Execution</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Customer Email
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <button
            onClick={handleSendTestWebhook}
            disabled={isTesting || !testEmail}
            className="apple-touch w-full py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Simulating Inbound Trigger...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Webhook</span>
              </>
            )}
          </button>

          {/* Test Feedback */}
          {testResult && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1.5 text-xs text-emerald-900 animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Trigger Succeeded!</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Generated personalized collection link:
              </p>
              <div className="p-2 rounded-lg bg-white border border-emerald-200 font-mono text-[11px] text-slate-800 truncate select-all flex items-center justify-between gap-2">
                <span className="truncate">{testResult.inviteUrl}</span>
                <a
                  href={testResult.inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:text-violet-800 shrink-0"
                  title="Open review form"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {testError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{testError}</span>
            </div>
          )}
        </div>

        {/* 3. Integration Recipes (Stripe, Zapier, cURL) */}
        <div className="space-y-3 pt-2 border-t border-slate-200/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Quick cURL / Zapier Recipe</span>
            </h3>
            <button
              onClick={handleCopyCurl}
              className="text-[11px] font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCurl ? 'Copied cURL' : 'Copy cURL'}</span>
            </button>
          </div>

          <pre className="p-3 rounded-2xl bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
            {curlExample}
          </pre>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-900 block mb-1">
                💳 Stripe Post-Checkout
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Point Stripe Webhooks to this URL on event <code className="font-mono text-[10px] bg-slate-200/60 px-1 py-0.5 rounded">checkout.session.completed</code>.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-900 block mb-1">
                ⚡ Zapier & Shopify
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Create a "Webhooks by Zapier" POST step whenever a new order or customer milestone is reached.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
