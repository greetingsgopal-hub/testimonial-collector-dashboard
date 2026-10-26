// 16. Tabular numbers + 18. Continuous corners + 1. Skeleton

export const KpiCard = ({ label, value, sub, loading }: { label: string; value: string | number; sub?: string; loading?: boolean }) => {
  if (loading) return <div className="h-[92px] rounded-[20px] bg-[#1C1C1F] animate-pulse border border-white/[0.04]" />;
  
  return (
    <div 
      className="rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] p-4 transition-all duration-200 hover:border-white/[0.12] hover:bg-[#202024]" 
      style={{ borderRadius: '20px' /* continuous corners squircle */ }}
    >
      <div className="text-[11px] tracking-widest text-white/40 uppercase font-medium">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div 
          className="text-[28px] font-semibold text-white tracking-tight tabular-nums" 
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </div>
        {sub && <div className="text-[12px] text-white/50 font-medium tabular-nums">{sub}</div>}
      </div>
    </div>
  );
};
export default KpiCard;
