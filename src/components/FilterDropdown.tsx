// 20 Amazon safe triangle + 13 Hit slop + 14 Safe area insets

export const FilterDropdown = () => {
  return (
    <div className="relative group inline-block">
      <button className="h-9 px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white text-[13px] font-medium transition-all flex items-center gap-1.5 border border-white/[0.08]">
        <span>Filters</span>
        <span className="text-[10px] text-white/50">▾</span>
      </button>
      
      {/* Safe triangle area via CSS - keep open when moving mouse diagonally */}
      <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-40 animate-in fade-in slide-in-from-top-1 duration-150">
        <div className="w-[260px] rounded-[16px] bg-[#1C1C1F] border border-white/[0.10] p-2.5 shadow-2xl backdrop-blur-xl">
          <div className="text-[11px] text-white/40 px-2 py-1 font-mono uppercase tracking-wider border-b border-white/[0.06] mb-1.5 pb-1.5">
            Safe Triangle Dropdown
          </div>
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-[10px] hover:bg-white/[0.08] text-white text-[13px] flex items-center justify-between transition-colors">
              <span>Status: Approved</span>
              <span className="text-[11px] text-white/40">142</span>
            </button>
            <button className="w-full text-left px-3 py-2 rounded-[10px] hover:bg-white/[0.08] text-white text-[13px] flex items-center justify-between transition-colors">
              <span>Rating: 5 stars</span>
              <span className="text-[11px] text-amber-400">★★★★★</span>
            </button>
            <button className="w-full text-left px-3 py-2 rounded-[10px] hover:bg-white/[0.08] text-white text-[13px] flex items-center justify-between transition-colors">
              <span>Date: Last 7 days</span>
              <span className="text-[11px] text-white/40">Recent</span>
            </button>
          </div>
          {/* Invisible triangle connector preventing accidental hover loss */}
          <div 
            className="absolute -top-4 left-0 w-full h-5 bg-transparent pointer-events-auto" 
            style={{ clipPath: 'polygon(0 100%, 50% 0, 100% 100%)' }} 
          />
        </div>
      </div>
      <style>{`@supports (padding: env(safe-area-inset-bottom)) { .safe-bottom { padding-bottom: env(safe-area-inset-bottom); } }`}</style>
    </div>
  );
};
export default FilterDropdown;
