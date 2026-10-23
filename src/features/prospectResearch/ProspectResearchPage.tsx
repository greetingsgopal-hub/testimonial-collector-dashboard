import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Globe,
  Newspaper,
  ShieldAlert,
} from 'lucide-react';
import { auth } from '../../lib/firebase';

type ResearchMode = 'prospect' | 'competitor';
type Status = 'idle' | 'loading' | 'error' | 'done';

interface EvidenceSource {
  id: string;
  kind: 'website' | 'hackernews' | 'news';
  url: string;
  title: string;
  text: string;
  retrievedAt: string;
}

interface AiClaim {
  text: string;
  sourceIds: string[];
}

interface ResearchResult {
  companyName: string;
  mode: string;
  evidence: {
    sources: EvidenceSource[];
    sourceStatus: Record<string, string>;
  };
  ai: {
    status: 'ok' | 'skipped' | 'failed';
    reason?: string;
    summary?: string;
    claims?: AiClaim[];
    inferences?: string[];
  };
  notice: string;
}

const KIND_STYLES: Record<EvidenceSource['kind'], { label: string; icon: React.ReactNode }> = {
  website: { label: 'Website', icon: <Globe className="w-3.5 h-3.5" /> },
  hackernews: { label: 'Hacker News', icon: <Search className="w-3.5 h-3.5" /> },
  news: { label: 'Google News', icon: <Newspaper className="w-3.5 h-3.5" /> },
};

export function ProspectResearchPage() {
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [mode, setMode] = useState<ResearchMode>('prospect');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ResearchResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setStatus('error');
      setError('Enter a company name.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const user = auth?.currentUser;
      if (!user) throw new Error('Not signed in.');
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/prospect-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName: companyName.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          mode,
        }),
      });
      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = (data as { error?: string })?.error || `Request failed (${res.status}).`;
        throw new Error(message);
      }
      setResult(data as ResearchResult);
      setStatus('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
      setStatus('error');
    }
  };

  const sourceById = new Map((result?.evidence.sources ?? []).map((s) => [s.id, s]));

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <a
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </a>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                PROSPECT RESEARCH
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-3">Prospect &amp; Competitor Research</h1>
            <p className="text-xs text-slate-400">
              Internal tool. Retrieves live evidence (website, Hacker News, Google News) and optionally synthesises a brief.
              AI output is unverified — always check the cited sources.
            </p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label htmlFor="company-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Company name <span className="text-rose-400">*</span>
              </label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={100}
                required
                placeholder="e.g. Acme"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="website-url" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Website URL <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                id="website-url"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                maxLength={300}
                placeholder="https://acme.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-1">
              <label htmlFor="research-mode" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mode
              </label>
              <select
                id="research-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as ResearchMode)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="prospect">Prospect</option>
                <option value="competitor">Competitor</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all cursor-pointer"
            >
              {status === 'loading' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>{status === 'loading' ? 'Researching…' : 'Run Research'}</span>
            </button>
            {status === 'loading' && (
              <span className="text-xs text-slate-400">Fetching website, Hacker News and Google News evidence…</span>
            )}
          </div>
        </form>

        {/* Error state */}
        {status === 'error' && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty state */}
        {status === 'idle' && (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
            <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              Enter a company name to gather evidence. Results appear here.
            </p>
          </div>
        )}

        {/* Results */}
        {status === 'done' && result && (
          <div className="space-y-6">
            {/* Tier 1: Retrieved evidence */}
            <section className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-1">
                Retrieved Evidence
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Verbatim text extracted by code from public pages and feeds. Nothing here is AI-generated.
              </p>
              {result.evidence.sources.length === 0 ? (
                <p className="text-xs text-slate-400">No evidence was retrieved for this query.</p>
              ) : (
                <ul className="space-y-3">
                  {result.evidence.sources.map((source) => {
                    const kind = KIND_STYLES[source.kind];
                    return (
                      <li key={source.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 font-mono">
                            {source.id}
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {kind.icon}
                            {kind.label}
                          </span>
                          {source.title && <span className="text-xs font-semibold text-slate-200">{source.title}</span>}
                        </div>
                        {source.text && <p className="text-xs text-slate-400 leading-relaxed mb-1.5">{source.text}</p>}
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 break-all"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          {source.url}
                        </a>
                      </li>
                    );
 })}
                </ul>
              )}
              {Object.entries(result.evidence.sourceStatus).some(([, v]) => v !== 'ok') && (
                <p className="text-[11px] text-amber-400/80 mt-3">
                  Source status: {Object.entries(result.evidence.sourceStatus).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                </p>
              )}
            </section>

            {/* Tier 2 + 3: AI output */}
            <section className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-1">
                AI Analysis
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Generated from the evidence above. Unverified — check each claim against its cited source before use.
              </p>

              {result.ai.status !== 'ok' ? (
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-300">
                      {result.ai.status === 'skipped' ? 'Synthesis skipped' : 'Synthesis failed'} — evidence-only mode.
                    </p>
                    {result.ai.reason && <p className="text-xs text-slate-500 mt-1">{result.ai.reason}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {result.ai.summary && (
                    <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                      {result.ai.summary}
                    </p>
                  )}

                  {(result.ai.claims?.length ?? 0) > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 mb-2">
                        Claims citing sources <span className="text-slate-500 font-normal">— verify before use</span>
                      </h3>
                      <ul className="space-y-2">
                        {result.ai.claims?.map((claim, i) => (
                          <li key={i} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                            <p className="text-xs text-slate-300 leading-relaxed mb-1.5">{claim.text}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {claim.sourceIds.map((id) => {
                                const src = sourceById.get(id);
                                return src ? (
                                  <a
                                    key={id}
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow"
                                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20 hover:bg-sky-500/20"
                                  >
                                    {id}
                                  </a>
                                ) : (
                                  <span key={id} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
                                    {id}
                                  </span>
                                );
                              })}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(result.ai.inferences?.length ?? 0) > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 mb-2">
                        Inferences <span className="text-slate-500 font-normal">— speculation, not evidence</span>
                      </h3>
                      <ul className="space-y-1.5">
                        {result.ai.inferences?.map((text, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-400/70 shrink-0 mt-0.5" />
                            <span>{text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-slate-600 mt-4 pt-3 border-t border-slate-800">{result.notice}</p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProspectResearchPage;
