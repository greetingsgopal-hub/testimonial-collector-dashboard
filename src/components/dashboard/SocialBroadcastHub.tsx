import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
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
  X,
} from 'lucide-react';

export interface SocialTestimonial {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  rating: number;
  createdAt?: string;
}

type ChannelId = 'linkedin' | 'x' | 'whatsapp' | 'facebook' | 'instagram' | 'webhook';

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
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Safe roundRect helper for environments where roundRect is unsupported
    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.rect(x, y, w, h);
      }
    };

    // Rich Dark-Purple SaaS Gradient Background
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.5, '#1E1B4B');
    grad.addColorStop(1, '#4C1D95');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Subtle Top Pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    drawRoundRect(90, 90, 360, 54, 27);
    ctx.fill();
    ctx.fillStyle = '#E9D5FF';
    ctx.font = 'bold 22px Inter, system-ui, sans-serif';
    ctx.fillText(`✓ VERIFIED CUSTOMER PRAISE`, 120, 125);

    // Main White Card
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    drawRoundRect(90, 180, 900, 740, 40);
    ctx.fill();

    // Star Rating
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 44px sans-serif';
    const stars = '★'.repeat(Math.max(1, Math.min(5, Math.round(t.rating || 5))));
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

    // Author Avatar Circle
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

    // Footer Watermark
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 22px Inter, system-ui, sans-serif';
    ctx.fillText(`Verified by PandaPraise • ${workspaceName}`, 90, 985);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Canvas render notice:', err);
    return '';
  }
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
  const [selectedProofIds, setSelectedProofIds] = useState<string[]>([]);
  const [starFilter, setStarFilter] = useState<'all' | '5' | '4+'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Multi-Platform Webhook Automation State (Stored in Firestore)
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [webhookInput, setWebhookInput] = useState<string>('');

  // Target Channels Selection (User can toggle multiple destinations at once)
  const [channels, setChannels] = useState<ChannelState[]>([
    {
      id: 'linkedin',
      name: 'LinkedIn',
      dotColor: 'bg-blue-600',
      modeLabel: 'Composer Ready',
      selected: true,
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      dotColor: 'bg-slate-900',
      modeLabel: 'Composer Ready',
      selected: true,
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      dotColor: 'bg-emerald-500',
      modeLabel: 'Direct Share Ready',
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

  // Synchronize when initialApprovedTestimonials changes
  useEffect(() => {
    if (initialApprovedTestimonials && initialApprovedTestimonials.length > 0) {
      setTestimonials(initialApprovedTestimonials);
    }
  }, [initialApprovedTestimonials]);

  // 1. Load Real Approved Testimonials & Saved Webhook from Firestore
  const loadRealData = async () => {
    setIsLoading(true);
    try {
      if (!db) {
        if (initialApprovedTestimonials?.length) {
          setTestimonials(initialApprovedTestimonials);
        }
        return;
      }

      // Load saved automation webhook from workspace doc
      const wsRef = doc(db, 'workspaces', workspaceId);
      const wsSnap = await getDoc(wsRef).catch(() => null);
      if (wsSnap && wsSnap.exists()) {
        const wsData = wsSnap.data();
        if (wsData.socialWebhookUrl) {
          setWebhookUrl(wsData.socialWebhookUrl);
          setWebhookInput(wsData.socialWebhookUrl);
        }
      }

      const rows: SocialTestimonial[] = [];

      // Query 'reviews' collection
      const q1 = query(
        collection(db, 'reviews'),
        where('workspaceId', '==', workspaceId),
        where('status', '==', 'approved')
      );
      const snap1 = await getDocs(q1).catch(() => null);
      if (snap1 && !snap1.empty) {
        snap1.docs.forEach((d) => {
          const data = d.data();
          rows.push({
            id: d.id,
            authorName: data.authorName || data.name || data.author_name || 'Verified Customer',
            authorRole: data.authorRole || data.role || data.author_role || 'Verified Buyer',
            content: data.content || data.text || '',
            rating: Number(data.rating || 5),
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
          });
        });
      }

      // Query 'testimonials' collection for additional compatibility
      const q2 = query(
        collection(db, 'testimonials'),
        where('workspaceId', '==', workspaceId),
        where('status', '==', 'approved')
      );
      const snap2 = await getDocs(q2).catch(() => null);
      if (snap2 && !snap2.empty) {
        snap2.docs.forEach((d) => {
          if (!rows.some((r) => r.id === d.id)) {
            const data = d.data();
            rows.push({
              id: d.id,
              authorName: data.authorName || data.name || data.author_name || 'Verified Customer',
              authorRole: data.authorRole || data.role || data.author_role || 'Verified Buyer',
              content: data.content || data.text || '',
              rating: Number(data.rating || 5),
              createdAt: data.createdAt || data.created_at || new Date().toISOString(),
            });
          }
        });
      }

      if (rows.length > 0) {
        setTestimonials(rows);
      } else if (initialApprovedTestimonials?.length) {
        setTestimonials(initialApprovedTestimonials);
      }
    } catch (err) {
      console.warn('Firestore fetch notice:', err);
      if (initialApprovedTestimonials?.length) {
        setTestimonials(initialApprovedTestimonials);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, [workspaceId]);

  // Filtered testimonials based on All / 5 Stars / 4+ Stars buttons
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
    if (selectedProofIds.length === filteredTestimonials.length && filteredTestimonials.length > 0) {
      setSelectedProofIds([]);
    } else {
      setSelectedProofIds(filteredTestimonials.map((t) => t.id));
    }
  };

  // Save Real Multi-Network Webhook URL (Make.com / Zapier / Buffer / n8n) to Firestore
  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = webhookInput.trim();
    setWebhookUrl(trimmed);
    setIsConfigModalOpen(false);

    try {
      if (db) {
        await setDoc(
          doc(db, 'workspaces', workspaceId),
          { socialWebhookUrl: trimmed, updatedAt: serverTimestamp() },
          { merge: true }
        );
      }
      setStatusBanner({
        type: 'success',
        text: trimmed
          ? 'Multi-network automation webhook connected! Clicking Broadcast will now POST all selected testimonials simultaneously.'
          : 'Webhook removed. Using direct browser broadcast mode.',
      });
    } catch {
      setStatusBanner({
        type: 'info',
        text: 'Webhook saved for this session.',
      });
    }
  };

  // Format Selected Testimonials into a Combined Multi-Review Social Post
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

  // MASTER ACTION: Broadcast All Selected Testimonials Across All Selected Channels At Once
  const handleBroadcastSelected = async () => {
    const selectedItems = testimonials.filter((t) => selectedProofIds.includes(t.id));
    const activeChannels = channels.filter((c) => c.selected);

    if (selectedItems.length === 0) {
      setStatusBanner({
        type: 'error',
        text: 'Please select at least 1 approved testimonial below to broadcast.',
      });
      return;
    }

    if (activeChannels.length === 0 && !webhookUrl) {
      setStatusBanner({
        type: 'error',
        text: 'Please select at least 1 social network card above.',
      });
      return;
    }

    setIsBroadcasting(true);
    setStatusBanner(null);

    try {
      const combinedCaption = buildBatchCaption(selectedItems);

      // 1. Copy combined caption to clipboard automatically
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(combinedCaption).catch(() => null);
      }

      // 2. Generate 1080x1080 PNG Image Cards for all selected testimonials
      const renderedCards = selectedItems.map((item) => ({
        testimonialId: item.id,
        authorName: item.authorName,
        authorRole: item.authorRole,
        rating: item.rating,
        content: item.content,
        imageCardBase64: renderTestimonialCardDataUrl(item, workspaceName),
      }));

      // 3. If Webhook Automation is connected (Make / Zapier / Buffer / n8n), fire ALL selected items + images in 1 real HTTP POST!
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

      // 4. Execute Direct Browser Actions for Each Selected Channel
      const encodedText = encodeURIComponent(combinedCaption);

      // Download 1080x1080 PNG Cards if Instagram/FB is selected
      if (activeChannels.some((c) => c.id === 'instagram')) {
        renderedCards.forEach((card, index) => {
          if (!card.imageCardBase64) return;
          const a = document.createElement('a');
          a.href = card.imageCardBase64;
          a.download = `${workspaceName}-praise-${index + 1}.png`;
          a.click();
        });
      }

      // Open Pre-filled Composer Tabs for Selected Networks
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
        text: `Broadcast launched for ${selectedItems.length} testimonial(s) across ${activeChannels
          .map((c) => c.name)
          .join(', ')}! Caption copied to clipboard${
          webhookUrl ? ' & webhook payload dispatched.' : '.'
        }`,
      });
    } catch (err: any) {
      setStatusBanner({
        type: 'error',
        text: err.message || 'Failed to complete broadcast dispatch.',
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* 1. HEADER CARD */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              Multi-Channel Social Broadcast Studio
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">On Social Media</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Select your target networks and approved customer testimonials below to broadcast across all channels at once.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsConfigModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shrink-0 cursor-pointer"
        >
          <Webhook className="w-4 h-4 text-purple-600" />
          <span>{webhookUrl ? 'Automation Webhook Active ✓' : 'Connect Auto-Post Webhook'}</span>
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

      {/* 2. TARGET SOCIAL DESTINATIONS (MULTI-SELECTABLE CARDS — ZERO BROKEN OAUTH REDIRECTS) */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                1. Connected Social Accounts ({channels.filter((c) => c.selected).length} Selected)
              </h2>
              <p className="text-xs text-slate-500">
                Click any network card to include or exclude it from your 1-click batch broadcast.
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

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{ch.modeLabel}</span>
                <span
                  className={`font-bold ${
                    ch.selected ? 'text-purple-700' : 'text-slate-400'
                  }`}
                >
                  {ch.selected ? 'Included ✓' : 'Click to enable'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. SELECTION & FILTER ACTION BAR */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSelectAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
          >
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

        {/* MASTER MULTI-BROADCAST CTA BUTTON */}
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
              ? `Broadcast ${selectedProofIds.length} Selected to ${
                  channels.filter((c) => c.selected).length
                } Channels →`
              : 'Select Testimonials to Post'}
          </span>
        </button>
      </section>

      {/* 4. APPROVED TESTIMONIALS MULTI-SELECT GRID */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900">
            2. Approved Testimonials ({filteredTestimonials.length})
          </h3>
          <span className="text-xs font-semibold text-purple-600">
            {selectedProofIds.length} queued for broadcast
          </span>
        </div>

        {filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              No Approved Testimonials Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              Once you approve incoming customer reviews in the <strong>Evaluate</strong> tab, they appear here automatically so you can select and broadcast them across your social channels.
            </p>
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
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(Math.max(1, Math.min(5, Math.round(item.rating || 5))))].map(
                          (_, idx) => (
                            <Star key={idx} className="w-4 h-4 fill-current" />
                          )
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="sr-only"
                          aria-label={`Select testimonial by ${item.authorName}`}
                        />
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            isSelected
                              ? 'bg-purple-600 text-white'
                              : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-800 leading-relaxed line-clamp-4">
                      "{item.content}"
                    </p>
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
                        const dataUrl = renderTestimonialCardDataUrl(item, workspaceName);
                        if (!dataUrl) return;
                        const a = document.createElement('a');
                        a.href = dataUrl;
                        a.download = `${workspaceName}-${item.authorName}-card.png`;
                        a.click();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-[11px] font-semibold text-slate-600 cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>HD Card</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. MULTI-NETWORK WEBHOOK AUTOMATION MODAL (MAKE / ZAPIER / BUFFER / N8N) */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Multi-Network Auto-Post Webhook
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Post simultaneously to LinkedIn, X, Facebook Pages, and Instagram Business in the background.
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
                <p className="font-bold text-purple-900">How 1-Click Background Auto-Posting Works:</p>
                <p>
                  Paste a Webhook URL from <strong>Make.com</strong>, <strong>Zapier</strong>, <strong>n8n</strong>, or <strong>Pabbly Connect</strong>. Whenever you select testimonials and click <strong>Broadcast</strong>, PandaPraise sends the formatted text captions + <strong>auto-rendered 1080×1080 PNG images</strong> directly to your scenario so all 4 social accounts post simultaneously.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destination Webhook URL (Optional)
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                >
                  Save Broadcast Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
