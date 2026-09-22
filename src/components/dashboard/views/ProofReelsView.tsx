import React from 'react';
import { Video, Plus } from 'lucide-react';

interface ProofReelsViewProps {
  onCollectVideo?: () => void;
}

export const ProofReelsView: React.FC<ProofReelsViewProps> = ({ onCollectVideo }) => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* Header (Matches Senja 03:42) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">Proof Reels</h1>
          <p className="text-xs text-gray-500 mt-1">
            Reels are cut from captioned video testimonials - collect or upload a few to start
          </p>
        </div>

        <button
          onClick={onCollectVideo}
          className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Make a reel</span>
        </button>
      </div>

      {/* Your Reels Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Your reels</h3>

        {/* Empty State Cards (Matches Senja 03:42) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={onCollectVideo}
            className="p-8 rounded-2xl bg-white border border-dashed border-gray-300 hover:border-[#6701e6] hover:bg-purple-50/20 transition-all flex flex-col items-center justify-center text-center space-y-3 cursor-pointer group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6701e6] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 group-hover:text-[#6701e6] transition-colors">
                Collect a video testimonial first
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Prompt clients to record a 30s video
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
