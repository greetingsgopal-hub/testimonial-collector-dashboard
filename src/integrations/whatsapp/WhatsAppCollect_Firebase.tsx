import React, { useState, useEffect } from "react";

import { db, auth } from "../../firebase-adapters/firebase";
import { collection, query, onSnapshot, orderBy, doc, setDoc, serverTimestamp, where } from "firebase/firestore";
import { getFreshUrl } from "../../firebase-adapters/firebase";

export { getFreshUrl };

export interface WhatsAppCollect_FirebaseProps {
  doc?: { storagePath?: string; videoUrl?: string; [key: string]: any };
  onVideoUrlChange?: (url: string, testimonialId?: string) => void;
}

// 02 COLLECT - WHATSAPP UI • INCOMING - Firebase version
export const WhatsAppCollect_Firebase: React.FC<WhatsAppCollect_FirebaseProps> = ({ 
  doc: propDoc, 
  onVideoUrlChange 
}) => {
  const [incoming, setIncoming] = useState<any[]>([]);
  const [importedMap, setImportedMap] = useState<Record<string, boolean>>({});
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [freshUrl, setFreshUrl] = useState<string>('');
  const [mediaError, setMediaError] = useState('');
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const [listenerError, setListenerError] = useState('');
  const [importError, setImportError] = useState('');

  const docData = propDoc || selectedDoc;

  useEffect(() => {
    if (docData?.storagePath) {
      setFreshUrl('');
      setMediaError('');
      setRefreshAttempted(false);
      getFreshUrl(docData.storagePath)
        .then((url) => {
          setFreshUrl(url);
          onVideoUrlChange?.(url, docData.id);
        })
        .catch((err) => {
          setMediaError(err instanceof Error ? err.message : 'Could not load this video from Firebase Storage.');
        });
    } else {
      setFreshUrl('');
      if (docData?.videoUrl) {
        setFreshUrl(docData.videoUrl);
        onVideoUrlChange?.(docData.videoUrl, docData.id);
      }
    }
  }, [docData?.storagePath, docData?.videoUrl, onVideoUrlChange]);

  useEffect(() => {
    // Real-time Firebase listener - solid base
    if (!db) {
      setListenerError('Firebase is not configured. Add the VITE_FIREBASE_* settings to load incoming videos.');
      return;
    }
    try {
      const ownerUid = auth?.currentUser?.uid;
      if (!ownerUid) {
        setListenerError('Sign in to view WhatsApp videos linked to your account.');
        return;
      }
      const q = query(collection(db, 'whatsapp_incoming'), where('ownerUid', '==', ownerUid), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        setListenerError('');
        setIncoming(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => {
        setListenerError(err.message || 'Could not load incoming WhatsApp videos.');
      });
      return () => unsub();
    } catch {
      setListenerError('Could not subscribe to incoming WhatsApp videos.');
    }
  }, []);

  const importToInbox = async (item: any) => {
    if (!db) {
      setImportError('Firebase is not configured. This item was not imported.');
      return;
    }
    setImportError('');
    try {
      await setDoc(doc(db, 'testimonials', item.id), {
        ...item,
        source: 'whatsapp',
        status: 'pending',
        storagePath: item.storagePath?.trim() || null,
        importedAt: serverTimestamp(),
      }, { merge: true });
      setImportedMap(prev => ({ ...prev, [item.id]: true }));
      setSelectedDoc(item);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Could not import this item.');
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
        
        {listenerError && <p role="alert" className="mt-3 text-xs text-red-300">{listenerError}</p>}
        {importError && <p role="alert" className="mt-3 text-xs text-red-300">{importError}</p>}
        <div className="mt-5 space-y-2 max-h-[240px] overflow-y-auto">
          {incoming.length === 0 && !listenerError && <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-white/40">No WhatsApp videos have arrived yet.</p>}
          {incoming.map((msg: any) => (
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
                {msg.avatar ? <img src={msg.avatar} alt={msg.name || 'Customer'} className="h-full w-full object-cover" /> : <span>VIDEO</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-medium text-white truncate">{msg.name}</span>
                  <span className="text-[10px] text-white/30 tabular-nums font-mono">{msg.time || msg.duration}</span>
                </div>
                <div className="text-[11px] text-white/40 truncate">{msg.phone} • {msg.duration}</div>
                <div className="mt-1 flex items-center gap-2">
                  <button
                    type="button"
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

        {mediaError && <p role="alert" className="mt-3 text-xs text-red-300">{mediaError}</p>}
        {freshUrl && (
        <div>
          <div className="text-[9px] text-white/30 font-mono mt-3 mb-1">Fresh Storage URL</div>
          <video
            src={freshUrl}
            controls
            className="max-w-full h-auto"
            onError={async () => {
              if (refreshAttempted) {
                setMediaError('Firebase Storage could not play this video after refreshing its URL. Check the file and Storage permissions.');
                return;
              }
              if (!docData?.storagePath) {
                setMediaError('This video URL is unavailable.');
                return;
              }
              try {
                setRefreshAttempted(true);
                setFreshUrl(await getFreshUrl(docData.storagePath));
              } catch (err) {
                setMediaError(err instanceof Error ? err.message : 'Could not refresh the Firebase Storage URL.');
              }
            }}
          />
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

