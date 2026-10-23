import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';

export const BeforeAfterVideoPlayer: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'after' | 'before'>('after');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12 p-6 sm:p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl text-white">
      {/* Top Header & Toggle Pill */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            LIVE BEFORE / AFTER BENCHMARK
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            See the 24-Hour Transformation
          </h3>
        </div>

        {/* Toggle Pills */}
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveMode('before')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'before'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-400" />
            Raw WhatsApp Video (0.4% CTR)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('after')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'after'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            PandaPraise Meta Ad (2.3% CTR)
          </button>
        </div>
      </div>

      {/* Main Comparison Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-8">
        {/* Left: Phone Mockup Frame with Video */}
        <div className="md:col-span-6 flex justify-center">
          <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] bg-black rounded-[42px] border-[6px] border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10 group">
            {/* Top Phone Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30"></div>

            {/* Video Player */}
            <video
              ref={videoRef}
              src="/demo_meta_ad.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className={`w-full h-full object-cover transition-all duration-300 ${
                activeMode === 'before' ? 'filter grayscale contrast-75 brightness-75 blur-[1px]' : ''
              }`}
            />

            {/* If 'Before' Mode: Overlay simulating raw whatsapp chat video */}
            {activeMode === 'before' && (
              <div className="absolute inset-0 bg-black/40 z-20 flex flex-col justify-between p-4 pointer-events-none">
                <div className="mt-8 bg-slate-900/90 backdrop-blur-md rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 text-xs text-rose-400 font-bold mb-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Raw WhatsApp Upload
                  </div>
                  <p className="text-[11px] text-slate-300">
                    No Hook • Low Volume • Customers drop off after 2 seconds
                  </p>
                </div>
                <div className="mb-6 bg-rose-500/90 text-white text-xs font-black py-2 px-3 rounded-lg text-center shadow-lg">
                  ⚠️ 0.4% CTR • Meta Ads Reject Score
                </div>
              </div>
            )}

            {/* If 'After' Mode: Live Hook Overlay Badge */}
            {activeMode === 'after' && (
              <div className="absolute top-10 left-3 right-3 z-20 pointer-events-none">
                <div className="bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 rounded-xl p-2.5 shadow-xl">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-Generated Viral Hook
                  </span>
                  <p className="text-xs font-black text-white mt-0.5 leading-snug">
                    "POV: You finally found a kurta with deep pockets 🔥"
                  </p>
                </div>
              </div>
            )}

            {/* Floating Player Controls */}
            <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-800 transition cursor-pointer border border-white/10"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="w-9 h-9 rounded-full bg-slate-900/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-800 transition cursor-pointer border border-white/10"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Metrics & Why It Converts Breakdown */}
        <div className="md:col-span-6 space-y-6">
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Meta Ads Performance Shift
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">Old Raw WhatsApp</span>
                <div className="text-2xl font-black text-rose-400 mt-1">0.42%</div>
                <span className="text-[11px] text-slate-500">Avg Click-Through Rate</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-xs text-emerald-400 font-semibold">PandaPraise V2</span>
                <div className="text-2xl font-black text-emerald-300 mt-1">2.38%</div>
                <span className="text-[11px] text-emerald-400/80">+466% ROAS Lift</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/30 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm text-white block">Pattern-Interrupting D2C Hooks</strong>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tested specifically for Indian shoppers so they stop scrolling past your Reels within the first 3 seconds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/30 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm text-white block">Word-by-Word Hormozi Animated Captions</strong>
                <p className="text-xs text-slate-400 mt-0.5">
                  85% of Instagram and Facebook Reels are watched sound-off. High-contrast captions ensure full comprehension.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/30 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm text-white block">Full Multi-Ratio Export</strong>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every ad is pre-rendered in 9:16 (Reels/Stories), 1:1 (Feed), and 4:5 for instant upload to Meta Ads Manager.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
