import React, { useState, useMemo } from 'react';
import {
  Mail,
  Copy,
  Check,
  Palette,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Review, ReviewStats } from '../../types';

interface EmailSignatureEmbedProps {
  reviews: Review[];
  stats: ReviewStats;
}

type SignatureStyle = 'minimal' | 'badge' | 'stars' | 'quote';

const STYLE_INFO: Record<SignatureStyle, { name: string; description: string }> = {
  minimal: { name: 'Minimal', description: 'Clean rating with link' },
  badge: { name: 'Badge', description: 'Colorful trust badge' },
  stars: { name: 'Stars', description: 'Star rating display' },
  quote: { name: 'Quote', description: 'Featured testimonial' },
};

export const EmailSignatureEmbed: React.FC<EmailSignatureEmbedProps> = ({ reviews, stats }) => {
  const { project } = useAuth();
  const [activeStyle, setActiveStyle] = useState<SignatureStyle>('badge');
  const [copied, setCopied] = useState(false);
  const [brandColor, setBrandColor] = useState('#8B5CF6');

  const wallUrl = project
    ? `${window.location.origin}/love/${project.slug || project.id}`
    : '#';

  const topReview = useMemo(() => {
    return reviews
      .filter(r => r.status === 'approved' && r.rating >= 4)
      .sort((a, b) => b.rating - a.rating || b.content.length - a.content.length)[0];
  }, [reviews]);

  const truncateQuote = (text: string, maxLen: number) => {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen).trim() + '…';
  };

  const generateHtml = (): string => {
    const avgRating = stats.averageRating.toFixed(1);
    const totalReviews = stats.total;

    switch (activeStyle) {
      case 'minimal':
        return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;">
  <tr>
    <td style="padding:8px 0;">
      <a href="${wallUrl}" style="text-decoration:none;color:${brandColor};font-size:13px;font-weight:600;">
        ⭐ ${avgRating}/5 from ${totalReviews} reviews
      </a>
    </td>
  </tr>
</table>`;

      case 'badge':
        return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;">
  <tr>
    <td style="padding:12px 0;">
      <a href="${wallUrl}" style="text-decoration:none;display:inline-block;">
        <table cellpadding="0" cellspacing="0" style="background:${brandColor};border-radius:8px;overflow:hidden;">
          <tr>
            <td style="padding:8px 16px;color:#fff;font-size:12px;font-weight:700;letter-spacing:0.5px;">
              ⭐ RATED ${avgRating}/5
            </td>
            <td style="padding:8px 16px;background:rgba(0,0,0,0.15);color:rgba(255,255,255,0.9);font-size:11px;">
              ${totalReviews} verified reviews
            </td>
          </tr>
        </table>
      </a>
    </td>
  </tr>
</table>`;

      case 'stars':
        const starsFull = Math.floor(stats.averageRating);
        const starsHtml = '★'.repeat(starsFull) + '☆'.repeat(5 - starsFull);
        return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;">
  <tr>
    <td style="padding:8px 0;">
      <a href="${wallUrl}" style="text-decoration:none;display:inline-block;">
        <span style="color:#F59E0B;font-size:16px;letter-spacing:2px;">${starsHtml}</span>
        <br/>
        <span style="color:#71717A;font-size:11px;">${avgRating} out of 5 · ${totalReviews} reviews</span>
      </a>
    </td>
  </tr>
</table>`;

      case 'quote':
        if (!topReview) {
          return `<!-- No approved reviews to display -->`;
        }
        return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;max-width:300px;">
  <tr>
    <td style="padding:12px 0;">
      <table cellpadding="0" cellspacing="0" style="border-left:3px solid ${brandColor};padding-left:12px;">
        <tr>
          <td>
            <p style="color:#3F3F46;font-size:12px;font-style:italic;margin:0 0 6px 0;line-height:1.4;">
              "${truncateQuote(topReview.content, 120)}"
            </p>
            <p style="color:#71717A;font-size:11px;margin:0;">
              — ${topReview.name}${topReview.company ? `, ${topReview.company}` : ''}
            </p>
            <a href="${wallUrl}" style="color:${brandColor};font-size:10px;text-decoration:none;display:inline-block;margin-top:4px;">
              See all ${totalReviews} reviews →
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

      default:
        return '';
    }
  };

  const htmlCode = useMemo(() => generateHtml(), [activeStyle, brandColor, stats, topReview, wallUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Mail size={16} className="text-violet-400" />
          Email Signature Embed
        </h3>
      </div>

      <p className="text-xs text-zinc-500">
        Add a social proof snippet to your email signature. Works with Gmail, Outlook, Apple Mail, and most email clients.
      </p>

      {/* Style Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.entries(STYLE_INFO) as [SignatureStyle, typeof STYLE_INFO[SignatureStyle]][]).map(([style, info]) => (
          <button
            key={style}
            onClick={() => setActiveStyle(style)}
            className={`p-3 rounded-xl text-left transition-all border
              ${activeStyle === style
                ? 'bg-violet-500/10 border-violet-500/30'
                : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
          >
            <p className={`text-xs font-medium ${activeStyle === style ? 'text-violet-300' : 'text-zinc-300'}`}>
              {info.name}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{info.description}</p>
          </button>
        ))}
      </div>

      {/* Color picker */}
      <div className="flex items-center gap-3">
        <Palette size={14} className="text-zinc-500" />
        <label className="text-xs text-zinc-500">Brand Color:</label>
        <input
          type="color"
          value={brandColor}
          onChange={e => setBrandColor(e.target.value)}
          className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={brandColor}
          onChange={e => setBrandColor(e.target.value)}
          className="w-24 px-2 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-zinc-200 font-mono"
        />
      </div>

      {/* Preview */}
      <div className="p-5 rounded-xl bg-white border border-zinc-200">
        <div className="flex items-center gap-1.5 mb-3">
          <Eye size={12} className="text-zinc-400" />
          <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Preview</span>
        </div>
        <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
      </div>

      {/* HTML Code */}
      <div className="relative">
        <pre className="p-4 rounded-xl bg-zinc-900 border border-white/10 text-xs text-emerald-300/80 overflow-x-auto font-mono max-h-48 overflow-y-auto leading-relaxed">
          {htmlCode}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                   bg-white/10 hover:bg-white/15 text-xs font-medium transition-colors
                   text-zinc-300 hover:text-white"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? 'Copied!' : 'Copy HTML'}
        </button>
      </div>

      {/* Instructions */}
      <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
        <h4 className="text-xs font-semibold text-violet-300 mb-2">How to add to your email signature:</h4>
        <ol className="space-y-1.5 text-xs text-zinc-400 list-decimal list-inside">
          <li>Copy the HTML code above</li>
          <li>Open your email client's signature settings</li>
          <li>Switch to "HTML" or "Source" mode</li>
          <li>Paste the code at the bottom of your signature</li>
          <li>Save — your social proof snippet will appear in every email you send!</li>
        </ol>
      </div>
    </div>
  );
};
