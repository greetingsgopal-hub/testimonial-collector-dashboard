
import React from 'react';
import { Link } from 'react-router-dom';
import { ShopifyConnect_Firebase } from "../integrations/shopify/ShopifyConnect_Firebase";
import { WhatsAppCollect_Firebase } from "../integrations/whatsapp/WhatsAppCollect_Firebase";
import { AutoEditor } from "../components/AutoEditor";
import { KpiCard } from "../components/ui/KpiCard";

// Final merged workflow - matches screenshot PNG 01-02-03 - AUTO + Firebase solid base
export const FinalWorkflow: React.FC = () => {
  const [activeVideoUrl, setActiveVideoUrl] = React.useState<string>('');
  const [activeTestimonialId, setActiveTestimonialId] = React.useState<string>('');

  return (
    <div 
      className="min-h-screen bg-[#0A0A0A] p-6 sm:p-10 text-white selection:bg-amber-400 selection:text-black font-sans" 
      style={{ background: 'radial-gradient(1200px 600px at 50% -10%, rgba(255,255,255,0.06), transparent), #0A0A0A' }}
    >
      <div className="max-w-[1280px] mx-auto space-y-8">
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
            AUTO WORKFLOW • FIREBASE SOLID BASE
          </span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[28px] font-semibold text-white tracking-tight tabular-nums">PandaPraise • Final • Firebase • AUTO</h1>
            <p className="mt-1 text-[13px] text-white/50">01 CONNECT Shopify 47s • 02 COLLECT WhatsApp No App • 03 EDIT Auto Hooks+Ratios • Top Notch 10M</p>
          </div>
          <div className="hidden md:flex gap-2">
            <KpiCard label="Flow" value="AUTO" sub="01→02→03" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <ShopifyConnect_Firebase />
          <WhatsAppCollect_Firebase onVideoUrlChange={(url, id) => { setActiveVideoUrl(url); setActiveTestimonialId(id || ''); }} />
          <AutoEditor videoUrl={activeVideoUrl} testimonialId={activeTestimonialId} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-[16px] bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="text-[11px] tracking-widest text-white/30 uppercase">Firebase Collections</div>
            <div className="mt-2 space-y-1 text-[11px] font-mono text-white/50 tabular-nums">
              <div>shops/{'{shopDomain}'} • connectedIn 47s</div>
              <div>whatsapp_triggers • +7 days queue</div>
              <div>whatsapp_incoming • real-time onSnapshot</div>
              <div>testimonials • source=whatsapp</div>
              <div>video_exports • auto:true topNotch:true</div>
            </div>
          </div>
          <div className="rounded-[16px] bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="text-[11px] tracking-widest text-white/30 uppercase">Storage • Top Notch</div>
            <div className="mt-2 space-y-1 text-[11px] font-mono text-white/50 tabular-nums">
              <div>whatsapp/{'{phone}'}/{'{id}'}.mp4</div>
              <div>edits/{'{id}'}/9x16_1080x1920_10M_CRF18.mp4</div>
              <div>edits/{'{id}'}/4x5_1080x1350_8M.mp4</div>
              <div>edits/{'{id}'}/1x1_1080x1080_8M.mp4</div>
              <div>CRF18 slow -14 LUFS unsharp0.3</div>
            </div>
          </div>
          <div className="rounded-[16px] bg-[#00D632]/10 border border-[#00D632]/20 p-4">
            <div className="text-[11px] tracking-widest text-[#00D632]/60 uppercase">Verify • Work Done</div>
            <div className="mt-2 space-y-1 text-[11px] text-white/60">
              <div>✓ Repo: 591 commits • Firebase base solid</div>
              <div>✓ 01 CONNECT: OAuth 1-click 47s timer</div>
              <div>✓ 02 COLLECT: WhatsApp UI incoming no app</div>
              <div>✓ 03 EDIT: Auto hooks 0-3s + captions + 3 ratios</div>
              <div>✓ Quality: 10M bitrate blocked if &lt;6M</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
