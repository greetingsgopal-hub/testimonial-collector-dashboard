import React from 'react';
import { ArrowRight, CheckCircle2, Download, FileText, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface WelcomeViewProps {
  onOpenForm: () => void;
  onCollect: () => void;
  onImport: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onOpenForm, onCollect, onImport }) => {
  const { user } = useAuth();
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'there');

  return (
    <div className="max-w-5xl mx-auto py-6 px-2 sm:px-4 space-y-7 animate-fade-in font-sans">
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#6701e6] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Your social proof workspace
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight font-display">
          Turn customer love into proof that helps you sell.
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Collect testimonials, choose your strongest proof, then put it where future customers can see it.
          You only need to complete these three steps to get started.
        </p>
      </section>

      <section className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Getting started</p>
            <h2 className="text-lg font-bold text-gray-950 mt-1">Your first three steps</h2>
          </div>
          <span className="text-xs font-bold text-[#6701e6] bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
            0 / 3 complete
          </span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5">
            <div className="w-9 h-9 rounded-xl bg-white border border-purple-100 flex items-center justify-center mb-4">
              <FileText className="w-4 h-4 text-[#6701e6]" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#6701e6]">Step 1</p>
            <h3 className="text-sm font-bold text-gray-950 mt-1">Get your first proof</h3>
            <p className="text-xs text-gray-500 leading-relaxed mt-2">Collect a new testimonial from a customer or bring in testimonials you already have.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Step 2</p>
            <h3 className="text-sm font-bold text-gray-950 mt-1">Approve your best proof</h3>
            <p className="text-xs text-gray-500 leading-relaxed mt-2">Review what customers said and choose the testimonials you want to use publicly.</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-5">
            <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-4">
              <Star className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Step 3</p>
            <h3 className="text-sm font-bold text-gray-950 mt-1">Put your proof to work</h3>
            <p className="text-xs text-gray-500 leading-relaxed mt-2">Turn approved testimonials into website and marketing assets with Studio.</p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <button onClick={onCollect} className="group text-left bg-white border border-gray-200 hover:border-purple-300 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center"><FileText className="w-5 h-5 text-[#6701e6]" /></div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#6701e6] transition-colors" />
          </div>
          <h2 className="text-lg font-bold text-gray-950 mt-5">Collect new testimonials</h2>
          <p className="text-sm text-gray-500 leading-relaxed mt-2">Create your customer collection form and share one simple link with your customers.</p>
          <span className="inline-flex items-center gap-2 mt-5 text-xs font-bold text-[#6701e6]">Start collecting <ArrowRight className="w-3.5 h-3.5" /></span>
        </button>
        <button onClick={onImport} className="group text-left bg-white border border-gray-200 hover:border-purple-300 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all cursor-pointer">
          <div className="flex items-start justify-between gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center"><Download className="w-5 h-5 text-gray-600" /></div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#6701e6] transition-colors" />
          </div>
          <h2 className="text-lg font-bold text-gray-950 mt-5">Import existing proof</h2>
          <p className="text-sm text-gray-500 leading-relaxed mt-2">Already have reviews or testimonials? Bring them into Panda Praise instead of waiting for new ones.</p>
          <span className="inline-flex items-center gap-2 mt-5 text-xs font-bold text-[#6701e6]">Import my proof <ArrowRight className="w-3.5 h-3.5" /></span>
        </button>
      </section>

      <section className="bg-gray-950 text-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold">Want to see your customer form first?</p>
          <p className="text-xs text-gray-400 mt-1">Preview exactly what your customers will see before sharing it.</p>
        </div>
        <button onClick={onOpenForm} className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-950 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer">
          Preview my form <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
};

export default WelcomeView;
