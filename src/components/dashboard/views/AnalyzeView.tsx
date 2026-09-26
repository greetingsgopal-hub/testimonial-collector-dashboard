import React, { useMemo, useState } from 'react';
import { Sparkles, Heart, AlertCircle, MessageCircle, TrendingUp } from 'lucide-react';
import { Review } from '../../../types';

interface AnalyzeViewProps { reviews?: Review[]; }

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({ reviews = [] }) => {
  const [activeAnalysis, setActiveAnalysis] = useState('loved');
  const approved = useMemo(() => reviews.filter(r => r.status === 'approved'), [reviews]);
  const data = useMemo(() => {
    if (!approved.length) return null;
    const positive = approved.filter(r => r.rating >= 4);
    const low = reviews.filter(r => r.rating <= 3);
    const words = new Map<string, number>();
    approved.forEach(r => r.content.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 5).forEach(w => words.set(w, (words.get(w) || 0) + 1)));
    const common = [...words.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([w,n]) => '"' + w + '" (' + n + ')');
    return { lovePct: Math.round((positive.length / approved.length) * 100), common, lowCount: low.length, total: approved.length };
  }, [approved, reviews]);

  const options = [
    { id:'loved', title:'What customers love', icon:Heart, summary:data ? data.lovePct + '% of approved proof is rated 4–5 stars.' : 'See the strongest positive themes in your approved proof.', bullets:data ? [data.lovePct + '% of approved testimonials are rated 4–5 stars.', data.total + ' approved testimonials are available for analysis.'] : [] },
    { id:'pain-points', title:'Customer pain points', icon:AlertCircle, summary:data ? data.lowCount + ' testimonial(s) are rated 3 stars or below and may need attention.' : 'Find recurring problems and low-rating feedback.', bullets:data ? [data.lowCount + ' testimonial(s) are rated 3 stars or below.', 'Review Private Feedback for individual customer recovery.'] : [] },
    { id:'phrases', title:'Common phrases', icon:MessageCircle, summary:data ? 'Most frequent words in your approved testimonials.' : 'Find language customers naturally use to describe you.', bullets:data ? data.common : [] },
    { id:'improvements', title:'What can be improved', icon:TrendingUp, summary:data ? 'Use low ratings and recurring language to decide what to investigate next.' : 'Turn customer proof into product and marketing questions.', bullets:data ? ['Review recurring low-rating feedback.', 'Use customer language in your website and campaigns.'] : [] },
  ];
  const current = options.find(o=>o.id===activeAnalysis) || options[0];

  return <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
    <div className="pb-4 border-b border-gray-100"><h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">Understand your customers</h1><p className="text-xs text-gray-500 mt-1">Use your collected proof to spot themes, customer language and areas worth investigating.</p></div>
    {!data ? <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-3"><Sparkles className="w-8 h-8 text-[#6701e6] mx-auto"/><h2 className="text-lg font-bold text-gray-900">Collect proof before analyzing it</h2><p className="text-xs text-gray-500 max-w-md mx-auto">Analysis becomes useful once Panda Praise has real customer testimonials. Collect or import proof first.</p></div> :
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start"><div className="md:col-span-5 space-y-3">{options.map(opt=>{const Icon=opt.icon; const selected=opt.id===activeAnalysis; return <button key={opt.id} onClick={()=>setActiveAnalysis(opt.id)} className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 ${selected?'border-purple-300 bg-purple-50':'border-gray-200 bg-white hover:border-gray-300'}`}><div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center"><Icon className="w-4 h-4 text-[#6701e6]"/></div><span className="text-xs font-bold text-gray-900">{opt.title}</span></button>})}</div>
    <div className="md:col-span-7 bg-white border border-gray-200 rounded-3xl p-7 shadow-xs space-y-5"><div><p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Customer intelligence</p><h2 className="text-lg font-bold text-gray-950 mt-1">{current.title}</h2><p className="text-xs text-gray-500 mt-2">{current.summary}</p></div><div className="space-y-2">{current.bullets.map((b,i)=><div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700">{b}</div>)}</div></div></div>}
  </div>;
};
export default AnalyzeView;