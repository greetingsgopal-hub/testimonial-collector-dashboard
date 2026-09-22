import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Send, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface WelcomeViewProps {
  onOpenForm: () => void;
  onSendInvites: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onOpenForm, onSendInvites }) => {
  const { user } = useAuth();
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Founder');

  useEffect(() => {
    // Confetti celebration burst on load (matches 02:20 in video)
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6701e6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-display flex items-center justify-center gap-2">
          <span>Welcome to Panda Praise, {displayName}</span>
          <span>👋</span>
        </h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto">
          We've set everything up. Now let's get you testimonials.
        </p>
      </div>

      {/* Embedded Video Player Container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-950 aspect-video max-w-2xl mx-auto group">
        <video
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&auto=format&fit=crop&q=80"
          controls
          playsInline
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Overlay Info */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quickstart Video: 2 minutes to your first testimonial</span>
        </div>
      </div>

      {/* Form Status Card & Action Bar */}
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Your form is live — now invite your customers</span>
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Panda Praise will send each of them a friendly email asking for a testimonial.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onSendInvites}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs hover:shadow flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send your first invites</span>
          </button>

          <button
            onClick={onOpenForm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>Open your form</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Quick Checklist */}
      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-2xs space-y-1">
          <div className="text-[#6701e6] font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Step 1
          </div>
          <p className="text-xs font-semibold text-gray-900">Custom Form Ready</p>
          <p className="text-[11px] text-gray-500">Optimized for high conversion</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-2xs space-y-1">
          <div className="text-[#6701e6] font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-600" /> Step 2
          </div>
          <p className="text-xs font-semibold text-gray-900">Send First Invites</p>
          <p className="text-[11px] text-gray-500">Reach 5 happy clients</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-2xs space-y-1">
          <div className="text-gray-400 font-bold text-xs flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">3</span> Step 3
          </div>
          <p className="text-xs font-semibold text-gray-900">Embed Widget</p>
          <p className="text-[11px] text-gray-500">Display proof on your site</p>
        </div>
      </div>

    </div>
  );
};
