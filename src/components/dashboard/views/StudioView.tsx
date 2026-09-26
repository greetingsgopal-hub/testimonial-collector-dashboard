import React from 'react';
import {
  Sparkles,
  LayoutGrid,
  Video,
  Layers,
  Image as ImageIcon,
  Heart,
  FileCheck,
  FolderPlus,
  Bot,
} from 'lucide-react';

interface StudioViewProps {
  onOpenWidgetCreator?: () => void;
  onOpenSocialCard?: () => void;
  onOpenWallOfLove?: () => void;
  approvedCount?: number;
  onOpenProof?: () => void;
  onCollect?: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  onOpenWidgetCreator,
  onOpenSocialCard,
  onOpenWallOfLove,
  approvedCount = 0,
  onOpenProof,
  onCollect,
}) => {

  const handlePublishSetup = () => {
    const projectId = window.location.pathname + window.location.host;
    localStorage.setItem(`panda-praise:publish-complete:${projectId}`, new Date().toISOString());
    window.dispatchEvent(new CustomEvent('panda-praise:publish-complete'));
  };

  const studioOptions = [
    { id: 'widget', label: 'Widget', icon: LayoutGrid, action: onOpenWidgetCreator },
    { id: 'social-video', label: 'Social Video', icon: Video, action: onOpenSocialCard },
    { id: 'popup', label: 'Popup', icon: Layers, action: onOpenWidgetCreator },
    { id: 'video-embed', label: 'Video embed', icon: Video, action: onOpenWidgetCreator },
    { id: 'image', label: 'Image', icon: ImageIcon, action: onOpenSocialCard },
    { id: 'wall-of-love', label: 'Wall of Love', icon: Heart, action: onOpenWallOfLove },
    { id: 'case-study', label: 'Case study', icon: FileCheck, action: onOpenSocialCard },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 font-sans">
      
      {/* Studio Header (Matches Senja 03:32) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">
            Social Proof Studio
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Turn approved testimonials into website and marketing assets.
          </p>
        </div>

        <button
          onClick={onOpenSocialCard}
          className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Bot className="w-4 h-4" />
          <span>Use Panda Praise with AI</span>
        </button>
      </div>

      {approvedCount === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-gray-900">Approve a testimonial before creating an asset</p>
            <p className="text-xs text-gray-600 mt-1">Studio uses approved proof. Go to your proof library, approve one, then come back here.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onOpenProof} className="px-3.5 py-2 rounded-xl bg-[#6701e6] text-white text-xs font-bold hover:bg-[#5200bd] cursor-pointer">Review proof</button>
            <button onClick={onCollect} className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 cursor-pointer">Collect proof</button>
          </div>
        </div>
      )}

      {/* Creation Quick Options Grid (Matches Senja 03:32) */
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {studioOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              onClick={approvedCount > 0 ? opt.action : undefined}
              className={`p-3.5 rounded-2xl bg-white border transition-all flex items-center gap-2 text-xs font-bold shadow-2xs group ${approvedCount > 0 ? 'border-gray-200 hover:border-[#6701e6] hover:bg-purple-50/30 text-gray-800 hover:shadow-xs cursor-pointer' : 'border-gray-200 text-gray-400 opacity-60 cursor-not-allowed'}`}
            >
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-[#6701e6] flex items-center justify-center shrink-0 group-hover:bg-[#6701e6] group-hover:text-white transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">+{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Saved Creations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-gray-900 font-display">Your Saved</h2>
            <p className="text-xs text-gray-400">Create a widget, Wall of Love, social asset or other proof asset. Your saved creations will appear here.</p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer">
              <span>All Saved</span>
            </button>
            <button className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer">
              <FolderPlus className="w-3.5 h-3.5 text-gray-400" />
              <span>New folder</span>
            </button>
          </div>
        </div>

        {/* Empty State (Matches Senja 03:32) */}
        <div className="p-16 rounded-3xl bg-white border border-dashed border-gray-300 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-[#6701e6] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-gray-800">Put your proof to work.</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            Choose an asset above, then select the approved testimonials you want customers to see.
          </p>
        </div>
      </div>

    </div>
  );
};
