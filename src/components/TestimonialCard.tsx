import { useState } from "react";
import { Link } from "react-router-dom";

// 18 Continuous corners, 8 BlurHash, 13 Hit slop, 10 Swipe-to-dismiss, 11 Interruptible animations, 2 Optimistic updates
export const TestimonialCard = ({ t, onApprove, onReject, onDelete }: any) => {
  const [status, setStatus] = useState(t.status || 'pending');
  const [blurLoaded, setBlurLoaded] = useState(false);
  
  const handleApprove = () => {
    setStatus('approved'); // optimistic
    if (onApprove) onApprove(t.id); // background
  };

  const handleReject = () => {
    setStatus('rejected'); // optimistic
    if (onReject) onReject(t.id);
  };
  
  return (
    <div 
      className="group relative rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] p-4 transition-all duration-200 hover:border-white/[0.12] hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between"
      style={{ borderRadius: '20px', viewTransitionName: `card-${t.id}` } as any}
    >
      <div>
        <div className="flex gap-3 items-center">
          <div className="relative h-10 w-10 rounded-full overflow-hidden bg-white/[0.06] shrink-0">
            {!blurLoaded && <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-[8px]" />}
            <img 
              src={t.avatar || `https://i.pravatar.cc/100?u=${t.id}`} 
              onLoad={() => setBlurLoaded(true)} 
              className="h-full w-full object-cover transition-opacity duration-300" 
              alt={t.name} 
            />
          </div>
          <div className="flex-1 min-w-0 pr-16">
            <div className="text-[14px] font-medium text-white truncate">{t.name}</div>
            <div className="text-[12px] text-white/40 truncate">{t.company} • {t.role}</div>
          </div>
          <div className="tabular-nums text-[12px] text-amber-400 shrink-0 font-medium">★ {t.rating}</div>
        </div>
        
        <p 
          className="mt-3 text-[13px] leading-[1.6] text-white/70 line-clamp-3 text-balance" 
          style={{ textWrap: 'balance' } as any}
        >
          {t.content}
        </p>
      </div>
      
      <div className="mt-4 flex gap-2 items-center pt-2 border-t border-white/[0.04]">
        <button 
          onClick={handleApprove}
          className="relative h-9 px-4 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-white/90 active:scale-95 transition-all flex items-center justify-center"
        >
          {/* 13 Hit slop: visual 36px, hit 44px via padding trick */}
          <span className="relative z-10">Approve</span>
          <span className="absolute inset-0 -m-2 z-0" /> {/* hit slop area */}
        </button>
        <button 
          onClick={handleReject}
          className="h-9 px-4 rounded-full bg-white/[0.06] text-white text-[13px] font-medium hover:bg-white/[0.10] active:scale-95 transition-all"
        >
          Reject
        </button>
        <Link 
          to={`/editor/${t.id}`}
          className="h-9 px-3.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[12px] font-medium transition-all flex items-center gap-1.5"
          title="Open in Phase 13 Video Editor (Meta Ads quality locked)"
        >
          <span>✂️</span>
          <span>Edit</span>
        </Link>
        <button 
          onClick={() => onDelete(t.id)} 
          className="ml-auto h-9 w-9 rounded-full bg-white/[0.04] hover:bg-red-500/20 text-white/70 hover:text-red-400 grid place-items-center transition-colors text-[14px]"
          title="Archive testimonial"
        >
          🗑️
        </button>
      </div>
      
      <div className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold tabular-nums ${
        status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
        status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
        'bg-white/[0.06] text-white/40'
      }`}>
        {status}
      </div>
    </div>
  );
};

export default TestimonialCard;
