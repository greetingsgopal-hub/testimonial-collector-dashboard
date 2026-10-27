import React from "react";
import { Link } from "react-router-dom";
import { ShopifyConnect } from "../integrations/shopify/ShopifyConnect";
import { WhatsAppCollect } from "../integrations/whatsapp/WhatsAppCollect";

export const Workflow_01_02_03: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 sm:p-10 selection:bg-amber-400 selection:text-black font-sans">
      <div className="max-w-[1300px] mx-auto space-y-8">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-[12px] font-mono tracking-wider text-amber-400 hover:underline uppercase">
              ← Back to Home
            </Link>
            <span className="text-white/20">•</span>
            <Link to="/moderation" className="text-[12px] font-mono text-white/50 hover:text-white uppercase">
              Inbox / Moderation
            </Link>
            <span className="text-white/20">•</span>
            <Link to="/editor/1" className="text-[12px] font-mono text-white/50 hover:text-white uppercase">
              Phase 13 Video Editor
            </Link>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            PHASE 1 & 2 ACTIVE
          </span>
        </div>

        {/* Title & Overview */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="text-[28px] font-bold tracking-tight text-white">
            PandaPraise Workflow • 01 → 02 → 03
          </h1>
          <p className="text-[14px] text-white/60">
            Connect in 47s → Collect via WhatsApp → Edit auto-cuts hooks &amp; exports Meta top-notch ad.
          </p>
        </div>
        
        {/* 3 Step Interactive Workflow Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* 01: Connect */}
          <ShopifyConnect />

          {/* 02: Collect */}
          <WhatsAppCollect />

          {/* 03: Edit */}
          <div className="rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] p-6 max-w-[480px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-[11px] tracking-widest text-white/40 font-mono">03</div>
                <div className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] border border-white/[0.06] font-mono text-amber-400">
                  HOOKS + RATIOS
                </div>
              </div>
              <h3 className="text-[14px] font-semibold tracking-[0.1em] text-white">EDIT</h3>
              <p className="mt-2 text-[13px] text-white/50 leading-[1.5]">
                Panda auto-cuts hooks (0-3s), adds captions, and exports 9:16 / 4:5 / 1:1.
              </p>
              
              <div className="mt-5 rounded-[12px] bg-black border border-white/[0.06] p-3.5 space-y-2.5">
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full w-[35%] bg-[#FFD60A] transition-all" />
                </div>
                <div className="text-[11px] text-white/60 font-mono">
                  Auto-detected hook: <span className="text-amber-400 font-semibold">0.0s - 3.1s</span> (pocket reveal)
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] font-mono">9:16 ✓</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] font-mono">4:5 ✓</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.06] font-mono">1:1 ✓</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                    10M bitrate locked
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.04]">
              <Link
                to="/editor/1"
                className="w-full h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black text-[13px] font-bold shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>🎬 Open Phase 13 Video Editor →</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Architecture flow indicator */}
        <div className="rounded-[16px] bg-white/[0.03] border border-white/[0.06] p-5 text-[12px] text-white/50 leading-relaxed space-y-2">
          <div className="font-semibold text-white/80 font-mono text-[11px] uppercase tracking-wider">
            Automated End-to-End Pipeline
          </div>
          <div>
            Shopify order fulfilled → Cloudflare Queue delay 7 days → WhatsApp review request template → Customer replies video → R2 + Firestore → Moderation Dashboard → Phase 13 Editor (auto-cut) → Meta Ads Manager
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workflow_01_02_03;
