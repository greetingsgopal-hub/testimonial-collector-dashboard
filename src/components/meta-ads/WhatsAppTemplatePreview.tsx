import React from 'react';
import { CheckCheck, Video, Tag, Sparkles } from 'lucide-react';

interface WhatsAppTemplatePreviewProps {
  storeName?: string;
  sampleProduct?: string;
  discountAmount?: string;
}

export const WhatsAppTemplatePreview: React.FC<WhatsAppTemplatePreviewProps> = ({
  storeName = 'FabIndia D2C',
  sampleProduct = 'Handcrafted Chanderi Kurta',
  discountAmount = '₹100',
}) => {
  return (
    <div className="w-full max-w-sm mx-auto bg-[#ECE5DD] rounded-3xl overflow-hidden border border-slate-300 shadow-xl font-sans">
      {/* WhatsApp Header Bar */}
      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600 border border-white/30 flex items-center justify-center font-bold text-sm">
            🐼
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm leading-none">{storeName}</span>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 text-slate-900 flex items-center justify-center text-[9px] font-black">
                ✓
              </span>
            </div>
            <span className="text-[11px] text-emerald-200">Official Business Account</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded text-emerald-100 font-mono">
            Auto-Trigger
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="p-4 space-y-3 min-h-[360px] flex flex-col justify-end text-xs">
        {/* Date pill */}
        <div className="text-center my-1">
          <span className="bg-white/80 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
            7 Days Post-Delivery • 14:15
          </span>
        </div>

        {/* 1. Automated Outreach Message */}
        <div className="bg-white text-slate-900 p-3.5 rounded-2xl rounded-tl-none shadow-xs border border-slate-200/80 max-w-[88%] space-y-2">
          <p className="leading-relaxed">
            Hey Priya! 🌸 Hope you're loving your new <strong className="text-emerald-800">{sampleProduct}</strong>!
          </p>
          <p className="leading-relaxed text-slate-700">
            Could you send a quick <strong>20-sec vertical video</strong> sharing what you loved?
          </p>
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 font-bold">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Get flat {discountAmount} OFF your next order!</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
            <span>14:15</span>
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>

        {/* 2. Customer Video Response */}
        <div className="bg-[#DCF8C6] text-slate-900 p-3 rounded-2xl rounded-tr-none shadow-xs border border-emerald-200/80 max-w-[85%] self-end space-y-2">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">review_video.mp4</span>
              <span className="text-[10px] text-slate-500">0:21 • 1080x1920 (Vertical)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-800 leading-snug">
            "The stitching and fabric quality are unreal! Already ordered one for my sister."
          </p>
          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500">
            <span>14:32</span>
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>

        {/* 3. Automated Reward Delivery & Pipeline Confirmation */}
        <div className="bg-white text-slate-900 p-3 rounded-2xl rounded-tl-none shadow-xs border border-slate-200/80 max-w-[88%] space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coupon Unlocked!</span>
          </div>
          <p className="text-[11px] text-slate-700">
            Use code <strong className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800">FAB100</strong> at checkout for {discountAmount} off. Thank you!
          </p>
          <span className="text-[10px] text-slate-400 block text-right">14:33</span>
        </div>
      </div>
    </div>
  );
};
