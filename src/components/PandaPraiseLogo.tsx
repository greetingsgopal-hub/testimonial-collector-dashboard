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

  const ringColor = isGradient
    ? 'url(#pp-ring-grad)'
    : isWhite
    ? '#ffffff'
    : isBlack
    ? '#09090b'
    : 'currentColor';

  const starColor = isGradient
    ? 'url(#pp-star-grad)'
    : isWhite
    ? '#ffffff'
    : isBlack
    ? '#09090b'
    : 'currentColor';

  const featureColor = isGradient
    ? '#c084fc'
    : isWhite
    ? '#ffffff'
    : isBlack
    ? '#09090b'
    : 'currentColor';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Panda Praise Mark"
    >
      <defs>
        <linearGradient id="pp-ring-grad" x1="6" y1="42" x2="42" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="pp-star-grad" x1="20" y1="3" x2="28" y2="13" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="pp-star-glow" x="14" y="0" width="20" height="20" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Verification Badge Ring / Crest */}
      <path
        d="M 17 9.5 A 19 19 0 1 0 31 9.5"
        stroke={ringColor}
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Geometric Panda Ears */}
      <circle cx="15" cy="16" r="4" fill={featureColor} />
      <circle cx="33" cy="16" r="4" fill={featureColor} />

      {/* Characteristic Angled Panda Eye Patches */}
      <rect
        x="15.8"
        y="22.5"
        width="5"
        height="8"
        rx="2.5"
        transform="rotate(-18 18.3 26.5)"
        fill={featureColor}
      />
      <rect
        x="27.2"
        y="22.5"
        width="5"
        height="8"
        rx="2.5"
        transform="rotate(18 29.7 26.5)"
        fill={featureColor}
      />

      {/* Subtle Inner Pupil Highlights */}
      <circle cx="19.2" cy="25" r="1" fill="#09090b" opacity={isBlack ? 0.3 : 0.85} />
      <circle cx="28.8" cy="25" r="1" fill="#09090b" opacity={isBlack ? 0.3 : 0.85} />

      {/* Minimal Nose Mark */}
      <path
        d="M 22.5 33.5 C 23.2 33 24.8 33 25.5 33.5 C 25.2 34.5 22.8 34.5 22.5 33.5 Z"
        fill={featureColor}
        opacity="0.8"
      />

      {/* 4-Point Praise Star Crown */}
      <path
        d="M 24 1.5 Q 24 7 28.5 7 Q 24 7 24 12.5 Q 24 7 19.5 7 Q 24 7 24 1.5 Z"
        fill={starColor}
        filter={isGradient ? 'url(#pp-star-glow)' : undefined}
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
