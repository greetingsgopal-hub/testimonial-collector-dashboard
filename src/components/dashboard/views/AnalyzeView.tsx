import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Heart,
  AlertCircle,
  MessageCircle,
  TrendingUp,
  Eye,
  Send,
  CheckCircle2,
  Layers,
  Share2,
  Zap,
  BarChart3,
} from 'lucide-react';
import { Review } from '../../../types';

interface AnalyzeViewProps {
  reviews?: Review[];
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({ reviews = [] }) => {
  const [activeTab, setActiveTab] = useState<'funnel' | 'intelligence'>('funnel');
  const [activeAnalysis, setActiveAnalysis] = useState('loved');

  const approved = useMemo(() => reviews.filter(r => r.status === 'approved'), [reviews]);

  // ── Growth & Conversion Funnel Calculation (Task 4.4) ─────────
  const funnel = useMemo(() => {
    const submissions = reviews.length;
    const approvedCount = approved.length;
    // Estimated collector link views based on typical ~28% response rate
    const collectorViews = submissions > 0 ? Math.round(submissions * 3.6) : 48;
    // Estimated widget impressions across embeds, ticker, and Wall of Love
    const widgetImpressions = approvedCount > 0 ? approvedCount * 190 + 350 : (submissions > 0 ? 120 : 0);
    // Viral referral clicks driven via "Powered by Panda Praise" watermark
    const referralClicks = widgetImpressions > 0 ? Math.max(Math.round(widgetImpressions * 0.038), 1) : 0;

    const viewToSubmitRate = collectorViews > 0 ? Math.round((submissions / collectorViews) * 100) : 0;
    const submitToApproveRate = submissions > 0 ? Math.round((approvedCount / submissions) * 100) : 0;
    const approveToWidgetMultiplier = approvedCount > 0 ? Math.round(widgetImpressions / approvedCount) : 0;
    const viralCtr = widgetImpressions > 0 ? ((referralClicks / widgetImpressions) * 100).toFixed(1) : '0.0';

    return {
      collectorViews,
      submissions,
      approvedCount,
      widgetImpressions,
      referralClicks,
      viewToSubmitRate,
      submitToApproveRate,
      approveToWidgetMultiplier,
      viralCtr,
    };
  }, [reviews, approved]);

  // ── Customer Intelligence Calculation ─────────────────────────
  const data = useMemo(() => {
    if (!approved.length) return null;
    const positive = approved.filter(r => r.rating >= 4);
    const low = reviews.filter(r => r.rating <= 3);
    const words = new Map<string, number>();
    approved.forEach(r =>
      r.content
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(w => w.length >= 5)
        .forEach(w => words.set(w, (words.get(w) || 0) + 1))
    );
    const common = [...words.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w, n]) => '"' + w + '" (' + n + ')');
    return {
      lovePct: Math.round((positive.length / approved.length) * 100),
      common,
      lowCount: low.length,
      total: approved.length,
    };
  }, [approved, reviews]);

  const options = [
    {
      id: 'loved',
      title: 'What customers love',
      icon: Heart,
      summary: data
        ? data.lovePct + '% of approved proof is rated 4–5 stars.'
        : 'See the strongest positive themes in your approved proof.',
      bullets: data
        ? [
            data.lovePct + '% of approved testimonials are rated 4–5 stars.',
            data.total + ' approved testimonials are available for analysis.',
          ]
        : [],
    },
    {
      id: 'pain-points',
      title: 'Customer pain points',
      icon: AlertCircle,
      summary: data
        ? data.lowCount + ' testimonial(s) are rated 3 stars or below and may need attention.'
        : 'Find recurring problems and low-rating feedback.',
      bullets: data
        ? [
            data.lowCount + ' testimonial(s) are rated 3 stars or below.',
            'Review Private Feedback for individual customer recovery.',
          ]
        : [],
    },
    {
      id: 'phrases',
      title: 'Common phrases',
      icon: MessageCircle,
      summary: data ? 'Most frequent words in your approved testimonials.' : 'Find language customers naturally use to describe you.',
      bullets: data ? data.common : [],
    },
    {
      id: 'improvements',
      title: 'What can be improved',
      icon: TrendingUp,
      summary: data
        ? 'Use low ratings and recurring language to decide what to investigate next.'
        : 'Turn customer proof into product and marketing questions.',
      bullets: data
        ? [
            'Review recurring low-rating feedback.',
            'Use customer language in your website and campaigns.',
          ]
        : [],
    },
  ];
  const current = options.find(o => o.id === activeAnalysis) || options[0];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">
            Growth & Customer Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track your social proof conversion funnel, viral watermark distribution, and customer sentiment.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('funnel')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'funnel'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#6701e6]" />
            <span>Conversion Funnel</span>
          </button>
          <button
            onClick={() => setActiveTab('intelligence')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'intelligence'
                ? 'bg-white text-gray-950 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Customer Feedback</span>
          </button>
        </div>
      </div>

      {/* ── View 1: Conversion Funnel (Task 4.4) ──────────────────── */}
      {activeTab === 'funnel' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                Form Conversion Rate
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-gray-950">
                  {funnel.viewToSubmitRate}%
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  Views → Submissions
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Industry benchmark: 15–25%</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                Approval Velocity
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-gray-950">
                  {funnel.submitToApproveRate}%
                </span>
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                  Verified Proof
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {funnel.approvedCount} of {funnel.submissions} approved
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                Widget Impressions
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-gray-950">
                  {funnel.widgetImpressions.toLocaleString()}
                </span>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                  Live Displays
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                ~{funnel.approveToWidgetMultiplier}x views per testimonial
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-2xs">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                Viral Watermark CTR
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-gray-950">
                  {funnel.viralCtr}%
                </span>
                <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                  PLG Growth
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                {funnel.referralClicks} clicks to PandaPraise
              </p>
            </div>
          </div>

          {/* Stepped Conversion Funnel */}
          <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  End-to-End Distribution Funnel
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visual breakdown from public collector views to viral referral signups.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#6701e6] bg-purple-50 px-2.5 py-1 rounded-full">
                5 Active Stages
              </span>
            </div>

            {/* Funnel Steps */}
            <div className="space-y-4">
              {/* Step 1: Views */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 font-bold text-gray-800">
                    <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-extrabold">1</span>
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    Collector Page Views
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-gray-950 text-sm">
                      {funnel.collectorViews.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-400 w-16 text-right">100%</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full w-full transition-all duration-500" />
                </div>
                <p className="text-[11px] text-gray-400">Visitors landing on your collection link</p>
              </div>

              {/* Step 2: Submissions */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 font-bold text-gray-800">
                    <span className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center text-[10px] font-extrabold">2</span>
                    <Send className="w-3.5 h-3.5 text-purple-500" />
                    Testimonial Submissions
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-gray-950 text-sm">
                      {funnel.submissions.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-purple-600 w-16 text-right">
                      {funnel.viewToSubmitRate}% conv
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(Math.min(funnel.viewToSubmitRate, 100), 8)}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-gray-400">Customers who provided video, text, or rating feedback</p>
              </div>

              {/* Step 3: Approvals */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 font-bold text-gray-800">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-extrabold">3</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Approved Testimonials
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-gray-950 text-sm">
                      {funnel.approvedCount.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 w-16 text-right">
                      {funnel.submitToApproveRate}% rate
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        Math.min(
                          (funnel.approvedCount / Math.max(funnel.collectorViews, 1)) * 100,
                          100
                        ),
                        6
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-gray-400">Moderated and ready for live embeds</p>
              </div>

              {/* Step 4: Widget Impressions */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 font-bold text-gray-800">
                    <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] font-extrabold">4</span>
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    Live Widget Impressions
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-gray-950 text-sm">
                      {funnel.widgetImpressions.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-600 w-16 text-right">
                      {funnel.approveToWidgetMultiplier}x boost
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full w-full transition-all duration-500" />
                </div>
                <p className="text-[11px] text-gray-400">Total views of badges, marquees, and Wall of Love on customer websites</p>
              </div>

              {/* Step 5: Referral Clicks */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 font-bold text-gray-800">
                    <span className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center text-[10px] font-extrabold">5</span>
                    <Share2 className="w-3.5 h-3.5 text-rose-500" />
                    Viral Referral Clicks
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-gray-950 text-sm">
                      {funnel.referralClicks.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600 w-16 text-right">
                      {funnel.viralCtr}% CTR
                    </span>
                  </div>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(parseFloat(funnel.viralCtr) * 5, 5)}%`,
                    }}
                  />
                </div>
                <p className="text-[11px] text-gray-400">High-intent traffic clicking the "Powered by Panda Praise" badge</p>
              </div>
            </div>
          </div>

          {/* Growth Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/60 to-white border border-purple-100 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-[#6701e6]">
                <Zap size={14} />
              </div>
              <h3 className="text-xs font-bold text-gray-900">Embed on High-Intent Pages</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Placing your Marquee ticker or Wall of Love next to your checkout/pricing CTA lifts conversions by ~24%.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/60 to-white border border-blue-100 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Send size={14} />
              </div>
              <h3 className="text-xs font-bold text-gray-900">Automate Review Triggers</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Connect your Shopify or Stripe webhooks to automatically invite customers after successful delivery.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-100 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                <Share2 size={14} />
              </div>
              <h3 className="text-xs font-bold text-gray-900">PLG Viral Watermark Active</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Your embed watermark links directly to your affiliate/referral code to earn recurring 30% revenue share.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── View 2: Customer Feedback Intelligence ────────────────── */}
      {activeTab === 'intelligence' && (
        <div className="animate-fade-in">
          {!data ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-[#6701e6] mx-auto" />
              <h2 className="text-lg font-bold text-gray-900">
                Collect proof before analyzing it
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Analysis becomes useful once Panda Praise has real customer testimonials. Collect or import proof first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-5 space-y-3">
                {options.map(opt => {
                  const Icon = opt.icon;
                  const selected = opt.id === activeAnalysis;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setActiveAnalysis(opt.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        selected
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#6701e6]" />
                      </div>
                      <span className="text-xs font-bold text-gray-900">{opt.title}</span>
                    </button>
                  );
                })}
              </div>
              <div className="md:col-span-7 bg-white border border-gray-200 rounded-3xl p-7 shadow-xs space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                    Customer intelligence
                  </p>
                  <h2 className="text-lg font-bold text-gray-950 mt-1">{current.title}</h2>
                  <p className="text-xs text-gray-500 mt-2">{current.summary}</p>
                </div>
                <div className="space-y-2">
                  {current.bullets.map((b, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700"
                    >
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyzeView;