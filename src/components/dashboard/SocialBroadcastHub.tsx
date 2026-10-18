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
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  Share2,
  Check,
  Sparkles,
  Download,
  Send,
  RefreshCw,
  Webhook,
  Star,
  Eye,
  PlusCircle,
  CheckCircle2,
  X,
  Upload,
  Image as ImageIcon,
  Layers,
  Trash2,
  Sliders,
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

// 1. Helper: Clean raw workspace names like "MYPROJECTPOTATO's Workspace" -> "Project Potato"
export function formatCleanBrandName(rawName: string): string {
  if (!rawName) return 'our team';
  const stripped = rawName
    .replace(/'s\s+workspace$/i, '')
    .replace(/\s+workspace$/i, '')
    .trim();

  // If it's an all-caps joined string like "MYPROJECTPOTATO" or "GREETINGSGOPAL", format cleanly
  if (/^[A-Z0-9]+$/.test(stripped) && stripped.length > 6) {
    return stripped.charAt(0).toUpperCase() + stripped.slice(1).toLowerCase();
  }
  return stripped;
}

export type LayoutClass = 'single' | 'double' | 'triple';
export type BackgroundStyle = 'gradient' | 'light' | 'neon' | 'hero_screenshot';
export type CardTemplateType = 'gradient' | 'light' | 'neon' | 'hero_screenshot';

export interface CardRenderOptions {
  layoutClass?: LayoutClass;
  backgroundStyle?: BackgroundStyle;
  heroScreenshotDataUrl?: string;
  overlayOpacity?: number; // 0.4 to 0.95, default 0.82
}

/**
 * Advanced Multi-Template Canvas Renderer
 * Supports:
 * - Single Testimonial (Hero quote, big rating, citation)
 * - Double Testimonials (Dialogue stack, white + lime contrast cards)
 * - Triple Testimonials (Cascading multi-card grid with pastel accents)
 * - Custom Website Hero Screenshot background with domain visible + scrim overlay
 */
export async function renderAdvancedSocialCard(
  testimonials: SocialTestimonial[],
  workspaceName: string,
  options: CardRenderOptions = {}
): Promise<string> {
  const brand = formatCleanBrandName(workspaceName);
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

  const wrapText = (
    c: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 6
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let linesDrawn = 0;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = c.measureText(testLine);
      if (metrics.width > maxWidth && line !== '') {
        linesDrawn++;
        if (linesDrawn >= maxLines && i < words.length - 1) {
          c.fillText(line.trim() + '...', x, currentY);
          return;
        }
        c.fillText(line.trim(), x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      c.fillText(line.trim(), x, currentY);
    }
  };

  const drawDefaultGradient = () => {
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.5, '#1E1B4B');
    grad.addColorStop(1, '#4C1D95');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);
  };

  // 1. Draw Background
  if (options.backgroundStyle === 'hero_screenshot' && options.heroScreenshotDataUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = options.heroScreenshotDataUrl!;
      });

      const imgRatio = img.width / img.height;
      const canvasRatio = 1;
      let drawW = 1080;
      let drawH = 1080;
      let drawX = 0;
      let drawY = 0;

      if (imgRatio > canvasRatio) {
        drawH = 1080;
        drawW = 1080 * imgRatio;
        drawX = (1080 - drawW) / 2;
      } else {
        drawW = 1080;
        drawH = 1080 / imgRatio;
        drawY = (1080 - drawH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Dark translucent scrim overlay for contrast
      const opacity = Math.max(0.3, Math.min(0.98, options.overlayOpacity ?? 0.82));
      ctx.fillStyle = `rgba(11, 15, 25, ${opacity})`;
      ctx.fillRect(0, 0, 1080, 1080);
    } catch {
      drawDefaultGradient();
    }
  } else if (options.backgroundStyle === 'light') {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 1080, 1080);
  } else if (options.backgroundStyle === 'neon') {
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, 1080, 1080);
  } else {
    drawDefaultGradient();
  }

  const isLight = options.backgroundStyle === 'light';

  // 2. Verified Top Badge Pill
  ctx.beginPath();
  safeRoundRect(ctx, 90, 80, 420, 50, 25);
  ctx.fillStyle = isLight ? '#EDE9FE' : 'rgba(255, 255, 255, 0.12)';
  ctx.fill();
  if (!isLight) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.fillStyle = isLight ? '#6D28D9' : '#E9D5FF';
  ctx.font = 'bold 20px Inter, system-ui, sans-serif';
  ctx.fillText('🐼 VERIFIED CUSTOMER PROOF', 120, 112);

  const layout = options.layoutClass || 'single';

  // 3. Render Selected Layout Class
  if (layout === 'single' && testimonials.length > 0) {
    const t = testimonials[0];

    // Single Main Card
    ctx.beginPath();
    safeRoundRect(ctx, 90, 160, 900, 770, 36);
    ctx.fillStyle = isLight ? '#FFFFFF' : '#0F172A';
    ctx.fill();
    ctx.strokeStyle = isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stars
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 36px Inter, system-ui, sans-serif';
    ctx.fillText('★★★★★  ' + Number(t.rating || 5).toFixed(1), 150, 240);

    // Decorative Quotation Marks
    ctx.fillStyle = isLight ? '#DDD6FE' : '#334155';
    ctx.font = 'bold 90px Georgia, serif';
    ctx.fillText('“', 150, 320);

    // Quote Content
    ctx.fillStyle = isLight ? '#0F172A' : '#F8FAFC';
    ctx.font = '500 32px Inter, system-ui, sans-serif';
    wrapText(ctx, `"${t.content.replace(/MYPROJECTPOTATO's Workspace/gi, brand)}"`, 150, 370, 780, 48, 6);

    // Author Initials Avatar
    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.arc(190, 820, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px Inter, system-ui, sans-serif';
    ctx.fillText((t.authorName || 'V').slice(0, 1).toUpperCase(), 180, 830);

    // Author Info
    ctx.fillStyle = isLight ? '#0F172A' : '#FFFFFF';
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.fillText(t.authorName || 'Verified Customer', 245, 815);

    ctx.fillStyle = isLight ? '#64748B' : '#94A3B8';
    ctx.font = '22px Inter, system-ui, sans-serif';
    ctx.fillText(`${t.authorRole || 'Customer'} • ${brand}`, 245, 848);

  } else if (layout === 'double' && testimonials.length >= 2) {
    // Double Stacked Dialogue Cards (Matching Image 8 style)
    const items = [testimonials[0], testimonials[1]];

    items.forEach((t, idx) => {
      const cardY = idx === 0 ? 160 : 540;
      const isTop = idx === 0;

      // Container Box
      ctx.beginPath();
      safeRoundRect(ctx, 90, cardY, 900, 350, 30);
      ctx.fillStyle = isTop ? (isLight ? '#FFFFFF' : '#1E293B') : '#D9F99D';
      ctx.fill();
      ctx.strokeStyle = isTop ? (isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.12)') : '#BEF264';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Star rating
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 24px Inter, system-ui, sans-serif';
      ctx.fillText('★★★★★', 140, cardY + 50);

      // Quote
      ctx.fillStyle = isTop ? (isLight ? '#0F172A' : '#F8FAFC') : '#14532D';
      ctx.font = '600 24px Inter, system-ui, sans-serif';
      wrapText(ctx, `"${t.content.replace(/MYPROJECTPOTATO's Workspace/gi, brand)}"`, 140, cardY + 95, 800, 36, 4);

      // Author Signature
      ctx.fillStyle = isTop ? '#7C3AED' : '#166534';
      ctx.font = 'bold 22px Inter, system-ui, sans-serif';
      ctx.fillText(`— ${t.authorName} (${t.authorRole})`, 140, cardY + 310);
    });

  } else {
    // Triple Dynamic Cascading Cards (Matching Image 5 style)
    const items = testimonials.slice(0, 3);
    const cardThemes = [
      { bg: '#DCFCE7', text: '#14532D', sub: '#166534', rot: -0.03, x: 90, y: 160 },
      { bg: '#FCE7F3', text: '#831843', sub: '#9D174D', rot: 0.025, x: 230, y: 390 },
      { bg: '#FFFFFF', text: '#0F172A', sub: '#6D28D9', rot: -0.015, x: 130, y: 620 },
    ];

    items.forEach((t, idx) => {
      const theme = cardThemes[idx] || cardThemes[0];
      ctx.save();
      ctx.translate(theme.x + 400, theme.y + 130);
      ctx.rotate(theme.rot);
      ctx.translate(-400, -130);

      // Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 12;

      ctx.beginPath();
      safeRoundRect(ctx, theme.x, theme.y, 780, 240, 24);
      ctx.fillStyle = theme.bg;
      ctx.fill();

      // Reset shadow for text
      ctx.shadowColor = 'transparent';

      // Stars
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 20px Inter, system-ui, sans-serif';
      ctx.fillText('★★★★★', theme.x + 35, theme.y + 40);

      // Content
      ctx.fillStyle = theme.text;
      ctx.font = '600 20px Inter, system-ui, sans-serif';
      wrapText(ctx, `"${t.content.replace(/MYPROJECTPOTATO's Workspace/gi, brand)}"`, theme.x + 35, theme.y + 75, 710, 28, 3);

      // Author
      ctx.fillStyle = theme.sub;
      ctx.font = 'bold 18px Inter, system-ui, sans-serif';
      ctx.fillText(`— ${t.authorName} (${t.authorRole})`, theme.x + 35, theme.y + 205);

      ctx.restore();
    });
  }

  // 4. Bottom Watermark
  ctx.fillStyle = isLight ? '#94A3B8' : '#CBD5E1';
  ctx.font = '600 22px Inter, system-ui, sans-serif';
  ctx.fillText(`Verified by PandaPraise • ${brand}`, 90, 995);

  return canvas.toDataURL('image/png');
}

