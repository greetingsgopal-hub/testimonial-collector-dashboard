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
}> = () => {
  return null;
};

export const PandaPraiseLogo: React.FC<PandaPraiseLogoProps> = ({
  className = '',
  variant = 'horizontal',
}) => {
  if (variant === 'icon-only') {
    return null;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs shadow-xs ${className}`}>
        <span className="font-medium text-slate-200 tracking-tight">
          Verified by <span className="text-white font-semibold">Panda Praise</span>
        </span>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-1 ${className}`}>
        <span className="font-bold tracking-tight text-white leading-none text-2xl">
          Panda Praise
        </span>
      </div>
    );
  }

  // Default: Horizontal lockup
  return (
    <div className={`inline-flex items-center ${className}`}>
      <span className="font-bold text-white text-lg tracking-tight">
        Panda Praise
      </span>
    </div>
  );
};
