import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  ShieldAlert,
  Flame,
  ExternalLink,
  Copy,
  CheckCircle2,
  Plus,
  X,
  Radio,
  Loader2,
  Globe,
  Share2,
} from 'lucide-react';

export interface RadarViewProps {
  workspaceId: string;
  workspaceName: string;
  brandSlug: string;
}

interface DashboardMention {
  id: string;
  source: 'Reddit' | 'HackerNews' | 'GoogleNews';
  targetKeyword: string;
  isCompetitor: boolean;
  author: string;
  category: 'PRAISE' | 'POACHABLE_LEAD' | 'FIRE_ALERT' | 'NOISE';
  urgencyScore: number;
  cleanQuote: string;
  aiPoachReply?: string;
  sourceUrl: string;
  isPublishedToWall: boolean;
  timeAgo: string;
}

const INITIAL_DASHBOARD_MENTIONS: DashboardMention[] = [
  {
    id: 'm-1',
    source: 'HackerNews',
    targetKeyword: 'Senja',
    isCompetitor: true,
    author: 'founder_mark',
    category: 'POACHABLE_LEAD',
    urgencyScore: 9,
    cleanQuote:
      'Senja just increased their monthly plan again. Does anyone have a self-hosted or zero-cost alternative for SaaS reviews?',
    aiPoachReply:
      "Hey @founder_mark! We built PandaPraise specifically for founders tired of recurring subscription hostage fees. You can auto-harvest reviews and get high-converting deal-closer vaults without monthly fees. Check it out at pandapraise.com!",
    sourceUrl: 'https://news.ycombinator.com',
    isPublishedToWall: false,
    timeAgo: '15m ago',
  },
  {
    id: 'm-2',
    source: 'Reddit',
    targetKeyword: 'PandaPraise',
    isCompetitor: false,
    author: 'u/saas_builder',
    category: 'PRAISE',
    urgencyScore: 8,
    cleanQuote:
      'PandaPraise caught 3 Reddit shoutouts for our agency automatically without bugging our clients with feedback forms. Best growth tool this quarter.',
    sourceUrl: 'https://reddit.com/r/SaaS',
    isPublishedToWall: true,
    timeAgo: '42m ago',
  },
  {
    id: 'm-3',
    source: 'Reddit',
    targetKeyword: 'Testimonial.to',
    isCompetitor: true,
    author: 'u/agency_lead',
    category: 'POACHABLE_LEAD',
    urgencyScore: 8,
    cleanQuote:
      'Migrating away from Testimonial.to because of their arbitrary upload limits on starter plans. Any recommendations?',
    aiPoachReply:
      "Hey! Take a look at PandaPraise — zero limits, zero hostage fees, and you can harvest authentic praise directly across Reddit, HN, and Google News at $0/mo.",
    sourceUrl: 'https://reddit.com',
    isPublishedToWall: false,
    timeAgo: '2h ago',
  },
  {
    id: 'm-4',
    source: 'GoogleNews',
    targetKeyword: 'PandaPraise',
    isCompetitor: false,
    author: 'Cloud Digest Index',
    category: 'FIRE_ALERT',
    urgencyScore: 7,
    cleanQuote:
      'Minor API latency spike detected on US-East scraper isolate during cloud worker deploy.',
    sourceUrl: 'https://news.google.com',
    isPublishedToWall: false,
    timeAgo: '4h ago',
  },
];

