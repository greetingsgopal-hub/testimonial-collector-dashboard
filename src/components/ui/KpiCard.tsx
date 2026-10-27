
// Tabular nums + continuous corners + hit slop
export const KpiCard = ({ label, value, sub }: any) => (
  <div className="rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] p-4" style={{ borderRadius: '20px' }}>
    <div className="text-[11px] tracking-widest text-white/40 uppercase">{label}</div>
    <div className="mt-2 text-[24px] font-semibold tabular-nums text-white tracking-tight">{value}</div>
    <div className="text-[11px] text-white/30 tabular-nums">{sub}</div>
  </div>
);
