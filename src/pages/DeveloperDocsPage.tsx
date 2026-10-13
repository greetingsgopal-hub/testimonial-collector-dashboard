import React, { useState } from 'react';
import {
  Terminal,
  Key,
  Copy,
  Check,
  ExternalLink,
  Send,
  Zap,
} from 'lucide-react';
import { usePageSeo } from '../lib/seo';

type CodeLang = 'curl' | 'node' | 'python';

export const DeveloperDocsPage: React.FC = () => {
  usePageSeo({
    title: 'Developer Documentation & Public REST API — Panda Praise',
    description: 'Integrate customer testimonials and widgets programmatically using the PandaPraise Public REST API.',
  });

  const [activeLang, setActiveLang] = useState<CodeLang>('curl');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('pp_live_demo_pandapraise_key');
  const [testEndpoint, setTestEndpoint] = useState<'getTestimonials' | 'postTestimonial' | 'getWidgets'>('getTestimonials');
  const [testOutput, setTestOutput] = useState<any | null>(null);
  const [testing, setTesting] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleRunConsole = async () => {
    setTesting(true);
    setTestOutput(null);
    try {
      if (testEndpoint === 'getTestimonials') {
        const res = await fetch('/api/v1/testimonials?space=demo&rating=5&limit=2', {
          headers: { 'Authorization': `Bearer ${apiKeyInput}` },
        });
        const data = await res.json();
        setTestOutput(data);
      } else if (testEndpoint === 'postTestimonial') {
        const res = await fetch('/api/v1/testimonials', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKeyInput}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authorName: 'Alex Rivera',
            authorCompany: 'Growth Labs',
            rating: 5,
            text: 'Submitted via the PandaPraise Public REST API in under 50ms!',
            spaceSlug: 'demo',
          }),
        });
        const data = await res.json();
        setTestOutput(data);
      } else if (testEndpoint === 'getWidgets') {
        const res = await fetch('/api/v1/widgets?space=demo', {
          headers: { 'Authorization': `Bearer ${apiKeyInput}` },
        });
        const data = await res.json();
        setTestOutput(data);
      }
    } catch (err: any) {
      setTestOutput({ error: err.message || 'API call failed' });
    } finally {
      setTesting(false);
    }
  };

  const codeExamples = {
    getTestimonials: {
      curl: `curl -X GET "https://pandapraise.com/api/v1/testimonials?space=your-space&rating=5&limit=20" \\
  -H "Authorization: Bearer ${apiKeyInput}"`,
      node: `import axios from 'axios';

const response = await axios.get('https://pandapraise.com/api/v1/testimonials', {
  headers: {
    'Authorization': 'Bearer ${apiKeyInput}',
  },
  params: {
    space: 'your-space',
    rating: 5,
    limit: 20,
  },
});

console.log(response.data.data);`,
      python: `import requests

headers = {
    "Authorization": "Bearer ${apiKeyInput}"
}
params = {
    "space": "your-space",
    "rating": 5,
    "limit": 20
}

response = requests.get("https://pandapraise.com/api/v1/testimonials", headers=headers, params=params)
print(response.json())`,
    },
    postTestimonial: {
      curl: `curl -X POST "https://pandapraise.com/api/v1/testimonials" \\
  -H "Authorization: Bearer ${apiKeyInput}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "authorName": "Jane Doe",
    "authorEmail": "jane@example.com",
    "authorCompany": "Acme SaaS",
    "rating": 5,
    "text": "PandaPraise makes collecting testimonials effortless!",
    "spaceSlug": "your-space"
  }'`,
      node: `import axios from 'axios';

const response = await axios.post('https://pandapraise.com/api/v1/testimonials', {
  authorName: 'Jane Doe',
  authorEmail: 'jane@example.com',
  authorCompany: 'Acme SaaS',
  rating: 5,
  text: 'PandaPraise makes collecting testimonials effortless!',
  spaceSlug: 'your-space',
}, {
  headers: {
    'Authorization': 'Bearer ${apiKeyInput}',
    'Content-Type': 'application/json',
  },
});

console.log(response.data);`,
      python: `import requests

headers = {
    "Authorization": "Bearer ${apiKeyInput}",
    "Content-Type": "application/json"
}
payload = {
    "authorName": "Jane Doe",
    "authorEmail": "jane@example.com",
    "authorCompany": "Acme SaaS",
    "rating": 5,
    "text": "PandaPraise makes collecting testimonials effortless!",
    "spaceSlug": "your-space"
}

response = requests.post("https://pandapraise.com/api/v1/testimonials", headers=headers, json=payload)
print(response.json())`,
    },
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased selection:bg-[#6701e6] selection:text-white">
      {/* Top Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 font-black text-xl text-gray-900 tracking-tight">
            <span className="w-8 h-8 rounded-xl bg-[#6701e6] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-500/20">
              🐼
            </span>
            Panda<span className="text-[#6701e6]">Praise</span>
            <span className="ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6701e6] border border-purple-100">
              Developers
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href="/api/v1/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-2"
            >
              OpenAPI 3.0 JSON
              <ExternalLink size={12} />
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white transition-all shadow-md shadow-purple-500/20"
            >
              Get API Key
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-12 pb-8 sm:pt-16 sm:pb-12 bg-gradient-to-b from-purple-50/50 via-white to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/80 text-[#6701e6] text-xs font-bold mb-4">
            <Terminal size={14} />
            Public REST API & Webhooks v1
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Build with the PandaPraise REST API
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-3xl leading-relaxed">
            Query testimonials, submit customer reviews from custom web forms, sync to your CRM, and automate real-time notifications via Slack, Discord, and Webhooks.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 text-xs font-mono text-gray-700">
              <span className="font-bold text-gray-900">Base URL:</span> https://pandapraise.com/api/v1
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 text-xs font-mono text-[#6701e6] border border-purple-100">
              <Key size={13} /> Header: Authorization: Bearer pp_live_...
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          
          {/* Interactive API Console */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Live API Playground</span>
                <h3 className="text-xl font-bold text-white mt-1">Interactive Request Console</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Language:</span>
                {(['curl', 'node', 'python'] as CodeLang[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      activeLang === lang
                        ? 'bg-[#6701e6] text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {lang === 'node' ? 'Node.js' : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
                <Key size={13} className="text-purple-400" /> API Key:
              </span>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="pp_live_..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Select Endpoint */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTestEndpoint('getTestimonials')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  testEndpoint === 'getTestimonials'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-emerald-400 font-mono mr-1.5 font-black">GET</span> /api/v1/testimonials
              </button>
              <button
                onClick={() => setTestEndpoint('postTestimonial')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  testEndpoint === 'postTestimonial'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-amber-400 font-mono mr-1.5 font-black">POST</span> /api/v1/testimonials
              </button>
              <button
                onClick={() => setTestEndpoint('getWidgets')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  testEndpoint === 'getWidgets'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-emerald-400 font-mono mr-1.5 font-black">GET</span> /api/v1/widgets
              </button>
            </div>

            {/* Code Snippet Box */}
            <div className="relative bg-slate-950 rounded-2xl p-4 sm:p-5 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto">
              <button
                onClick={() =>
                  handleCopy(
                    testEndpoint === 'getWidgets'
                      ? `curl -X GET "https://pandapraise.com/api/v1/widgets?space=demo" -H "Authorization: Bearer ${apiKeyInput}"`
                      : codeExamples[testEndpoint][activeLang],
                    'activeCode'
                  )
                }
                className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Copy Code"
              >
                {copiedSnippet === 'activeCode' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <pre className="whitespace-pre overflow-x-auto">
                {testEndpoint === 'getWidgets'
                  ? `curl -X GET "https://pandapraise.com/api/v1/widgets?space=demo" \\
  -H "Authorization: Bearer ${apiKeyInput}"`
                  : codeExamples[testEndpoint][activeLang]}
              </pre>
            </div>

            {/* Execute Button & Response */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunConsole}
                  disabled={testing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send size={14} />
                  {testing ? 'Sending Request...' : 'Send Live Request'}
                </button>
                <span className="text-[11px] text-slate-400">
                  Calls edge endpoint on Cloudflare Worker runtime
                </span>
              </div>

              {testOutput && (
                <div className="mt-4 bg-slate-950 rounded-2xl p-4 border border-slate-800 font-mono text-xs">
                  <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">HTTP 200 OK Response:</div>
                  <pre className="text-emerald-400 overflow-x-auto whitespace-pre">
                    {JSON.stringify(testOutput, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Webhooks Section */}
          <div className="border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2">
              <Zap size={20} className="text-[#6701e6]" />
              <h3 className="text-xl font-bold text-gray-900">Real-Time Webhooks & Notifications</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              PandaPraise dispatches real-time webhooks whenever customer reviews are created or approved. You can send rich notification cards directly into your Slack channels or Discord servers, or trigger automations via Zapier / Make.com.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="text-sm font-bold text-gray-900">Slack Block Kit Cards</h4>
                <p className="text-xs text-gray-500">
                  Sends formatted alert cards with star ratings, reviewer quote, and a 1-click button to view and approve in the dashboard.
                </p>
                <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs font-mono text-gray-700">
                  Target: Slack Incoming Webhook URL
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <h4 className="text-sm font-bold text-gray-900">Discord Embeds</h4>
                <p className="text-xs text-gray-500">
                  Sends a rich colored embed (brand purple #6701E6) with star ratings, reviewer company, and review quote.
                </p>
                <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs font-mono text-gray-700">
                  Target: Discord Channel Webhook URL
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 bg-gray-50 text-center text-xs text-gray-500">
        <p>© 2026 PandaPraise Developer Platform. Edge-first global distribution API.</p>
      </footer>
    </div>
  );
};
