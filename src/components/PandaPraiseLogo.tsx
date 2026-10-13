import React from 'react';

export interface PandaPraiseLogoProps {
  className?: string;
  variant?: 'icon-only' | 'horizontal' | 'stacked' | 'badge';
  colorMode?: 'gradient' | 'white' | 'black' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
}

export const PandaPraiseIcon: React.FC<{
  size?: number;
  colorMode?: 'gradient' | 'white' | 'black' | 'monochrome';
  className?: string;
}> = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Panda Praise Logo"
    >
      {/* Ears */}
      <circle cx="26" cy="26" r="14" fill="#0f172a" />
      <circle cx="26" cy="26" r="7.5" fill="#334155" opacity="0.35" />
      <circle cx="74" cy="26" r="14" fill="#0f172a" />
      <circle cx="74" cy="26" r="7.5" fill="#334155" opacity="0.35" />

      {/* Head */}
      <circle cx="50" cy="54" r="37" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />

      {/* Eye patches */}
      <ellipse cx="37" cy="51" rx="10" ry="13" transform="rotate(-15 37 51)" fill="#0f172a" />
      <ellipse cx="63" cy="51" rx="10" ry="13" transform="rotate(15 63 51)" fill="#0f172a" />

      {/* Eyes & Gleam */}
      <circle cx="37.5" cy="49" r="3.5" fill="#ffffff" />
      <circle cx="62.5" cy="49" r="3.5" fill="#ffffff" />
      <circle cx="39" cy="51" r="1.5" fill="#ffffff" opacity="0.8" />
      <circle cx="64" cy="51" r="1.5" fill="#ffffff" opacity="0.8" />

      {/* Nose */}
      <ellipse cx="50" cy="65" rx="6" ry="4.5" fill="#0f172a" />

      {/* Mouth */}
      <path d="M44 71 Q50 75 56 71" stroke="#0f172a" strokeWidth="2.8" fill="none" strokeLinecap="round" />

      {/* Rosy Cheeks */}
      <ellipse cx="28" cy="62" rx="4.5" ry="3" fill="#f43f5e" opacity="0.3" />
      <ellipse cx="72" cy="62" rx="4.5" ry="3" fill="#f43f5e" opacity="0.3" />
    </svg>
  );
};

export const PandaPraiseLogo: React.FC<PandaPraiseLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 32,
}) => {
  const numSize = typeof size === 'number' ? size : size === 'sm' ? 24 : size === 'lg' ? 40 : size === 'xl' ? 48 : 32;

  if (variant === 'icon-only') {
    return <PandaPraiseIcon size={numSize} className={className} />;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs shadow-xs ${className}`}>
        <PandaPraiseIcon size={18} className="shrink-0" />
        <span className="font-medium text-slate-200 tracking-tight">
          Verified by <span className="text-white font-semibold">Panda Praise</span>
        </span>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-1.5 ${className}`}>
        <PandaPraiseIcon size={numSize + 8} className="shrink-0" />
        <span className="font-bold tracking-tight text-white leading-none text-2xl">
          Panda Praise
        </span>
      </div>
    );
  }

  // Default: Horizontal lockup
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <PandaPraiseIcon size={numSize} className="shrink-0" />
      <span className="font-bold text-white text-lg tracking-tight">
        Panda Praise
      </span>
    </div>
  );
};

export default PandaPraiseLogo;
