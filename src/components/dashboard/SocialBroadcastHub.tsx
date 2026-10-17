import React, { useState, useEffect, useMemo } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Share2,
  Check,
  Sparkles,
  Download,
  Send,
  RefreshCw,
  Webhook,
  CheckSquare,
  Square,
  Star,
  Eye,
  PlusCircle,
  CheckCircle2,
  X,
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

type ChannelId = 'linkedin' | 'x' | 'whatsapp' | 'instagram';

interface ChannelState {
  id: ChannelId;
  name: string;
  dotColor: string;
  modeLabel: string;
  selected: boolean;
}

// Helper: Generate a real 1080x1080 HD PNG Social Card from a Testimonial using HTML5 Canvas
export function renderTestimonialCardDataUrl(
  t: SocialTestimonial,
  workspaceName: string
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const safeRoundRect = (
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    if (typeof (c as any).roundRect === 'function') {
      (c as any).roundRect(x, y, w, h, r);
    } else {
      c.rect(x, y, w, h);
    }
  };

  // Rich Dark-Purple SaaS Gradient Background
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, '#0F172A');
  grad.addColorStop(0.5, '#1E1B4B');
  grad.addColorStop(1, '#4C1D95');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  // Top Verified Badge Pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  safeRoundRect(ctx, 90, 90, 390, 54, 27);
  ctx.fill();
  ctx.fillStyle = '#E9D5FF';
  ctx.font = 'bold 22px Inter, system-ui, sans-serif';
  ctx.fillText('✓ VERIFIED CUSTOMER PRAISE', 120, 125);

  // Main White Quote Card
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  safeRoundRect(ctx, 90, 180, 900, 740, 40);
  ctx.fill();

  // Star Rating Row
  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 44px sans-serif';
  const starCount = Math.max(1, Math.min(5, Math.round(t.rating || 5)));
  const stars = '★'.repeat(starCount);
  ctx.fillText(`${stars}  ${Number(t.rating || 5).toFixed(1)}`, 150, 275);

  // Word-Wrapped Testimonial Quote
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 36px Inter, system-ui, sans-serif';
  const words = `"${t.content}"`.split(' ');
  let line = '';
  let y = 365;
  const maxWidth = 780;
  const lineHeight = 52;

  for (const word of words) {
    const testLine = line + word + ' ';
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line, 150, y);
      line = word + ' ';
      y += lineHeight;
      if (y > 680) {
        line += '...';
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 150, y);

  // Author Initials Avatar
  ctx.fillStyle = '#7C3AED';
  ctx.beginPath();
  ctx.arc(185, 815, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Inter, system-ui, sans-serif';
  ctx.fillText((t.authorName || 'V').slice(0, 1).toUpperCase(), 174, 825);

  // Author Name & Role
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 30px Inter, system-ui, sans-serif';
  ctx.fillText(t.authorName || 'Verified Customer', 240, 808);

  ctx.fillStyle = '#64748B';
  ctx.font = '24px Inter, system-ui, sans-serif';
  ctx.fillText(`${t.authorRole || 'Verified Buyer'} • ${workspaceName}`, 240, 844);

  // Bottom Branding Footer
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '600 22px Inter, system-ui, sans-serif';
  ctx.fillText(`Verified by PandaPraise • ${workspaceName}`, 90, 985);

  return canvas.toDataURL('image/png');
}

