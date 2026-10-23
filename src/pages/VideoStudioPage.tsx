import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Sparkles,
  Video,
  Play,
  Pause,
  Download,
  CheckCircle2,
  Layers,
  ArrowRight,
  Flame,
  Type,
  FileVideo,
  ShoppingBag,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

interface RenderedAdResult {
  id: string;
  title: string;
  productName: string;
  hook: string;
  videoUrl: string;
  ratio: '9:16' | '1:1' | '4:5';
  createdAt: string;
}

export const VideoStudioPage: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>('/demo_meta_ad.mp4');
  const [productName, setProductName] = useState('Breezy Linen Kurta');
  const [selectedHook, setSelectedHook] = useState(
    'POV: You finally found a kurta with deep pockets'
  );
  const [customHook, setCustomHook] = useState('');
  const [captionStyle, setCaptionStyle] = useState<'hormozi' | 'minimal' | 'emerald'>('hormozi');
  const [currentRatio, setCurrentRatio] = useState<'9:16' | '1:1' | '4:5'>('9:16');

  // Render Pipeline States
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStage, setRenderStage] = useState('');
  const [renderedAd, setRenderedAd] = useState<RenderedAdResult | null>(null);
  const [isSavedToLibrary, setIsSavedToLibrary] = useState(false);

  // Player controls
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_HOOKS = [
    `POV: You finally found a ${productName || 'product'} with deep pockets`,
    `I wore this for 10 hours... here's the honest truth`,
    `Don't buy this before watching this`,
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setRenderedAd(null);
      setIsSavedToLibrary(false);
    }
  };

  const handleLoadSample = () => {
    setVideoFile(null);
    setVideoSrc('/demo_meta_ad.mp4');
    setProductName('Breezy Linen Kurta');
    setSelectedHook('POV: You finally found a kurta with deep pockets');
    setRenderedAd(null);
    setIsSavedToLibrary(false);
  };

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

  const activeHookText = customHook.trim() ? customHook : selectedHook;

  const startRenderingPipeline = () => {
    setIsRendering(true);
    setRenderProgress(5);
    setRenderStage('Extracting audio & normalizing ambient noise...');
    setRenderedAd(null);
    setIsSavedToLibrary(false);

    // Simulated high-fidelity 4-step pipeline
    setTimeout(() => {
      setRenderProgress(28);
      setRenderStage('Faster-Whisper: Word-level timestamp alignment...');
    }, 900);

    setTimeout(() => {
      setRenderProgress(62);
      setRenderStage('Burning kinetic Hormozi yellow/cyan captions...');
    }, 1900);

    setTimeout(() => {
      setRenderProgress(88);
      setRenderStage('FFmpeg encoding H.264 CRF 18 (9:16, 1:1, 4:5)...');
    }, 2800);

    setTimeout(() => {
      setRenderProgress(100);
      setRenderStage('Complete! Ready for Meta Ads Manager.');
      setIsRendering(false);

      const newAd: RenderedAdResult = {
        id: `ad_${Date.now()}`,
        title: `${productName} — ${activeHookText.substring(0, 32)}...`,
        productName,
        hook: activeHookText,
        videoUrl: videoSrc,
        ratio: currentRatio,
        createdAt: 'Just now',
      };
      setRenderedAd(newAd);
    }, 3600);
  };

  const handleSaveToLibrary = () => {
    if (!renderedAd) return;
    try {
      const existingStr = localStorage.getItem('pandapraise_v2_custom_ads');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      existing.unshift(renderedAd);
      localStorage.setItem('pandapraise_v2_custom_ads', JSON.stringify(existing));
      setIsSavedToLibrary(true);
    } catch (err) {
      console.error('Error saving ad to library:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-900 flex font-sans antialiased">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none">
        <div>
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-sm">
              🐼
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900">
                PandaPraise
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                Studio
              </span>
            </div>
          </div>

          <nav className="p-3 space-y-1 text-sm font-medium text-slate-600">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Video className="w-4 h-4 text-slate-400" />
              <span>WhatsApp Queue</span>
            </a>

            <a
              href="/dashboard/studio"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-purple-50 text-purple-700 font-semibold shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Live Render Studio</span>
            </a>

            <a
              href="/dashboard/ads"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Meta Ads Library</span>
            </a>

            <a
              href="/dashboard/connect"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-slate-400" />
              <span>Shopify Onboarding</span>
            </a>

            <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
              <a
                href="/billing"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Billing & Plans</span>
              </a>

              <a
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-600"
              >
                <span>← Back to Landing Page</span>
              </a>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
              <Flame className="w-3.5 h-3.5 text-purple-600" />
              <span>D2C Studio Engine</span>
            </div>
            <p className="text-[11px] text-purple-700 mt-1 leading-snug">
              Burn top hooks & kinetic captions onto customer reviews in under 4 seconds.
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN STUDIO VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-base text-slate-900">Live "Upload & Render" Studio</h1>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Transform raw customer selfies into high-converting Meta UGC ads
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Load Demo Video
            </button>
            <a
              href="/dashboard/ads"
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Creative Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls & Hook Customization */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* 1. Video Upload Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="font-bold text-sm text-slate-900">Upload Raw Customer Video</h2>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">MP4, MOV up to 100MB</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-purple-50/30 group"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 group-hover:bg-purple-200 text-purple-600 flex items-center justify-center mx-auto mb-3 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {videoFile ? videoFile.name : 'Click to select or drag & drop customer video'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Vertical 9:16 selfie video recommended for optimal Reel conversion
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <FileVideo className="w-4 h-4 text-slate-400" />
                  <span>Current source: <strong>{videoFile ? videoFile.name : 'demo_meta_ad.mp4 (Sample)'}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-purple-600 hover:text-purple-700 font-semibold underline text-xs cursor-pointer"
                >
                  Use sample video
                </button>
              </div>
            </div>

            {/* 2. Product Name & Hook Configuration */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="font-bold text-sm text-slate-900">D2C Product & Viral Hook</h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Product Name (Featured in ad copy)
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Linen Kurta, Vitamin C Serum"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Proven D2C Hook (Top Overlay Badge)
                </label>
                <div className="space-y-2">
                  {PRESET_HOOKS.map((hookText, index) => (
                    <label
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedHook === hookText && !customHook.trim()
                          ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        setSelectedHook(hookText);
                        setCustomHook('');
                      }}
                    >
                      <input
                        type="radio"
                        name="hook"
                        checked={selectedHook === hookText && !customHook.trim()}
                        onChange={() => {}}
                        className="mt-0.5 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="text-xs font-semibold text-slate-800">
                        {hookText}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Or write custom hook
                </label>
                <input
                  type="text"
                  value={customHook}
                  onChange={(e) => setCustomHook(e.target.value)}
                  placeholder="e.g. My mom refused to believe this was under ₹1,200..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* 3. Captions Styling & Render Trigger */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h2 className="font-bold text-sm text-slate-900">Caption Style & Output Aspect Ratio</h2>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCaptionStyle('hormozi')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    captionStyle === 'hormozi'
                      ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 text-xs'
                  }`}
                >
                  <Type className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                  <div className="text-xs">Hormozi Kinetic</div>
                  <div className="text-[10px] text-slate-400">Yellow + Cyan</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCaptionStyle('minimal')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    captionStyle === 'minimal'
                      ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 text-xs'
                  }`}
                >
                  <Type className="w-4 h-4 mx-auto mb-1 text-slate-700" />
                  <div className="text-xs">Clean White</div>
                  <div className="text-[10px] text-slate-400">Black outline</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCaptionStyle('emerald')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    captionStyle === 'emerald'
                      ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 text-xs'
                  }`}
                >
                  <Type className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
                  <div className="text-xs">Emerald Trust</div>
                  <div className="text-[10px] text-slate-400">Green highlight</div>
                </button>
              </div>

              {/* Render Button */}
              <button
                type="button"
                disabled={isRendering}
                onClick={startRenderingPipeline}
                className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-purple-200 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
              >
                {isRendering ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Rendering Meta Ad Creative...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Meta Ad ({currentRatio})</span>
                  </>
                )}
              </button>

              {/* Real-time Progress Bar */}
              {isRendering && (
                <div className="space-y-2 pt-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-700">{renderStage}</span>
                    <span className="font-mono text-slate-500">{renderProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

          </section>

          {/* RIGHT COLUMN: Live Interactive Video Player & Aspect Ratio Switcher */}
          <section className="lg:col-span-5 sticky top-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Ad Creative Preview</h3>
                  <p className="text-[11px] text-slate-500">
                    {renderedAd ? '✨ Rendered with Hormozi Captions' : 'Live Preview Draft'}
                  </p>
                </div>

                {/* Aspect Ratio Tabs */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                  {(['9:16', '1:1', '4:5'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setCurrentRatio(ratio)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        currentRatio === ratio
                          ? 'bg-white text-purple-700 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Player Container */}
              <div
                className={`relative mx-auto bg-black rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex items-center justify-center ${
                  currentRatio === '9:16'
                    ? 'w-[280px] h-[498px]'
                    : currentRatio === '1:1'
                    ? 'w-[320px] h-[320px]'
                    : 'w-[300px] h-[375px]'
                }`}
              >
                <video
                  ref={videoRef}
                  src={videoSrc}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Top Viral Hook Overlay Pill */}
                <div className="absolute top-4 left-3 right-3 z-20 pointer-events-none">
                  <div className="bg-black/85 backdrop-blur-md text-white font-extrabold text-xs px-3 py-1.5 rounded-xl border border-white/20 shadow-lg text-center tracking-tight leading-tight">
                    🔥 {activeHookText}
                  </div>
                </div>

                {/* Kinetic Animated Captions Overlay */}
                <div className="absolute bottom-12 left-4 right-4 z-20 pointer-events-none text-center">
                  <span
                    className={`inline-block font-black text-sm tracking-wide px-3 py-1 rounded-lg backdrop-blur-xs uppercase shadow-md ${
                      captionStyle === 'hormozi'
                        ? 'bg-black/75 text-[#FACC15] border border-amber-400/40'
                        : captionStyle === 'emerald'
                        ? 'bg-black/75 text-emerald-400 border border-emerald-400/40'
                        : 'bg-black/80 text-white'
                    }`}
                  >
                    "{productName} • HONEST REVIEW"
                  </span>
                </div>

                {/* Proof Badge Bottom Right */}
                <div className="absolute bottom-3 right-3 z-20 pointer-events-none">
                  <div className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[9px] shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Real Customer UGC</span>
                  </div>
                </div>

                {/* Play / Pause Center Overlay Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </div>
                </button>
              </div>

              {/* Bottom Actions for Rendered Ad */}
              {renderedAd ? (
                <div className="space-y-2 pt-2 animate-in fade-in">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Render complete! Formatted at CRF 18 visually lossless.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={videoSrc}
                      download={`PandaPraise_${productName.replace(/\s+/g, '_')}_${currentRatio.replace(':', 'x')}.mp4`}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {currentRatio}</span>
                    </a>

                    <button
                      type="button"
                      disabled={isSavedToLibrary}
                      onClick={handleSaveToLibrary}
                      className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isSavedToLibrary ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Saved in Library!</span>
                        </>
                      ) : (
                        <>
                          <Layers className="w-3.5 h-3.5" />
                          <span>Save to Library</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isSavedToLibrary && (
                    <div className="text-center pt-1">
                      <a
                        href="/dashboard/ads"
                        className="text-xs text-purple-600 font-bold underline hover:text-purple-700 inline-flex items-center gap-1"
                      >
                        <span>Open Meta Ads Library to view all creatives</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-400">
                    Select a hook and click <strong>Generate Meta Ad</strong> to compile your finished video creative.
                  </p>
                </div>
              )}

            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default VideoStudioPage;
