import React, { useState, useEffect, useMemo } from 'react';
import {
  useRealtimeWorkspaceTestimonials,
  UnifiedTestimonial,
} from '../../services/testimonialSyncEngine';
import {
  Video,
  FileText,
  Play,
  Upload,
  Download,
  X,
} from 'lucide-react';
import { renderEditorialPlaceCardCanvas } from './ProofToEmbedsFlow';

const DEFAULT_AESTHETIC_BG =
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85';

// ============================================================================
// 1. COLLECTION PULSE BANNER & PLAYER (Embeds at Top of ?tab=forms)
// ============================================================================
export function CollectionPulseBar({
  workspaceId,
  workspaceName,
  onGoToProof,
  onGoToEmbeds,
}: {
  workspaceId: string;
  workspaceName: string;
  onGoToProof?: () => void;
  onGoToEmbeds?: (selected: UnifiedTestimonial[]) => void;
}) {
  const {
    testimonials,
    videoTestimonials,
    textTestimonials,
    totalCount,
    avgRating,
  } = useRealtimeWorkspaceTestimonials(workspaceId, workspaceName);

  const [watchingReview, setWatchingReview] = useState<UnifiedTestimonial | null>(null);

  return (
    <div className="space-y-4 font-sans">
      {/* Live Collection Pulse KPI Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Live Collection Pulse ({totalCount} Received)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {onGoToProof && (
              <button
                type="button"
                onClick={onGoToProof}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold cursor-pointer"
              >
                Open in Proof ({totalCount}) →
              </button>
            )}
            {onGoToEmbeds && testimonials.length > 0 && (
              <button
                type="button"
                onClick={() => onGoToEmbeds(testimonials)}
                className="px-3.5 py-1.5 rounded-xl bg-[#6701e6] hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
              >
                Customize in Embeds →
              </button>
            )}
          </div>
        </div>

        {/* 4 Pulse Cards */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Total Collected
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {totalCount}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium">
              Auto-synced to Proof & Embeds
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Format Mode
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-extrabold text-slate-900">Hybrid</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                Video+Text
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {videoTestimonials.length} Video · {textTestimonials.length} Text
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Average Score
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {avgRating.toFixed(1)} <span className="text-amber-400 text-lg">★</span>
            </p>
            <span className="text-[11px] text-slate-500">
              Across {totalCount} submission(s)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Latest Submission
            </span>
            <p className="text-sm font-bold text-slate-900 truncate mt-1">
              {testimonials[0]?.authorName || 'Waiting for responses...'}
            </p>
            {testimonials[0] && (
              <button
                type="button"
                onClick={() => setWatchingReview(testimonials[0])}
                className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Watch / Read Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Recent Incoming Feed inside Collection Pulse (Click any to Watch/Review) */}
        {testimonials.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Recent Responses Received (Click to Watch or Review)
            </span>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {testimonials.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWatchingReview(item)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-purple-500 bg-white flex items-center gap-2.5 shrink-0 text-left cursor-pointer transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center">
                    {item.mediaType === 'video' ? (
                      <Video className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {item.authorName}
                    </p>
                    <p className="text-[10px] text-slate-500 max-w-[160px] truncate">
                      {item.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal to Watch Video or Read Full Submitted Testimonial in Collection Pulse */}
      {watchingReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {watchingReview.authorName} · {watchingReview.authorRole}
                </h3>
                <p className="text-xs text-slate-500">
                  {watchingReview.source} · {'★'.repeat(watchingReview.rating)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWatchingReview(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {watchingReview.videoDataUrl && (
              <video
                src={watchingReview.videoDataUrl}
                controls
                autoPlay
                className="w-full rounded-2xl max-h-72 bg-black"
              />
            )}

            <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              “{watchingReview.content}”
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWatchingReview(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              {onGoToEmbeds && (
                <button
                  type="button"
                  onClick={() => {
                    const target = watchingReview;
                    setWatchingReview(null);
                    onGoToEmbeds([target]);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#6701e6] text-white text-xs font-bold cursor-pointer"
                >
                  Customize in Embeds →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. AUTO-SYNCED EMBEDS STUDIO (Automatically Loads Approved Proof from DB!)
// ============================================================================
export function AutoSyncedEmbedsStudio({
  workspaceId,
  workspaceName,
  preselectedTestimonials = [],
}: {
  workspaceId: string;
  workspaceName: string;
  preselectedTestimonials?: UnifiedTestimonial[];
}) {
  const { approvedTestimonials } = useRealtimeWorkspaceTestimonials(
    workspaceId,
    workspaceName
  );

  // Merge any explicitly selected proof with all live approved testimonials from Firestore
  const availableProofs = useMemo(() => {
    if (preselectedTestimonials.length > 0) return preselectedTestimonials;
    return approvedTestimonials;
  }, [preselectedTestimonials, approvedTestimonials]);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [backgroundUrl, setBackgroundUrl] = useState<string>(DEFAULT_AESTHETIC_BG);

  const activeProof = availableProofs[activeIndex];

  const [quoteText, setQuoteText] = useState<string>(
    activeProof?.content ||
      'What really stood out was the attention to detail. Every moment felt effortless.'
  );
  const [authorName, setAuthorName] = useState<string>(
    activeProof?.authorName || 'Andrea'
  );
  const [locationOrRole, setLocationOrRole] = useState<string>(
    activeProof?.authorRole || 'Verified Client'
  );
  const [starRating, setStarRating] = useState<number>(activeProof?.rating || 5);
  const [bottomHandle, setBottomHandle] = useState<string>(
    `@${workspaceName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`
  );
  const [toast, setToast] = useState<string | null>(null);

  // Automatically sync fields whenever new testimonials arrive from Firestore or user switches index
  useEffect(() => {
    const item = availableProofs[activeIndex];
    if (item) {
      setQuoteText(item.content.replace(/^["“]|["”]$/g, ''));
      setAuthorName(item.authorName);
      setLocationOrRole(item.authorRole);
      setStarRating(item.rating || 5);
    }
  }, [availableProofs, activeIndex]);

  const handleUploadBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setBackgroundUrl(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadCard = async () => {
    const canvas = await renderEditorialPlaceCardCanvas({
      backgroundUrl,
      rating: starRating,
      quoteText,
      authorName,
      locationOrRole,
      bottomHandle,
    });
    const a = document.createElement('a');
    a.download = `${authorName.toLowerCase().replace(/\s+/g, '-')}-card.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    setToast('Downloaded HD Testimonial Card!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-slate-900">
      {/* Selector Bar showing all Live Approved Testimonials pulled automatically */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#6701e6]">
            Auto-Synced from Proof ({availableProofs.length} Approved)
          </span>
          <h2 className="text-lg font-bold text-slate-950">
            Select Any Received Testimonial to Customize & Post
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {availableProofs.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                activeIndex === idx
                  ? 'bg-[#6701e6] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.authorName} ({item.rating}★)
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          {toast}
        </div>
      )}

      {/* Split Preview & Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 flex flex-col items-center">
          <div
            className="w-full max-w-[450px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative flex items-center justify-center p-8 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          >
            <div className="relative z-10 w-full bg-[#F4F2EA] rounded-[18px] px-8 py-9 shadow-2xl flex flex-col justify-between min-h-[54%]">
              <div>
                <div className="flex items-center gap-2 text-[#625834] text-xl mb-4">
                  {Array.from({ length: starRating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p
                  className="text-[15px] leading-[1.68] text-[#4B432B] italic"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {quoteText}
                </p>
              </div>

              <div
                className="mt-7 pt-2 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#5C5233]"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <span>{authorName}</span>
                <span className="flex-1 h-[1.5px] bg-[#6E6340]/70 mx-2" />
                <span>{locationOrRole}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-900">
              Customize Background & Content
            </span>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6701e6] text-white text-xs font-bold cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Background Photo</span>
              <input type="file" accept="image/*" onChange={handleUploadBg} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Testimonial Quote
            </label>
            <textarea
              rows={4}
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Role / City
              </label>
              <input
                type="text"
                value={locationOrRole}
                onChange={(e) => setLocationOrRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Social Handle / Brand
            </label>
            <input
              type="text"
              value={bottomHandle}
              onChange={(e) => setBottomHandle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
            />
          </div>

          <button
            type="button"
            onClick={handleDownloadCard}
            className="w-full py-3 rounded-xl bg-[#6701e6] hover:bg-purple-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res Card (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
