import { useEffect, useRef, useState } from 'react';

export function LandingPage() {
  const [slider, setSlider] = useState(52);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const magneticRef = useRef<HTMLButtonElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  // mouse tracking for orbs + custom cursor
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate(${e.clientX * 0.04}px, ${e.clientY * 0.03}px)`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate(${e.clientX * -0.03}px, ${e.clientY * -0.02}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // magnetic button
  useEffect(() => {
    const btn = magneticRef.current;
    if (!btn) return;
    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 300) {
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.25}px)`;
      }
    };
    const onLeave = () => {
      btn.style.transform = 'translate(0,0)';
    };
    window.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      btn.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // reveal on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string, msg?: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenuOpen(false);
    if (msg) {
      setToast(msg);
      setTimeout(()=>setToast(null), 2500);
    }
  };

  return (
    <div className="relative bg-[#050507] text-[#F5F3EF] overflow-x-clip selection:bg-[#FFE600] selection:text-black antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;800;900&display=swap');
        :root { --bg:#050507; --text:#F5F3EF; --accent:#FFE600; }
        * { font-family: 'Inter', system-ui, sans-serif; }
        .serif { font-family: 'Instrument Serif', serif; }
        .grain::before {
          content:""; position:fixed; inset:0; pointer-events:none; z-index:50;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity:0.035; mix-blend-mode:soft-light;
        }
        .reveal { opacity:0; transform:translateY(32px); transition: all 0.9s cubic-bezier(0.16,1,0.3,1); }
        .reveal.in-view { opacity:1; transform:translateY(0); }
        .stagger > * { opacity:0; transform:translateY(20px); }
        .stagger.in-view > *:nth-child(1){ animation:staggerIn 0.8s 0.1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .stagger.in-view > *:nth-child(2){ animation:staggerIn 0.8s 0.22s cubic-bezier(0.16,1,0.3,1) forwards; }
        .stagger.in-view > *:nth-child(3){ animation:staggerIn 0.8s 0.34s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes staggerIn { to { opacity:1; transform:translateY(0);} }
        .hero-title { line-height:0.85; letter-spacing:-0.06em; }
        .magnetic { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
        @media (pointer: coarse) { .cursor-el { display:none !important; } }
      `}</style>

      {/* CURSOR */}
      <div ref={cursorRef} className="cursor-el pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference hidden lg:block -translate-x-1/2 -translate-y-1/2">
        <div className="w-[40px] h-[40px] rounded-full border border-white/40" />
      </div>
      <div ref={cursorDotRef} className="cursor-el pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference hidden lg:block -translate-x-1/2 -translate-y-1/2">
        <div className="w-[4px] h-[4px] bg-white rounded-full" />
      </div>

      <div className="grain" />
      {/* GRADIENT ORBS */}
      <div ref={orb1Ref} className="pointer-events-none fixed -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[120px] opacity-[0.25] transition-transform duration-1000" style={{ background: 'radial-gradient(circle at 30% 30%, #7A5CFF 0%, #3B1BFF 25%, transparent 70%)' }} />
      <div ref={orb2Ref} className="pointer-events-none fixed top-[30%] -right-[20%] w-[60vw] h-[60vw] rounded-full blur-[130px] opacity-[0.22] transition-transform duration-1000" style={{ background: 'radial-gradient(circle at 50% 50%, #FFE600 0%, #FF7A00 20%, transparent 65%)' }} />
      <div className="pointer-events-none fixed bottom-[-10%] left-[20%] w-[80vw] h-[50vw] rounded-full blur-[140px] opacity-[0.12]" style={{ background: 'radial-gradient(circle, #00FF94 0%, transparent 70%)' }} />

      <div className="relative z-10 min-h-screen w-full" style={{ paddingTop: 'var(--safe-area-inset-top)', boxSizing: 'border-box' }}>
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-2.5 rounded-full bg-[#FFE600] text-black text-[12px] font-bold shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-black/10 animate-[toastIn_0.4s_cubic-bezier(0.16,1,0.3,1)]">
            {toast}
          </div>
        )}
        <style>{`@keyframes toastIn { from{transform:translate(-50%,20px); opacity:0} to{transform:translate(-50%,0); opacity:1} }`}</style>
        {/* NAV */}
        <header className="sticky top-[var(--safe-area-inset-top)] z-40 backdrop-blur-xl border-b border-white/[0.06] bg-[#050507]/70">
          <div className="mx-auto max-w-[1680px] px-6 md:px-10 h-[64px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F5F3EF] text-black flex items-center justify-center text-[14px] font-black">🐼</div>
              <span className="text-[15px] tracking-[-0.02em] font-semibold">PandaPraise</span>
              <span className="hidden md:inline-flex ml-3 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] tracking-widest uppercase">Pivot • UGC Engine</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-[12px] tracking-widest uppercase opacity-70">
              <button onClick={() => scrollTo('manifesto')} className="hover:opacity-100 transition-opacity">Manifesto</button>
              <button onClick={() => scrollTo('how')} className="hover:opacity-100 transition-opacity">System</button>
              <button onClick={() => scrollTo('compare')} className="hover:opacity-100 transition-opacity">Before/After</button>
              <button onClick={() => scrollTo('pricing')} className="hover:opacity-100 transition-opacity">Pricing</button>
            </nav>
            <div className="flex items-center gap-3">
              <button onClick={() => scrollTo('pricing', 'Scrolling to pricing — ₹1500 for 5 ads')} className="hidden md:inline-flex h-[36px] px-5 rounded-full bg-[#FFE600] text-black text-[12px] font-bold tracking-wide hover:brightness-110 transition">GET 5 ADS — ₹1500</button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-9 h-9 rounded-full border border-white/15 flex items-center justify-center">≡</button>
            </div>
          </div>
          {menuOpen && (
            <div className="md:hidden border-t border-white/10 bg-[#050507] px-6 py-6 flex flex-col gap-4 text-sm">
              {['manifesto','how','compare','pricing'].map(id=>(
                <button key={id} onClick={()=>scrollTo(id)} className="text-left uppercase tracking-widest text-xs opacity-70">{id}</button>
              ))}
            </div>
          )}
        </header>

        {/* HERO */}
        <section ref={heroRef} className="mx-auto max-w-[1680px] px-6 md:px-10 pt-12 md:pt-20 pb-16 border-b border-white/[0.06] relative">
          <div className="flex flex-col">
            <div className="reveal flex items-center gap-3 mb-8 md:mb-10">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] tracking-[0.18em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                FOR INDIAN SHOPIFY MERCHANTS DOING ₹2L+/MO ON META
              </span>
              <span className="hidden md:inline-flex text-[11px] tracking-widest uppercase opacity-40">• Built for WhatsApp → Meta</span>
            </div>

            <h1 className="hero-title reveal relative z-10">
              <span className="serif block text-[44px] md:text-[96px] lg:text-[128px] font-[200] italic tracking-[-0.04em] opacity-90">Your customers</span>
              <span className="block text-[52px] md:text-[120px] lg:text-[168px] font-[900] tracking-[-0.07em] -mt-2 md:-mt-6">ALREADY MADE</span>
              <span className="block text-[52px] md:text-[120px] lg:text-[168px] font-[900] tracking-[-0.07em] -mt-2 md:-mt-8 relative">
                <span className="relative z-10">YOUR BEST AD.</span>
                <span className="absolute left-0 md:left-2 bottom-[14%] w-[96%] h-[38%] bg-[#FFE600] -rotate-[1.2deg] -z-0 mix-blend-normal" />
                <span className="relative z-10 text-black">YOUR BEST AD.</span>
              </span>
            </h1>

            <div className="reveal mt-8 md:mt-10 max-w-[560px]">
              <p className="text-[18px] md:text-[20px] leading-[1.35] tracking-[-0.01em] text-[#F5F3EF]/80">
                You just have it <span className="text-[#F5F3EF] underline decoration-white/20 underline-offset-4">lost on WhatsApp</span>. We turn real shaky 19-sec videos into <span className="bg-white text-black px-1.5 font-semibold">Meta-ready UGC ads</span> in 24h.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button ref={magneticRef} onClick={()=>scrollTo('pricing')} className="magnetic group relative h-[56px] md:h-[62px] px-8 rounded-full bg-[#FFE600] text-black font-[800] text-[13px] md:text-[14px] tracking-[-0.01em] flex items-center gap-3 shadow-[0_0_0_1px_#FFE600,0_20px_60px_rgba(255,230,0,0.25)] hover:shadow-[0_0_0_1px_#FFE600,0_24px_80px_rgba(255,230,0,0.35)] transition-all">
                  Turn My WhatsApp Videos Into Ads — ₹1500 for 5
                  <span className="w-7 h-7 rounded-full bg-black text-[#FFE600] flex items-center justify-center group-hover:rotate-45 transition-transform">↗</span>
                </button>
                <button onClick={()=>scrollTo('compare')} className="h-[56px] px-6 rounded-full border border-white/15 bg-white/[0.03] backdrop-blur text-[13px] tracking-wide hover:bg-white/[0.06] transition">
                  See ads running live →
                </button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-[11px] tracking-widest uppercase opacity-50">
                <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-[#25D366]/20 border border-[#25D366]/30 flex items-center justify-center text-[10px]">✓</span> No scripts • No actors</span>
                <span>•</span>
                <span>24H delivery</span>
              </div>
            </div>
          </div>

          {/* CINEMATIC VISUAL */}
          <div className="reveal mt-16 md:mt-20 relative">
            <div className="absolute -inset-[10%] bg-gradient-to-b from-white/[0.04] to-transparent blur-[40px] pointer-events-none" />
            <div className="relative mx-auto max-w-[1240px] grid md:grid-cols-[1.05fr_0.12fr_1fr] items-center gap-4 md:gap-0 rounded-[28px] border border-white/[0.08] bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_40%,rgba(0,0,0,0)_70%)] backdrop-blur-xl p-3 md:p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_40px_120px_rgba(0,0,0,0.6)]">
              {/* WhatsApp side */}
              <div className="relative rounded-[20px] overflow-hidden bg-[#0B1014] border border-white/[0.06] min-h-[420px] md:min-h-[520px] flex flex-col">
                <div className="h-[54px] px-4 flex items-center justify-between bg-[#202C33] border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00A884] flex items-center justify-center text-xs">👩</div>
                    <div>
                      <div className="text-[13px] font-semibold leading-none">Anjali • Order #1842</div>
                      <div className="text-[10px] opacity-60">last seen today • video • 19s</div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-60 text-[14px]">⋯</div>
                </div>
                <div className="flex-1 p-4 space-y-3 bg-[#0B141A] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.06]" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3C/svg%3E")`}} />
                  <div className="relative max-w-[78%] rounded-[10px] rounded-bl-[2px] bg-[#202C33] px-3 py-2 text-[13px] leading-[1.35]">Hi! Got my kurta today... pockets are actually real?? 😭❤️</div>
                  <div className="relative ml-auto max-w-[74%] rounded-[14px] overflow-hidden border border-white/10 bg-black group cursor-pointer">
                    <div className="aspect-[9/13] bg-[#111] relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-xl">
                          <span className="ml-0.5 text-black text-xl">▶</span>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">0:19 • shaky • no captions</span>
                        <span className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-[10px]">↓</span>
                      </div>
                      {/* fake video content */}
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[70%] h-[60%] rounded-[12px] bg-[#222] border border-white/10 overflow-hidden opacity-80">
                        <div className="w-full h-full bg-[radial-gradient(circle_at_30%_20%,#555,#111)]" />
                      </div>
                    </div>
                  </div>
                  <div className="relative max-w-[72%] rounded-[10px] rounded-bl-[2px] bg-[#202C33] px-3 py-2 text-[12px]">OMG thank you! Can I send more videos?</div>
                </div>
                <div className="h-[52px] px-3 flex items-center gap-2 bg-[#202C33] border-t border-white/5">
                  <div className="flex-1 h-8 rounded-full bg-[#2A3942] px-3 flex items-center text-[12px] opacity-60">Message • Auto follow-up active</div>
                  <div className="w-8 h-8 rounded-full bg-[#00A884] flex items-center justify-center">➤</div>
                </div>
              </div>

              {/* Arrow morph */}
              <div className="hidden md:flex flex-col items-center justify-center gap-3 px-2">
                <div className="w-[72px] h-[72px] rounded-full bg-[#FFE600] text-black flex items-center justify-center text-[28px] font-black shadow-[0_0_40px_rgba(255,230,0,0.5)] animate-[pulse_2s_infinite]">→</div>
                <div className="text-[10px] tracking-[0.2em] uppercase opacity-60 rotate-90 mt-4">PandaPraise AI Engine</div>
                <div className="mt-2 w-px h-16 bg-gradient-to-b from-[#FFE600] to-transparent" />
                <div className="text-[9px] px-2 py-1 rounded-full bg-[#25D366]/15 border border-[#25D366]/20 text-[#25D366]">+Hook + Captions + Ratio</div>
              </div>
              <div className="md:hidden flex justify-center py-2">
                <div className="w-10 h-10 rounded-full bg-[#FFE600] text-black flex items-center justify-center rotate-90">→</div>
              </div>

              {/* 9:16 output */}
              <div className="relative rounded-[20px] overflow-hidden bg-black border border-white/[0.08] min-h-[520px] md:min-h-[560px] flex">
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_20%,#2a2a2a,#0a0a0a)]" />
                  <div className="absolute top-0 left-0 right-0 h-[54px] px-4 flex items-center justify-between text-[11px] tracking-widest uppercase opacity-60 z-10">
                    <span>Meta Ads • 9:16 • 1080x1920</span>
                    <span className="px-2 py-1 rounded-full bg-[#FFE600] text-black text-[10px] font-bold">ROAS 2.4x</span>
                  </div>
                  <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-[88%] z-20">
                    <div className="space-y-2">
                      <div className="inline-block px-2 py-1 rounded bg-black text-[10px] tracking-widest uppercase border border-white/10">HOOK • 0:00-0:02</div>
                      <div className="text-[30px] md:text-[36px] font-black leading-[0.9] tracking-[-0.03em]">
                        <span className="block bg-[#FFE600] text-black px-2 leading-[0.95]">POV: Kurta with</span>
                        <span className="block bg-[#FFE600] text-black px-2 leading-[0.95] mt-1">REAL POCKETS??</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-bold">✓ Captions • Hormozi Style</span>
                        <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px]">1:1 • 4:5 auto</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 w-[62%] aspect-[3/4] rounded-[18px] bg-[#1a1a1a] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/40" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="h-1.5 w-full bg-white/15 rounded-full overflow-hidden">
                        <div className="h-full w-[68%] bg-[#FFE600]" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-[84px] right-3 flex flex-col gap-2 z-10">
                  {['9:16','1:1','4:5'].map(r=>(
                    <div key={r} className={`w-9 h-9 rounded-full border flex items-center justify-center text-[10px] font-bold ${r==='9:16' ? 'bg-white text-black border-white' : 'bg-white/10 border-white/15 text-white/60'}`}>{r}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center md:justify-between gap-4 text-[11px] tracking-widest uppercase opacity-40">
              <span>● Auto-collects after delivery +7d</span>
              <span>● Removes “umm” • adds captions • 3 hooks</span>
              <span>● Ready to upload to Meta in 24h</span>
            </div>
          </div>
        </section>

        {/* MANIFESTO */}
        <section id="manifesto" className="mx-auto max-w-[1680px] px-6 md:px-10 py-20 md:py-32 border-b border-white/[0.06] grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-12 overflow-hidden">
          <div className="reveal min-w-0 overflow-hidden">
            <div className="text-[11px] tracking-[0.3em] uppercase opacity-40 mb-8">Manifesto / 002</div>
            <div className="space-y-2 md:space-y-3">
              {[
                { a:'REAL', b:'FAKE', accent:true },
                { a:'TRUST', b:'POLISH', accent:false },
                { a:'UGC', b:'AI', accent:true },
              ].map((row,i)=>(
                <div key={i} className="flex flex-wrap items-baseline gap-2 md:gap-6 group min-w-0">
                  <span className={`text-[42px] sm:text-[64px] md:text-[96px] lg:text-[124px] font-[900] tracking-[-0.06em] leading-[0.85] ${row.accent ? 'text-[#F5F3EF]' : 'text-white/15 group-hover:text-white/30 transition-colors'}`}>{row.a}</span>
                  <span className="text-[18px] md:text-[24px] opacity-20 shrink-0">›</span>
                  <span className={`serif italic text-[32px] sm:text-[44px] md:text-[72px] lg:text-[92px] leading-[0.85] tracking-[-0.04em] break-words ${row.accent ? 'text-[#FFE600]/25 line-through decoration-[#FFE600]/40' : 'text-white/15 line-through'}`}>{row.b}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal lg:pl-12 flex flex-col justify-end min-w-0">
            <div className="border-l border-[#FFE600]/30 pl-6 md:pl-10 py-2">
              <p className="serif text-[20px] md:text-[26px] leading-[1.25] tracking-[-0.02em] max-w-full">
                AI actors are getting banned. Meta wants <span className="bg-[#FFE600] text-black px-1">real faces.</span> Your customers' shaky videos convert 2.4x better because <span className="italic">India trusts imperfection.</span>
              </p>
              <div className="mt-8 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
                <div><div className="text-[28px] font-black tracking-[-0.04em]">2.4x</div><div className="text-[11px] uppercase tracking-widest opacity-50">CTR vs polished</div></div>
                <div><div className="text-[28px] font-black tracking-[-0.04em]">19s</div><div className="text-[11px] uppercase tracking-widest opacity-50">Avg customer clip</div></div>
                <div><div className="text-[28px] font-black tracking-[-0.04em]">₹0</div><div className="text-[11px] uppercase tracking-widest opacity-50">Shoot cost</div></div>
              </div>
              <div className="mt-8 text-[13px] leading-relaxed opacity-60 max-w-[420px]">
                We don't create UGC. We rescue the UGC you already earned and left to rot in WhatsApp. No briefing, no creator marketplace, no 10-day wait.
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="mx-auto max-w-[1680px] px-6 md:px-10 py-20 md:py-28 border-b border-white/[0.06]">
          <div className="reveal flex flex-wrap justify-between items-end gap-6 mb-12">
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase opacity-40 mb-4">System / 003 — How it works</div>
              <h2 className="text-[42px] md:text-[72px] font-[900] tracking-[-0.05em] leading-[0.9]">3 steps.<br/><span className="serif italic font-[400] tracking-[-0.03em] opacity-80">Zero shoot.</span></h2>
            </div>
            <div className="text-[13px] max-w-[360px] opacity-60">Connect Shopify once. Panda auto-DMs customers after delivery. They reply with video. We edit. You get Meta-ready ads.</div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6 stagger reveal">
            {[
              {
                n:'01',
                title:'CONNECT',
                desc:'Shopify logo, Order Delivered +7 days timeline, glass card with code snippet',
                code:'shopify.webhook.on("order.delivered", (o) => {\n  panda.schedule(o.customer.phone, "+7d")\n})',
                meta:'OAuth • 47s setup • No dev',
              },
              {
                n:'02',
                title:'COLLECT',
                desc:'WhatsApp UI mockup with video coming in, notification dot, auto-followup',
                code:'Hi {name}! Loved your {product}?\n→ Send 19s video = ₹200 off next order\n[Auto follow-up if no reply in 24h]',
                meta:'WhatApp Green API • Auto-nudge',
              },
              {
                n:'03',
                title:'TEXT-EDIT',
                desc:'Show captions being added, hooks morphing, ratio switch 9:16/1:1/4:5',
                code:'hooks: ["POV: Real pockets??","My mom stole this","Wore it 7 days straight"]\n+ Hormozi captions + de-noise + 3 ratios',
                meta:'24h SLA • 3 hooks per video',
              },
            ].map((card, idx)=>(
              <div key={idx} className="group relative rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] backdrop-blur-xl p-6 md:p-8 min-h-[480px] flex flex-col overflow-hidden hover:-translate-y-2 hover:border-white/[0.15] transition-all duration-700 hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                <div className="absolute -right-6 -top-6 text-[140px] font-[900] leading-none tracking-[-0.08em] text-white/[0.04] group-hover:text-white/[0.07] transition-colors select-none">{card.n}</div>
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[11px] tracking-[0.25em] uppercase px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08]">{card.n} — {card.title}</span>
                  <span className="w-2 h-2 rounded-full bg-[#FFE600] shadow-[0_0_12px_#FFE600]" />
                </div>
                <h3 className="relative z-10 mt-8 text-[32px] font-[800] tracking-[-0.03em] leading-[0.9]">{card.title}</h3>
                <p className="relative z-10 mt-3 text-[13px] opacity-60 leading-relaxed max-w-[28ch]">{card.desc}</p>

                <div className="relative z-10 mt-8 rounded-[14px] bg-[#0A0A0B] border border-white/[0.06] p-4 overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    <span className="ml-auto text-[10px] opacity-30 tracking-widest uppercase">{card.meta}</span>
                  </div>
                  <pre className="text-[11px] leading-[1.5] opacity-80 overflow-x-auto whitespace-pre-wrap font-mono">{card.code}</pre>
                  {idx===1 && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex-1 h-9 rounded-full bg-[#202C33] px-3 flex items-center gap-2 text-[11px]"><span className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center text-[10px]">▶</span> 00:19 new video from Anjali</div>
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </div>
                  )}
                  {idx===2 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {['HOOK #1','HOOK #2','HOOK #3'].map(h=>(
                        <div key={h} className="rounded-[8px] bg-[#FFE600] text-black text-[10px] font-bold px-2 py-2 text-center">{h}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative z-10 mt-auto pt-8 flex items-center gap-3 text-[11px] tracking-widest uppercase opacity-40 group-hover:opacity-80 transition-opacity">
                  <span>Hover to preview</span>
                  <span className="flex-1 h-px bg-white/10" />
                  <span className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center group-hover:bg-white group-hover:text-black transition">↗</span>
                </div>

                {/* video preview on hover */}
                <div className="absolute inset-0 bg-[#FFE600]/[0.04] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        </section>

        {/* BEFORE AFTER */}
        <section id="compare" className="mx-auto max-w-[1680px] px-6 md:px-10 py-20 md:py-28 border-b border-white/[0.06]">
          <div className="reveal mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 className="text-[40px] md:text-[68px] font-[900] tracking-[-0.05em] leading-[0.9]">Before / After<br/><span className="serif italic font-[300]">— same video.</span></h2>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Drag →</span>
              <span className="opacity-50">Raw WhatsApp vs PandaPraise</span>
            </div>
          </div>

          <div className="reveal relative mx-auto max-w-[1100px] rounded-[28px] overflow-hidden border border-white/[0.08] bg-black aspect-[16/10] md:aspect-[16/9] select-none">
            {/* AFTER (full) */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_30%,#2a2a2a,#0a0a0a)]" />
              <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-[#FFE600] text-black text-[11px] font-bold tracking-widest">AFTER • Meta Ready • 9:16</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[44%] md:w-[32%] aspect-[9/16] rounded-[18px] bg-[#161616] border border-white/10 overflow-hidden relative shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
                  <div className="absolute bottom-[22%] left-3 right-3">
                    <div className="bg-[#FFE600] text-black font-black text-[18px] leading-[0.9] px-2 py-1 inline-block">POV: Kurta with</div>
                    <div className="bg-[#FFE600] text-black font-black text-[18px] leading-[0.9] px-2 py-1 mt-1 inline-block">real pockets??</div>
                  </div>
                  <div className="absolute top-3 left-3 text-[9px] px-2 py-1 rounded-full bg-white text-black font-bold">HOOK • 2.4x CTR</div>
                </div>
              </div>
            </div>
            {/* BEFORE clip */}
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
              <div className="absolute inset-0 bg-[#0E0E0E]">
                <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white text-[11px] tracking-widest">BEFORE • Raw WhatsApp</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[44%] md:w-[32%] aspect-[9/16] rounded-[18px] bg-[#111] border border-white/5 overflow-hidden relative opacity-70 blur-[0.3px]">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
                    <div className="absolute bottom-3 left-3 text-[10px] px-2 py-1 rounded bg-black/60 border border-white/10">no captions • shaky • 0:19</div>
                  </div>
                </div>
              </div>
            </div>

            {/* slider handle */}
            <div className="absolute top-0 bottom-0 w-[2px] bg-white z-20" style={{ left: `${slider}%` }}>
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.5)] cursor-ew-resize">↔</div>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={slider}
              onChange={(e)=>setSlider(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
              aria-label="Before after slider"
            />
          </div>

          <div className="reveal mt-8 grid md:grid-cols-3 gap-4 max-w-[1100px] mx-auto text-[12px]">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 flex items-center justify-between"><span className="opacity-50">Original</span><span>Blurry • No hook • No subs</span></div>
            <div className="rounded-full border border-[#FFE600]/30 bg-[#FFE600]/10 px-4 py-2 flex items-center justify-between text-[#FFE600]"><span>Edited</span><span>+Captions +Hook +3 ratios</span></div>
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 flex items-center justify-between"><span className="opacity-50">Result</span><span>Ready to upload to Meta</span></div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="mx-auto max-w-[1680px] px-6 md:px-10 py-20 md:py-28 border-b border-white/[0.06]">
          <div className="reveal grid lg:grid-cols-[0.9fr_1.1fr] gap-10">
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase opacity-40 mb-6">Brutalist Check / 005</div>
              <h2 className="text-[40px] md:text-[64px] font-[900] tracking-[-0.05em] leading-[0.9]">Why not<br/>VN / InVideo?</h2>
              <p className="mt-6 text-[14px] leading-relaxed opacity-60 max-w-[36ch]">They give you templates. India scrolls past templates. We give you your customer's face — which Meta actually rewards right now.</p>
              <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFE600] text-black text-[12px] font-bold">FAKE UGC IS GETTING FLAGGED IN 2024</div>
            </div>
            <div className="reveal border border-white/[0.08] rounded-[20px] overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] backdrop-blur">
              <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] text-[11px] tracking-widest uppercase border-b border-white/[0.08]">
                <div className="px-6 py-4 opacity-40">Feature</div>
                <div className="px-6 py-4 border-l border-white/[0.08] opacity-40 line-through">VN / InVideo / CapCut</div>
                <div className="px-6 py-4 border-l border-white/[0.08] bg-[#FFE600] text-black font-bold">PandaPraise</div>
              </div>
              {[
                { f:'Real customer face', vn:'❌ AI avatar', pp:'✓ Real WhatsApp video', good:true },
                { f:'Meta compliance 2024', vn:'❌ Flagged as synthetic', pp:'✓ Whitelisted as UGC', good:true },
                { f:'Shoot / briefing', vn:'2h briefing + script', pp:'0 min • Already have video', good:true },
                { f:'Turnaround', vn:'3-5 days', pp:'24 hours', good:true },
                { f:'Cost per ad', vn:'₹2k-₹10k + actor', pp:'₹300 per ad', good:true },
                { f:'Trust in India', vn:'Looks like ad', pp:'Looks like review', good:true },
                { f:'Ratio exports', vn:'Manual re-edit', pp:'9:16 / 1:1 / 4:5 auto', good:true },
              ].map((row,i)=>(
                <div key={i} className="grid grid-cols-[1.2fr_0.8fr_0.8fr] text-[13px] border-b border-white/[0.06] last:border-0">
                  <div className="px-6 py-4 font-medium">{row.f}</div>
                  <div className="px-6 py-4 border-l border-white/[0.06] opacity-40 line-through decoration-white/20">{row.vn}</div>
                  <div className="px-6 py-4 border-l border-white/[0.06] bg-[#FFE600]/[0.06] font-semibold text-[#FFE600]">{row.pp}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto max-w-[1680px] px-6 md:px-10 py-20 md:py-32 border-b border-white/[0.06]">
          <div className="reveal flex flex-wrap items-end justify-between gap-8 mb-14">
            <h2 className="text-[48px] md:text-[84px] font-[900] tracking-[-0.06em] leading-[0.85]">Pricing as<br/><span className="serif italic font-[300] tracking-[-0.03em]">art prints.</span></h2>
            <div className="text-[13px] opacity-60 max-w-[320px]">Not SaaS tiers. Limited drops. Each pack = edited, captioned, hook-tested, ratio-ready. Cancel after one drop if you want.</div>
          </div>

          <div className="grid lg:grid-cols-3 gap-[1px] bg-white/[0.08] border border-white/[0.08] rounded-[28px] overflow-hidden reveal">
            {/* Starter */}
            <div className="bg-[#050507] p-8 md:p-10 flex flex-col min-h-[520px] relative group hover:bg-[#0A0A0D] transition-colors">
              <div className="flex justify-between items-start">
                <div className="text-[11px] tracking-[0.25em] uppercase px-2.5 py-1 rounded-full border border-white/10">Starter • Drop 01</div>
                <div className="text-[11px] opacity-40">5 ads</div>
              </div>
              <div className="mt-10">
                <div className="text-[88px] font-[900] tracking-[-0.07em] leading-[0.85]">₹1,500</div>
                <div className="mt-2 text-[13px] opacity-60">/ for 5 ads • ₹300 per ad</div>
              </div>
              <ul className="mt-10 space-y-3 text-[13px]">
                {['5 WhatsApp videos edited','Hormozi yellow captions','3 hooks per video','9:16 + 1:1 + 4:5 exports','24h delivery'].map(t=>(
                  <li key={t} className="flex gap-3"><span className="text-[#FFE600]">—</span><span className="opacity-80">{t}</span></li>
                ))}
              </ul>
              <button onClick={()=>{}} className="mt-auto h-[52px] rounded-full border border-white/15 bg-white/[0.03] text-[13px] font-semibold tracking-wide hover:bg-white hover:text-black transition">Start with 5 ads</button>
              <div className="absolute right-6 bottom-24 text-[88px] font-black opacity-[0.03] leading-none select-none">01</div>
            </div>

            {/* Growth - highlighted */}
            <div className="relative bg-[#FFE600] text-black p-8 md:p-10 flex flex-col min-h-[560px] shadow-[0_0_80px_rgba(255,230,0,0.25)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-black text-[#FFE600] text-[11px] font-bold tracking-widest">MOST POPULAR • 68% CHOOSE THIS</div>
              <div className="flex justify-between items-start mt-4">
                <div className="text-[11px] tracking-[0.25em] uppercase px-2.5 py-1 rounded-full bg-black text-[#FFE600]">Growth • Drop 02</div>
                <div className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/10">20 ads • BEST VALUE</div>
              </div>
              <div className="mt-10">
                <div className="text-[96px] font-[900] tracking-[-0.07em] leading-[0.85]">₹2,999</div>
                <div className="mt-2 text-[13px] font-medium opacity-70">/ for 20 ads • ₹150 per ad • Save ₹3k</div>
              </div>
              <ul className="mt-10 space-y-3 text-[13px] font-medium">
                {['Everything in Starter','20 videos → 60 ad variants (3 hooks)','Auto-collect via Shopify + WhatsApp','Priority 18h delivery','1 re-edit included per video','RoAS report: which hook won'].map(t=>(
                  <li key={t} className="flex gap-3"><span>—</span><span>{t}</span></li>
                ))}
              </ul>
              <button onClick={()=>{}} className="mt-auto h-[56px] rounded-full bg-black text-[#FFE600] text-[13px] font-[800] tracking-wide flex items-center justify-center gap-2 hover:bg-[#111] transition">Get 20 Ads Now — Most Popular ↗</button>
              <div className="absolute right-6 bottom-28 text-[120px] font-black opacity-[0.06] leading-none select-none">02</div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-black/10 blur-[20px]" />
            </div>

            {/* Scale */}
            <div className="bg-[#050507] p-8 md:p-10 flex flex-col min-h-[520px] relative group hover:bg-[#0A0A0D] transition-colors">
              <div className="flex justify-between items-start">
                <div className="text-[11px] tracking-[0.25em] uppercase px-2.5 py-1 rounded-full border border-white/10">Scale • Drop 03</div>
                <div className="text-[11px] opacity-40">50 ads</div>
              </div>
              <div className="mt-10">
                <div className="text-[88px] font-[900] tracking-[-0.06em] leading-[0.85]">₹6,999</div>
                <div className="mt-2 text-[13px] opacity-60">/ for 50 ads • ₹140 per ad</div>
              </div>
              <ul className="mt-10 space-y-3 text-[13px]">
                {['Everything in Growth','50 videos → 150 variants','Dedicated editor + WhatsApp group','A/B hooks tested in your ad account','Monthly collection automation','Pause anytime'].map(t=>(
                  <li key={t} className="flex gap-3"><span className="text-white/30">—</span><span className="opacity-80">{t}</span></li>
                ))}
              </ul>
              <button onClick={()=>{}} className="mt-auto h-[52px] rounded-full border border-white/15 bg-white text-black text-[13px] font-semibold tracking-wide hover:bg-[#FFE600] hover:border-[#FFE600] hover:text-black transition">Scale to 50 ads</button>
              <div className="absolute right-6 bottom-24 text-[88px] font-black opacity-[0.03] leading-none select-none">03</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-[11px] tracking-widest uppercase opacity-40 justify-center">
            <span className="px-3 py-1 rounded-full border border-white/10">No subscription • Pay per drop</span>
            <span className="px-3 py-1 rounded-full border border-white/10">GST invoice • UPI / Card</span>
            <span className="px-3 py-1 rounded-full border border-white/10">For ₹2L+/mo Meta spend only</span>
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="relative overflow-hidden border-t border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,230,0,0.14),transparent_60%)]" />
          <div className="mx-auto max-w-[1680px] px-6 md:px-10 py-20 md:py-32 relative">
            <div className="reveal">
              <div className="text-[11px] tracking-[0.3em] uppercase opacity-40 mb-6">Final Call / 007</div>
              <h2 className="text-[46px] md:text-[96px] lg:text-[128px] font-[900] tracking-[-0.07em] leading-[0.85]">
                STOP PAYING<br/>
                <span className="relative inline-block">
                  <span className="relative z-10">₹10K FOR FAKE</span>
                  <span className="absolute left-0 bottom-[12%] w-full h-[36%] bg-[#FFE600] -rotate-[0.8deg] -z-0" />
                  <span className="relative z-10 text-black">₹10K FOR FAKE</span>
                </span>
                <br/>UGC.
              </h2>
              <div className="mt-10 max-w-[520px]">
                <p className="text-[18px] leading-[1.4] opacity-70">Your customer already filmed it on her bed at 11pm. Shaky. Real. Converting. You just need to stop losing it on WhatsApp.</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button onClick={()=>scrollTo('pricing')} className="h-[64px] px-10 rounded-full bg-[#FFE600] text-black font-[900] text-[15px] tracking-[-0.01em] flex items-center gap-3 shadow-[0_20px_60px_rgba(255,230,0,0.3)] hover:shadow-[0_28px_80px_rgba(255,230,0,0.4)] hover:-translate-y-0.5 transition-all">Upload WhatsApp Video Now ↗</button>
                  <div className="flex items-center gap-3 text-[12px] opacity-60">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i=><div key={i} className="w-8 h-8 rounded-full border-2 border-[#050507] bg-[#222] flex items-center justify-center text-[12px]">👩</div>)}
                    </div>
                    <span>312 Indian brands • 4.9/5</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-24 pt-10 border-t border-white/[0.06] flex flex-wrap justify-between gap-8 text-[11px] tracking-widest uppercase opacity-40">
              <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">🐼</span> PandaPraise © 2025 • Made for Shopify India • No AI actors</div>
              <div className="flex gap-6">
                <a className="hover:opacity-100 hover:underline">Privacy</a>
                <a className="hover:opacity-100 hover:underline">Terms</a>
                <a className="hover:opacity-100 hover:underline">WhatsApp Policy</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;
