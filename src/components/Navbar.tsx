import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <a href="/" className="flex items-center gap-2.5 cursor-pointer">
          <span className="text-2xl">🐼</span>
          <span className="font-black text-lg tracking-tight text-white">
            Panda<span className="text-emerald-400">Praise</span>
          </span>
        </a>

        {/* Streamlined Nav Links (Hidden on small screens, clean spacing on desktop) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-gray-300">
          <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it works</a>
          <a href="#transformation" className="hover:text-emerald-400 transition-colors">Transformation</a>
          <a href="#customers" className="hover:text-emerald-400 transition-colors">Customers</a>
          <a href="#why-video-editor" className="hover:text-emerald-400 transition-colors text-emerald-400">Why not video editor?</a>
          <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
        </nav>

        {/* Action Buttons & Auth Group */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="hidden sm:inline-flex text-xs font-medium text-gray-400 hover:text-white px-3 py-2 transition-colors"
          >
            Log in
          </a>

          <a
            href="/studio"
            className="text-xs font-semibold text-gray-300 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 px-3.5 py-2 rounded-xl transition-all"
          >
            Shopify Flow
          </a>

          <a
            href="#checkout"
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all transform hover:scale-[1.02]"
          >
            <span>Get 5 Ads for ₹1,500</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
