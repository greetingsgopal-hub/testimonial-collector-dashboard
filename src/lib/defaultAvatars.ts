// ─────────────────────────────────────────────────────────────
// Default Animated Avatars (Male & Female)
// Hand-crafted modern vector SVG data URIs for instant selection
// ─────────────────────────────────────────────────────────────

export const MALE_ANIMATED_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="maleBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="maleSkin" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
  <!-- Background Badge -->
  <circle cx="60" cy="60" r="58" fill="url(#maleBg)" />
  <!-- Torso & Navy Suit -->
  <path d="M22 116 C24 90 40 80 60 80 C80 80 96 90 98 116 Z" fill="#0F172A" />
  <path d="M48 80 L60 98 L72 80 Z" fill="#F8FAFC" />
  <path d="M57 88 L63 88 L61 98 L59 98 Z" fill="#3B82F6" />
  <!-- Neck -->
  <rect x="52" y="65" width="16" height="18" rx="4" fill="#F59E0B" />
  <!-- Animated Face -->
  <ellipse cx="60" cy="50" rx="22" ry="24" fill="url(#maleSkin)" />
  <!-- Stylish Modern Animated Hair -->
  <path d="M38 46 C36 28 46 18 62 18 C78 18 84 26 82 42 C76 36 68 32 58 33 C48 34 42 38 38 46 Z" fill="#1E293B" />
  <path d="M40 38 C38 30 44 24 52 22 C48 26 46 32 48 36 Z" fill="#334155" />
  <!-- Eyebrows -->
  <path d="M46 40 Q51 37 56 40" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" fill="none" />
  <path d="M64 40 Q69 37 74 40" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" fill="none" />
  <!-- Animated Eyes with Twinkle -->
  <ellipse cx="51" cy="48" rx="3" ry="3.4" fill="#0F172A" />
  <circle cx="52" cy="47" r="1.1" fill="#FFFFFF" />
  <ellipse cx="69" cy="48" rx="3" ry="3.4" fill="#0F172A" />
  <circle cx="70" cy="47" r="1.1" fill="#FFFFFF" />
  <!-- Cheeks -->
  <ellipse cx="44" cy="55" rx="3.5" ry="2" fill="#EF4444" opacity="0.3" />
  <ellipse cx="76" cy="55" rx="3.5" ry="2" fill="#EF4444" opacity="0.3" />
  <!-- Warm Smile -->
  <path d="M53 58 Q60 67 67 58" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" fill="none" />
</svg>
`)}`;

export const FEMALE_ANIMATED_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="femBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EC4899"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
    <linearGradient id="femSkin" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FED7AA"/>
      <stop offset="100%" stop-color="#FDBA74"/>
    </linearGradient>
  </defs>
  <!-- Background Badge -->
  <circle cx="60" cy="60" r="58" fill="url(#femBg)" />
  <!-- Flowing Animated Hair Backdrop -->
  <path d="M28 46 C28 22 42 16 60 16 C78 16 92 22 92 46 C92 70 88 92 82 100 C76 92 80 74 80 66 C80 66 40 66 40 66 C40 74 44 92 38 100 C32 92 28 70 28 46 Z" fill="#312E81" />
  <!-- Torso & Stylish Violet Blouse -->
  <path d="M24 116 C26 90 42 80 60 80 C78 80 94 90 96 116 Z" fill="#7C3AED" />
  <path d="M48 80 L60 96 L72 80 Z" fill="#EDE9FE" />
  <!-- Neck -->
  <rect x="53" y="65" width="14" height="18" rx="4" fill="#FDBA74" />
  <!-- Animated Face -->
  <ellipse cx="60" cy="50" rx="20" ry="22" fill="url(#femSkin)" />
  <!-- Front Bangs -->
  <path d="M36 40 C42 28 54 24 60 24 C68 24 78 30 84 40 C76 34 68 34 60 36 C52 38 44 40 36 40 Z" fill="#312E81" />
  <!-- Eyebrows -->
  <path d="M47 41 Q52 38 56 41" stroke="#312E81" stroke-width="1.8" stroke-linecap="round" fill="none" />
  <path d="M64 41 Q68 38 73 41" stroke="#312E81" stroke-width="1.8" stroke-linecap="round" fill="none" />
  <!-- Eyelashes & Animated Eyes -->
  <path d="M46 44 L44 42" stroke="#1E1B4B" stroke-width="1.5" stroke-linecap="round" />
  <ellipse cx="51" cy="48" rx="3" ry="3.3" fill="#1E1B4B" />
  <circle cx="52" cy="47" r="1.1" fill="#FFFFFF" />
  <path d="M74 44 L76 42" stroke="#1E1B4B" stroke-width="1.5" stroke-linecap="round" />
  <ellipse cx="69" cy="48" rx="3" ry="3.3" fill="#1E1B4B" />
  <circle cx="70" cy="47" r="1.1" fill="#FFFFFF" />
  <!-- Cheeks -->
  <ellipse cx="44" cy="55" rx="3.5" ry="2" fill="#F43F5E" opacity="0.4" />
  <ellipse cx="76" cy="55" rx="3.5" ry="2" fill="#F43F5E" opacity="0.4" />
  <!-- Sweet Smile -->
  <path d="M53 58 Q60 67 67 58" stroke="#991B1B" stroke-width="2.2" stroke-linecap="round" fill="none" />
</svg>
`)}`;

export const isDefaultAvatar = (url?: string | null): 'male' | 'female' | null => {
  if (!url) return null;
  if (url === MALE_ANIMATED_AVATAR) return 'male';
  if (url === FEMALE_ANIMATED_AVATAR) return 'female';
  return null;
};
