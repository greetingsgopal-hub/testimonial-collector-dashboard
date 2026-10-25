import React, { useState } from 'react';

export interface NavbarProps {
  variant?: 'light' | 'dark';
}

export const Navbar: React.FC<NavbarProps> = ({ variant = 'light' }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLight = variant === 'light';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isLight
          ? 'border-b border-[#efefef] bg-[#faf9f7]/90 backdrop-blur-md text-[#121722] shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
          : 'border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2.5 cursor-pointer shrink-0">
          <span className="text-2xl" role="img" aria-label="Panda">🐼</span>
          <span className={`font-black text-lg tracking-tight ${isLight ? 'text-[#121722]' : 'text-white'}`}>
            Panda<span className="text-[#0068f9]">Praise</span>
          </span>
        </a>

        {/* Streamlined Nav Links for Desktop */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold">
          <a
            href="#how-it-works"
            className={`${isLight ? 'text-[#121722]/80 hover:text-[#0068f9]' : 'text-gray-300 hover:text-white'} transition-colors`}
          >
            How it works
          </a>
          <a
            href="#transformation"
            className={`${isLight ? 'text-[#121722]/80 hover:text-[#0068f9]' : 'text-gray-300 hover:text-white'} transition-colors`}
          >
            Transformation
          </a>
          <a
            href="#customers"
            className={`${isLight ? 'text-[#121722]/80 hover:text-[#0068f9]' : 'text-gray-300 hover:text-white'} transition-colors`}
          >
            Customers
          </a>
          <a
            href="#why-video-editor"
            className={`transition-all px-3 py-1 rounded-full text-xs font-semibold ${
              isLight
                ? 'bg-[#0068f9]/10 text-[#0068f9] hover:bg-[#0068f9]/15 border border-[#0068f9]/20'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
            }`}
          >
            Why not video editor?
          </a>
          <a
            href="#pricing"
            className={`${isLight ? 'text-[#121722]/80 hover:text-[#0068f9]' : 'text-gray-300 hover:text-white'} transition-colors`}
          >
            Pricing
          </a>
          <a
            href="#faq"
            className={`${isLight ? 'text-[#121722]/80 hover:text-[#0068f9]' : 'text-gray-300 hover:text-white'} transition-colors`}
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons & Auth Group */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className={`hidden sm:inline-flex text-xs font-semibold px-3 py-2 transition-colors ${
              isLight ? 'text-[#777c86] hover:text-[#121722]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Log in
          </a>

          <a
            href="/studio"
            className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs ${
              isLight
                ? 'bg-white border border-[#e5e7eb] text-[#121722] hover:bg-slate-50 hover:border-[#cbd5e1]'
                : 'bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700'
            }`}
          >
            Shopify Flow
          </a>

          <a
            href="#checkout"
            className={`inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-md ${
              isLight
                ? 'text-white bg-[#0068f9] hover:bg-[#024bb1] shadow-blue-500/20'
                : 'text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-900/30'
            }`}
          >
            <span>Get 5 Ads for ₹1,500</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isLight ? 'text-[#121722] hover:bg-black/5' : 'text-gray-300 hover:bg-white/10'
            }`}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden border-t px-4 py-4 space-y-3 transition-all ${
            isLight ? 'border-[#efefef] bg-[#faf9f7]' : 'border-gray-800 bg-gray-950'
          }`}
        >
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-xs font-semibold py-1.5 ${isLight ? 'text-[#121722]' : 'text-gray-300'}`}
          >
            How it works
          </a>
          <a
            href="#transformation"
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-xs font-semibold py-1.5 ${isLight ? 'text-[#121722]' : 'text-gray-300'}`}
          >
            Transformation
          </a>
          <a
            href="#customers"
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-xs font-semibold py-1.5 ${isLight ? 'text-[#121722]' : 'text-gray-300'}`}
          >
            Customers
          </a>
          <a
            href="#why-video-editor"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold py-1.5 text-[#0068f9]"
          >
            Why not video editor?
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-xs font-semibold py-1.5 ${isLight ? 'text-[#121722]' : 'text-gray-300'}`}
          >
            Pricing
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className={`block text-xs font-semibold py-1.5 ${isLight ? 'text-[#121722]' : 'text-gray-300'}`}
          >
            FAQ
          </a>
          <a
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold py-1.5 text-[#777c86]"
          >
            Log in
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
