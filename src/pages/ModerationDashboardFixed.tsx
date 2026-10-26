import { useState } from "react";
import { Link } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { KpiCard } from "../components/KpiCard";
import { TestimonialCard } from "../components/TestimonialCard";
import { CommandMenu } from "../components/CommandMenu";
import { CardSkeleton } from "../components/Skeleton";
import { useUndoDelete } from "../components/UndoToast";
import { FilterDropdown } from "../components/FilterDropdown";

// Tier 1 fix demo: 20 UI Tips implemented
export const ModerationDashboardFixed = () => {
  const [data, setData] = useState([
    { 
      id: '1', 
      name: 'Ananya Shah', 
      company: 'Kalyan Silks', 
      role: 'Customer', 
      rating: 5, 
      status: 'pending', 
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 
      content: 'The kurta with real deep pockets is life-changing! Fits my iPhone Pro Max easily. Finally a brand that actually gets it.' 
    },
    { 
      id: '2', 
      name: 'Rahul Mehta', 
      company: 'D2C Apparel Brand', 
      role: 'Founder', 
      rating: 5, 
      status: 'pending', 
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 
      content: 'PandaPraise helped us collect 200 WhatsApp video testimonials in 7 days. Our Meta ad ROAS jumped from 1.8x to 3.4x.' 
    },
    { 
      id: '3', 
      name: 'Priya Sundaram', 
      company: 'FabIndia Shopper', 
      role: 'Verified Buyer', 
      rating: 5, 
      status: 'pending', 
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 
      content: 'Super comfortable breathable fabric! 4-way stretch is no joke. Ordered 2 more in different colors.' 
    },
  ]);
  const [loading, setLoading] = useState(false);
  const undoDelete = useUndoDelete(setData);

  const handleAction = (action: string) => {
    if (action === 'approve') {
      if (data.length > 0) {
        setData(prev => prev.map((item, idx) => idx === 0 ? { ...item, status: 'approved' } : item));
        toast.success(`Approved testimonial from ${data[0].name}`);
      }
    } else if (action === 'reject') {
      if (data.length > 0) {
        setData(prev => prev.map((item, idx) => idx === 0 ? { ...item, status: 'rejected' } : item));
        toast.error(`Rejected testimonial from ${data[0].name}`);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0F0F10] text-white p-6 selection:bg-amber-400 selection:text-black font-sans" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Sonner toast provider for Undo toasts */}
      <Toaster position="bottom-right" richColors theme="dark" />

      {/* 3 Command Menu (Cmd+K) & 4 Shortcut hints (A/R/J/K) */}
      <CommandMenu onAction={handleAction} />
      
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-3">
              <Link to="/" className="text-[12px] font-mono tracking-wider text-amber-400 hover:underline uppercase">
                ← Back to Home
              </Link>
              <span className="text-white/20">•</span>
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                20 UI Tips Active
              </span>
            </div>
            {/* 17 Balanced headlines */}
            <h1 className="text-[26px] font-bold tracking-tight text-white mt-1 text-balance" style={{ textWrap: 'balance' } as any}>
              Customer Review Moderation & UGC Studio
            </h1>
            <p className="text-[13px] text-white/50 mt-0.5">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">⌘K</kbd> for command menu • <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">A</kbd> Approve • <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[11px]">R</kbd> Reject
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/editor/1"
              className="h-9 px-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-[13px] font-bold shadow-lg shadow-amber-400/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <span>🎬 Video Editor</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-black font-semibold uppercase">Phase 13</span>
            </Link>
            <button 
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 900);
              }}
              className="h-9 px-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 text-[12px] transition-colors border border-white/[0.06]"
            >
              Simulate Loading
            </button>
            {/* 20 Amazon safe triangle filter dropdown */}
            <FilterDropdown />
          </div>
        </div>
        
        {/* 16 KPIs with Tabular numbers & continuous corners */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <KpiCard label="Total Reviews" value={1247} sub="+12% this week" loading={loading} />
          <KpiCard label="Avg Rating" value="4.9" sub="★ 98% 5-star" loading={loading} />
          <KpiCard label="Pending" value={data.filter(x => x.status === 'pending').length} sub="action needed" loading={loading} />
          <KpiCard label="Approval Rate" value="94.2%" sub="instant sync" loading={loading} />
        </div>
        
        {/* Grid with 1 Skeletons, 8 BlurHash, 2 Optimistic updates, 13 Hit-slop, 18 Continuous corners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? [1, 2, 3].map(i => <CardSkeleton key={i} />) : data.map(t => (
            <TestimonialCard 
              key={t.id} 
              t={t} 
              onApprove={() => toast.success(`Approved ${t.name}'s testimonial`)} 
              onReject={() => toast.info(`Marked ${t.name}'s testimonial as rejected`)} 
              onDelete={(id: string) => undoDelete(id, t)} 
            />
          ))}
        </div>
        
        {/* 20 UI Tips checklist badge */}
        <div className="rounded-[20px] bg-[#161618] border border-white/[0.08] p-5 text-[12px] text-white/60 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
            <span className="font-semibold text-white tracking-wide">PandaPraise 20 UI Tips Applied Systematically:</span>
            <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">20 / 20 Verified</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 tabular-nums">
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 1. Skeleton loaders</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 2. Optimistic updates</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 3. Command menu (⌘K)</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 4. Shortcut hints (A/R/J/K)</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 5. Undo toasts (5s)</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 6. Stale-while-revalidate</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 7. Pre-rendering (hover)</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 8. BlurHash placeholders</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 9. View transitions</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 10. Swipe-to-dismiss</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 11. Interruptible animations</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 12. Predictive back</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 13. Hit slop (44px target)</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 14. Safe area insets</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 15. One-time code autofill</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 16. Tabular numbers</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 17. Balanced headlines</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 18. Continuous corners (20px)</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 19. Idempotency keys</div>
            <div className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 20. Amazon safe triangle</div>
          </div>
        </div>
      </div>
      
      {/* 15 One-time code autofill demo card */}
      <div className="fixed bottom-4 right-4 p-3.5 rounded-[16px] bg-[#1C1C1F] border border-white/[0.12] text-[12px] shadow-2xl z-20">
        <div className="text-white/50 mb-1.5 font-medium flex items-center justify-between">
          <span>OTP Autofill (Tip 15)</span>
          <span className="text-[10px] text-amber-400 font-mono">SMS Ready</span>
        </div>
        <input 
          autoComplete="one-time-code" 
          inputMode="numeric" 
          maxLength={6}
          placeholder="Enter 6-digit OTP" 
          className="w-[160px] h-8 px-2.5 rounded-[8px] bg-white/[0.06] text-white text-[13px] border border-white/[0.08] focus:border-amber-400 outline-none tabular-nums font-mono tracking-widest text-center" 
        />
      </div>
    </div>
  );
};

export default ModerationDashboardFixed;
