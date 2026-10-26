// 3 Command menu + 4 Shortcut hints
import { useEffect, useState } from "react";

export const CommandMenu = ({ onAction }: { onAction: (a: string) => void }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger single-key shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        return;
      }
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (!isInput) {
        if (e.key.toLowerCase() === 'a') onAction('approve'); // shortcut hints
        if (e.key.toLowerCase() === 'r') onAction('reject');
        if (e.key.toLowerCase() === 'j') onAction('next');
        if (e.key.toLowerCase() === 'k' && !(e.metaKey || e.ctrlKey)) onAction('prev');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onAction]);
  
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 animate-in fade-in duration-150"
      onClick={() => setOpen(false)}
    >
      <div 
        className="w-full max-w-[480px] rounded-[20px] bg-[#1C1C1F] border border-white/[0.10] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input 
          autoFocus 
          placeholder="Type command… (A=Approve, R=Reject, J/K navigate)" 
          className="w-full h-12 px-4 bg-transparent text-white placeholder:text-white/30 outline-none border-b border-white/[0.06] text-[14px]" 
        />
        <div className="p-3 text-[12px] text-white/50 flex flex-wrap gap-2 items-center justify-between bg-black/20">
          <span>⌘K to close</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">A</kbd> Approve</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">R</kbd> Reject</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">J/K</kbd> Next/Prev</span>
        </div>
      </div>
    </div>
  );
};
export default CommandMenu;
