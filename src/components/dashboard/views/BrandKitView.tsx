import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, Crown, Plus } from 'lucide-react';

export const BrandKitView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* Header (Matches Senja 03:52) */}
      <div className="text-center space-y-2 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6701e6] flex items-center justify-center mx-auto border border-purple-100 shadow-2xs">
          <Palette className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">
          Save and reuse your brand assets with the Brand Kit
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          Manage all your logos, spokesperson avatars, colors, fonts, image templates, and voices across Panda Praise. Available on Panda Praise paid plans.
        </p>
        <div className="pt-2">
          <Link
            to="/onboarding/upgrade"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black hover:bg-gray-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Upgrade now</span>
          </Link>
        </div>
      </div>

      {/* Brand Asset Mock Showcase (Matches Senja 03:52) */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl mx-auto">
        
        {/* Logos */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-700">Logos</span>
          <div className="flex items-center gap-3">
            <div className="w-20 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
              <span className="font-extrabold text-xs text-[#6701e6]">LOGO</span>
            </div>
            <div className="w-20 h-16 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 text-[10px]">
              <Plus className="w-4 h-4 mb-0.5" />
              <span>Add new</span>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-700">Colors</span>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-2 rounded-xl border border-gray-200 bg-white space-y-1">
              <div className="h-10 rounded-lg bg-[#6701E6]"></div>
              <span className="block text-[10px] font-mono font-bold text-gray-700">#6701E6</span>
            </div>
            <div className="p-2 rounded-xl border border-gray-200 bg-white space-y-1">
              <div className="h-10 rounded-lg bg-[#27272A]"></div>
              <span className="block text-[10px] font-mono font-bold text-gray-700">#27272A</span>
            </div>
            <div className="p-2 rounded-xl border border-gray-200 bg-white space-y-1">
              <div className="h-10 rounded-lg bg-[#E2E8F0]"></div>
              <span className="block text-[10px] font-mono font-bold text-gray-700">#E2E8F0</span>
            </div>
            <div className="p-2 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 text-[10px]">
              <Plus className="w-4 h-4 mb-0.5" />
              <span>Add color</span>
            </div>
          </div>
        </div>

        {/* Fonts */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-700">Typography</span>
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-900">Inter & Plus Jakarta Sans</span>
            <span className="text-[10px] text-gray-400">Primary Font</span>
          </div>
        </div>

      </div>

    </div>
  );
};
