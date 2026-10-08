import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ArrowRight, 
} from 'lucide-react';
import { ImportModal } from '../ImportModal';

export { ImportModal } from '../ImportModal';

interface PlatformItem {
  id: string;
  name: string;
  category: 'Available now' | 'Coming soon';
  type: 'url' | 'api';
  icon: string;
  color: string;
}

const PLATFORMS: PlatformItem[] = [
  { id: 'google', name: 'Google Reviews', category: 'Available now', type: 'url', icon: 'https://www.google.com/favicon.ico', color: '#4285F4' },
  { id: 'facebook', name: 'Facebook Page', category: 'Available now', type: 'url', icon: 'https://facebook.com/favicon.ico', color: '#1877F2' },
  { id: 'trustpilot', name: 'Trustpilot', category: 'Available now', type: 'url', icon: 'https://www.trustpilot.com/favicon.ico', color: '#00B67A' },
  { id: 'appstore', name: 'App Store', category: 'Available now', type: 'url', icon: 'https://www.apple.com/favicon.ico', color: '#0070c9' },
  { id: 'producthunt', name: 'Product Hunt', category: 'Available now', type: 'url', icon: 'https://www.producthunt.com/favicon.ico', color: '#DA552F' },
  { id: 'g2', name: 'G2', category: 'Available now', type: 'url', icon: 'https://www.g2.com/favicon.ico', color: '#FF492C' },
  { id: 'capterra', name: 'Capterra', category: 'Available now', type: 'url', icon: 'https://www.capterra.com/favicon.ico', color: '#00587C' },
  { id: 'yelp', name: 'Yelp', category: 'Available now', type: 'url', icon: 'https://www.yelp.com/favicon.ico', color: '#D32323' },
  { id: 'playstore', name: 'Google Play', category: 'Available now', type: 'url', icon: 'https://play.google.com/favicon.ico', color: '#01875f' },
  { id: 'twitter', name: 'Twitter / X', category: 'Available now', type: 'url', icon: 'https://twitter.com/favicon.ico', color: '#000000' },
  { id: 'reddit', name: 'Reddit', category: 'Available now', type: 'url', icon: 'https://www.reddit.com/favicon.ico', color: '#FF4500' },
  { id: 'instagram', name: 'Instagram', category: 'Available now', type: 'url', icon: 'https://instagram.com/favicon.ico', color: '#E4405F' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Available now', type: 'url', icon: 'https://www.linkedin.com/favicon.ico', color: '#0A66C2' },
  { id: 'shopify', name: 'Shopify', category: 'Available now', type: 'url', icon: 'https://www.shopify.com/favicon.ico', color: '#96bf48' },
  { id: 'amazon', name: 'Amazon', category: 'Available now', type: 'url', icon: 'https://www.amazon.com/favicon.ico', color: '#FF9900' },
  { id: 'udemy', name: 'Udemy', category: 'Available now', type: 'url', icon: 'https://www.udemy.com/favicon.ico', color: '#A435F0' },
  { id: 'airbnb', name: 'Airbnb', category: 'Available now', type: 'url', icon: 'https://www.airbnb.com/favicon.ico', color: '#FF5A5F' },
  { id: 'whop', name: 'Whop', category: 'Available now', type: 'url', icon: 'https://whop.com/favicon.ico', color: '#FF5C00' },
  { id: 'wordpress', name: 'WordPress', category: 'Available now', type: 'url', icon: 'https://wordpress.org/favicon.ico', color: '#21759B' },
  { id: 'discourse', name: 'Discourse', category: 'Available now', type: 'url', icon: 'https://www.discourse.org/favicon.ico', color: '#2B3B48' },
  { id: 'web', name: 'Web Page / Any Link', category: 'Available now', type: 'url', icon: 'https://www.google.com/s2/favicons?domain=example.com', color: '#4F46E5' },
];

export interface ConnectSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlatform: (platformId: string) => void;
  projectId?: string;
  initialPlatform?: string;
}

export const ConnectSourceModal: React.FC<ConnectSourceModalProps> = ({
  isOpen,
  onClose,
  onSelectPlatform,
  projectId,
  initialPlatform,
}) => {
  const [step, setStep] = useState<'select' | 'configure'>(initialPlatform ? 'configure' : 'select');
  const [selectedId, setSelectedId] = useState<string>(initialPlatform || 'google');
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialPlatform) {
        setSelectedId(initialPlatform);
        setStep('configure');
      } else {
        setStep('select');
      }
    }
  }, [isOpen, initialPlatform]);

  if (!isOpen) return null;

  const handleSelectPlatform = (id: string) => {
    setSelectedId(id);
  };

  const handleContinue = () => {
    setStep('configure');
  };

  const handleBackToSelect = () => {
    setStep('select');
  };

  const handleClose = () => {
    setStep('select');
    onClose();
  };

  // If a specific platform is being configured or was selected, render unified ImportModal
  if (step !== 'select') {
    return (
      <ImportModal
        isOpen={isOpen}
        onClose={handleClose}
        platformId={selectedId}
        projectId={projectId}
        onBack={initialPlatform ? handleClose : handleBackToSelect}
        onSuccess={() => {
          onSelectPlatform(selectedId);
        }}
      />
    );
  }

  const currentPlatform = PLATFORMS.find((p) => p.id === selectedId) || PLATFORMS[0];

  return (
    <div 
      id="connect-source-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        id="connect-source-container"
        className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 flex flex-col text-left max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── STEP 1: SELECT PLATFORM ── */}
        <div className="space-y-6">
          <div className="text-center space-y-1.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#6701e6] dark:text-purple-300 flex items-center justify-center mx-auto mb-2 border border-purple-100 dark:border-purple-800 shadow-2xs">
              <Sparkles className="w-5 h-5 fill-[#6701e6] dark:fill-purple-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight font-display">
              Connect Source (Zero-OAuth Import)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
              Import reviews instantly by pasting any public link — no passwords or OAuth app review required.
            </p>
          </div>

          {/* Platform Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-2.5 p-1">
            {PLATFORMS.map((platform) => {
              const isSelected = selectedId === platform.id;
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handleSelectPlatform(platform.id)}
                  onMouseEnter={() => setHoveredName(platform.name)}
                  onMouseLeave={() => setHoveredName(null)}
                  className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-[#6701e6] bg-purple-50/90 dark:bg-purple-950/60 shadow-sm border border-[#6701e6]/30 scale-105'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/80 border border-gray-200/80 dark:border-gray-700'
                  }`}
                  title={platform.name}
                >
                  <img
                    src={platform.icon}
                    alt={platform.name}
                    className="w-5 h-5 object-contain pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-[11px] font-bold text-gray-700 sr-only">{platform.name}</span>
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6701e6] text-white rounded-full flex items-center justify-center text-[10px] shadow-2xs">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected or Hovered Label */}
          <div className="py-2.5 px-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all flex items-center justify-center gap-1.5">
            <span>Selected:</span>
            <span className="text-[#6701e6] dark:text-purple-400 font-bold">
              {hoveredName || currentPlatform.name}
            </span>
            <span className="text-gray-400 font-normal">
              ({(PLATFORMS.find((p) => p.name === (hoveredName || currentPlatform.name)) || currentPlatform).category})
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Powered by Zero-Auth Extractor
            </span>

            <button
              type="button"
              onClick={handleContinue}
              className="px-6 py-2.5 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
