import React, { useState } from 'react';
import { X, Check, ExternalLink, Sparkles } from 'lucide-react';

interface PlatformItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
}

const PLATFORMS: PlatformItem[] = [
  { id: 'google', name: 'Google', category: 'Reviews', icon: 'https://www.google.com/favicon.ico', color: '#4285F4' },
  { id: 'facebook', name: 'Facebook', category: 'Social', icon: 'https://facebook.com/favicon.ico', color: '#1877F2' },
  { id: 'twitter', name: 'Twitter / X', category: 'Social', icon: 'https://twitter.com/favicon.ico', color: '#000000' },
  { id: 'g2', name: 'G2', category: 'B2B Software', icon: 'https://www.g2.com/favicon.ico', color: '#FF492C' },
  { id: 'trustpilot', name: 'Trustpilot', category: 'Reviews', icon: 'https://www.trustpilot.com/favicon.ico', color: '#00B67A' },
  { id: 'producthunt', name: 'Product Hunt', category: 'Launches', icon: 'https://www.producthunt.com/favicon.ico', color: '#DA552F' },
  { id: 'capterra', name: 'Capterra', category: 'B2B Software', icon: 'https://www.capterra.com/favicon.ico', color: '#00587C' },
  { id: 'yelp', name: 'Yelp', category: 'Local', icon: 'https://www.yelp.com/favicon.ico', color: '#D32323' },
  { id: 'shopify', name: 'Shopify', category: 'Ecommerce', icon: 'https://www.shopify.com/favicon.ico', color: '#96bf48' },
  { id: 'udemy', name: 'Udemy', category: 'Courses', icon: 'https://www.udemy.com/favicon.ico', color: '#A435F0' },
  { id: 'amazon', name: 'Amazon', category: 'Ecommerce', icon: 'https://www.amazon.com/favicon.ico', color: '#FF9900' },
  { id: 'airbnb', name: 'Airbnb', category: 'Hospitality', icon: 'https://www.airbnb.com/favicon.ico', color: '#FF5A5F' },
  { id: 'appstore', name: 'App Store', category: 'Mobile Apps', icon: 'https://www.apple.com/favicon.ico', color: '#0070c9' },
  { id: 'playstore', name: 'Google Play', category: 'Mobile Apps', icon: 'https://play.google.com/favicon.ico', color: '#01875f' },
  { id: 'whop', name: 'Whop', category: 'Communities', icon: 'https://whop.com/favicon.ico', color: '#FF5C00' },
  { id: 'wordpress', name: 'WordPress', category: 'CMS', icon: 'https://wordpress.org/favicon.ico', color: '#21759B' },
  { id: 'discourse', name: 'Discourse', category: 'Forums', icon: 'https://www.discourse.org/favicon.ico', color: '#2B3B48' },
  { id: 'reddit', name: 'Reddit', category: 'Social', icon: 'https://www.reddit.com/favicon.ico', color: '#FF4500' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Social', icon: 'https://www.linkedin.com/favicon.ico', color: '#0A66C2' },
  { id: 'tripadvisor', name: 'TripAdvisor', category: 'Travel', icon: 'https://www.tripadvisor.com/favicon.ico', color: '#34E0A1' },
  { id: 'tiktok', name: 'TikTok', category: 'Video', icon: 'https://www.tiktok.com/favicon.ico', color: '#000000' },
];

interface ConnectSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlatform: (platformId: string) => void;
}

export const ConnectSourceModal: React.FC<ConnectSourceModalProps> = ({
  isOpen,
  onClose,
  onSelectPlatform,
}) => {
  const [selectedId, setSelectedId] = useState<string>('google');
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleContinue = () => {
    onSelectPlatform(selectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-8 animate-slide-up flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header (Matches Senja 03:06) */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6701e6] flex items-center justify-center mx-auto mb-2 border border-purple-100">
            <Sparkles className="w-5 h-5 fill-[#6701e6]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight font-display">
            Connect source
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            Where are you currently collecting testimonials? Select your platform to continue.
          </p>
        </div>

        {/* Platform Grid (21 items, 7 per row on desktop) */}
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2.5 p-1">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedId === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => setSelectedId(platform.id)}
                onMouseEnter={() => setHoveredName(platform.name)}
                onMouseLeave={() => setHoveredName(null)}
                className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-[#6701e6] bg-purple-50/80 shadow-xs'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200/80'
                }`}
                title={platform.name}
              >
                <img
                  src={platform.icon}
                  alt={platform.name}
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    // Fallback to stylized letter if favicon fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-xs font-bold text-gray-700 sr-only">{platform.name}</span>
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6701e6] text-white rounded-full flex items-center justify-center text-[10px]">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected or Hovered Label */}
        <div className="mt-4 py-2 text-center text-xs font-semibold text-gray-600 bg-gray-50 rounded-xl border border-gray-100">
          Selected: <span className="text-[#6701e6] font-bold">{hoveredName || PLATFORMS.find(p => p.id === selectedId)?.name || 'Platform'}</span>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => alert('Platform source sync imports reviews via CSV or direct webhook. You can upload a CSV export from any platform to import historical reviews instantly.')}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <span>Need help? Source guide</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={handleContinue}
            className="px-6 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
};
