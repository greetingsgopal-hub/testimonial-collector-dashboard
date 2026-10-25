import { useState, useRef, useEffect, useCallback } from 'react';

export function LandingPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [slider, setSlider] = useState<number>(62);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !sliderContainerRef.current) return;
      const rect = sliderContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const offset = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (offset / rect.width) * 100));
      setSlider(percentage);
    };

    const handleUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    setUploadedFile(file.name);
    showToast(`✓ ${file.name} queued — demo ad in 2h`);
  };

  return (
    <div
      className="min-h-screen bg-[#0A0A0B] text-[#F8F6F1] selection:bg-[#FFE600] selection:text-black overflow-x-clip antialiased"
      style={{ paddingTop: 'var(--safe-area-inset-top)', boxSizing: 'border-box' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');
        :root { --accent: #FFE600; --bg: #0A0A0B; --text: #F8F6F1; }
        .serif { font-family: "Instrument Serif", Georgia, serif; }
        .sans { font-family: "Inter", system-ui, sans-serif; }
        * { font-family: "Inter", system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #2a2a2e; border-radius: 999px; }
        @keyframes in { from { transform: translateY(8px) scale(0.98); opacity:0 } to { transform: translateY(0) scale(1); opacity:1 } }
        .no-scrollbar::-webkit-scrollbar { display:none }
      `}</style>

      {/* AMBIENT GLOW */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-[120px] opacity-[0.07] bg-[#FFE600]" />
      </div>

      {/* TOAST NOTIFICATION */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        {toast && (
          <div className="pointer-events-auto sans bg-[#F8F6F1] text-black text-[13px] font-semibold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-[in_0.25s_ease]">
            <span className="w-5 h-5 rounded-full bg-black text-white grid place-items-center text-[10px]">↗</span>
            {toast}
          </div>
        )}
      </div>

      {/* STICKY HEADER */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/[0.06] bg-[#0A0A0B]/80"
        style={{ top: 'var(--safe-area-inset-top)' }}
      >
        <div className="max-w-[1120px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#FFE600] rounded-[6px] grid place-items-center text-black font-black text-[13px] leading-none">
              P
            </div>
            <span className="sans font-bold tracking-[-0.02em] text-[15px]">PandaPraise</span>
            <span className="ml-2 text-[10px] tracking-[0.18em] font-semibold text-white/40 border border-white/10 rounded-full px-2 py-0.5">
              MERCHANT
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/60">
            <button onClick={() => scrollTo('proof')} className="hover:text-white transition">
              Live Proof
            </button>
            <button onClick={() => scrollTo('how')} className="hover:text-white transition">
              How it works
            </button>
            <button onClick={() => scrollTo('pricing')} className="hover:text-white transition">
              Pricing
            </button>
          </div>

          <button
            onClick={() => scrollTo('upload')}
            className="sans bg-[#FFE600] text-black font-semibold text-[13px] px-4 py-2 rounded-full hover:brightness-110 transition"
          >
            Get demo free
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative max-w-[1120px] mx-auto px-6 pt-[56px] md:pt-[84px] pb-[40px] grid md:grid-cols-[1.05fr_0.95fr] gap-10 md:gap-8 items-start">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.18em] font-semibold text-white/50 border border-white/[0.08] rounded-full px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600] animate-pulse" />
            FOR SHOPIFY STORES DOING ₹2L+/MO ON META
          </div>

          <h1 className="serif text-[44px] md:text-[68px] leading-[0.95] tracking-[-0.03em] font-normal">
            Your WhatsApp is <br />
            <span className="italic text-[#FFE600]">full of ads</span>
            <br />
            you never used
          </h1>

          <p className="sans mt-6 text-[17px] leading-[1.5] text-white/60 max-w-[460px]">
            Turn real 19-sec customer videos into Meta-ready UGC ads. No actors. No brief. 24h delivery.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => scrollTo('upload')}
              className="sans bg-[#FFE600] text-black font-bold text-[14px] px-6 h-[48px] rounded-full flex items-center gap-2 hover:brightness-110 transition"
            >
              Upload 1 WhatsApp Video → Get Demo Ad FREE (in 2h)
            </button>
            <button
              onClick={() => scrollTo('proof')}
              className="sans border border-white/15 text-white font-medium text-[14px] px-6 h-[48px] rounded-full hover:bg-white/5 transition flex items-center"
            >
              See 3 live ads running now →
            </button>
          </div>

          <div className="mt-8 flex items-center gap-3 text-[12px] text-white/40">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((p) => (
                <div
                  key={p}
                  className="w-7 h-7 rounded-full border-2 border-[#0A0A0B] bg-[#1c1c1e] grid place-items-center text-[10px] font-bold"
                >
                  {['S', 'Z', 'M'][p]}
                </div>
              ))}
            </div>
            <span>Trusted by 214 Shopify stores • Avg. 2.8% CTR</span>
          </div>
        </div>

        {/* HERO VISUAL PIPELINE */}
        <div className="relative md:pl-4">
          <div className="grid grid-cols-[1.1fr_auto_1.2fr] items-center gap-3">
            {/* WHATSAPP INCOMING CARD */}
            <div className="bg-[#111113] border border-white/[0.08] rounded-[18px] overflow-hidden shadow-2xl">
              <div className="bg-[#202327] px-3 py-2.5 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#2a2f36] grid place-items-center text-[11px]">
                  👩🏽
                </div>
                <div className="leading-tight">
                  <div className="text-[12px] font-semibold">Anjali • Customer</div>
                  <div className="text-[10px] text-white/40">today, 2:14 PM ✓✓</div>
                </div>
                <div className="ml-auto text-white/20">⋮</div>
              </div>

              <div className="p-3 space-y-3 bg-[#0e1012]">
                <div className="bg-[#1f2428] rounded-[12px] rounded-bl-[4px] px-3 py-2 max-w-[88%]">
                  <div className="text-[11px] text-[#25D366] font-semibold mb-0.5">VIDEO • 0:19</div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-white/10 grid place-items-center">▶</div>
                    <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[72%] bg-[#25D366]" />
                    </div>
                    <div className="text-[10px] text-white/40">0:19</div>
                  </div>
                  <div className="text-[12px] mt-2 leading-snug">
                    OMG pockets are real! 😭 Best kurta I own fr. Wore it to office...
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-[#005c4b] text-[11px] px-3 py-1.5 rounded-[12px] rounded-br-[4px]">
                    Thank you Anjali! 🤩 Can we use this?
                  </div>
                </div>
              </div>
            </div>

            {/* PIPELINE ARROW */}
            <div className="flex flex-col items-center gap-2 text-[#FFE600]">
              <div className="w-[36px] h-[1px] bg-[#FFE600]/60 hidden md:block" />
              <div className="w-8 h-8 rounded-full bg-[#FFE600] text-black grid place-items-center font-bold text-[14px]">
                →
              </div>
              <div className="text-[9px] tracking-[0.2em] font-bold text-white/50 rotate-90 md:rotate-0 whitespace-nowrap">
                PANDA AI
              </div>
            </div>

            {/* META AD PREVIEW */}
            <div className="relative bg-[#151518] border border-white/10 rounded-[18px] overflow-hidden aspect-[9/16] shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
              <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                <span className="text-[9px] tracking-widest font-bold bg-black/60 backdrop-blur px-2 py-1 rounded-full">
                  9:16 • 1080x1920
                </span>
                <span className="text-[9px] bg-[#FFE600] text-black font-bold px-2 py-1 rounded-full">
                  META READY
                </span>
              </div>

              <div className="h-full w-full bg-[radial-gradient(circle_at_50%_30%,#2a2a2e,#121213)] grid place-items-center p-4">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-white/10 grid place-items-center mb-3">
                    ▶
                  </div>
                  <div className="text-[12px] text-white/30">
                    Customer video <br />
                    auto-cropped
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="bg-[#FFE600] text-black font-black text-[13px] leading-[1.1] tracking-[-0.01em] px-2.5 py-2 rounded-[8px] -rotate-[1deg] shadow-lg">
                  POV: Kurta with <br />
                  REAL POCKETS??
                </div>
                <div className="mt-2 flex gap-1.5">
                  <span className="text-[8px] bg-white text-black font-bold px-2 py-1 rounded-full">
                    HOOK • 0-3s
                  </span>
                  <span className="text-[8px] bg-white/15 text-white px-2 py-1 rounded-full">
                    SUBTITLES • AUTO
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SLA BADGE */}
          <div className="absolute -bottom-4 left-4 md:left-0 bg-[#F8F6F1] text-black rounded-[12px] px-3 py-2.5 flex items-center gap-3 shadow-xl border border-black/5">
            <div className="w-8 h-8 rounded-full bg-black text-white grid place-items-center text-[12px]">
              ✓
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-bold">Edited in 8m 12s</div>
              <div className="text-[10px] text-black/60">3 hooks • 2 ratios • SRT + SRT</div>
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS MARQUEE */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-[1120px] mx-auto px-6 h-[52px] flex items-center gap-6 overflow-x-auto no-scrollbar text-[12px] tracking-[0.16em] font-semibold text-white/30 whitespace-nowrap">
          <span className="text-white/60">INTEGRATES WITH</span>
          {['Shopify', 'WhatsApp Business API', 'Meta Ads', 'Razorpay', 'GST'].map((p) => (
            <span key={p} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-white/20" /> {p}
            </span>
          ))}
        </div>
      </section>

      {/* LIVE PROOF */}
      <section id="proof" className="max-w-[1120px] mx-auto px-6 py-[72px]">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 className="serif text-[32px] md:text-[44px] leading-[0.95] tracking-[-0.02em] max-w-[520px]">
            These are NOT actors. <br />
            They're customers.{' '}
            <span className="italic text-white/50">Running live.</span>
          </h2>
          <div className="text-[13px] text-white/40 max-w-[320px]">
            Pulled from WhatsApp Business API → edited → pushed to Meta Ads Manager. No shoot.
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              brand: 'Snitch',
              handle: '@snitch.co.in',
              days: 47,
              ctr: '2.8%',
              cpa: '₹11',
              color: '#FFE600',
            },
            {
              brand: 'Zouk',
              handle: 'Bags • Vegan',
              days: 32,
              ctr: '3.1%',
              cpa: '₹18',
              color: '#fff',
            },
            {
              brand: 'Minimalist',
              handle: 'Skincare • 5% Niacinamide',
              days: 61,
              ctr: '2.4%',
              cpa: '₹14',
              color: '#FFE600',
            },
          ].map((p) => (
            <div
              key={p.brand}
              className="group relative bg-[#141416] border border-white/[0.07] rounded-[20px] overflow-hidden hover:border-white/15 transition"
            >
              <div className="aspect-[4/3] bg-[#1a1a1d] relative p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white text-black grid place-items-center font-bold text-[12px]">
                      {p.brand[0]}
                    </div>
                    <div className="leading-tight">
                      <div className="text-[13px] font-semibold">{p.brand}</div>
                      <div className="text-[11px] text-white/40">{p.handle}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold tracking-widest bg-[#1aff5a] text-black px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                    LIVE
                  </span>
                </div>

                <div className="h-[120px] rounded-[12px] bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.06] grid place-items-center">
                  <div className="text-center">
                    <div className="text-[11px] text-white/40 mb-1">9:16 UGC AD • NO SCRIPT</div>
                    <div className="serif text-[18px] italic">“I wasn’t paid to say this”</div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 flex items-center justify-between text-[11px] border-t border-white/[0.06] bg-[#0f0f10]">
                <span className="text-white/50">Running {p.days} days</span>
                <span className="flex gap-2">
                  <span className="bg-white/10 px-2 py-1 rounded-full">{p.ctr} CTR</span>
                  <span className="bg-[#FFE600] text-black font-bold px-2 py-1 rounded-full">
                    {p.cpa} CPA
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-[1120px] mx-auto px-6 py-[24px] md:py-[48px]">
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            {
              n: '01',
              t: 'CONNECT',
              d: 'Shopify in 47s. Auto-trigger WhatsApp 7 days after delivery.',
              tag: 'OAUTH • 1-CLICK',
            },
            {
              n: '02',
              t: 'COLLECT',
              d: 'Customers reply with video on WhatsApp. No app, no link.',
              tag: 'WHATSAPP UI • INCOMING',
            },
            {
              n: '03',
              t: 'EDIT',
              d: 'Panda auto-cuts hooks (0-3s), adds captions, exports 9:16 / 4:5 / 1:1.',
              tag: 'HOOKS + RATIOS',
            },
          ].map((p) => (
            <div
              key={p.n}
              className="bg-[#121214] border border-white/[0.07] rounded-[16px] p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="serif text-[28px] leading-none text-white/20">{p.n}</span>
                <span className="text-[10px] tracking-widest font-bold text-white/30 border border-white/10 px-2 py-1 rounded-full">
                  {p.tag}
                </span>
              </div>
              <div className="text-[13px] font-bold tracking-[0.14em]">{p.t}</div>
              <div className="text-[13px] text-white/50 mt-2 leading-[1.5]">{p.d}</div>
            </div>
          ))}
        </div>

        {/* BEFORE / AFTER SLIDER CARD */}
        <div className="bg-[#F8F6F1] text-black rounded-[24px] overflow-hidden grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 md:p-8">
            <div className="text-[11px] tracking-[0.2em] font-bold opacity-50 mb-3">
              BEFORE / AFTER • DRAG TO COMPARE
            </div>

            <div
              ref={sliderContainerRef}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
              className="relative aspect-[16/10] rounded-[16px] overflow-hidden bg-[#0A0A0B] border border-black/10 select-none touch-none cursor-ew-resize"
            >
              {/* BEFORE BACKGROUND */}
              <div className="absolute inset-0 bg-[#1a1a1d] grid place-items-center">
                <div className="text-center">
                  <div className="text-[11px] tracking-widest font-bold text-white/30 mb-2">
                    RAW WHATSAPP
                  </div>
                  <div className="text-white text-[14px] opacity-60">
                    Shaky • No captions • 16:9
                  </div>
                  <div className="mt-3 w-[180px] h-[90px] rounded bg-white/10 mx-auto" />
                </div>
              </div>

              {/* AFTER LAYER (CLIPPED) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${slider}%` }}
              >
                <div
                  className="absolute inset-0 bg-[#FFE600] grid place-items-center w-full"
                  style={{ width: `${100 / (slider / 100)}%` }}
                >
                  <div className="text-center p-4 w-full max-w-[320px]">
                    <div className="text-[11px] tracking-widest font-bold text-black/40 mb-2">
                      PANDA EDIT
                    </div>
                    <div className="bg-black text-[#FFE600] font-black text-[16px] px-3 py-2 rounded-lg -rotate-1 inline-block">
                      POV: REAL POCKETS??
                    </div>
                    <div className="mt-3 text-[12px] font-semibold text-black/70">
                      Hook 0-3s • Captions • 9:16
                    </div>
                  </div>
                </div>
              </div>

              {/* DIVIDER HANDLE */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-white z-10"
                style={{ left: `${slider}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black grid place-items-center shadow-lg border border-black/10 font-bold text-[12px]">
                  ↔
                </div>
              </div>

              {/* PILLS */}
              <div className="absolute bottom-3 left-3 flex gap-2 z-20">
                <span className="text-[10px] bg-black text-white px-2 py-1 rounded-full">
                  BEFORE
                </span>
                <span className="text-[10px] bg-[#FFE600] text-black font-bold px-2 py-1 rounded-full">
                  AFTER
                </span>
              </div>

              <div className="absolute bottom-3 right-3 text-[10px] bg-white/90 px-2 py-1 rounded-full font-semibold">
                {Math.round(slider)}%
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-white flex flex-col justify-center border-t md:border-t-0 md:border-l border-black/5">
            <h3 className="serif text-[28px] leading-[0.95] tracking-[-0.02em]">
              We don’t brief. <br />
              We don’t cast.
            </h3>
            <p className="text-[14px] leading-[1.6] opacity-70 mt-4">
              Your customers already filmed the ad. In their bedroom. With bad lighting. That’s why it converts. We just clean it for Meta.
            </p>
            <ul className="mt-6 space-y-2 text-[13px]">
              {[
                'Auto-hook finder (first 3s retention)',
                'Burned-in subtitles (Hindi + English)',
                'Export 9:16, 4:5, 1:1 in one click',
              ].map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-black/20">—</span> {p}
                </li>
              ))}
            </ul>
            <button
              onClick={() => scrollTo('upload')}
              className="mt-6 bg-black text-white h-[44px] rounded-full px-5 text-[13px] font-semibold w-fit hover:bg-black/90"
            >
              Try with your video →
            </button>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="max-w-[1120px] mx-auto px-6 py-[72px]">
        <div className="text-center max-w-[640px] mx-auto mb-10">
          <h2 className="serif text-[36px] md:text-[48px] leading-[0.9] tracking-[-0.03em]">
            Art prints, not plans.
          </h2>
          <p className="text-[14px] text-white/50 mt-3">
            Pay per batch. No subscription. GST invoice. Razorpay.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {[
            {
              price: '₹1,500',
              name: 'Starter',
              ads: '5 ads',
              per: '₹300 / ad',
              features: ['3 hooks per video', '9:16 + 4:5 exports', '24h turnaround SLA'],
              popular: false,
            },
            {
              price: '₹2,999',
              name: 'Growth',
              ads: '20 ads',
              per: '₹149 / ad',
              features: [
                '5 hooks + 3 viral CTAs',
                '9:16 + 4:5 + 1:1 auto ratios',
                '12h priority delivery',
                'Ad copy + headline included',
              ],
              popular: true,
            },
            {
              price: '₹6,999',
              name: 'Scale',
              ads: '50 ads',
              per: '₹139 / ad',
              features: [
                '10 hooks + variations',
                'All ratios + burned SRT files',
                '6h rapid delivery',
                'Dedicated ad editor',
                'Meta upload & tags',
              ],
              popular: false,
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`relative rounded-[22px] border p-[1px] flex flex-col transition-all duration-300 ${
                p.popular
                  ? 'border-[#FFE600] bg-[#FFE600] md:-translate-y-2 md:shadow-[0_20px_60px_rgba(255,230,0,0.28)]'
                  : 'border-white/10 bg-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`rounded-[21px] h-full p-6 sm:p-7 flex flex-col justify-between ${
                  p.popular ? 'bg-[#FFE600] text-black' : 'bg-[#141416] text-[#F8F6F1]'
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-black text-[#FFE600] text-[10px] font-black tracking-widest px-3.5 py-1 rounded-full shadow-lg border border-black uppercase whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-sans font-black text-[38px] md:text-[44px] tracking-tight leading-none">
                      {p.price}
                    </div>
                    <div
                      className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${
                        p.popular ? 'bg-black text-[#FFE600]' : 'bg-white/10 text-white/90 border border-white/10'
                      }`}
                    >
                      {p.ads}
                    </div>
                  </div>
                  
                  <div className={`text-[12px] mt-2 font-medium ${p.popular ? 'text-black/70' : 'text-white/50'}`}>
                    {p.name} • {p.per}
                  </div>

                  <div
                    className={`mt-6 space-y-3 text-[13px] ${
                      p.popular ? 'text-black/80 font-medium' : 'text-white/70'
                    }`}
                  >
                    {p.features.map((t) => (
                      <div key={t} className="flex items-center gap-2.5">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            p.popular ? 'bg-black/15 text-black' : 'bg-[#FFE600]/20 text-[#FFE600]'
                          }`}
                        >
                          ✓
                        </span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-2">
                  <button
                    onClick={() => showToast(`Razorpay: ${p.name} ${p.price} — opening checkout...`)}
                    className={`w-full h-[48px] rounded-full font-bold text-[13px] tracking-wide flex items-center justify-center transition-all transform hover:scale-[1.01] active:scale-95 ${
                      p.popular
                        ? 'bg-black text-[#FFE600] hover:bg-[#111] shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                        : 'bg-white text-black hover:bg-white/90 shadow-[0_4px_20px_rgba(255,255,255,0.1)]'
                    }`}
                  >
                    Buy {p.name} → Pay via Razorpay
                  </button>
                  <div className={`mt-3 text-[11px] text-center font-medium ${p.popular ? 'text-black/60' : 'text-white/40'}`}>
                    GST invoice • 7-day re-edit • No actors
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UPLOAD DEMO SECTION */}
      <section id="upload" className="max-w-[1120px] mx-auto px-6 pb-[96px]">
        <div className="bg-[#121214] border border-white/[0.07] rounded-[24px] p-6 md:p-10 grid md:grid-cols-[1fr_1.1fr] gap-8 items-center">
          <div>
            <h2 className="serif text-[38px] md:text-[48px] leading-[0.9] tracking-[-0.03em]">
              STOP PAYING <br />
              <span className="text-[#FFE600]">₹10K FOR</span> <br />
              FAKE UGC.
            </h2>
            <p className="text-[14px] text-white/50 leading-[1.6] mt-4 max-w-[360px]">
              Upload one WhatsApp video. We’ll turn it into a Meta-ready ad in 2 hours. Free. No meeting. If it doesn’t beat your current CTR, don’t pay.
            </p>
            <div className="mt-6 flex items-center gap-3 text-[11px] text-white/30">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-white/10 grid place-items-center">✓</span>
                MP4, MOV, 3GP
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-white/10 grid place-items-center">✓</span>
                Max 100MB
              </span>
            </div>
          </div>

          <div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFile(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`group rounded-[16px] border-2 border-dashed p-8 text-center cursor-pointer transition ${
                isDraggingFile
                  ? 'border-[#FFE600] bg-[#FFE600]/5'
                  : 'border-white/15 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <div className="mx-auto w-12 h-12 rounded-full bg-white/10 grid place-items-center text-[20px] mb-3 group-hover:scale-105 transition">
                ↑
              </div>
              <div className="text-[14px] font-semibold">Drop WhatsApp video here</div>
              <div className="text-[12px] text-white/40 mt-1">or click to browse • 19-sec ideal</div>
              {uploadedFile && (
                <div className="mt-4 inline-flex items-center gap-2 bg-[#F8F6F1] text-black text-[12px] font-semibold px-3 py-1.5 rounded-full">
                  <span className="w-5 h-5 rounded-full bg-black text-white grid place-items-center text-[10px]">
                    ▶
                  </span>
                  {uploadedFile}
                </div>
              )}
            </div>

            <button
              onClick={() =>
                uploadedFile
                  ? showToast('Demo ad queued — check WhatsApp in 2h')
                  : showToast('Upload a video first — any WhatsApp forward works')
              }
              className="mt-4 w-full bg-[#FFE600] text-black font-bold h-[48px] rounded-full text-[14px] hover:brightness-110 transition"
            >
              {uploadedFile
                ? `Get demo for ${uploadedFile.slice(0, 18)} →`
                : 'Upload 1 WhatsApp Video → Get Demo Ad FREE (in 2h)'}
            </button>

            <div className="mt-3 text-center text-[11px] text-white/30">
              No spam • Deletes after 48h • Built for Shopify + Meta
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-8 flex flex-wrap justify-between gap-4 text-[11px] text-white/20 border-t border-white/[0.06] pt-6">
          <span>© PandaPraise • Made for ₹2L+/mo stores • GST • Razorpay</span>
          <span className="flex gap-4">
            <button
              onClick={() => showToast('Privacy — videos deleted in 48h')}
              className="hover:text-white/40"
            >
              Privacy
            </button>
            <button
              onClick={() => showToast('Terms — no actor guarantee')}
              className="hover:text-white/40"
            >
              Terms
            </button>
            <button
              onClick={() => showToast('Support on WhatsApp: +91 90000 00000')}
              className="hover:text-white/40"
            >
              Support
            </button>
          </span>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
