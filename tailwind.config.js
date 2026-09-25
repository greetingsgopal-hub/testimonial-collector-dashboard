/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        senja: {
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
          light: '#6366f1',
          beam: '#a5b4fc',
          bg: '#ffffff',
          card: '#ffffff',
          cardHover: '#f8fafc',
          border: '#e2e8f0',
          accent: '#f59e0b',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Inter', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"DM Sans"', 'sans-serif'],
        bricolage: ['"Bricolage Grotesque"', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
        dmsans: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 35px -5px rgba(79, 70, 229, 0.35)',
        'glow-sm': '0 0 20px -3px rgba(79, 70, 229, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'senja-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'senja-md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'senja-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'senja-gradient-1': 'radial-gradient(1120px 384px at 50% -96px, rgba(79, 70, 229, 0.07), rgba(255, 255, 255, 0))',
        'senja-gradient-4': 'radial-gradient(960px 416px at 50% 130%, rgba(99, 102, 241, 0.35), rgba(255, 255, 255, 0) 70%), radial-gradient(672px 288px at 8% -30%, rgba(79, 70, 229, 0.4), rgba(255, 255, 255, 0) 70%)',
        'senja-gradient-btn': 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
