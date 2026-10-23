import React, { useState } from 'react';
import { CheckCheck, Video, Copy, Check, ShieldCheck } from 'lucide-react';

interface WhatsAppTemplatePreviewProps {
  storeName?: string;
  sampleProduct?: string;
  discountAmount?: string;
}

type TemplateKey = 't1' | 't2' | 't3';

export const WhatsAppTemplatePreview: React.FC<WhatsAppTemplatePreviewProps> = ({
  storeName = 'FabIndia D2C',
  sampleProduct = 'Handcrafted Chanderi Kurta',
  discountAmount = '100',
}) => {
  const [activeTab, setActiveTab] = useState<TemplateKey>('t1');
  const [copied, setCopied] = useState(false);

  const TEMPLATES = {
    t1: {
      name: 'video_review_reward_7day',
      label: '1. Day 7 Collection (40% Reply)',
      body: `Hey Anjali! 🐼

Your ${sampleProduct} from ${storeName} was delivered 7 days back — how is it?

Can you send a quick 20 sec video? Just hold phone vertical and say:
1. What you liked
2. One honest thing

No filter, no makeup needed — real video = real help for others!

Send video here and get ₹${discountAmount} OFF next order instantly + your video featured on our page ❤️

Just reply with video, we'll handle rest.`,
      button: '📹 Send Video Now',
      metaCode: `Hey {{1}}! 🐼\n\nYour {{2}} from {{3}} was delivered 7 days back — how is it?\n\nCan you send a quick 20 sec video? Just hold phone vertical and say:\n1. What you liked\n2. One honest thing\n\nNo filter, no makeup needed — real video = real help for others!\n\nSend video here and get ₹{{4}} OFF next order instantly + your video featured on our page ❤️\n\nJust reply with video, we'll handle rest.`,
    },
    t2: {
      name: 'video_reminder_48h',
      label: '2. 48h Nudge (+15%)',
      body: `Anjali, quick nudge! 😊

That 20 sec video = ₹${discountAmount} off + helps 100 others decide.

Still shy? Just say "Product accha hai, fitting mast hai" — bas! Even 10 sec works.`,
      button: '📹 Send 10 Sec Video',
      metaCode: `{{1}}, quick nudge! 😊\n\nThat 20 sec video = ₹100 off + helps 100 others decide.\n\nStill shy? Just say "Product accha hai, fitting mast hai" — bas! Even 10 sec works.`,
    },
    t3: {
      name: 'video_thanks_rights',
      label: '3. UGC Commercial Rights',
      body: `Thank you so much Anjali! 🙏 Your video is 🔥

Your ₹${discountAmount} code: PANDA100-AB72 (valid 30 days)

Quick yes — can we use your video as ad? Your face will help others trust us. We'll blur your number, only first name.

Reply YES if okay ❤️`,
      buttonGroup: ['[YES, USE IT]', '[NO, PRIVATE]'],
      metaCode: `Thank you so much {{1}}! 🙏 Your video is 🔥\n\nYour ₹{{2}} code: {{3}} (valid 30 days)\n\nQuick yes — can we use your video as ad? Your face will help others trust us. We'll blur your number, only first name.\n\nReply YES if okay ❤️`,
    },
  };

  const currentTpl = TEMPLATES[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTpl.metaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-3 font-sans">
      
      {/* Template Tab Selector */}
      <div className="flex items-center justify-between gap-1 bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
        {(['t1', 't2', 't3'] as const).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeTab === tabKey
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tabKey === 't1' ? '1. Collection' : tabKey === 't2' ? '2. 48h Reminder' : '3. UGC Rights'}
          </button>
        ))}
      </div>

      {/* Meta Template Copy Bar */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-bold">{currentTpl.name}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-[11px] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Meta Template</span>
            </>
          )}
        </button>
      </div>

      {/* Realistic WhatsApp Phone Simulation */}
      <div className="bg-[#ECE5DD] rounded-3xl overflow-hidden border border-slate-300 shadow-xl">
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
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded text-emerald-100 font-mono">
            Hinglish 40%
          </span>
        </div>

        {/* Chat Area */}
        <div className="p-4 space-y-3 min-h-[380px] flex flex-col justify-end text-xs">
          {/* Date pill */}
          <div className="text-center my-1">
            <span className="bg-white/80 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
              {activeTab === 't1'
                ? 'Day 7 Post-Delivery • 14:15'
                : activeTab === 't2'
                ? 'Day 9 (48h Nudge) • 16:30'
                : 'Video Received • Instant Reply'}
            </span>
          </div>

          {/* WhatsApp Message Bubble */}
          <div className="bg-white text-slate-900 p-3.5 rounded-2xl rounded-tl-none shadow-xs border border-slate-200/80 max-w-[92%] space-y-2">
            <div className="whitespace-pre-line leading-relaxed text-slate-800 text-[11px] font-medium">
              {currentTpl.body}
            </div>

            {/* Quick Action Button in Template 1 & 2 */}
            {'button' in currentTpl && (
              <div className="pt-2 border-t border-slate-100">
                <div className="py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-center flex items-center justify-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentTpl.button}</span>
                </div>
              </div>
            )}

            {/* UGC Rights Buttons in Template 3 */}
            {'buttonGroup' in currentTpl && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Meta Commercial Ad Permission</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="py-1 px-2 rounded-lg bg-emerald-600 text-white font-bold text-center text-[10px]">
                    YES, USE IT ❤️
                  </div>
                  <div className="py-1 px-2 rounded-lg bg-slate-100 text-slate-600 font-bold text-center text-[10px]">
                    NO, PRIVATE
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-0.5">
              <span>Just now</span>
              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
            </div>
          </div>

          {/* Bottom Trust Note */}
          <div className="text-center pt-1">
            <span className="text-[10px] text-slate-500 font-medium">
              {activeTab === 't1' && '🎯 Day 7 bribe: ₹100 discount reduces review friction'}
              {activeTab === 't2' && '⚡ 10-sec low-effort prompt overcomes customer shyness'}
              {activeTab === 't3' && '⚖️ Written consent required by Meta advertising policies'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
