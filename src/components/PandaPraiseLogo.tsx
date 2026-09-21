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
      <div className={`inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs shadow-sm ${className}`}>
        <span className="font-semibold text-zinc-200 tracking-tight font-display">
          Verified by <span className="text-white font-bold">Panda Praise</span>
        </span>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-1 ${className}`}>
        <span className="font-display font-extrabold tracking-tight text-white leading-none text-2xl">
          Panda Praise
        </span>
      </div>
    );
  }

  // Default: Horizontal lockup
  return (
    <div className={`inline-flex items-center ${className}`}>
      <span className="font-display font-extrabold text-white text-lg tracking-tight">
        Panda Praise
      </span>
    </div>
  );
};
