
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-white/[0.06] rounded-[12px] ${className}`} />
);
export const KpiSkeleton = () => <Skeleton className="h-[88px] w-full" />;