export default function SocialBroadcastHub({
  workspaceId = 'papasystem',
  workspaceName = 'papasystem',
  initialApprovedTestimonials,
}: {
  workspaceId?: string;
  workspaceName?: string;
  initialApprovedTestimonials?: SocialTestimonial[];
}) {
  const [testimonials, setTestimonials] = useState<SocialTestimonial[]>(
    initialApprovedTestimonials || []
  );
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
  const [selectedProofIds, setSelectedProofIds] = useState<string[]>([]);
  const [starFilter, setStarFilter] = useState<'all' | '5' | '4+'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [previewCardModal, setPreviewCardModal] = useState<{
    title: string;
    dataUrl: string;
  } | null>(null);

  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Optional Webhook Automation State
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [webhookInput, setWebhookInput] = useState<string>('');

  // Target Channels (Default LinkedIn, X, and Instagram/FB Card enabled for immediate 1-click flow)
  const [channels, setChannels] = useState<ChannelState[]>([
    {
      id: 'linkedin',
      name: 'LinkedIn',
      dotColor: 'bg-blue-600',
      modeLabel: 'Pre-filled Feed Post',
      selected: true,
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      dotColor: 'bg-slate-900',
      modeLabel: 'Pre-filled Post Intent',
      selected: true,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      dotColor: 'bg-emerald-500',
      modeLabel: 'Direct Chat / Status',
      selected: false,
    },
    {
      id: 'instagram',
      name: 'Instagram & FB Card',
      dotColor: 'bg-pink-600',
      modeLabel: '1080×1080 PNG Auto-Card',
      selected: true,
    },
  ]);

  const selectedChannelsCount = channels.filter((c) => c.selected).length;

  // 1. Load Real Approved & Pending Testimonials from Firestore
  const loadRealData = async () => {
    setIsLoading(true);
    try {
      const db = getFirestore();

      const wsRef = doc(db, 'workspaces', workspaceId);
      const wsSnap = await getDoc(wsRef);
      if (wsSnap.exists()) {
        const wsData = wsSnap.data();
        if (wsData.socialWebhookUrl) {
          setWebhookUrl(wsData.socialWebhookUrl);
          setWebhookInput(wsData.socialWebhookUrl);
        }
      }

      // Query testimonials & reviews collections for this workspace
      const approvedRows: SocialTestimonial[] = [];
      const seenIds = new Set<string>();
      let pendingCount = 0;

      const qTestimonials = query(
        collection(db, 'testimonials'),
        where('workspaceId', '==', workspaceId)
      );
      const snapTestimonials = await getDocs(qTestimonials);

      snapTestimonials.docs.forEach((d) => {
        const data = d.data();
        if (data.status === 'pending') {
          pendingCount += 1;
        } else if (data.status === 'approved' || !data.status) {
          seenIds.add(d.id);
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

      // Also check reviews collection for approved/pending
      const qReviews = query(
        collection(db, 'reviews'),
        where('workspaceId', '==', workspaceId)
      );
      const snapReviews = await getDocs(qReviews);

      snapReviews.docs.forEach((d) => {
        const data = d.data();
        if (data.status === 'pending') {
          pendingCount += 1;
        } else if ((data.status === 'approved' || !data.status) && !seenIds.has(d.id)) {
          seenIds.add(d.id);
          approvedRows.push({
            id: d.id,
            authorName: data.authorName || data.author_name || data.name || 'Verified Customer',
            authorRole: data.authorRole || data.author_role || data.role || 'Verified Buyer',
            content: data.content || data.text || '',
            rating: Number(data.rating || 5),
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
          });
        }
      });

      setPendingReviewsCount(pendingCount);

      if (approvedRows.length > 0) {
        setTestimonials(approvedRows);
        setSelectedProofIds([approvedRows[0].id]);
      } else if (initialApprovedTestimonials?.length) {
        setTestimonials(initialApprovedTestimonials);
        setSelectedProofIds([initialApprovedTestimonials[0].id]);
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

  // 2. Smooth Journey Helper: Approve Waiting Pending Reviews in 1 Click
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
        text: `Approved ${snap.docs.length} pending testimonial(s)! They are now ready to broadcast.`,
      });
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        text: err.message || 'Could not approve pending testimonials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Smooth Journey Helper: Seed 3 Sample Proofs so Users Can Test Broadcasting Immediately
  const handleLoadSampleProofs = async () => {
    const sampleProofs: SocialTestimonial[] = [
      {
        id: `sample-${Date.now()}-1`,
        authorName: 'Aarav Mehta',
        authorRole: 'Founder, FinStack',
        content: `Switching to ${workspaceName} saved our team 6 hours every week and doubled our customer trust on the checkout page!`,
        rating: 5,
        isSample: true,
      },
      {
        id: `sample-${Date.now()}-2`,
        authorName: 'Sarah Jenkins',
        authorRole: 'Head of Growth, ScaleOps',
        content: `The fastest onboarding we have ever experienced. Within 5 minutes of setting up ${workspaceName}, we had live social proof running.`,
        rating: 5,
        isSample: true,
      },
      {
        id: `sample-${Date.now()}-3`,
        authorName: 'Rohan Kulkarni',
        authorRole: 'CTO, CloudPulse',
        content: `Clean UI, zero page-speed bloat, and rock-solid reliability. Highly recommend ${workspaceName} to any growing business.`,
        rating: 5,
        isSample: true,
      },
    ];

    setTestimonials(sampleProofs);
    setSelectedProofIds([sampleProofs[0].id]);

    // Also persist to Firestore if authenticated so they stay available across tabs
    try {
      const db = getFirestore();
      for (const sp of sampleProofs) {
        await addDoc(collection(db, 'testimonials'), {
          workspaceId,
          authorName: sp.authorName,
          authorRole: sp.authorRole,
          content: sp.content,
          rating: sp.rating,
          mediaType: 'text',
          status: 'approved',
          source: 'Sample Starter',
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // Keeps samples in local state if Firestore write is restricted
    }

    setStatusBanner({
      type: 'info',
      text: 'Loaded 3 sample testimonials & pre-selected the first one! Click the purple "Broadcast" button below to test your 1-click flow.',
    });
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
    setSelectedProofIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (
      selectedProofIds.length === filteredTestimonials.length &&
      filteredTestimonials.length > 0
    ) {
      setSelectedProofIds([]);
    } else {
      setSelectedProofIds(filteredTestimonials.map((t) => t.id));
    }
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = webhookInput.trim();
    setWebhookUrl(trimmed);
    setIsConfigModalOpen(false);

    try {
      const db = getFirestore();
      await setDoc(
        doc(db, 'workspaces', workspaceId),
        { socialWebhookUrl: trimmed, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch {
      // Ignore if offline
    }

    if (trimmed) {
      setStatusBanner({
        type: 'success',
        text: 'Background automation webhook connected! Clicking Broadcast will now send all selected posts simultaneously.',
      });
    }
  };

  const buildBatchCaption = (selectedItems: SocialTestimonial[]): string => {
    if (selectedItems.length === 1) {
      const item = selectedItems[0];
      return `"${item.content}"\n\n— ${item.authorName} (${item.authorRole}) ⭐️⭐️⭐️⭐️⭐️\n\nVerified customer love for ${workspaceName} via @PandaPraise`;
    }

    const lines = selectedItems.map(
      (item, idx) =>
        `${idx + 1}. "${item.content}" — ${item.authorName} (${item.authorRole}) ⭐️ ${item.rating}.0`
    );
    return `Here is what verified customers are saying about ${workspaceName}:\n\n${lines.join(
      '\n\n'
    )}\n\nCollected & verified via PandaPraise`;
  };

  // MASTER ACTION: Broadcast All Selected Testimonials Across All Selected Channels
  const handleBroadcastSelected = async () => {
    const selectedItems = testimonials.filter((t) => selectedProofIds.includes(t.id));
    const activeChannels = channels.filter((c) => c.selected);

    if (selectedItems.length === 0) {
      setStatusBanner({
        type: 'error',
        text: 'Select at least 1 testimonial below first.',
      });
      return;
    }

    if (activeChannels.length === 0 && !webhookUrl) {
      setStatusBanner({
        type: 'error',
        text: 'Select at least 1 social destination card in Step 1.',
      });
      return;
    }

    setIsBroadcasting(true);
    setStatusBanner(null);

    try {
      const combinedCaption = buildBatchCaption(selectedItems);
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(combinedCaption).catch(() => null);
      }

      const renderedCards = selectedItems.map((item) => ({
        testimonialId: item.id,
        authorName: item.authorName,
        authorRole: item.authorRole,
        rating: item.rating,
        content: item.content,
        imageCardBase64: renderTestimonialCardDataUrl(item, workspaceName),
      }));

      // Fire background webhook if configured
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'social.batch_broadcast',
            workspaceId,
            workspaceName,
            targetChannels: activeChannels.map((c) => c.id),
            combinedCaption,
            count: selectedItems.length,
            items: renderedCards,
            timestamp: new Date().toISOString(),
          }),
        });
      }

      const encodedText = encodeURIComponent(combinedCaption);

      // Auto-download 1080x1080 PNG card if Instagram & FB Card is selected
      if (activeChannels.some((c) => c.id === 'instagram')) {
        renderedCards.forEach((card, index) => {
          if (!card.imageCardBase64) return;
          const a = document.createElement('a');
          a.href = card.imageCardBase64;
          a.download = `${workspaceName}-testimonial-${index + 1}.png`;
          a.click();
        });
      }

      if (activeChannels.some((c) => c.id === 'linkedin')) {
        window.open(
          `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
          '_blank',
          'noopener,noreferrer'
        );
      }

      if (activeChannels.some((c) => c.id === 'x')) {
        window.open(
          `https://x.com/intent/post?text=${encodedText}`,
          '_blank',
          'noopener,noreferrer'
        );
      }

      if (activeChannels.some((c) => c.id === 'whatsapp')) {
        window.open(
          `https://api.whatsapp.com/send?text=${encodedText}`,
          '_blank',
          'noopener,noreferrer'
        );
      }

      setStatusBanner({
        type: 'success',
        text: `Broadcast launched for ${selectedItems.length} review(s) across ${activeChannels
          .map((c) => c.name)
          .join(', ')}! Formatted caption copied to clipboard.`,
      });
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        text: err.message || 'Broadcast failed.',
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* 1. PAGE HEADER */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              1-Click Social Proof Distribution
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">On Social Media</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Turn customer reviews into ready-to-post LinkedIn, X, WhatsApp, and 1080×1080 Instagram cards in 1 click.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsConfigModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          <Webhook className="w-4 h-4 text-purple-600" />
          <span>
            {webhookUrl ? 'Auto-Post Webhook Active ✓' : 'Optional: Background Auto-Post'}
          </span>
        </button>
      </section>

      {/* STATUS BANNER */}
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
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. STEP 1: CHOOSE BROADCAST DESTINATIONS */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                1. Choose Broadcast Destinations ({selectedChannelsCount} Selected)
              </h2>
              <p className="text-xs text-slate-500">
                Select which social networks should open or download when you click Broadcast.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadRealData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Proofs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {channels.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => toggleChannel(ch.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[104px] ${
                ch.selected
                  ? 'border-purple-600 bg-purple-50/30 ring-2 ring-purple-600/15'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${ch.dotColor}`} />
                  <span className="font-bold text-sm text-slate-900">{ch.name}</span>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    ch.selected
                      ? 'bg-purple-600 text-white'
                      : 'border border-slate-300 bg-white'
                  }`}
                >
                  {ch.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs gap-2">
                <span className="text-slate-500 font-medium truncate">{ch.modeLabel}</span>
                <span
                  className={`font-bold whitespace-nowrap shrink-0 ${
                    ch.selected ? 'text-purple-700' : 'text-slate-400'
                  }`}
                >
                  {ch.selected ? 'Included ✓' : 'Enable'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. STEP 2: SELECT TESTIMONIALS & CLICK BROADCAST */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSelectAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={selectedProofIds.length === filteredTestimonials.length && filteredTestimonials.length > 0}
              onChange={() => {}}
              aria-label="Select all testimonials"
            />
            {selectedProofIds.length === filteredTestimonials.length &&
            filteredTestimonials.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-purple-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select All</span>
          </button>

          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100">
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
        </div>

        {/* PRIMARY BROADCAST CTA */}
        <button
          type="button"
          data-testid="publish-social-btn"
          disabled={selectedProofIds.length === 0 || isBroadcasting}
          onClick={handleBroadcastSelected}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedProofIds.length > 0
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-200'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>
            {selectedProofIds.length > 0
              ? `Broadcast ${selectedProofIds.length} Selected to ${selectedChannelsCount} Channels →`
              : 'Select Testimonials to Post'}
          </span>
        </button>
      </section>

      {/* 4. APPROVED TESTIMONIALS LIST OR ACTIONABLE EMPTY STATE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900">
            2. Select Approved Testimonials ({filteredTestimonials.length})
          </h3>
          <span className="text-xs font-semibold text-purple-600">
            {selectedProofIds.length} queued for broadcast
          </span>
        </div>

        {filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              No Approved Testimonials in Your Queue Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Want to test the 1-click social broadcaster and 1080×1080 Instagram card generator right now? Load 3 sample reviews below or approve waiting customer submissions.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {pendingReviewsCount > 0 && (
                <button
                  type="button"
                  onClick={handleApproveAllPending}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve {pendingReviewsCount} Pending Review(s) Now</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleLoadSampleProofs}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-200 cursor-pointer"
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
                    isSelected
                      ? 'border-purple-600 ring-2 ring-purple-600/15 bg-purple-50/10'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(Math.max(1, Math.min(5, Math.round(item.rating || 5))))].map(
                            (_, idx) => (
                              <Star key={idx} className="w-4 h-4 fill-current" />
                            )
                          )}
                        </div>
                        {item.isSample && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
                            Sample Proof
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'border border-slate-300 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={`Select testimonial by ${item.authorName}`}
                        />
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-sm text-slate-800 leading-relaxed">
                      "{item.content}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.authorName}</p>
                      <p className="text-[11px] text-slate-500">{item.authorRole}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const dataUrl = renderTestimonialCardDataUrl(item, workspaceName);
                          setPreviewCardModal({
                            title: `${item.authorName} — 1080×1080 Social Card`,
                            dataUrl,
                          });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const dataUrl = renderTestimonialCardDataUrl(item, workspaceName);
                          if (!dataUrl) return;
                          const a = document.createElement('a');
                          a.href = dataUrl;
                          a.download = `${workspaceName}-${item.authorName}-card.png`;
                          a.click();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[11px] font-bold text-purple-700 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PNG</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* LIVE 1080x1080 SOCIAL CARD PREVIEW MODAL */}
      {previewCardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{previewCardModal.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewCardModal(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="my-4 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <img
                src={previewCardModal.dataUrl}
                alt="Rendered Social Proof Card"
                className="w-full h-auto block"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreviewCardModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <a
                href={previewCardModal.dataUrl}
                download={`${workspaceName}-social-card.png`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download 1080×1080 PNG</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* OPTIONAL WEBHOOK AUTOMATION MODAL */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Optional: Background Auto-Post Webhook
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  For power users automating LinkedIn, X, Facebook Pages & Instagram Business via Make or Zapier.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWebhook} className="mt-4 space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                <p className="font-bold text-purple-900">No Webhook Needed for Standard Sharing!</p>
                <p>
                  By default, clicking <strong>Broadcast</strong> opens pre-filled LinkedIn, X, and WhatsApp composers and downloads your 1080×1080 Instagram card directly in your browser. Only add a Make.com / Zapier URL below if you want background webhook triggers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Make.com / Zapier / n8n Webhook URL (Optional)
                </label>
                <input
                  type="url"
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  placeholder="https://hook.eu1.make.com/xxxxxxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                >
                  Save Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
