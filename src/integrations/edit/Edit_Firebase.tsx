import React, { useState } from "react";
import { db } from "../../firebase-adapters/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// 03 EDIT - HOOKS + RATIOS - Firebase version - Panda auto-cuts hooks (0-3s), adds captions, exports 9:16 / 4:5 / 1:1
export const Edit_Firebase: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [exports, setExports] = useState<any[]>([]);

  const handleAutoEdit = async () => {
    setExporting(true);
    // Simulate auto-cut 0-3s hook detection + captions + 3 ratios
    const mockExports = [
      { ratio: '9:16', resolution: '1080x1920', bitrate: '10M', crf: 18, url: 'https://firebasestorage.googleapis.com/.../edit/9x16.mp4', hook: '0.0-3.1s pocket reveal' },
      { ratio: '4:5', resolution: '1080x1350', bitrate: '8M', crf: 19, url: 'https://firebasestorage.googleapis.com/.../edit/4x5.mp4', hook: '0.0-3.1s pocket reveal' },
      { ratio: '1:1', resolution: '1080x1080', bitrate: '8M', crf: 19, url: 'https://firebasestorage.googleapis.com/.../edit/1x1.mp4', hook: '0.0-3.1s pocket reveal' },
    ];
    
    // Save to Firebase - solid base
    if (db) {
      for (const exp of mockExports) {
        try {
          await setDoc(doc(db, 'video_exports', `${Date.now()}_${exp.ratio.replace(':', 'x')}`), {
            ...exp,
            createdAt: serverTimestamp(),
            status: 'ready',
            qualityCheck: { bitrateOk: true, crfOk: true, topNotch: true },
            captions: 'auto-generated with Whisper',
            hookText: 'pov - kurta with real pockets?!'
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore video_exports notice:', err);
        }
      }
    }
    
    await new Promise(r => setTimeout(r, 1200));
    setExports(mockExports);
    setExporting(false);
  };

  return (
    <div className="rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] p-6 w-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-[20px] font-light text-white/20 tabular-nums font-mono">03</span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] tracking-widest text-white/40 font-mono">
            HOOKS + RATIOS
          </span>
        </div>
        <h3 className="text-[14px] font-bold tracking-[0.15em] text-white">EDIT</h3>
        <p className="mt-2 text-[13px] text-white/50 leading-[1.6]">
          Panda auto-cuts hooks (0-3s), adds captions, exports 9:16 / 4:5 / 1:1.
        </p>
        
        <div className="mt-5 space-y-3">
          <div className="rounded-[12px] bg-black border border-white/[0.06] p-3">
            <div className="flex justify-between text-[10px] text-white/30 mb-2 tabular-nums font-mono">
              <span>Hook Detection</span>
              <span className="text-amber-400 font-semibold">0.0s → 3.1s</span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full w-[16%] bg-[#FFD60A]" />
            </div>
            <div className="mt-2 text-[11px] text-white/40 font-mono">
              Detected: pocket reveal • Energy: 92% • Face: yes
            </div>
          </div>
          
          {exports.length === 0 ? (
            <button 
              onClick={handleAutoEdit} 
              disabled={exporting} 
              className="w-full h-[44px] rounded-full bg-white text-black font-semibold text-[13px] disabled:opacity-50 hover:bg-white/90 active:scale-95 transition-all shadow-md"
            >
              {exporting ? 'Auto-cutting hooks + captions...' : 'Auto-Edit • Top Notch 10M'}
            </button>
          ) : (
            <div className="space-y-2">
              {exports.map(e => (
                <div key={e.ratio} className="flex justify-between items-center p-2 rounded-[10px] bg-white/[0.04] border border-white/[0.04] text-[11px]">
                  <span className="text-white font-medium tabular-nums font-mono">{e.ratio} • {e.resolution}</span>
                  <span className="text-white/40 tabular-nums font-mono">{e.bitrate} CRF{e.crf}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                    ✓ {e.hook}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-[11px] text-white/30 font-mono leading-relaxed">
        Firestore: video_exports • Storage: edits/&#123;ratio&#125;.mp4 • Quality: CRF18 10M slow preset
      </div>
    </div>
  );
};

export default Edit_Firebase;
