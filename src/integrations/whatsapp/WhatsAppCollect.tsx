import React, { useState } from "react";
import { Link } from "react-router-dom";

// Phase 2: COLLECT - WhatsApp UI Incoming, No app, no link
export const WhatsAppCollect: React.FC = () => {
  const [incoming, setIncoming] = useState<any[]>([
    { 
      id: 'w1', 
      from: '+91 98*** ****12', 
      name: 'Ananya S.', 
      type: 'video', 
      duration: '0:09', 
      time: '2m ago', 
      status: 'new', 
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' 
    },
    { 
      id: 'w2', 
      from: '+91 98*** ****45', 
      name: 'Rahul M.', 
      type: 'video', 
      duration: '0:12', 
      time: '12m ago', 
      status: 'approved', 
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' 
    },
  ]);

  const [imported, setImported] = useState(false);

  const handleImport = () => {
    setIncoming(prev => prev.map(m => ({ ...m, status: 'approved' })));
    setImported(true);
    setTimeout(() => setImported(false), 3000);
  };
  
  return (
    <div className="rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] p-6 max-w-[480px]">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[11px] tracking-widest text-white/40 font-mono">02</div>
        <div className="text-[10px] px-2 py-1 rounded-full bg-white/[0.06] border border-white/[0.06] font-mono">
          WHATSAPP UI • INCOMING
        </div>
      </div>
      <h3 className="text-[14px] font-semibold tracking-[0.1em] text-white">COLLECT</h3>
      <p className="mt-2 text-[13px] text-white/50 leading-[1.5]">
        Customers reply with video on WhatsApp. No app, no link.
      </p>
      
      <div className="mt-5 space-y-2">
        {incoming.map(msg => (
          <div key={msg.id} className="flex gap-3 p-3 rounded-[14px] bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
            <div className="relative h-12 w-12 rounded-[12px] overflow-hidden bg-black shrink-0">
              <img src={msg.thumbnail} alt={msg.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded tabular-nums font-mono">
                {msg.duration}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <div className="text-[13px] font-medium text-white truncate">{msg.name}</div>
                <div className="text-[10px] text-white/30 tabular-nums">{msg.time}</div>
              </div>
              <div className="text-[11px] text-white/40">{msg.from} • VIDEO</div>
              <div className="mt-1 flex gap-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                  msg.status === 'new' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {msg.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex gap-2">
        <button 
          onClick={handleImport}
          className="flex-1 h-9 rounded-full bg-white text-black text-[12px] font-semibold hover:bg-white/90 active:scale-95 transition-all"
        >
          {imported ? '✓ Imported to Inbox!' : 'Import to Inbox →'}
        </button>
        <Link 
          to="/moderation" 
          className="h-9 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.10] text-white text-[12px] font-medium flex items-center justify-center transition-all"
        >
          Inbox
        </Link>
      </div>
      
      <div className="mt-3 text-[11px] text-white/30 leading-relaxed">
        Webhook: <code className="font-mono text-white/50">POST /api/whatsapp/incoming</code> • Auto-creates testimonial with source=whatsapp
      </div>
    </div>
  );
};

export default WhatsAppCollect;
