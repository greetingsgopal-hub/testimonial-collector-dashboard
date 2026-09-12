import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  CheckCircle2, 
  Server, 
  Cloud,
  FileCode
} from 'lucide-react';
import { getActiveBackendInfo } from '../../lib/storage';

interface DatabaseConfigModalProps {
  onClose: () => void;
}

const SUPABASE_ENV_SNIPPET = `# Supabase Cloud Database (PostgreSQL)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

const NETLIFY_DEPLOY_SNIPPET = `# Netlify CLI deployment
npm run build
npx netlify deploy --prod --dir=dist`;

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'rest' | 'netlify'>('supabase');
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const backend = getActiveBackendInfo();

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(SUPABASE_ENV_SNIPPET);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleCopySqlLocation = () => {
    navigator.clipboard.writeText('-- Run the contents of schema.sql in your Supabase SQL Editor');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Plug In Your Database & Deploy
              </h3>
              <p className="text-xs text-zinc-400">
                Connect Supabase (Postgres) or your custom backend in minutes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Backend Indicator Banner */}
        <div className="px-6 py-3 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-2">
            <span>Current Active Storage:</span>
            <strong className="text-brand-300">{backend.name}</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {backend.status}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-zinc-800/80">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-1.5 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'supabase'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Supabase (PostgreSQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('rest')}
            className={`flex items-center gap-1.5 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'rest'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Custom REST API</span>
          </button>

          <button
            onClick={() => setActiveTab('netlify')}
            className={`flex items-center gap-1.5 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'netlify'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Deploy to Netlify</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    Step 1: Run SQL Schema
                  </span>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <span>Supabase Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We have included a complete, production-ready <code className="text-brand-300 font-mono">schema.sql</code> file in the project root. It includes the <code className="text-zinc-300 font-mono">reviews</code> table, fast indexes, and Row Level Security (RLS) policies.
                </p>
                <div className="pt-1">
                  <button
                    onClick={handleCopySqlLocation}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>File: schema.sql (Copy instruction)</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-brand-400" />
                    Step 2: Add Environment Variables
                  </span>
                  <button
                    onClick={handleCopyEnv}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy .env snippet</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-zinc-300 overflow-x-auto">
                  {SUPABASE_ENV_SNIPPET}
                </pre>
                <p className="text-[11px] text-zinc-500">
                  Add these to your <code className="text-zinc-300">.env</code> file locally or in Netlify site settings. ReviewVault will automatically switch from LocalStorage to Supabase on reload!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rest' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                If you already have a backend (Node.js, Express, Hono, FastAPI, Go, Django), set these environment variables to connect your API:
              </p>
              <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
{`# Custom REST API Backend
VITE_API_URL=https://api.yourdomain.com/v1
VITE_API_KEY=your_optional_api_key`}
              </pre>
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                <div className="font-semibold text-zinc-300">Expected Endpoints:</div>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 font-mono text-[11px]">
                  <li>GET /reviews?status=approved</li>
                  <li>POST /reviews (submits a new testimonial)</li>
                  <li>PATCH /reviews/:id (updates status or tags)</li>
                  <li>DELETE /reviews/:id</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'netlify' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                <div className="font-semibold text-white text-xs">
                  Zero-Config Netlify Deployment
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  The project is already pre-configured with <code className="text-brand-300">netlify.toml</code> and <code className="text-brand-300">public/_redirects</code> for single-page routing and production caching headers.
                </p>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-zinc-300">Deploy Options:</div>
                  <div className="text-xs text-zinc-400 space-y-1.5 pl-2">
                    <p><strong>Option A (Git):</strong> Push this repo to GitHub/GitLab and link it in Netlify. Build command is <code className="text-brand-300">npm run build</code> and publish directory is <code className="text-brand-300">dist</code>.</p>
                    <p><strong>Option B (Netlify Drop):</strong> Run <code className="text-brand-300">npm run build</code>, then drag the generated <code className="text-brand-300">dist</code> folder straight to <a href="https://app.netlify.com/drop" target="_blank" className="text-brand-400 underline">app.netlify.com/drop</a>.</p>
                  </div>
                </div>

                <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto">
                  {NETLIFY_DEPLOY_SNIPPET}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
