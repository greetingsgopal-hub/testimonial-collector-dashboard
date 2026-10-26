import React from "react";

export const Skeleton = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-white/[0.06] rounded-[16px] overflow-hidden relative ${className}`} style={style}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shimmer_1.5s_infinite]" />
  </div>
);

export const CardSkeleton = () => (
  <div className="p-4 rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] space-y-3">
    <div className="flex gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-16 w-full rounded-[12px]" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-8 w-8 rounded-full ml-auto" />
    </div>
  </div>
);

export default Skeleton;
