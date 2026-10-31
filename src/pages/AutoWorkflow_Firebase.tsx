import React from "react";
import { Link } from "react-router-dom";
import { ShopifyConnect_Firebase } from "../integrations/shopify/ShopifyConnect_Firebase";
import { WhatsAppCollect_Firebase } from "../integrations/whatsapp/WhatsAppCollect_Firebase";
import { AutoEditor } from "../components/AutoEditor";
import { WhatsAppAccountLink } from "../integrations/whatsapp/WhatsAppAccountLink";

// Final auto workflow - 01 02 03 all auto - Firebase solid base
export const AutoWorkflow_Firebase: React.FC = () => {
  const [activeVideoUrl, setActiveVideoUrl] = React.useState('');
  const [activeTestimonialId, setActiveTestimonialId] = React.useState('');
  return (
    <div 
      className="min-h-screen bg-[#0A0A0A] p-6 sm:p-10 text-white selection:bg-amber-400 selection:text-black font-sans"
      style={{ background: 'radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent), #0A0A0A' }}
    >
      <div className="max-w-[1280px] mx-auto space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-[12px] font-mono tracking-wider text-amber-400 hover:underline uppercase">
              ← Home
            </Link>
            <span className="text-white/20">•</span>
            <Link to="/moderation" className="text-[12px] font-mono text-white/50 hover:text-white uppercase">
              Inbox / Moderation
            </Link>
            <span className="text-white/20">•</span>
            <Link to="/editor/1" className="text-[12px] font-mono text-white/50 hover:text-white uppercase">
              Studio Video Editor
            </Link>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            AUTO WORKFLOW • FIREBASE
          </span>
        </div>

        {/* Title */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h1 className="text-[26px] sm:text-[30px] font-bold text-white tracking-tight">
            PandaPraise • AUTO Workflow • Firebase
          </h1>
          <p className="text-[13px] sm:text-[14px] text-white/50">
            01 Connect 47s (auto) → 02 Collect WhatsApp (auto) → 03 Edit Hooks+Ratios (auto)
          </p>
        </div>
        
        {/* 3 Step Auto Workflow Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <ShopifyConnect_Firebase />
          <WhatsAppCollect_Firebase onVideoUrlChange={(url, id) => { setActiveVideoUrl(url); setActiveTestimonialId(id || ''); }} />
          <AutoEditor videoUrl={activeVideoUrl} testimonialId={activeTestimonialId} />
        </div>

        <WhatsAppAccountLink />

        {/* Architecture Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="rounded-[16px] bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="text-[11px] text-white/40 uppercase tracking-widest font-mono">Firebase Collections</div>
            <div className="mt-2.5 space-y-1 text-[11px] text-white/60 tabular-nums font-mono">
              <div>• shops/&#123;shopDomain&#125; (OAuth tokens)</div>
              <div>• whatsapp_triggers (7-day queue)</div>
              <div>• whatsapp_incoming (real-time stream)</div>
              <div>• testimonials (unified inbox)</div>
              <div>• video_exports (auto 3-ratio exports)</div>
            </div>
          </div>
          <div className="rounded-[16px] bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="text-[11px] text-white/40 uppercase tracking-widest font-mono">Firebase Storage</div>
            <div className="mt-2.5 space-y-1 text-[11px] text-white/60 tabular-nums font-mono">
              <div>whatsapp/&#123;phone&#125;/&#123;id&#125;.mp4</div>
              <div>edits/&#123;id&#125;/9x16_10M.mp4</div>
              <div>edits/&#123;id&#125;/4x5_8M.mp4</div>
              <div>edits/&#123;id&#125;/1x1_8M.mp4</div>
              <div>avatars/&#123;user&#125;.jpg</div>
            </div>
          </div>
          <div className="rounded-[16px] bg-emerald-500/10 border border-emerald-500/20 p-4">
            <div className="text-[11px] text-emerald-400 uppercase tracking-widest font-mono font-semibold">
              Quality Lock - Top Notch
            </div>
            <div className="mt-2.5 space-y-1 text-[11px] text-emerald-300/90 tabular-nums font-mono">
              <div>✓ CRF 18 slow preset (not fast)</div>
              <div>✓ 10M bitrate 1080x1920 (Meta sweet spot)</div>
              <div>✓ -14 LUFS audio + unsharp 0.3</div>
              <div>✓ Hook 0-3s auto-cut (pocket reveal)</div>
              <div>✓ Safe zones 250px top/bottom</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AutoWorkflow_Firebase;

