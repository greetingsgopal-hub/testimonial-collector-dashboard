import React, { useState } from 'react';
import { Download, Sparkles, ShoppingBag, Check, Play, Pause } from 'lucide-react';

export interface MetaAdItem {
  id: string;
  customerName: string;
  productName: string;
  hookText: string;
  videoUrl: string;
  ctr: string;
  ratios: string[];
  createdAt: string;
}

export const AdCard: React.FC<{ ad: MetaAdItem; onPushToShopify?: (id: string) => void }> = ({
  ad,
  onPushToShopify,
}) => {
  const [activeRatio, setActiveRatio] = useState<'9:16' | '1:1' | '4:5'>('9:16');
  const [isPushed, setIsPushed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

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

  const handlePush = () => {
    setIsPushed(true);
    if (onPushToShopify) onPushToShopify(ad.id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition group">
      {/* Top Video Preview Area */}
      <div className="relative aspect-[9/16] bg-black overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src={ad.videoUrl}
          loop
          muted
          playsInline
          className={`w-full h-full object-cover transition-all ${
            activeRatio === '1:1' ? 'aspect-square max-h-[80%]' : ''
          }`}
        />

        {/* Top Viral Hook Pill Overlay */}
        <div className="absolute top-3 left-3 right-3 pointer-events-none z-10">
          <div className="bg-black/85 backdrop-blur-md border border-emerald-500/40 rounded-xl p-2.5 shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto-Generated Hook
            </span>
            <p className="text-xs font-black text-white mt-0.5 leading-snug line-clamp-2">
              "{ad.hookText}"
            </p>
          </div>
        </div>

        {/* Floating Play Overlay Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-slate-950/70 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer z-20 backdrop-blur-sm"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        {/* Bottom CTR Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            ⚡ {ad.ctr} Meta CTR
          </span>
        </div>
      </div>

      {/* Details & Actions Footer */}
      <div className="p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>By {ad.customerName}</span>
            <span>{ad.createdAt}</span>
          </div>
          <h4 className="font-bold text-sm text-white line-clamp-1">{ad.productName}</h4>
        </div>

        {/* Ratio Selector Tabs */}
        <div className="flex items-center justify-between bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['9:16', '1:1', '4:5'] as const).map((ratio) => (
            <button
              key={ratio}
              type="button"
              onClick={() => setActiveRatio(ratio)}
              className={`flex-1 py-1 text-center rounded-lg font-bold transition cursor-pointer ${
                activeRatio === ratio
                  ? 'bg-slate-800 text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {ratio}
            </button>
          ))}
        </div>

        {/* Download & Push Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <a
            href={ad.videoUrl}
            download={`ad_${ad.id}_${activeRatio}.mp4`}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition text-center"
          >
            <Download className="w-3.5 h-3.5" />
            Download ({activeRatio})
          </a>

          <button
            type="button"
            onClick={handlePush}
            disabled={isPushed}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isPushed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
            }`}
          >
            {isPushed ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Live on Store
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                Push to Shopify
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
