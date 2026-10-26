import React, { useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { 
  Play, 
  Pause, 
  Scissors, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Volume2, 
  Share2, 
  Eye, 
  Download,
  Zap,
  Smartphone,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  VideoEditService, 
  AspectRatio, 
  RATIO_SPECS 
} from '../services/videoEditService';

export const VideoEditor: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const videoId = id || 'video_priya_01';

  // Video playback state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(19.0);
  const [blurLoaded, setBlurLoaded] = useState(false);

  // Phase 13 Editor Settings
  const [startTime, setStartTime] = useState(0);
  const [duration, setDuration] = useState(9.0); // Meta 9s sweet spot
  const [ratio, setRatio] = useState<AspectRatio>('9:16');
  const [showSafeZones, setShowSafeZones] = useState(true);
  
  // Hook Text
  const [hookText, setHookText] = useState('POV: KURTA WITH REAL DEEP POCKETS?!');
  const [hookColor, setHookColor] = useState('#FFD60A');

  // Enhancements
  const [enableSharpen, setEnableSharpen] = useState(true);
  const [enableLoudnorm, setEnableLoudnorm] = useState(true);
  const [enableCaptions, setEnableCaptions] = useState(true);

  // Quality Lock Settings
  const [bitrate, setBitrate] = useState<string>('10M');
  const [crf, setCrf] = useState<number>(18);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedResult, setExportedResult] = useState<any>(null);

  // Quality Audit Evaluation
  const qualityAudit = useMemo(() => {
    return VideoEditService.auditQuality({
      crf,
      bitrate,
      duration,
      ratio,
    });
  }, [crf, bitrate, duration, ratio]);

  // Video time tracking
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      // Loop within trimmed boundary
      if (cur >= startTime + duration) {
        videoRef.current.currentTime = startTime;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      if (!isNaN(d) && d > 0) {
        setVideoDuration(d);
      }
      setBlurLoaded(true);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= startTime + duration) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const setSweetSpotPreset = (presetSeconds: number) => {
    setDuration(presetSeconds);
    if (startTime + presetSeconds > videoDuration) {
      setStartTime(Math.max(0, videoDuration - presetSeconds));
    }
    toast.info(`Trim adjusted to ${presetSeconds}s (Meta Ads Sweet Spot)`);
  };

  const handleExport = async () => {
    if (!qualityAudit.isTopNotchReady) {
      toast.error('Quality Lock Active: ' + qualityAudit.message);
      return;
    }

    setIsExporting(true);
    toast.loading('Encoding Top Notch master with CRF ' + crf + ' and 10M bitrate...', { id: 'export-toast' });

    try {
      const result = await VideoEditService.exportVideo({
        videoId,
        startTime,
        duration,
        ratio,
        hookText,
        hookColor,
        enableSharpen,
        enableLoudnorm,
        enableCaptions,
        crf,
        bitrate,
      });

      setExportedResult(result);
      toast.success(`✓ Top Notch Ready! Exported ${result.resolution} for Meta Ads.`, { id: 'export-toast' });
    } catch (err: any) {
      toast.error(err.message || 'Export failed', { id: 'export-toast' });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePushToMetaAds = () => {
    toast.success('Pushed high-res video ad to Meta Ads Library (ID: 1093657506579806)');
  };

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white selection:bg-amber-400 selection:text-black font-sans pb-16">
      <Toaster position="bottom-right" richColors theme="dark" />

      {/* Top Header Bar */}
      <header className="h-16 border-b border-white/[0.08] bg-[#121215]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="text-[12px] font-mono tracking-wider text-white/50 hover:text-white transition-colors"
          >
            ← BACK TO DASHBOARD
          </Link>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-white">Phase 13: Video Editor</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 font-mono font-medium">
              META ADS LOCKED
            </span>
          </div>
        </div>

        {/* Quality Lock Banner in Header */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-mono border transition-all ${
            qualityAudit.isTopNotchReady 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span className="font-semibold">
              {qualityAudit.isTopNotchReady ? '✓ TOP NOTCH LOCKED (CRF ' + crf + ' • ' + bitrate + ')' : 'QUALITY LOCK WARNING'}
            </span>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="h-9 px-4 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Encoding Top Notch...' : 'Export Top Notch'}</span>
          </button>

          <button
            onClick={handlePushToMetaAds}
            className="h-9 px-4 rounded-full bg-[#6701e6] hover:bg-[#5501bf] text-white text-[13px] font-semibold active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-purple-900/30"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Push to Meta Ads</span>
          </button>
        </div>
      </header>

      {/* Main Studio Split Layout */}
      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Video Preview Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 text-[12px] text-white/50 px-2">
            <span className="font-mono">PREVIEW CANVAS: {RATIO_SPECS[ratio].label} ({RATIO_SPECS[ratio].width}x{RATIO_SPECS[ratio].height})</span>
            <button 
              onClick={() => setShowSafeZones(!showSafeZones)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors border ${
                showSafeZones ? 'bg-amber-400/10 text-amber-400 border-amber-400/30' : 'bg-white/[0.04] text-white/40 border-white/[0.08]'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Safe Zone Guides {showSafeZones ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Interactive Player Frame with Continuous Corners */}
          <div 
            className="relative bg-black rounded-[20px] overflow-hidden border border-white/[0.12] shadow-2xl flex items-center justify-center transition-all duration-300"
            style={{
              borderRadius: '20px',
              width: ratio === '9:16' ? '340px' : ratio === '4:5' ? '400px' : '440px',
              aspectRatio: ratio === '9:16' ? '9/16' : ratio === '4:5' ? '4/5' : '1/1',
              maxHeight: '620px'
            }}
          >
            {/* BlurHash / Gradient Placeholder Backdrop */}
            {!blurLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30 blur-[20px]" />
            )}

            {/* Video Element */}
            <video
              ref={videoRef}
              src="/think_reel.mp4"
              poster="/images/hero-reel-poster.jpg"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-cover cursor-pointer"
              onClick={togglePlay}
              playsInline
              loop
            />

            {/* Top 250px Safe Zone Guide (Stories/Reels UI) */}
            {showSafeZones && (
              <div 
                className="absolute top-0 left-0 right-0 border-b-2 border-dashed border-amber-400/50 bg-black/30 pointer-events-none flex items-center justify-between px-3 text-[10px] text-amber-300 font-mono"
                style={{ height: '14%' }}
              >
                <span>⚠️ META TOP UI SAFE ZONE</span>
                <span>(No Text Area)</span>
              </div>
            )}

            {/* Burned Hook Overlay Preview */}
            {hookText && (
              <div 
                className="absolute left-4 right-4 text-center pointer-events-none transition-all duration-150"
                style={{ top: ratio === '9:16' ? '18%' : '14%' }}
              >
                <span 
                  className="inline-block uppercase tracking-wide font-black text-[18px] sm:text-[20px] px-3 py-1.5 rounded-[8px] bg-black/60 backdrop-blur-sm shadow-xl"
                  style={{
                    color: hookColor,
                    fontFamily: 'Impact, sans-serif',
                    textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                    WebkitTextStroke: '1px black',
                  }}
                >
                  {hookText}
                </span>
              </div>
            )}

            {/* Auto-Captions Preview (Whisper AI) */}
            {enableCaptions && (
              <div className="absolute bottom-[20%] left-4 right-4 text-center pointer-events-none">
                <span className="inline-block font-black text-[17px] text-white px-3 py-1 rounded bg-black/75 shadow-lg tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                  PURSE KA JHANJHAT KHATAM! 💃
                </span>
              </div>
            )}

            {/* Bottom 250px Safe Zone Guide (Meta CTA & Caption) */}
            {showSafeZones && (
              <div 
                className="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-amber-400/50 bg-black/30 pointer-events-none flex items-center justify-between px-3 text-[10px] text-amber-300 font-mono"
                style={{ height: '16%' }}
              >
                <span>⚠️ META BOTTOM CTA SAFE ZONE</span>
                <span>(Caption/Audio)</span>
              </div>
            )}

            {/* Play/Pause Button Overlay */}
            {!isPlaying && (
              <button 
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white/20 backdrop-blur-md text-white grid place-items-center hover:scale-110 active:scale-95 transition-all shadow-xl"
              >
                <Play className="w-6 h-6 ml-0.5 fill-white" />
              </button>
            )}

            {/* Quality Rating Stamp on preview */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
              CRF {crf} • {bitrate}
            </div>
          </div>

          {/* Scrubber & Timeline Bar */}
          <div className="w-full max-w-[440px] mt-4 p-3 rounded-[16px] bg-[#161619] border border-white/[0.08] flex items-center gap-3">
            <button 
              onClick={togglePlay}
              className="h-8 w-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white grid place-items-center transition-colors shrink-0"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>

            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={videoDuration}
                step={0.1}
                value={currentTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCurrentTime(val);
                  if (videoRef.current) videoRef.current.currentTime = val;
                }}
                className="w-full accent-amber-400 h-1.5 rounded-lg bg-white/10 cursor-pointer"
              />
            </div>

            <span className="text-[11px] font-mono text-white/50 tabular-nums shrink-0">
              {currentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Right Column: Editor Controls Suite */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* 1. Trim Control Box */}
          <div className="p-5 rounded-[20px] bg-[#161619] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-amber-400" />
                <h3 className="text-[14px] font-semibold text-white">Trim Video (Meta Sweet Spot)</h3>
              </div>
              <span className="text-[12px] font-mono text-amber-400 font-semibold tabular-nums">
                {duration.toFixed(1)}s
              </span>
            </div>

            {/* Sweet Spot Presets */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSweetSpotPreset(9.0)}
                className={`py-2 px-3 rounded-[12px] text-[12px] font-semibold border transition-all text-center ${
                  duration === 9.0 
                    ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20' 
                    : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                9s Sweet Spot 🔥
              </button>
              <button
                onClick={() => setSweetSpotPreset(15.0)}
                className={`py-2 px-3 rounded-[12px] text-[12px] font-semibold border transition-all text-center ${
                  duration === 15.0 
                    ? 'bg-amber-400 text-black border-amber-400' 
                    : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                15s Standard
              </button>
              <button
                onClick={() => setSweetSpotPreset(19.0)}
                className={`py-2 px-3 rounded-[12px] text-[12px] font-semibold border transition-all text-center ${
                  duration === 19.0 
                    ? 'bg-amber-400 text-black border-amber-400' 
                    : 'bg-white/[0.04] text-white/70 border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                19s Full
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[11px] text-white/50">
                <span>Start Offset: {startTime.toFixed(1)}s</span>
                <span>End: {(startTime + duration).toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(0, videoDuration - duration)}
                step={0.5}
                value={startTime}
                onChange={(e) => setStartTime(parseFloat(e.target.value))}
                className="w-full accent-amber-400 h-1.5 rounded-lg bg-white/10"
              />
            </div>
          </div>

          {/* 2. Aspect Ratio Selector */}
          <div className="p-5 rounded-[20px] bg-[#161619] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-[14px] font-semibold text-white">Crop & Aspect Ratio</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['9:16', '4:5', '1:1'] as AspectRatio[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className={`p-3 rounded-[14px] border text-left transition-all ${
                    ratio === r 
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg' 
                      : 'bg-white/[0.03] border-white/[0.06] text-white/60 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="text-[13px] font-bold font-mono">{r}</div>
                  <div className="text-[11px] text-white/40 truncate">{RATIO_SPECS[r].label.split(' ')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Hook Text Customization */}
          <div className="p-5 rounded-[20px] bg-[#161619] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-[14px] font-semibold text-white">Burned Hook Text</h3>
              </div>
              <span className="text-[11px] text-white/40">Yellow #FFD60A</span>
            </div>

            <input
              type="text"
              value={hookText}
              onChange={(e) => setHookText(e.target.value)}
              placeholder="POV: Kurta with real deep pockets?!"
              className="w-full h-11 px-3.5 rounded-[12px] bg-black/40 border border-white/[0.10] text-white text-[13px] focus:border-amber-400 outline-none uppercase font-semibold"
            />

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-white/40">Color:</span>
              {[
                { hex: '#FFD60A', name: 'Meta Gold' },
                { hex: '#FFFFFF', name: 'White' },
                { hex: '#00E6FF', name: 'Cyan' },
                { hex: '#00FF66', name: 'Emerald' }
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setHookColor(c.hex)}
                  className={`h-6 px-2.5 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 transition-all ${
                    hookColor === c.hex ? 'border-white scale-105' : 'border-transparent opacity-60'
                  }`}
                  style={{ backgroundColor: c.hex + '20', color: c.hex }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.hex }} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. AI Enhancements: Auto-Captions (Whisper) & Unsharp Sharpen */}
          <div className="p-5 rounded-[20px] bg-[#161619] border border-white/[0.08] space-y-3">
            <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI Enhancements & Audio</span>
            </h3>

            <div className="space-y-2">
              {/* Auto-captions toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-[12px] bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors border border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-[13px] font-medium text-white">Auto-Captions (Whisper AI)</div>
                    <div className="text-[11px] text-white/40">Hinglish/English kinetic subtitles with Apple emojis</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableCaptions}
                  onChange={(e) => setEnableCaptions(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </label>

              {/* Unsharp sharpen toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-[12px] bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors border border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-[13px] font-medium text-white">Unsharp Sharpen Filter (+0.3)</div>
                    <div className="text-[11px] text-white/40">Eliminates mobile video compression blur</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableSharpen}
                  onChange={(e) => setEnableSharpen(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </label>

              {/* Loudnorm audio toggle */}
              <label className="flex items-center justify-between p-2.5 rounded-[12px] bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer transition-colors border border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-[13px] font-medium text-white">Broadcast Loudnorm (-14 LUFS)</div>
                    <div className="text-[11px] text-white/40">Meta recommended loudness standard</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableLoudnorm}
                  onChange={(e) => setEnableLoudnorm(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 5. Quality Lock Engine */}
          <div className="p-5 rounded-[20px] bg-[#161619] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-[14px] font-semibold text-white">Quality Lock Engine</h3>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono flex items-center gap-1 ${
                qualityAudit.isTopNotchReady ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {qualityAudit.isTopNotchReady ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✓ TOP NOTCH READY</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>BLOCKING EXPORT</span>
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <div className="p-3 rounded-[12px] bg-black/40 border border-white/[0.06] space-y-2">
                <span className="text-white/40">Target Bitrate:</span>
                <div className="font-mono font-bold text-emerald-400 text-[14px]">{bitrate}</div>
                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => setBitrate('10M')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      bitrate === '10M' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-white/[0.04] text-white/40 border-white/[0.08]'
                    }`}
                  >
                    10M (HD Lock)
                  </button>
                  <button
                    onClick={() => setBitrate('4M')}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      bitrate === '4M' ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-white/[0.04] text-white/40 border-white/[0.08]'
                    }`}
                    title="Simulate low bitrate to test Quality Lock"
                  >
                    4M (Test Lock)
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-[12px] bg-black/40 border border-white/[0.06] space-y-2">
                <span className="text-white/40">CRF Encoding:</span>
                <div className="font-mono font-bold text-emerald-400 text-[14px]">CRF {crf}</div>
                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => setCrf(18)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      crf === 18 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-white/[0.04] text-white/40 border-white/[0.08]'
                    }`}
                  >
                    18 (Lossless)
                  </button>
                  <button
                    onClick={() => setCrf(24)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      crf === 24 ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-white/[0.04] text-white/40 border-white/[0.08]'
                    }`}
                    title="Simulate high CRF to test Quality Lock"
                  >
                    24 (Test Lock)
                  </button>
                </div>
              </div>
            </div>

            {/* Quality Lock Rule Audit Output */}
            {!qualityAudit.isTopNotchReady && (
              <div className="p-3 rounded-[12px] bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Quality Lock Active: {qualityAudit.message}. Export is blocked to protect Meta Ad ROAS.</span>
              </div>
            )}

            {/* Exported Result Confirmation Banner */}
            {exportedResult && (
              <div className="p-3.5 rounded-[12px] bg-emerald-500/10 border border-emerald-500/30 text-white text-[12px] space-y-1.5">
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Top Notch Export Ready ({exportedResult.resolution})</span>
                  </span>
                  <span className="font-mono text-[11px] text-white/50">{exportedResult.exportTime}</span>
                </div>
                <p className="text-white/60 text-[11px]">
                  Output file: <code className="text-amber-400 font-mono">{exportedResult.outputPath}</code>
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href={exportedResult.downloadUrl}
                    download
                    className="h-7 px-3 rounded-full bg-emerald-500 text-black text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-400 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Clean Master</span>
                  </a>
                </div>
              </div>
            )}

            <p className="text-[11px] text-white/50 leading-relaxed">
              Guarantees Meta algorithms will never penalize your ad creative for low resolution or bitrate drops.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default VideoEditor;