// Backward-compatible synchronous wrapper for single-card consumers
export function renderTestimonialCardDataUrl(
  t: SocialTestimonial,
  workspaceName: string,
  template: CardTemplateType = 'gradient'
): string {
  const brand = formatCleanBrandName(workspaceName);
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

  // 1. Background Canvas
  if (template === 'light') {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 1080, 1080);
  } else if (template === 'neon') {
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, 1080, 1080);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.5, '#1E1B4B');
    grad.addColorStop(1, '#4C1D95');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);
  }

  // 2. Top Verified Badge Pill
  ctx.beginPath();
  safeRoundRect(ctx, 90, 90, 390, 54, 27);
  if (template === 'light') {
    ctx.fillStyle = '#EDE9FE';
    ctx.fill();
    ctx.fillStyle = '#6D28D9';
  } else if (template === 'neon') {
    ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#E9D5FF';
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fill();
    ctx.fillStyle = '#E9D5FF';
  }
  ctx.font = 'bold 22px Inter, system-ui, sans-serif';
  ctx.fillText('✓ VERIFIED CUSTOMER PRAISE', 120, 125);

  // 3. Main Quote Card
  ctx.beginPath();
  safeRoundRect(ctx, 90, 180, 900, 740, 40);
  if (template === 'light') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 4;
    ctx.stroke();
  } else if (template === 'neon') {
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 4;
    ctx.stroke();
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }

  // 4. Star Rating Row
  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 44px sans-serif';
  const starCount = Math.max(1, Math.min(5, Math.round(t.rating || 5)));
  const stars = '★'.repeat(starCount);
  ctx.fillText(`${stars}  ${Number(t.rating || 5).toFixed(1)}`, 150, 275);

  // 5. Word-Wrapped Testimonial Quote
  if (template === 'neon') {
    ctx.fillStyle = '#F8FAFC';
  } else {
    ctx.fillStyle = '#0F172A';
  }
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

  // 6. Author Initials Avatar
  ctx.fillStyle = template === 'neon' ? '#8B5CF6' : '#7C3AED';
  ctx.beginPath();
  ctx.arc(185, 815, 36, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Inter, system-ui, sans-serif';
  ctx.fillText((t.authorName || 'V').slice(0, 1).toUpperCase(), 174, 825);

  // 7. Author Name, Role, and Branding Footer
  if (template === 'neon') {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px Inter, system-ui, sans-serif';
    ctx.fillText(t.authorName || 'Verified Customer', 240, 808);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '24px Inter, system-ui, sans-serif';
    ctx.fillText(`${t.authorRole || 'Verified Buyer'} • ${brand}`, 240, 844);

    ctx.fillStyle = '#64748B';
    ctx.font = '600 22px Inter, system-ui, sans-serif';
    ctx.fillText(`Verified by PandaPraise • ${brand}`, 90, 985);
  } else if (template === 'light') {
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 30px Inter, system-ui, sans-serif';
    ctx.fillText(t.authorName || 'Verified Customer', 240, 808);

    ctx.fillStyle = '#64748B';
    ctx.font = '24px Inter, system-ui, sans-serif';
    ctx.fillText(`${t.authorRole || 'Verified Buyer'} • ${brand}`, 240, 844);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 22px Inter, system-ui, sans-serif';
    ctx.fillText(`Verified by PandaPraise • ${brand}`, 90, 985);
  } else {
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 30px Inter, system-ui, sans-serif';
    ctx.fillText(t.authorName || 'Verified Customer', 240, 808);

    ctx.fillStyle = '#64748B';
    ctx.font = '24px Inter, system-ui, sans-serif';
    ctx.fillText(`${t.authorRole || 'Verified Buyer'} • ${brand}`, 240, 844);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 22px Inter, system-ui, sans-serif';
    ctx.fillText(`Verified by PandaPraise • ${brand}`, 90, 985);
  }

  return canvas.toDataURL('image/png');
}

