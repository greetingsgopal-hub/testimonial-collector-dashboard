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
}> = ({ size = 32, colorMode = 'gradient', className = '' }) => {
  const isGradient = colorMode === 'gradient';
  const isWhite = colorMode === 'white';
  const isBlack = colorMode === 'black';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Panda Praise Mark - 5-Star Testimonial Panda"
    >
      <defs>
        {/* Soft glowing violet-purple aura */}
        <linearGradient id="pp3-aura" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        {/* 5-Star Testimonial Glow */}
        <linearGradient id="pp3-star" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <linearGradient id="pp3-ear-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>

        <filter id="pp3-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Gentle Glowing Outline / Praise Halo */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke={isGradient ? 'url(#pp3-aura)' : isWhite ? '#ffffff' : isBlack ? '#18181b' : 'currentColor'}
        strokeWidth="2"
        strokeOpacity={isGradient ? 0.35 : 0.2}
      />

      {/* Cheerful Friendly Panda Ears */}
      <circle
        cx="12.5"
        cy="13.5"
        r="6.5"
        fill={isWhite ? '#ffffff' : isBlack ? '#18181b' : '#1e1b4b'}
      />
      <circle
        cx="12.5"
        cy="13.5"
        r="4"
        fill={isGradient ? 'url(#pp3-ear-glow)' : isWhite ? '#e2e8f0' : isBlack ? '#3f3f46' : '#a855f7'}
      />

      <circle
        cx="35.5"
        cy="13.5"
        r="6.5"
        fill={isWhite ? '#ffffff' : isBlack ? '#18181b' : '#1e1b4b'}
      />
      <circle
        cx="35.5"
        cy="13.5"
        r="4"
        fill={isGradient ? 'url(#pp3-ear-glow)' : isWhite ? '#e2e8f0' : isBlack ? '#3f3f46' : '#a855f7'}
      />

      {/* Friendly Rounded Panda Face Base */}
      <rect
        x="8"
        y="12"
        width="32"
        height="28"
        rx="14"
        fill={isWhite ? '#ffffff' : isBlack ? '#27272a' : '#f8fafc'}
      />

      {/* Soft Friendly Panda Eye Patches (curved, round, cheerful) */}
      <ellipse
        cx="16"
        cy="23"
        rx="5"
        ry="6"
        fill={isWhite ? '#09090b' : isBlack ? '#09090b' : '#1e1b4b'}
      />
      <ellipse
        cx="32"
        cy="23"
        rx="5"
        ry="6"
        fill={isWhite ? '#09090b' : isBlack ? '#09090b' : '#1e1b4b'}
      />

      {/* Joyful Circular Pupils with Sparkle / Catchlight */}
      <circle cx="16.5" cy="22.5" r="2.2" fill="#ffffff" />
      <circle cx="17.5" cy="21.5" r="0.9" fill="#a855f7" />
      <circle cx="31.5" cy="22.5" r="2.2" fill="#ffffff" />
      <circle cx="32.5" cy="21.5" r="0.9" fill="#a855f7" />

      {/* Cheerful Button Nose */}
      <ellipse
        cx="24"
        cy="28"
        rx="2.8"
        ry="2"
        fill={isWhite ? '#09090b' : isBlack ? '#09090b' : '#1e1b4b'}
      />

      {/* Warm Upward Smiling Mouth (Happy Panda) */}
      <path
        d="M 21.2 30.5 C 22.2 32.8 23.5 33.2 24 33.2 C 24.5 33.2 25.8 32.8 26.8 30.5"
        stroke={isWhite ? '#09090b' : isBlack ? '#09090b' : '#1e1b4b'}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* 5-Star Testimonial Praise Stars on Cheeks (Concept 3 signature) */}
      {/* Left Praise Star */}
      <path
        d="M 10 30.5 L 11.2 32.8 L 13.7 33.2 L 11.8 34.9 L 12.3 37.4 L 10 36.1 L 7.7 37.4 L 8.2 34.9 L 6.3 33.2 L 8.8 32.8 Z"
        fill={isGradient ? 'url(#pp3-star)' : isWhite ? '#ffffff' : '#f59e0b'}
        filter={isGradient ? 'url(#pp3-glow)' : undefined}
      />
      {/* Right Praise Star */}
      <path
        d="M 38 30.5 L 39.2 32.8 L 41.7 33.2 L 39.8 34.9 L 40.3 37.4 L 38 36.1 L 35.7 37.4 L 36.2 34.9 L 34.3 33.2 L 36.8 32.8 Z"
        fill={isGradient ? 'url(#pp3-star)' : isWhite ? '#ffffff' : '#f59e0b'}
        filter={isGradient ? 'url(#pp3-glow)' : undefined}
      />

      {/* Top Praise Star Crown */}
      <path
        d="M 24 2.5 L 25.4 6 L 29.2 6.5 L 26.4 9.1 L 27.2 12.8 L 24 10.9 L 20.8 12.8 L 21.6 9.1 L 18.8 6.5 L 22.6 6 Z"
        fill={isGradient ? 'url(#pp3-star)' : isWhite ? '#ffffff' : '#f59e0b'}
        filter={isGradient ? 'url(#pp3-glow)' : undefined}
      />
    </svg>
  );
};

export const PandaPraiseLogo: React.FC<PandaPraiseLogoProps> = ({
  className = '',
  variant = 'horizontal',
  colorMode = 'gradient',
  size = 'md',
}) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 24
      : size === 'md'
      ? 32
      : size === 'lg'
      ? 48
      : 64;

  if (variant === 'icon-only') {
    return <PandaPraiseIcon size={pixelSize} colorMode={colorMode} className={className} />;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs shadow-sm ${className}`}>
        <PandaPraiseIcon size={18} colorMode={colorMode} />
        <span className="font-semibold text-zinc-200 tracking-tight">
          Verified by <span className="text-white">Panda Praise</span>
        </span>
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        <PandaPraiseIcon size={pixelSize * 1.5} colorMode={colorMode} />
        <div className="flex flex-col items-center">
          <span className="font-display font-black tracking-tight text-white leading-none text-2xl">
            Panda <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Praise</span>
          </span>
          <span className="text-[10px] tracking-widest uppercase font-medium text-zinc-400 mt-1">
            Praise That Sticks
          </span>
        </div>
      </div>
    );
  }

  // Default: Horizontal lockup
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <PandaPraiseIcon size={pixelSize} colorMode={colorMode} />
      <div className="flex items-baseline gap-1">
        <span className="font-display font-extrabold text-white text-lg tracking-tight">
          Panda
        </span>
        <span className="font-display font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-lg tracking-tight">
          Praise
        </span>
      </div>
    </div>
  );
};
