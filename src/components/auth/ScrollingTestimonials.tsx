import React from 'react';
import { BookOpen, Star, Video, Globe, ShieldCheck, Sparkles, Share2, QrCode } from 'lucide-react';

export interface FeatureCardItem {
  icon: React.ReactNode;
  title: string;
  text: string;
}

// Honest feature cards replace the fabricated customer testimonials that were
// here before (fake names/roles attributed to Panda Praise customers). When
// real customer testimonials exist, they can be swapped back in here.
const FEATURES_LIST: FeatureCardItem[] = [
  {
    icon: <Star className="w-6 h-6 text-amber-400" />,
    title: 'Collect text & video testimonials',
    text: 'A public link, QR code or embeddable widget your customers can use in under a minute.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    title: 'Approve before anything goes live',
    text: 'Every submission lands in your moderation inbox first. Nothing is published without your sign-off.',
  },
  {
    icon: <Globe className="w-6 h-6 text-sky-400" />,
    title: 'Import your existing reviews',
    text: 'Upload a CSV, or connect Google, LinkedIn, Instagram or Facebook to pull reviews in.',
  },
  {
    icon: <Share2 className="w-6 h-6 text-rose-400" />,
    title: 'Publish anywhere',
    text: 'Walls of Love, embeddable widgets, popups and shareable images for your socials.',
  },
  {
    icon: <Video className="w-6 h-6 text-indigo-400" />,
    title: 'Ad-free video hosting',
    text: 'Your video testimonials hosted on dedicated, ad-free hosting — no Wistia or YouTube branding.',
  },
  {
    icon: <QrCode className="w-6 h-6 text-teal-400" />,
    title: 'QR codes for in-person collection',
    text: 'Print a QR code on receipts, packaging or signage and collect praise on the spot.',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-amber-400" />,
    title: 'Free forever plan',
    text: 'Start collecting today. No credit card required — upgrade only when it pays for itself.',
  },
];

export const ScrollingTestimonials: React.FC = () => {
  // Duplicate for seamless infinite loop
  const duplicatedList = [...FEATURES_LIST, ...FEATURES_LIST];

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-[#6701e6] p-8 xl:p-12 flex-col justify-center relative overflow-hidden text-white select-none">
      
      {/* Soft atmospheric background glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-900/40 blur-3xl" />

      {/* Top and Bottom gradient mask to soften card entrance and exit */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#6701e6] via-[#6701e6]/80 to-transparent z-20" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#6701e6] via-[#6701e6]/80 to-transparent z-20" />

      {/* Infinite Upward Scrolling Container */}
      <div className="relative z-10 max-w-lg mx-auto w-full h-[760px] overflow-hidden">
        <div className="animate-vertical-scroll space-y-5 hover:[animation-play-state:paused]">
          {duplicatedList.map((f, idx) => (
            <div
              key={`${f.title}-${idx}`}
              className="rounded-3xl bg-white/10 border border-white/15 p-6 backdrop-blur-md shadow-xl transition-transform hover:scale-[1.01]"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 flex items-center justify-center ring-2 ring-white/20 shrink-0">
                  {f.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base sm:text-lg font-bold leading-snug break-words">
                    {f.title}
                  </p>
                  <p className="text-xs sm:text-sm text-white/80 mt-2 font-medium leading-relaxed">
                    {f.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Small floating bottom-right docs badge (Screenshot 1 Exact) */}
      <div className="absolute bottom-6 right-6 z-30 w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-lg">
        <BookOpen className="w-4 h-4" />
      </div>

    </div>
  );
}
export default ScrollingTestimonials;