export const RadarView: React.FC<RadarViewProps> = ({
  workspaceName,
  brandSlug,
}) => {
  const [competitors, setCompetitors] = useState<string[]>(['Senja', 'Testimonial.to']);
  const [newCompetitorInput, setNewCompetitorInput] = useState('');
  const [mentions, setMentions] = useState<DashboardMention[]>(INITIAL_DASHBOARD_MENTIONS);
  const [isScanning, setIsScanning] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'poachable' | 'praise' | 'alerts' | 'published'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCompetitorInput.trim();
    if (trimmed && !competitors.includes(trimmed)) {
      setCompetitors([...competitors, trimmed]);
      setNewCompetitorInput('');
    }
  };

  const handleRemoveCompetitor = (name: string) => {
    setCompetitors(competitors.filter((c) => c !== name));
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: workspaceName,
          competitor: competitors[0] || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.mentions) && data.mentions.length > 0) {
          setMentions(
            data.mentions.map((m: any, idx: number) => ({
              id: m.externalId || `m-scan-${idx}`,
              source: m.source || 'Reddit',
              targetKeyword: m.targetKeyword || workspaceName,
              isCompetitor: Boolean(m.isCompetitor),
              author: m.author || 'Web User',
              category: m.category || 'PRAISE',
              urgencyScore: m.urgencyScore || 7,
              cleanQuote: m.cleanQuote || m.rawText,
              aiPoachReply: m.aiPoachReply,
              sourceUrl: m.sourceUrl || 'https://news.ycombinator.com',
              isPublishedToWall: false,
              timeAgo: 'Just now',
            }))
          );
        }
      }
    } catch {
      // In-browser fallback
    } finally {
      setIsScanning(false);
    }
  };

  const togglePublishStatus = (id: string) => {
    setMentions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isPublishedToWall: !m.isPublishedToWall } : m))
    );
  };

  const handleCopyPoachScript = (id: string, text: string, url: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const poachableCount = mentions.filter((m) => m.category === 'POACHABLE_LEAD').length;
  const praiseCount = mentions.filter((m) => m.category === 'PRAISE').length;
  const alertsCount = mentions.filter((m) => m.category === 'FIRE_ALERT').length;
  const publishedCount = mentions.filter((m) => m.isPublishedToWall).length;

  const filteredMentions = mentions.filter((m) => {
    if (filterTab === 'poachable') return m.category === 'POACHABLE_LEAD';
    if (filterTab === 'praise') return m.category === 'PRAISE';
    if (filterTab === 'alerts') return m.category === 'FIRE_ALERT';
    if (filterTab === 'published') return m.isPublishedToWall;
    return true;
  });

  return (
    <div className="space-y-6 font-sans animate-fade-in text-slate-900">
      {/* ── 1. Top Header & Vault Link ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Radar & Lead Poacher
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
              100% Zero-Cost Scraping
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Continuously scans Reddit, Hacker News, and Google News RSS for brand praise and competitor churn signals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/p/${brandSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold border border-violet-200 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Public Vault (/p/{brandSlug}) ↗</span>
          </a>

          <button
            type="button"
            onClick={handleRunScan}
            disabled={isScanning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-105 disabled:opacity-75"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning Feeds...</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5" />
                <span>Run Live Scan Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 2. Competitor Watchlist Configuration ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-rose-500" />
              <span>Competitor Watchlist (Lead Poaching Engine)</span>
            </h2>
            <p className="text-xs text-slate-500">
              We monitor these brands for pricing complaints, outage frustration, and migration queries.
            </p>
          </div>

          <form onSubmit={handleAddCompetitor} className="flex items-center gap-2">
            <input
              type="text"
              value={newCompetitorInput}
              onChange={(e) => setNewCompetitorInput(e.target.value)}
              placeholder="Add competitor name..."
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-violet-600 focus:ring-1 focus:ring-violet-600 outline-hidden bg-slate-50/50"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 px-2.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Competitor Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-800 border border-violet-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-violet-600" />
            <span>Brand: {workspaceName}</span>
          </span>

          {competitors.map((comp) => (
            <span
              key={comp}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5"
            >
              <Target className="w-3 h-3 text-rose-500" />
              <span>Spying: {comp}</span>
              <button
                type="button"
                onClick={() => handleRemoveCompetitor(comp)}
                className="text-rose-400 hover:text-rose-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* ── 3. Summary Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-rose-600 font-bold mb-1">
            <span>Poachable Leads</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{poachableCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">High-intent churn queries</p>
        </div>

        <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-purple-600 font-bold mb-1">
            <span>Verified Praise</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{praiseCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Organic customer shoutouts</p>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-600 font-bold mb-1">
            <span>Fire Alerts</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{alertsCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Bug & outage reports</p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-emerald-600 font-bold mb-1">
            <span>Published to Vault</span>
            <Share2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{publishedCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Live on /p/{brandSlug}</p>
        </div>
      </div>

      {/* ── 4. Signals Table & Cards ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        {/* Filter Navigation */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Signals ({mentions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('poachable')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'poachable'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              🎯 Poachable Leads ({poachableCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('praise')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'praise'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
              }`}
            >
              ✨ Praise ({praiseCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('alerts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'alerts'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              🚨 Fire Alerts ({alertsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterTab === 'published'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Published ({publishedCount})
            </button>
          </div>
        </div>

        {/* Signals List */}
        <div className="divide-y divide-slate-100">
          {filteredMentions.map((m) => (
            <div key={m.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      m.source === 'Reddit'
                        ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : m.source === 'HackerNews'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {m.source}
                  </span>

                  <span className="font-bold text-xs text-slate-800">{m.author}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-400 font-medium">{m.timeAgo}</span>
                </div>

                <div className="flex items-center gap-2">
                  {m.category === 'POACHABLE_LEAD' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <Flame className="w-3 h-3 text-rose-500" />
                      Poach Lead ({m.urgencyScore}/10)
                    </span>
                  ) : m.category === 'PRAISE' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      Praise Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      Alert ({m.urgencyScore}/10)
                    </span>
                  )}

                  {/* 1-Click Publish Toggle Button */}
                  <button
                    type="button"
                    data-toggle-publish="true"
                    onClick={() => togglePublishStatus(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      m.isPublishedToWall
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.isPublishedToWall ? '✓ Published to Vault' : '+ Publish to Vault'}
                  </button>
                </div>
              </div>

              {/* Quote */}
              <p className="text-sm text-slate-800 leading-relaxed font-normal mb-2.5">
                "{m.cleanQuote}"
              </p>

              {/* Founder Poach Script container */}
              {m.category === 'POACHABLE_LEAD' && m.aiPoachReply && (
                <div className="rounded-xl bg-rose-50/70 border border-rose-200/90 p-3 mb-2.5 text-xs">
                  <div className="font-bold text-rose-950 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>💡 AI Founder Poach Script (High-Converting DM Reply):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPoachScript(m.id, m.aiPoachReply!, m.sourceUrl)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>📋 Copy Poach Script & Open Thread</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-700 italic leading-relaxed">
                    "{m.aiPoachReply}"
                  </p>
                </div>
              )}

              {/* Link to Thread */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <a
                  href={m.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-800 font-semibold hover:underline"
                >
                  <span>Open Thread on {m.source}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RadarView;