export default function SocialBroadcastHub({
  workspaceId = 'papasystem',
  workspaceName = 'papasystem',
  workspaceSlug,
  workspaceWebsite,
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [layoutClass, setLayoutClass] = useState<LayoutClass>('single');
  const [cardTemplate, setCardTemplate] = useState<CardTemplateType>('gradient');
  const [heroScreenshotUrl, setHeroScreenshotUrl] = useState<string>('');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.82);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState<boolean>(false);
  const [previewCardModal, setPreviewCardModal] = useState<{
    title: string;
    dataUrl: string;
  } | null>(null);
  const [isBroadcastGuideOpen, setIsBroadcastGuideOpen] = useState<boolean>(false);

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
        setSelectedProofIds((prev) => (prev.length > 0 ? prev : [approvedRows[0].id]));
      } else if (initialApprovedTestimonials?.length) {
        setTestimonials(initialApprovedTestimonials);
        setSelectedProofIds((prev) => (prev.length > 0 ? prev : [initialApprovedTestimonials[0].id]));
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
    setIsLoading(true);
    const brand = formatCleanBrandName(workspaceName);
    const cleanSlug = (workspaceSlug || brand.toLowerCase().replace(/[^a-z0-9]/g, '')) || 'myprojectpotato';
    const now = new Date().toISOString();

    const sampleProofs: SocialTestimonial[] = [
      {
        id: `sample-${cleanSlug}-1`,
        authorName: 'Aarav Mehta',
        authorRole: 'Founder, FinStack',
        content: `Switching to ${brand} saved our team 6 hours every week and doubled our customer trust on the checkout page!`,
        rating: 5,
        isSample: true,
      },
      {
        id: `sample-${cleanSlug}-2`,
        authorName: 'Sarah Jenkins',
        authorRole: 'Head of Growth, ScaleOps',
        content: `The fastest onboarding we have ever experienced. Within 5 minutes of setting up ${brand}, we had live social proof running.`,
        rating: 5,
        isSample: true,
      },
      {
        id: `sample-${cleanSlug}-3`,
        authorName: 'Rohan Kulkarni',
        authorRole: 'CTO, CloudPulse',
        content: `Clean UI, zero page-speed bloat, and rock-solid reliability. Highly recommend ${brand} to any growing business.`,
        rating: 5,
        isSample: true,
      },
    ];

    try {
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;
      const ownerId = currentUser?.uid || 'sample-owner';

      for (let i = 0; i < sampleProofs.length; i++) {
        const item = sampleProofs[i];
        const docId = item.id;

        // 1. Write to testimonials collection (with workspaceSlug for fallback queries)
        await setDoc(
          doc(db, 'testimonials', docId),
          {
            workspaceId,
            workspaceSlug: cleanSlug,
            authorName: item.authorName,
            authorRole: item.authorRole,
            content: item.content,
            rating: 5,
            status: 'approved',
            createdAt: now,
            isSample: true,
          },
          { merge: true }
        ).catch(() => null);

        // 2. Write to reviews collection if authenticated
        if (currentUser) {
          await setDoc(
            doc(db, 'reviews', docId),
            {
              projectId: workspaceId,
              collectionFormId: null,
              ownerId,
              name: item.authorName,
              email: 'sample@pandapraise.com',
              role: item.authorRole,
              company: null,
              avatarUrl: null,
              rating: 5,
              title: null,
              content: item.content,
              type: 'text',
              videoUrl: null,
              tags: ['sample', 'social-proof'],
              source: 'manual',
              status: 'approved',
              isFeatured: true,
              consent: true,
              helpfulCount: 0,
              createdAt: now,
              updatedAt: now,
            },
            { merge: true }
          ).catch(() => null);

          // 3. Write to public_reviews collection (for anonymous public wall readers)
          await setDoc(
            doc(db, 'public_reviews', docId),
            {
              projectId: workspaceId,
              projectSlug: cleanSlug,
              collectionFormId: null,
              ownerId,
              name: item.authorName,
              role: item.authorRole,
              company: null,
              avatarUrl: null,
              rating: 5,
              title: null,
              content: item.content,
              type: 'text',
              videoUrl: null,
              tags: ['sample', 'social-proof'],
              isFeatured: true,
              status: 'approved',
              editedByOwner: false,
              editedAt: null,
              createdAt: now,
              updatedAt: now,
            },
            { merge: true }
          ).catch(() => null);
        }
      }
    } catch (saveErr) {
      console.warn('Could not persist sample proofs to Firestore:', saveErr);
    } finally {
      setIsLoading(false);
    }

    // Replace instead of appending duplicates, and select only the first card
    setTestimonials(sampleProofs);
    setSelectedProofIds([sampleProofs[0].id]);
    setStatusBanner({
      type: 'success',
      text: `Loaded & saved 3 approved sample testimonials for ${brand}! Public route https://pandapraise.com/w/${cleanSlug} is now synced and live.`,
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

  const maxSelectableCount = layoutClass === 'single' ? 1 : layoutClass === 'double' ? 2 : 3;

  const handleSelectLayout = (newLayout: LayoutClass) => {
    setLayoutClass(newLayout);
    const newMax = newLayout === 'single' ? 1 : newLayout === 'double' ? 2 : 3;
    if (selectedProofIds.length > newMax) {
      setSelectedProofIds((prev) => prev.slice(0, newMax));
    }
  };

  const toggleProofSelection = (id: string) => {
    setSelectedProofIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (maxSelectableCount === 1) {
        return [id];
      }
      if (prev.length >= maxSelectableCount) {
        // Drop earliest and append newest to make picking effortless
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleScreenshotUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setStatusBanner({ type: 'error', text: 'Please upload an image file (PNG, JPG, WebP).' });
      return;
    }
    setIsUploadingScreenshot(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setHeroScreenshotUrl(dataUrl);
      setCardTemplate('hero_screenshot');
      setIsUploadingScreenshot(false);
      setStatusBanner({
        type: 'success',
        text: 'Website hero screenshot uploaded! Cards will now render over your live website backdrop with domain visible.',
      });
    };
    reader.onerror = () => {
      setIsUploadingScreenshot(false);
      setStatusBanner({ type: 'error', text: 'Failed to read image file.' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setHeroScreenshotUrl('');
    if (cardTemplate === 'hero_screenshot') {
      setCardTemplate('gradient');
    }
    setStatusBanner({ type: 'info', text: 'Custom website screenshot removed. Reverted to gradient.' });
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

  // 2. Helper: Build Platform-Aware, Clean Social Captions
  const buildBatchCaption = (
    selectedItems: SocialTestimonial[],
    rawWorkspaceName: string,
    _website?: string
  ): string => {
    const brand = formatCleanBrandName(rawWorkspaceName);
    const cleanSlug = (workspaceSlug || brand.toLowerCase().replace(/[^a-z0-9]/g, '')) || 'myprojectpotato';
    const publicUrl = `https://pandapraise.com/w/${cleanSlug}`;

    if (selectedItems.length === 0) return '';

    if (selectedItems.length === 1) {
      const primaryProof = selectedItems[0];
      const cleanQuote = primaryProof.content.replace(/MYPROJECTPOTATO's Workspace/gi, brand);
      return `"${cleanQuote}"\n\n— ${primaryProof.authorName} (${primaryProof.authorRole}) ⭐⭐⭐⭐⭐\n\nVerified customer love for ${brand}\n👉 Explore verified proof: ${publicUrl}`;
    }

    const quotes = selectedItems
      .map(
        (t) =>
          `"${t.content.replace(/MYPROJECTPOTATO's Workspace/gi, brand)}"\n— ${t.authorName} (${t.authorRole}) ⭐⭐⭐⭐⭐`
      )
      .join('\n\n');

    return `${quotes}\n\nVerified customer praise for ${brand}\n👉 Explore verified wall: ${publicUrl}`;
  };

  // Live Studio Graphic Preview Handler
  const handlePreviewCurrentStudioGraphic = async () => {
    const selectedItems = testimonials.filter((t) => selectedProofIds.includes(t.id));
    if (selectedItems.length === 0) {
      setStatusBanner({ type: 'error', text: 'Select at least 1 testimonial below first to preview.' });
      return;
    }
    const brand = formatCleanBrandName(workspaceName);
    const dataUrl = await renderAdvancedSocialCard(selectedItems, workspaceName, {
      layoutClass,
      backgroundStyle: cardTemplate,
      heroScreenshotDataUrl: heroScreenshotUrl,
      overlayOpacity,
    });
    setPreviewCardModal({
      title: `${brand} • ${layoutClass.toUpperCase()} Layout Studio Card (1080×1080 HD)`,
      dataUrl,
    });
  };

  // UPGRADED MASTER BROADCAST HANDLER WITH DIRECT IMAGE CLIPBOARD COPYING
  const handleBroadcastSelected = async () => {
    const selectedItems = testimonials.filter((t) => selectedProofIds.includes(t.id));
    const activeChannels = channels.filter((c) => c.selected);

    if (selectedItems.length === 0) {
      setStatusBanner({
        type: 'error',
        text: `Select ${maxSelectableCount === 1 ? '1 testimonial' : `up to ${maxSelectableCount} testimonials`} below first.`,
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
      const brand = formatCleanBrandName(workspaceName);
      const combinedCaption = buildBatchCaption(selectedItems, workspaceName, workspaceWebsite);

      // 1. Copy text caption to clipboard
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(combinedCaption).catch(() => null);
      }

      // 2. Generate HD 1080x1080 PNG graphic matching the active layout class & website background
      const dataUrl = await renderAdvancedSocialCard(selectedItems, workspaceName, {
        layoutClass,
        backgroundStyle: cardTemplate,
        heroScreenshotDataUrl: heroScreenshotUrl,
        overlayOpacity,
      });

      if (dataUrl) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          if (
            typeof navigator !== 'undefined' &&
            navigator.clipboard &&
            typeof (window as any).ClipboardItem !== 'undefined'
          ) {
            await navigator.clipboard.write([
              new (window as any).ClipboardItem({ 'image/png': blob }),
            ]);
          }
        } catch (clipErr) {
          console.warn('Direct image clipboard copy fallback:', clipErr);
        }
      }

      // 3. Trigger automatic PNG download for direct attachment
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${layoutClass}-proof-card.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // 4. Fire background webhook if configured
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'social.batch_broadcast',
            workspaceId,
            workspaceName: brand,
            targetChannels: activeChannels.map((c) => c.id),
            combinedCaption,
            layoutClass,
            count: selectedItems.length,
            items: selectedItems.map((item) => ({
              testimonialId: item.id,
              authorName: item.authorName,
              authorRole: item.authorRole,
              rating: item.rating,
              content: item.content,
            })),
            imageCardBase64: dataUrl,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => null);
      }

      const encodedText = encodeURIComponent(combinedCaption);

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

      // Open visual guide modal prompting user to paste graphic
      setIsBroadcastGuideOpen(true);

      setStatusBanner({
        type: 'success',
        text: `Success! ${layoutClass.toUpperCase()} graphic card copied to clipboard & downloaded. Press Ctrl+V in your social composer to attach it!`,
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
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Post on internet</h1>
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

        {/* VISUAL STUDIO: LAYOUT CLASS & BACKGROUND */}
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
          {/* Row 1: Layout Class Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                Template Layout Class:
              </span>
              <p className="text-[11px] text-slate-500">
                Single quote, double conversation dialogue, or triple cascading cards
              </p>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => handleSelectLayout('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  layoutClass === 'single'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>1️⃣ Single Quote</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    layoutClass === 'single'
                      ? 'bg-purple-700/60 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  1 Card
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLayout('double')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  layoutClass === 'double'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>2️⃣ Double Stack</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    layoutClass === 'double'
                      ? 'bg-purple-700/60 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  2 Cards
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLayout('triple')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  layoutClass === 'triple'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>3️⃣ Triple Cascade</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    layoutClass === 'triple'
                      ? 'bg-purple-700/60 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  3 Cards
                </span>
              </button>
            </div>
          </div>

          {/* Row 2: Background Style Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100/60">
            <div>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                Background Backdrop:
              </span>
              <p className="text-[11px] text-slate-500">
                1080×1080 canvas backdrop or your actual software hero page
              </p>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setCardTemplate('gradient')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  cardTemplate === 'gradient'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✨ Vibrant Gradient
              </button>
              <button
                type="button"
                onClick={() => setCardTemplate('light')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  cardTemplate === 'light'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ☀️ Minimalist Light
              </button>
              <button
                type="button"
                onClick={() => setCardTemplate('neon')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  cardTemplate === 'neon'
                    ? 'bg-slate-900 text-purple-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌙 Dark Mode Neon
              </button>
              <button
                type="button"
                onClick={() => setCardTemplate('hero_screenshot')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  cardTemplate === 'hero_screenshot'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 hover:text-purple-900 bg-purple-50/60'
                }`}
              >
                <span>🖼️ Website Hero Screenshot</span>
                {heroScreenshotUrl && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            </div>
          </div>

          {/* Row 3: Website Hero Screenshot Dropzone & Scrim Control */}
          {(cardTemplate === 'hero_screenshot' || heroScreenshotUrl) && (
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-purple-600" />
                    Website Hero Screenshot with Visible Domain Name
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Upload a screenshot of your landing page or app header with your domain name visible. Makes shared social proof 100% authentic and serves as a brand billboard.
                  </p>
                </div>
                {heroScreenshotUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveScreenshot}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer self-start sm:self-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Screenshot</span>
                  </button>
                )}
              </div>

              {heroScreenshotUrl ? (
                <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-xl border border-purple-100">
                  <div className="relative w-36 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-xs">
                    <img
                      src={heroScreenshotUrl}
                      alt="Website Hero Preview"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-slate-950 pointer-events-none"
                      style={{ opacity: overlayOpacity }}
                    />
                    <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs">
                      Domain Visible Backdrop
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-purple-600" />
                        Dark Scrim Contrast: {Math.round(overlayOpacity * 100)}%
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {overlayOpacity >= 0.8 ? 'High Text Contrast' : 'High Backdrop Visibility'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.40"
                      max="0.95"
                      step="0.01"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500">
                      Keeps your website hero & domain visible behind the card while ensuring 100% review legibility.
                    </p>
                  </div>

                  <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer">
                    <Upload className={`w-3.5 h-3.5 text-purple-600 ${isUploadingScreenshot ? 'animate-spin' : ''}`} />
                    <span>{isUploadingScreenshot ? 'Uploading...' : 'Change'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleScreenshotUpload(file);
                      }}
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl bg-white hover:bg-purple-50/30 transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Upload className={`w-5 h-5 ${isUploadingScreenshot ? 'animate-spin' : ''}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {isUploadingScreenshot ? 'Reading Screenshot...' : 'Click to Upload Website Hero Screenshot'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    PNG, JPG, or WebP with your live URL or navigation bar visible
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleScreenshotUpload(file);
                    }}
                  />
                </label>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 3. STEP 2: SELECT TESTIMONIAL & CLICK BROADCAST */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
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
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
            {layoutClass.toUpperCase()} Layout: Pick {maxSelectableCount} ({selectedProofIds.length} of {maxSelectableCount} selected)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Studio Graphic Live Preview */}
          <button
            type="button"
            disabled={selectedProofIds.length === 0}
            onClick={handlePreviewCurrentStudioGraphic}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedProofIds.length > 0
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                : 'bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-purple-600" />
            <span>👁️ Preview Studio Card</span>
          </button>

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
                ? `Broadcast ${selectedProofIds.length} Selected to ${selectedChannelsCount} ${
                    selectedChannelsCount === 1 ? 'Channel' : 'Channels'
                  } →`
                : 'Select Testimonials to Post'}
            </span>
          </button>
        </div>
      </section>

      {/* 4. APPROVED TESTIMONIALS LIST OR ACTIONABLE EMPTY STATE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              2. Select Testimonial(s) for {layoutClass.toUpperCase()} Layout ({filteredTestimonials.length} Available)
            </h3>
            <p className="text-xs text-slate-500">
              {layoutClass === 'single'
                ? 'Select 1 testimonial to feature in your single hero card.'
                : layoutClass === 'double'
                ? 'Select 2 testimonials to render as stacked dialogue cards.'
                : 'Select 3 testimonials to render as cascading multi-cards.'}
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-600">
            {selectedProofIds.length === maxSelectableCount
              ? `✓ Ready to broadcast (${selectedProofIds.length}/${maxSelectableCount})`
              : `${selectedProofIds.length} of ${maxSelectableCount} selected`}
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
              const selectionIndex = selectedProofIds.indexOf(item.id);
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

                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white">
                            Card #{selectionIndex + 1}
                          </span>
                        )}
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
                        onClick={async (e) => {
                          e.stopPropagation();
                          const dataUrl = await renderAdvancedSocialCard([item], workspaceName, {
                            layoutClass: 'single',
                            backgroundStyle: cardTemplate,
                            heroScreenshotDataUrl: heroScreenshotUrl,
                            overlayOpacity,
                          });
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
                        onClick={async (e) => {
                          e.stopPropagation();
                          const dataUrl = await renderAdvancedSocialCard([item], workspaceName, {
                            layoutClass: 'single',
                            backgroundStyle: cardTemplate,
                            heroScreenshotDataUrl: heroScreenshotUrl,
                            overlayOpacity,
                          });
                          if (!dataUrl) return;
                          const brand = formatCleanBrandName(workspaceName);
                          const a = document.createElement('a');
                          a.href = dataUrl;
                          a.download = `${brand}-${item.authorName}-card.png`;
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
                download={`${formatCleanBrandName(workspaceName).toLowerCase().replace(/[^a-z0-9]/g, '-')}-social-card.png`}
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

      {/* POST-BROADCAST VISUAL ATTACHMENT GUIDE MODAL */}
      {isBroadcastGuideOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-purple-200 max-w-md w-full p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setIsBroadcastGuideOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl mb-4">
              📸
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1.5">
              1080×1080 Graphic Card Ready!
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              We opened your social composer and copied your HD branded graphic directly to your clipboard.
            </p>

            <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-100 text-xs text-purple-900 space-y-2 mb-5">
              <div className="flex items-center gap-1.5 font-bold text-purple-950">
                <span>⚡ How to attach in 1 second:</span>
              </div>
              <p className="leading-relaxed">
                Click inside your open social tab (X, LinkedIn, or Facebook) and press{' '}
                <kbd className="px-1.5 py-0.5 bg-white border border-purple-200 rounded font-mono font-bold text-purple-900 shadow-2xs">
                  Ctrl + V
                </kbd>{' '}
                (or{' '}
                <kbd className="px-1.5 py-0.5 bg-white border border-purple-200 rounded font-mono font-bold text-purple-900 shadow-2xs">
                  ⌘ + V
                </kbd>
                ) to paste the image directly!
              </p>
              <p className="text-[11px] text-purple-700/90">
                The image file was also downloaded to your computer as a backup if you prefer dragging it in.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsBroadcastGuideOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Got it, let's post!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
