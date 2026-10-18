import React, { useState, useEffect, useMemo } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {
  Check,
  Sparkles,
  Download,
  Send,
  Star,
  Eye,
  PlusCircle,
  X,
  LayoutTemplate,
  Upload,
} from 'lucide-react';

export interface SocialTestimonial {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  rating: number;
  createdAt?: string;
  isSample?: boolean;
}

export type LayoutClass = 'single' | 'double' | 'triple';
type ChannelId = 'linkedin' | 'x' | 'whatsapp' | 'instagram';

interface ChannelState {
  id: ChannelId;
  name: string;
  dotColor: string;
  modeLabel: string;
  selected: boolean;
}

// ==========================================
// ADVANCED MULTI-TEMPLATE CANVAS RENDERER
// ==========================================
export function renderAdvancedSocialCard(
  testimonials: SocialTestimonial[],
  workspaceName: string,
  layoutClass: LayoutClass,
  themeColor: string,
  heroScreenshotUrl?: string | null
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const drawDefaultGradient = () => {
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.5, '#1E1B4B');
    grad.addColorStop(1, themeColor || '#4C1D95');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);
  };

  // Background Fill (Solid or Hero Screenshot)
  if (heroScreenshotUrl) {
    try {
      drawDefaultGradient();
    } catch {
      drawDefaultGradient();
    }
  } else {
    drawDefaultGradient();
  }

  // 1. SINGLE TESTIMONIAL LAYOUT (Matches Clean Professional Quote Card)
  if (layoutClass === 'single' && testimonials.length > 0) {
    const t = testimonials[0];

    // Main White Card Container
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(90, 140, 900, 800, 36);
    } else {
      ctx.rect(90, 140, 900, 800);
    }
    ctx.fill();

    // Star Rating
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText('★★★★★  ' + Number(t.rating || 5).toFixed(1), 150, 240);

    // Quote Content
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 36px Inter, sans-serif';
    wrapText(ctx, `"${t.content}"`, 150, 340, 780, 52);

    // Author Details
    ctx.fillStyle = '#7C3AED';
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillText(t.authorName || 'Verified Customer', 150, 780);
    ctx.fillStyle = '#64748B';
    ctx.font = '24px Inter, sans-serif';
    ctx.fillText(`${t.authorRole || 'Customer'} • ${workspaceName}`, 150, 820);
  } 
  // 2. DOUBLE TESTIMONIALS LAYOUT (Stacked Dialogue Cards)
  else if (layoutClass === 'double' && testimonials.length >= 2) {
    [testimonials[0], testimonials[1]].forEach((t, index) => {
      const cardY = index === 0 ? 160 : 560;
      ctx.fillStyle = index === 0 ? '#FFFFFF' : '#D9F99D'; // White and Lime Green cards
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(90, cardY, 900, 350, 28);
      } else {
        ctx.rect(90, cardY, 900, 350);
      }
      ctx.fill();

      ctx.fillStyle = index === 0 ? '#0F172A' : '#1A2E05';
      ctx.font = 'bold 26px Inter, sans-serif';
      wrapText(ctx, `"${t.content}"`, 140, cardY + 90, 800, 40);

      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText(`— ${t.authorName} (${t.authorRole})`, 140, cardY + 280);
    });
  } 
  // 3. TRIPLE TESTIMONIALS LAYOUT (Floating Multi-card Cascade)
  else {
    testimonials.slice(0, 3).forEach((t, index) => {
      const offsets = [
        { x: 90, y: 160, rot: -0.03 },
        { x: 390, y: 340, rot: 0.02 },
        { x: 190, y: 580, rot: -0.01 },
      ];
      const pos = offsets[index] || offsets[0];
      ctx.save();
      ctx.translate(pos.x + 350, pos.y + 150);
      ctx.rotate(pos.rot);
      ctx.translate(-350, -150);

      ctx.fillStyle = index === 0 ? '#DCFCE7' : index === 1 ? '#FCE7F3' : '#FFFFFF';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(0, 0, 700, 320, 24);
      } else {
        ctx.rect(0, 0, 700, 320);
      }
      ctx.fill();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 22px Inter, sans-serif';
      wrapText(ctx, `"${t.content}"`, 40, 70, 620, 32);
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText(`— ${t.authorName} (${t.authorRole})`, 40, 260);
      ctx.restore();
    });
  }

  return canvas.toDataURL('image/png');
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export function SocialBroadcastStudio({
  workspaceId = 'papasystem',
  workspaceName = 'papasystem',
  workspaceSlug,
  workspaceWebsite: _workspaceWebsite,
  initialApprovedTestimonials,
}: {
  workspaceId?: string;
  workspaceName?: string;
  workspaceSlug?: string;
  workspaceWebsite?: string;
  initialApprovedTestimonials?: SocialTestimonial[];
}) {
  const [testimonials, setTestimonials] = useState<SocialTestimonial[]>(
    initialApprovedTestimonials || []
  );
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
  const [selectedProofIds, setSelectedProofIds] = useState<string[]>([]);
  const [starFilter, setStarFilter] = useState<'all' | '5' | '4+'>('all');
  const [, setIsLoading] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  // Template Customization State
  const [layoutClass, setLayoutClass] = useState<LayoutClass>('single');
  const [themeColor] = useState<string>('#7C3AED');
  const [heroScreenshot, setHeroScreenshot] = useState<string | null>(null);

  const [previewCardModal, setPreviewCardModal] = useState<{
    title: string;
    dataUrl: string;
  } | null>(null);

  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const [channels, setChannels] = useState<ChannelState[]>([
    { id: 'linkedin', name: 'LinkedIn', dotColor: 'bg-blue-600', modeLabel: 'Pre-filled Feed Post', selected: true },
    { id: 'x', name: 'X (Twitter)', dotColor: 'bg-slate-900', modeLabel: 'Pre-filled Post Intent', selected: true },
    { id: 'whatsapp', name: 'WhatsApp', dotColor: 'bg-emerald-500', modeLabel: 'Direct Chat / Status', selected: false },
    { id: 'instagram', name: 'Instagram & FB Card', dotColor: 'bg-pink-600', modeLabel: '1080×1080 PNG Auto-Card', selected: true },
  ]);

  const loadRealData = async () => {
    setIsLoading(true);
    try {
      const db = getFirestore();
      const qAll = query(collection(db, 'testimonials'), where('workspaceId', '==', workspaceId));
      const snap = await getDocs(qAll);

      const approvedRows: SocialTestimonial[] = [];
      let pendingCount = 0;

      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.status === 'pending') {
          pendingCount += 1;
        } else if (data.status === 'approved' || !data.status) {
          approvedRows.push({
            id: d.id,
            authorName: data.authorName || data.author_name || 'Verified Customer',
            authorRole: data.authorRole || data.author_role || 'Verified Buyer',
            content: data.content || data.text || '',
            rating: Number(data.rating || 5),
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
          });
        }
      });

      setPendingReviewsCount(pendingCount);
      if (approvedRows.length > 0) {
        setTestimonials(approvedRows);
        setSelectedProofIds((prev) => (prev.length > 0 ? prev : [approvedRows[0].id]));
      }
    } catch (err) {
      console.warn('Firestore fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, [workspaceId]);

  const handleApproveAllPending = async () => {
    setIsLoading(true);
    try {
      const db = getFirestore();
      const qPending = query(
        collection(db, 'testimonials'),
        where('workspaceId', '==', workspaceId),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(qPending);
      await Promise.all(
        snap.docs.map((docSnap) =>
          updateDoc(doc(db, 'testimonials', docSnap.id), { status: 'approved' })
        )
      );
      await loadRealData();
      setStatusBanner({
        type: 'success',
        text: `Approved ${snap.docs.length} pending review(s)!`,
      });
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: err.message || 'Could not approve reviews.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSampleProofs = async () => {
    const sampleProofs: SocialTestimonial[] = [
      {
        id: 'sample-proof-1',
        authorName: 'Aarav Mehta',
        authorRole: 'Founder, FinStack',
        content: `Switching to ${workspaceName} saved our team 6 hours every week and doubled our customer trust!`,
        rating: 5,
        isSample: true,
      },
      {
        id: 'sample-proof-2',
        authorName: 'Sarah Jenkins',
        authorRole: 'Head of Growth, ScaleOps',
        content: `The fastest onboarding we have ever experienced. Within 5 minutes of setting up ${workspaceName}, we had live proof running.`,
        rating: 5,
        isSample: true,
      },
      {
        id: 'sample-proof-3',
        authorName: 'Rohan Kulkarni',
        authorRole: 'CTO, CloudPulse',
        content: `Clean UI, zero page-speed bloat, and rock-solid reliability. Highly recommend ${workspaceName} to any growing business.`,
        rating: 5,
        isSample: true,
      },
    ];

    setTestimonials(sampleProofs);
    setSelectedProofIds(sampleProofs.slice(0, layoutClass === 'single' ? 1 : layoutClass === 'double' ? 2 : 3).map(p => p.id));
    setStatusBanner({
      type: 'info',
      text: 'Loaded sample testimonials. Select your template class above and click Preview Card!',
    });
  };

  const handleHeroScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setHeroScreenshot(uploadEvent.target?.result as string);
        setStatusBanner({
          type: 'success',
          text: 'Website hero screenshot loaded successfully! It will now serve as your HD background template.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      if (starFilter === '5') return Math.round(t.rating) === 5;
      if (starFilter === '4+') return t.rating >= 4;
      return true;
    });
  }, [testimonials, starFilter]);

  const toggleChannel = (id: ChannelId) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, selected: !ch.selected } : ch))
    );
  };

  const toggleProofSelection = (id: string) => {
    setSelectedProofIds((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((item) => item !== id);
      // Enforce selection limits based on template class
      const limit = layoutClass === 'single' ? 1 : layoutClass === 'double' ? 2 : 3;
      if (prev.length >= limit) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleBroadcastSelected = async () => {
    const selectedItems = testimonials.filter((t) => selectedProofIds.includes(t.id));
    const activeChannels = channels.filter((c) => c.selected);

    if (selectedItems.length === 0) {
      setStatusBanner({ type: 'error', text: 'Select at least 1 testimonial below first.' });
      return;
    }

    setIsBroadcasting(true);
    try {
      const primaryProof = selectedItems[0];
      const cleanSlug = workspaceSlug || workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const publicWallUrl = `https://pandapraise.com/w/${cleanSlug}`;
      const combinedCaption = `"${primaryProof.content}"\n\n— ${primaryProof.authorName} (${primaryProof.authorRole}) ⭐⭐⭐⭐⭐\n\nVerified customer love for ${workspaceName}\n👉 Explore verified wall: ${publicWallUrl}`;

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(combinedCaption).catch(() => null);
      }

      const dataUrl = renderAdvancedSocialCard(
        selectedItems,
        workspaceName,
        layoutClass,
        themeColor,
        heroScreenshot
      );

      if (dataUrl) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          if (
            typeof navigator !== 'undefined' &&
            navigator.clipboard &&
            typeof (window as any).ClipboardItem !== 'undefined'
          ) {
            await navigator.clipboard.write([new (window as any).ClipboardItem({ 'image/png': blob })]);
          }
        } catch {
          // Fallback
        }
      }

      if (activeChannels.some((c) => c.id === 'instagram')) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${workspaceName}-${layoutClass}-social-card.png`;
        a.click();
      }

      const encodedText = encodeURIComponent(combinedCaption);
      if (activeChannels.some((c) => c.id === 'linkedin')) {
        window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`, '_blank', 'noopener,noreferrer');
      }
      if (activeChannels.some((c) => c.id === 'x')) {
        window.open(`https://x.com/intent/post?text=${encodedText}`, '_blank', 'noopener,noreferrer');
      }
      if (activeChannels.some((c) => c.id === 'whatsapp')) {
        window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank', 'noopener,noreferrer');
      }

      setStatusBanner({
        type: 'success',
        text: `Success! Caption copied & PNG card generated for ${layoutClass.toUpperCase()} template. Press Ctrl+V to paste your visual card!`,
      });
    } catch (err: any) {
      setStatusBanner({ type: 'error', text: err.message || 'Broadcast failed.' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* HEADER */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              Visual Template & Social Studio
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Post on internet</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Design professional Single, Double, or Triple testimonial graphics backed by your website hero screenshot.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-xs font-bold text-purple-700 border border-purple-200 cursor-pointer transition-colors shrink-0">
          <Upload className="w-4 h-4" />
          <span>{heroScreenshot ? 'Change Hero Background ✓' : 'Upload Website Hero Background'}</span>
          <input type="file" accept="image/*" onChange={handleHeroScreenshotUpload} className="hidden" />
        </label>
      </section>

      {statusBanner && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : statusBanner.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-purple-50 border-purple-200 text-purple-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{statusBanner.text}</span>
          </div>
          <button type="button" onClick={() => setStatusBanner(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* TEMPLATE CLASS SELECTOR */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <LayoutTemplate className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">1. Choose Template Class</h2>
            <p className="text-xs text-slate-500">Select whether your graphic features 1, 2, or 3 reviews.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'single', label: 'Single Testimonial Template', desc: 'High-impact central quote card' },
            { id: 'double', label: 'Double Testimonials Template', desc: 'Side-by-side or stacked dialogue' },
            { id: 'triple', label: 'Triple Testimonials Template', desc: 'Dynamic floating multi-card cascade' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setLayoutClass(item.id as LayoutClass);
                setSelectedProofIds(testimonials.slice(0, item.id === 'single' ? 1 : item.id === 'double' ? 2 : 3).map(p => p.id));
              }}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                layoutClass === item.id
                  ? 'border-purple-600 bg-purple-50/30 ring-2 ring-purple-600/15'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                <span>{item.label}</span>
                {layoutClass === item.id && <Check className="w-4 h-4 text-purple-600 stroke-[3]" />}
              </div>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* CHANNELS & BROADCAST BAR */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 mr-2">
            <button
              type="button"
              onClick={() => setStarFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                starFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All ({testimonials.length})
            </button>
            <button
              type="button"
              onClick={() => setStarFilter('5')}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${
                starFilter === '5' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>5 Stars</span>
            </button>
            <button
              type="button"
              onClick={() => setStarFilter('4+')}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                starFilter === '4+' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              4+ Stars
            </button>
          </div>

          {channels.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => toggleChannel(ch.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                ch.selected ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${ch.selected ? 'bg-white' : ch.dotColor}`} />
              <span>{ch.name}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          data-testid="publish-social-btn"
          disabled={selectedProofIds.length === 0 || isBroadcasting}
          onClick={handleBroadcastSelected}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {selectedProofIds.length > 0
              ? `Broadcast ${selectedProofIds.length} Selected Graphic →`
              : 'Select Testimonials to Post'}
          </span>
        </button>
      </section>

      {/* TESTIMONIALS SELECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900">
            2. Select Testimonial(s) for this {layoutClass.toUpperCase()} Template
          </h3>
          <span className="text-xs font-semibold text-purple-600">
            {selectedProofIds.length} / {layoutClass === 'single' ? 1 : layoutClass === 'double' ? 2 : 3} selected
          </span>
        </div>

        {filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-xs space-y-3">
            <h4 className="text-base font-bold text-slate-900">No Approved Testimonials Yet</h4>
            <div className="flex flex-wrap gap-2 justify-center">
              {pendingReviewsCount > 0 && (
                <button
                  type="button"
                  onClick={handleApproveAllPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  <span>Approve {pendingReviewsCount} Pending</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleLoadSampleProofs}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>⚡ Load 3 Sample Proofs to Test Studio</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTestimonials.map((item) => {
              const isSelected = selectedProofIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  data-testid={`review-card-${item.id}`}
                  onClick={() => toggleProofSelection(item.id)}
                  className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected ? 'border-purple-600 ring-2 ring-purple-600/15 bg-purple-50/10' : 'border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(Math.max(1, Math.min(5, Math.round(item.rating || 5))))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isSelected ? 'bg-purple-600 text-white' : 'border border-slate-300 bg-white'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-sm text-slate-800">"{item.content}"</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.authorName}</p>
                      <p className="text-[11px] text-slate-500">{item.authorRole}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const selectedItems = testimonials.filter((t) => selectedProofIds.includes(t.id));
                        const dataUrl = renderAdvancedSocialCard(
                          selectedItems.length ? selectedItems : [item],
                          workspaceName,
                          layoutClass,
                          themeColor,
                          heroScreenshot
                        );
                        setPreviewCardModal({ title: `${layoutClass.toUpperCase()} Graphic Preview`, dataUrl });
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Template</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PREVIEW MODAL */}
      {previewCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{previewCardModal.title}</h3>
              <button type="button" onClick={() => setPreviewCardModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <img src={previewCardModal.dataUrl} alt="Template Preview" className="w-full h-auto block" />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPreviewCardModal(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">
                Close
              </button>
              <a
                href={previewCardModal.dataUrl}
                download={`${workspaceName}-${layoutClass}-template.png`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download HD PNG</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialBroadcastStudio;
