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
          50: '#f7f1fe',
          100: '#eee2fd',
          200: '#d8bbfb',
          300: '#bc85fe',
          400: '#943dff',
          500: '#7301fe',
          600: '#6701e6',
          700: '#4e01ad',
          800: '#3c0184',
          900: '#2f085e',
          950: '#1e053d',
        },
        senja: {
          DEFAULT: '#6701e6',
          dark: '#5400bd',
          light: '#9954f2',
          beam: '#cba3ff',
          bg: '#0b0b0f',
          card: '#13131a',
          cardHover: '#181824',
          border: '#272738',
          accent: '#ffbf00',
        },
        secondary: {
          50: '#fefbf0',
          100: '#fdf7e2',
          200: '#fbebbb',
          300: '#ffe085',
          400: '#ffcd36',
          500: '#ffbf00',
          600: '#d6a100',
          700: '#ad8200',
          800: '#856300',
          900: '#5e4908',
          950: '#3d2f05',
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
        'glow': '0 0 35px -5px rgba(103, 1, 230, 0.35)',
        'glow-sm': '0 0 20px -3px rgba(103, 1, 230, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'senja-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'senja-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'senja-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      backgroundImage: {
        'senja-gradient-1': 'radial-gradient(1120px 384px at 50% -96px, rgba(103, 1, 230, 0.07), rgba(0, 0, 0, 0))',
        'senja-gradient-4': 'radial-gradient(960px 416px at 50% 130%, rgba(145, 56, 255, 0.55), rgba(0, 0, 0, 0) 70%), radial-gradient(672px 288px at 8% -30%, rgba(73, 1, 164, 0.65), rgba(0, 0, 0, 0) 70%)',
        'senja-gradient-btn': 'linear-gradient(180deg, #9954f2 0%, #6701e6 100%)',
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
