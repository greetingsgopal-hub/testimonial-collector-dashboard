import React, { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from "../../firebase-adapters/firebase";
import { collection, query, onSnapshot, orderBy, doc, setDoc, serverTimestamp } from "firebase/firestore";

export const getFreshUrl = async (path: string) => {
  const storage = getStorage();
  const urlRef = ref(storage, path);
  // Always generate fresh — expires in 1 week, but we refresh on every load
  return await getDownloadURL(urlRef);
};

export interface WhatsAppCollect_FirebaseProps {
  doc?: { storagePath?: string; videoUrl?: string; [key: string]: any };
  onVideoUrlChange?: (url: string) => void;
}

// 02 COLLECT - WHATSAPP UI • INCOMING - Firebase version
export const WhatsAppCollect_Firebase: React.FC<WhatsAppCollect_FirebaseProps> = ({ 
  doc: propDoc, 
  onVideoUrlChange 
}) => {
  const [incoming, setIncoming] = useState<any[]>([]);
  const [importedMap, setImportedMap] = useState<Record<string, boolean>>({});
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');

  const docData = propDoc || selectedDoc;

  // In WhatsAppCollect_Firebase.tsx
  // WRONG (you have): setVideoUrl(doc.videoUrl) // cached 24h URL -> 4xx after
  // RIGHT:
  useEffect(() => {
    if (docData?.storagePath) {
      getFreshUrl(docData.storagePath)
        .then((url) => {
          setVideoUrl(url);
          onVideoUrlChange?.(url);
        })
        .catch((err) => {
          console.warn('Notice generating fresh URL:', err);
        });
    }
  }, [docData?.storagePath]);

  useEffect(() => {
    // Real-time Firebase listener - solid base
    if (!db) return;
    try {
      const q = query(collection(db, 'whatsapp_incoming'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setIncoming(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }, (err) => {
        console.warn('Real-time listener notice (resilient mode):', err);
      });
      return () => unsub();
    } catch {
      // Fallback in test / offline environments
    }
  }, []);

  // Mock data if empty (for instant demo matching screenshot)
  const displayData = incoming.length > 0 ? incoming : [
    { 
      id: 'w1', 
      name: 'Ananya S.', 
      phone: '+91 98****12', 
      duration: '0:09', 
      time: '2m ago', 
      status: 'new', 
      type: 'video', 
      shop: 'kalyan-silks', 
      rating: 5,
      storagePath: 'whatsapp/+919800000012/w1.mp4'
    },
    { 
      id: 'w2', 
      name: 'Rahul M.', 
      phone: '+91 98****45', 
      duration: '0:12', 
      time: '12m ago', 
      status: 'pending', 
      type: 'video', 
      shop: 'kalyan-silks', 
      rating: 4,
      storagePath: 'whatsapp/+919800000045/w2.mp4'
    },
  ];

  const importToInbox = async (item: any) => {
    setImportedMap(prev => ({ ...prev, [item.id]: true }));
    setSelectedDoc(item);
    // Move from whatsapp_incoming to testimonials - Firebase solid base
    if (db) {
      try {
        const storagePath = item.storagePath || `whatsapp/${item.id}.mp4`;
        await setDoc(doc(db, 'testimonials', item.id), {
          ...item,
          source: 'whatsapp',
          status: 'pending',
          storagePath,
          importedAt: serverTimestamp(),
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore import notice:', err);
      }
    }
  };

  return (
    <div className="rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] p-6 w-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-[20px] font-light text-white/20 tabular-nums font-mono">02</span>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] tracking-widest text-white/40 font-mono">
            WHATSAPP UI • INCOMING
          </span>
        </div>
        <h3 className="text-[14px] font-bold tracking-[0.15em] text-white">COLLECT</h3>
        <p className="mt-2 text-[13px] text-white/50 leading-[1.6]">
          Customers reply with video on WhatsApp. No app, no link.
        </p>
        
        <div className="mt-5 space-y-2 max-h-[240px] overflow-y-auto">
          {displayData.map((msg: any) => (
            <div 
              key={msg.id} 
              onClick={() => setSelectedDoc(msg)}
              className={`flex gap-3 p-3 rounded-[14px] border transition-colors group items-center cursor-pointer ${
                docData?.id === msg.id 
                  ? 'bg-white/[0.08] border-amber-400/40' 
                  : 'bg-white/[0.04] border-white/[0.04] hover:border-white/[0.08]'
              }`}
            >
              <div className="relative h-12 w-12 rounded-[12px] overflow-hidden bg-black grid place-items-center text-[10px] text-white/40 font-mono shrink-0">
                <img 
                  src={msg.avatar || `https://firebasestorage.googleapis.com/v0/b/pandapraise.appspot.com/o/${encodeURIComponent(msg.storagePath || `whatsapp/${msg.id}.mp4`)}?alt=media`} 
                  alt={msg.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // 4xx -> token expired, refetch
                    if (e.currentTarget.src.includes('fbcdn.net') || e.currentTarget.src.includes('firebasestorage')) {
                      getFreshUrl(msg.storagePath || `whatsapp/${msg.id}.mp4`).then(newUrl => {
                        e.currentTarget.src = newUrl;
                      }).catch(() => {});
                    }
                  }} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-medium text-white truncate">{msg.name}</span>
                  <span className="text-[10px] text-white/30 tabular-nums font-mono">{msg.time || msg.duration}</span>
                </div>
                <div className="text-[11px] text-white/40 truncate">{msg.phone} • {msg.duration}</div>
                <div className="mt-1 flex items-center gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      importToInbox(msg);
                    }} 
                    className="text-[10px] px-2.5 py-0.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 active:scale-95 transition-all shadow-sm"
                  >
                    {importedMap[msg.id] ? '✓ Imported' : 'Import →'}
                  </button>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/50 font-mono">
                    {msg.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {videoUrl && (
          <div className="mt-3 px-3 py-1.5 rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">Fresh Storage URL: {videoUrl.slice(0, 36)}...</span>
            </div>
            <span className="text-emerald-300 font-bold ml-2 shrink-0">Active</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-[11px] text-white/30 font-mono leading-relaxed">
        Firestore: whatsapp_incoming → testimonials • Storage: whatsapp/&#123;id&#125;.mp4
      </div>
    </div>
  );
};

export default WhatsAppCollect_Firebase;
