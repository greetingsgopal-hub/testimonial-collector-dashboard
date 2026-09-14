import React from 'react';
import { Link } from 'react-router-dom';
import { Download, ArrowLeft, Check, Sparkles, Shield } from 'lucide-react';
import { PandaPraiseIcon } from '../components/PandaPraiseLogo';
import { usePageSeo } from '../lib/seo';

interface AssetCardProps {
  title: string;
  category: string;
  dimensions: string;
  imageSrc: string;
  downloadFilename: string;
  description: string;
}

const AssetCard: React.FC<AssetCardProps> = ({
  title,
  category,
  dimensions,
  imageSrc,
  downloadFilename,
  description,
}) => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Preview image */}
        <div className="rounded-xl overflow-hidden border border-white/10 bg-zinc-950/60 relative group-hover:border-purple-500/40 transition-colors">
          <img
            src={imageSrc}
            alt={title}
            className="w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-zinc-900/80 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-zinc-300">
            {dimensions}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
            {category}
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">{title}</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5">
        <a
          href={imageSrc}
          download={downloadFilename}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-purple-500/20 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Asset</span>
        </a>
      </div>
    </div>
  );
};

export const BrandKitPage: React.FC = () => {
  usePageSeo({
    title: 'Brand Kit & Social Media Media Assets — Panda Praise',
    description: 'Download official high-resolution Panda Praise logos, avatars, and social media background banners for Twitter/X, LinkedIn, Facebook, and YouTube.',
  });

  const assets: AssetCardProps[] = [
    {
      title: 'Official Social Avatar & App Icon',
      category: 'Profile Logo',
      dimensions: '1024 × 1024 (1:1 Square)',
      imageSrc: '/brand/panda-praise-avatar.jpg',
      downloadFilename: 'panda-praise-official-avatar.jpg',
      description: 'The cheerful 5-star smiling panda emblem framed in a sleek rounded app badge. Optimized for Twitter/X, LinkedIn, Facebook, Instagram, and YouTube profile photos.',
    },
    {
      title: 'Twitter / X Header Banner',
      category: 'Social Banner',
      dimensions: '1920 × 1080 (16:9 Widescreen)',
      imageSrc: '/brand/panda-praise-banner-twitter.jpg',
      downloadFilename: 'panda-praise-twitter-banner.jpg',
      description: 'Features the 5-star praise mark, the bold "Panda Praise" logotype, the core tagline "Praise that sticks", and floating glass testimonial proof cards.',
    },
    {
      title: 'LinkedIn Company Cover Banner',
      category: 'Enterprise Banner',
      dimensions: '1920 × 1080 (16:9 Widescreen)',
      imageSrc: '/brand/panda-praise-banner-linkedin.jpg',
      downloadFilename: 'panda-praise-linkedin-banner.jpg',
      description: 'Sleek enterprise dark navy header with neon purple energy lines and the headline: "Turn Customer Praise Into Unstoppable Social Proof".',
    },
    {
      title: 'YouTube & Facebook Universal Cover',
      category: 'Video & Community Banner',
      dimensions: '1920 × 1080 (16:9 Widescreen)',
      imageSrc: '/brand/panda-praise-banner-youtube-facebook.jpg',
      downloadFilename: 'panda-praise-youtube-facebook-banner.jpg',
      description: 'Vibrant widescreen panorama featuring the crowned 5-star panda mark alongside interactive video & text testimonial cards.',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-purple-500 selection:text-white">
      {/* Header Navigation */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3">
            <PandaPraiseIcon size={34} colorMode="gradient" />
            <span className="font-display font-extrabold text-lg text-white tracking-tight">
              Panda <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Praise</span>
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Brand Kit
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Media Assets & Brand Identity</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white">
            Panda Praise <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Brand Kit</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Download official high-resolution logos, avatars, and social media background banners customized for Twitter/X, LinkedIn, Facebook, and YouTube channels.
          </p>
        </div>

        {/* Live Vector Mark Preview */}
        <section className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="ambient-glow opacity-30" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl bg-zinc-900/90 border border-purple-500/30 flex items-center justify-center p-3 shadow-xl">
                <PandaPraiseIcon size={72} colorMode="gradient" />
              </div>
              <div className="space-y-1 text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>Selected Official Concept: The 5-Star Testimonial Panda</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-white">
                  Friendly, Cheerful & Trustworthy
                </h2>
                <p className="text-xs text-zinc-400 max-w-lg">
                  Designed to communicate customer love, warmth, and 5-star social proof. Soft curves, joyful smiling expression, and radiant praise stars.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-purple-500" />
                <span className="font-mono text-xs text-zinc-300">#A855F7</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-pink-500" />
                <span className="font-mono text-xs text-zinc-300">#EC4899</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-amber-400" />
                <span className="font-mono text-xs text-zinc-300">#F59E0B</span>
              </div>
            </div>
          </div>
        </section>

        {/* Downloadable Assets Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Social Media Channel Assets
              </h2>
              <p className="text-xs text-zinc-400">
                Directly download full-resolution background banners and profile graphics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assets.map((asset, idx) => (
              <AssetCard key={idx} {...asset} />
            ))}
          </div>
        </section>

        {/* Guidelines / Usage Notes */}
        <section className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4 text-xs text-zinc-400 leading-relaxed">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Brand Usage Guidelines</span>
          </h3>
          <p>
            • <strong>Panda Praise Logo</strong> should always be displayed on high-contrast backgrounds (deep charcoal, obsidian, or clean white).
          </p>
          <p>
            • <strong>Core Tagline</strong>: "Praise that sticks."
          </p>
          <p>
            • All banners are pre-formatted to match native platform requirements for safe zone visibility across desktop and mobile screens.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Panda Praise. All brand assets are property of Panda Praise.
      </footer>
    </div>
  );
};
