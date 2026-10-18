import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ChangeEvent } from 'react';
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
  Search,
  Sparkles,
  RefreshCw,
  Check,
  Copy,
  X,
  Upload,
  Download,
  Share2,
  ArrowLeft,
  CheckSquare,
  Square,
  Plus,
} from 'lucide-react';

// ============================================================================
// SHARED TYPES & DEFAULT ASSETS
// ============================================================================
export interface ProofTestimonial {
  id: string;
  workspaceId: string;
  authorName: string;
  authorRole: string; // Used as City / Role on the right side of the divider line
  content: string;
  rating: number;
  status: 'Approved' | 'Pending Review';
  source: string;
  tags: ('Ease of use' | 'Time saved' | 'Support')[];
  createdAt: string;
}

// Default aesthetic architectural courtyard/poolside background matching reference image
export const DEFAULT_AESTHETIC_BG =
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85';

// Curated quick-swap backgrounds in case user wants 1-click presets alongside system file upload
export const PRESET_BACKGROUNDS = [
  {
    id: 'courtyard',
    label: 'Resort Courtyard (Default)',
    url: DEFAULT_AESTHETIC_BG,
  },
  {
    id: 'workspace',
    label: 'Minimalist Studio',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'nature',
    label: 'Warm Terracotta Villa',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85',
  },
];

export function classifyPraiseTags(
  text: string,
  existing?: string[]
): ('Ease of use' | 'Time saved' | 'Support')[] {
  const tags = new Set<'Ease of use' | 'Time saved' | 'Support'>();
  const lower = (text || '').toLowerCase();

  if (Array.isArray(existing)) {
    existing.forEach((t) => {
      if (t === 'Ease of use' || t === 'Time saved' || t === 'Support') tags.add(t);
    });
  }
  if (/\b(easy|ease|simple|picked it up|intuitive|clean|smooth|attention to detail|fast setup|day)\b/i.test(lower)) {
    tags.add('Ease of use');
  }
  if (/\b(time|hours|sundays|minutes|schedule|scheduling|automated|runs itself|saved|fast|quick)\b/i.test(lower)) {
    tags.add('Time saved');
  }
  if (/\b(support|staff|attentive|team|help|helpful|service|customer|care|response|guided)\b/i.test(lower)) {
    tags.add('Support');
  }
  if (tags.size === 0) tags.add('Ease of use');
  return Array.from(tags);
}

export const classifyPraiseCategories = classifyPraiseTags;

// Helper to draw rounded rectangle on Canvas with backward compatibility
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

// ============================================================================
// HIGH-RES HTML5 CANVAS RENDERER (Matches Reference Place-Card Template 1:1)
// ============================================================================
export async function renderEditorialPlaceCardCanvas(params: {
  backgroundUrl: string;
  rating: number;
  quoteText: string;
  authorName: string;
  locationOrRole: string;
  bottomHandle: string;
}): Promise<HTMLCanvasElement> {
  const { backgroundUrl, rating, quoteText, authorName, locationOrRole, bottomHandle } = params;

  // 4:5 Portrait Aspect Ratio (1080 x 1350 px — Official Instagram / LinkedIn Portrait HD Standard)
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. Draw Variable Background Image (Cover-fit)
  try {
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      bgImg.onload = resolve;
      bgImg.onerror = reject;
      bgImg.src = backgroundUrl;
    });

    const imgRatio = bgImg.width / bgImg.height;
    const canvasRatio = canvas.width / canvas.height;
    let drawW = canvas.width;
    let drawH = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawW = canvas.height * imgRatio;
      offsetX = -(drawW - canvas.width) / 2;
    } else {
      drawH = canvas.width / imgRatio;
      offsetY = -(drawH - canvas.height) / 2;
    }

    ctx.drawImage(bgImg, offsetX, offsetY, drawW, drawH);

    // Subtle warm vignette at the bottom so @handle is always readable
    const bottomGrad = ctx.createLinearGradient(0, 1050, 0, 1350);
    bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
    bottomGrad.addColorStop(1, 'rgba(20,16,10,0.45)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, 1050, 1080, 300);
  } catch {
    // Warm fallback background if offline
    const fallbackGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
    fallbackGrad.addColorStop(0, '#786852');
    fallbackGrad.addColorStop(1, '#3E3427');
    ctx.fillStyle = fallbackGrad;
    ctx.fillRect(0, 0, 1080, 1350);
  }

  // 2. Draw CONSTANT Center Off-White / Cream Place Card
  const cardX = 165;
  const cardY = 365;
  const cardW = 750;
  const cardH = 590;

  ctx.save();
  ctx.shadowColor = 'rgba(15, 12, 8, 0.28)';
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 18;

  ctx.fillStyle = '#F4F2EA'; // Exact warm off-white place card tone
  ctx.beginPath();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fill();
  ctx.restore();

  // 3. Draw 5 Olive/Bronze Stars (Top-Left of Place Card)
  const innerLeft = cardX + 68;
  const innerRight = cardX + cardW - 68;
  const maxTextWidth = innerRight - innerLeft;

  ctx.fillStyle = '#625834';
  ctx.font = '38px Georgia, serif';
  ctx.textAlign = 'left';
  const starCount = Math.max(1, Math.min(5, Math.round(rating || 5)));
  const starsString = Array.from({ length: starCount }).map(() => '★').join('  ');
  ctx.fillText(starsString, innerLeft, cardY + 92);

  // 4. Draw Variable Italic Serif Testimonial Body
  ctx.fillStyle = '#4B432B';
  ctx.font = 'italic 30px Georgia, "Playfair Display", "Times New Roman", serif';
  const cleanQuote = quoteText.replace(/^["“]|["”]$/g, '').trim();
  const words = cleanQuote.split(/\s+/);
  let line = '';
  let y = cardY + 162;
  const lineHeight = 46;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxTextWidth && line) {
      ctx.fillText(line, innerLeft, y);
      line = word;
      y += lineHeight;
      if (y > cardY + cardH - 135) {
        line += '...';
        break;
      }
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, innerLeft, y);
  }

  // 5. Draw Constant Signature Footer: "Author Name ─────────────── Any City"
  const footerY = cardY + cardH - 64;
  ctx.fillStyle = '#5C5233';
  ctx.font = 'bold 28px Georgia, "Times New Roman", serif';

  const leftText = (authorName || 'Andrea').trim();
  const rightText = (locationOrRole || 'Verified Customer').trim();

  ctx.textAlign = 'left';
  ctx.fillText(leftText, innerLeft, footerY);
  const leftWidth = ctx.measureText(leftText).width;

  ctx.textAlign = 'right';
  ctx.fillText(rightText, innerRight, footerY);
  const rightWidth = ctx.measureText(rightText).width;

  // Connecting Horizontal Line between Author and City/Role
  const lineStartX = innerLeft + leftWidth + 24;
  const lineEndX = innerRight - rightWidth - 24;
  if (lineEndX > lineStartX + 20) {
    ctx.strokeStyle = '#6E6340';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lineStartX, footerY - 9);
    ctx.lineTo(lineEndX, footerY - 9);
    ctx.stroke();
  }

  // 6. Draw Bottom "@handle" Watermark Over Background Photo
  if (bottomHandle.trim()) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#F5E6A8';
    ctx.font = 'italic bold 32px Georgia, serif';
    ctx.fillText(bottomHandle.trim(), 540, 1255);
  }

  return canvas;
}

// ============================================================================
// PART 1: PROOF SECTION (Select Approved Testimonials -> Click "Post on Internet")
// ============================================================================
export function ProofSection({
  workspaceId = 'besteample',
  workspaceName = 'besteample',
  onPostOnInternet,
}: {
  workspaceId?: string;
  workspaceName?: string;
  onPostOnInternet?: (selectedApproved: ProofTestimonial[]) => void;
}) {
  const [proofs, setProofs] = useState<ProofTestimonial[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePraiseFilter, setActivePraiseFilter] = useState<
    'Ease of use' | 'Time saved' | 'Support' | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Invite Customer Modal State
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);

  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${workspaceId.toLowerCase()}`;

  const loadApprovedAndPendingProofs = useCallback(async () => {
    setIsLoading(true);
    try {
      let db: any = null;
      try {
        db = getFirestore();
      } catch {
        // Firebase not configured
      }

      if (db) {
        const q = query(
          collection(db, 'testimonials'),
          where('workspaceId', '==', workspaceId)
        );
        const snap = await getDocs(q);

        if (snap && snap.docs && snap.docs.length > 0) {
          const loaded: ProofTestimonial[] = snap.docs.map((d) => {
            const data = d.data();
            const rawStatus = String(data.status || 'approved').toLowerCase();
            const text = String(data.content || data.text || '').trim();
            return {
              id: d.id,
              workspaceId,
              authorName: String(data.authorName || data.author_name || 'Andrea'),
              authorRole: String(data.authorRole || data.author_role || 'Verified Customer'),
              content: text,
              rating: Number(data.rating || 5),
              status: rawStatus === 'pending' || rawStatus === 'pending review' ? 'Pending Review' : 'Approved',
              source: String(data.source || 'Imported'),
              tags: classifyPraiseTags(text, data.tags),
              createdAt: data.createdAt || new Date().toISOString(),
            };
          });
          setProofs(loaded);
          return;
        }
      }

      // Default initial reviews matching Stitch & Editorial screenshots
      setProofs([
        {
          id: 'proof-1',
          workspaceId,
          authorName: 'Andrea',
          authorRole: 'Any City',
          content:
            'What really stood out was the attention to detail. Every meal was delicious and beautifully presented, the staff were attentive without being intrusive, and the surroundings were immaculately maintained. Whether lounging by the pool, enjoying a massage, or stargazing at night, every moment felt like a dream.',
          rating: 5,
          status: 'Approved',
          source: 'Google Reviews',
          tags: ['Ease of use', 'Support'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'proof-2',
          workspaceId,
          authorName: 'Sam Marsh',
          authorRole: 'Marsh & Sons',
          content:
            'I was sure the techs would never use it. They picked it up in a day.',
          rating: 5,
          status: 'Approved',
          source: 'Direct Form',
          tags: ['Ease of use'],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'proof-3',
          workspaceId,
          authorName: 'Dave Hartley',
          authorRole: 'Owner, Hartley Plumbing',
          content: 'Scheduling used to eat my Sundays. Now it runs itself.',
          rating: 5,
          status: 'Approved',
          source: 'CSV Import',
          tags: ['Time saved'],
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      // Fallback handled
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    loadApprovedAndPendingProofs();
  }, [loadApprovedAndPendingProofs]);

  const toggleSelectApproved = (item: ProofTestimonial) => {
    if (item.status !== 'Approved') return;
    setSelectedIds((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  };

  const handleApprovePending = async (id: string) => {
    setProofs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p))
    );
    setSelectedIds((prev) => [...prev, id]);
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'testimonials', id), { status: 'approved' });
    } catch {
      // Local state updated
    }
  };

  const tagCounts = useMemo(() => {
    const counts = { 'Ease of use': 0, 'Time saved': 0, Support: 0 };
    proofs.forEach((p) => {
      p.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [proofs]);

  const filteredProofs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return proofs.filter((p) => {
      const matchesTag = activePraiseFilter ? p.tags.includes(activePraiseFilter) : true;
      const matchesQuery =
        !q ||
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        p.authorRole.toLowerCase().includes(q);
      return matchesTag && matchesQuery;
    });
  }, [proofs, activePraiseFilter, searchQuery]);

  const selectedApprovedObjects = proofs.filter(
    (p) => p.status === 'Approved' && selectedIds.includes(p.id)
  );

  const handleTriggerPost = (targetList: ProofTestimonial[]) => {
    if (onPostOnInternet) {
      onPostOnInternet(targetList);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs font-sans text-slate-900">
      {/* Header Row */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Your Proof</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {proofs.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={loadApprovedAndPendingProofs}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Proof</span>
          </button>

          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-purple-600" />
            <span>+ Invite customer</span>
          </button>

          {/* PRIMARY WORKFLOW CTA: "Post on Internet" (Opens Embeds Section with Selected Approved Testimonials) */}
          <button
            type="button"
            onClick={() => {
              const targetList =
                selectedApprovedObjects.length > 0
                  ? selectedApprovedObjects
                  : proofs.filter((p) => p.status === 'Approved').slice(0, 1);
              handleTriggerPost(targetList);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6701e6] hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>
              {selectedApprovedObjects.length > 0
                ? `Post on Internet (${selectedApprovedObjects.length} Selected) →`
                : 'Post on Internet →'}
            </span>
          </button>
        </div>
      </section>

      {/* Top Filter Ribbon */}
      <section className="flex flex-wrap items-center justify-between gap-2 mb-5 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-normal mr-1">Customers praise:</span>
          {(['Ease of use', 'Time saved', 'Support'] as const).map((label) => {
            const active = activePraiseFilter === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setActivePraiseFilter(active ? null : label)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                  active
                    ? 'border-purple-500 bg-purple-50 text-purple-900 font-semibold ring-2 ring-purple-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{label}</span>
                <span className="font-bold text-slate-900">{tagCounts[label]}</span>
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-purple-700">
          ✓ Tick any Approved review below to customize & post on internet
        </span>
      </section>

      {/* Search Input Bar */}
      <section className="mb-5">
        <div className="relative rounded-xl shadow-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            id="proof-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proof testimonials, names, tags..."
            className="block w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 rounded-xl border border-purple-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6701e6]"
          />
        </div>
      </section>

      {/* Highlighted AI Case Study Card */}
      <section className="mb-5">
        <div className="p-4 sm:p-5 rounded-xl border border-purple-200 bg-[#fbf9fe]">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            How {workspaceName} turns verified customer praise into high-converting social proof
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[#6701e6] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Case study generated with Panda Praise AI · {filteredProofs.length} metrics</span>
          </p>
        </div>
      </section>

      {/* Listed Testimonials */}
      <section className="space-y-3.5">
        {filteredProofs.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isApproved = item.status === 'Approved';

          return (
            <article
              key={item.id}
              onClick={() => isApproved && toggleSelectApproved(item)}
              className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#6701e6] bg-purple-50/25 ring-2 ring-purple-500/15'
                  : 'border-slate-200/80 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  {/* Selection Checkbox for Approved Reviews */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isApproved) toggleSelectApproved(item);
                    }}
                    className="text-purple-600 cursor-pointer"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-[#6701e6]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                    )}
                  </button>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {item.authorName}{' '}
                    <span className="text-slate-400 font-normal">·</span>{' '}
                    <span className="font-medium text-slate-700">{item.authorRole}</span>
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  {isApproved ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTriggerPost([item]);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-[#6701e6] hover:bg-purple-100 border border-purple-200 cursor-pointer"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Post on Internet →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprovePending(item.id);
                      }}
                      className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white cursor-pointer"
                    >
                      Approve
                    </button>
                  )}

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                        : 'bg-amber-50 text-amber-700 border-amber-200/60'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center text-amber-400 text-sm mb-2 pl-8">
                {Array.from({ length: item.rating }).map((_, idx) => (
                  <span key={idx}>★</span>
                ))}
              </div>

              <p className="text-sm text-slate-700 leading-relaxed font-normal pl-8">
                “{item.content.replace(/^["“]|["”]$/g, '')}”
              </p>
            </article>
          );
        })}
      </section>

      {/* INVITE CUSTOMER MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Invite Customer for Review</h3>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Share your direct collection link with customers via WhatsApp, email, or SMS. Every approved submission appears right in your Proof list.
            </p>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="flex-1 bg-transparent text-xs font-mono text-slate-700 focus:outline-none px-2"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  setCopiedInvite(true);
                  setTimeout(() => setCopiedInvite(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedInvite ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedInvite ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PART 2: EMBEDS SECTION ("Post on Internet" Customizer with Reference Template)
// ============================================================================
export function EmbedsPostStudio({
  workspaceName = 'reallygreatsite',
  selectedTestimonials = [],
  onBackToProof,
}: {
  workspaceName?: string;
  selectedTestimonials?: ProofTestimonial[];
  onBackToProof?: () => void;
}) {
  // Active testimonial index (if user selected multiple approved testimonials in Proof)
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Variable Background Image (Default + Upload from System)
  const [backgroundUrl, setBackgroundUrl] = useState<string>(DEFAULT_AESTHETIC_BG);

  // Variable Content inside the Constant White Place Card (Populated from selected Approved Proof)
  const currentProof = selectedTestimonials[activeIndex] || {
    id: 'default-proof',
    workspaceId: workspaceName,
    authorName: 'Andrea',
    authorRole: 'Any City',
    content:
      'What really stood out was the attention to detail. Every meal was delicious and beautifully presented, the staff were attentive without being intrusive, and the surroundings were immaculately maintained. Whether lounging by the pool, enjoying a massage, or stargazing at night, every moment felt like a dream.',
    rating: 5,
    status: 'Approved' as const,
    source: 'Proof',
    tags: ['Ease of use'],
    createdAt: new Date().toISOString(),
  };

  const [quoteText, setQuoteText] = useState<string>(
    currentProof.content.replace(/^["“]|["”]$/g, '')
  );
  const [authorName, setAuthorName] = useState<string>(currentProof.authorName);
  const [locationOrRole, setLocationOrRole] = useState<string>(currentProof.authorRole);
  const [starRating, setStarRating] = useState<number>(currentProof.rating || 5);
  const [bottomHandle, setBottomHandle] = useState<string>(
    `@${workspaceName.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'reallygreatsite'}`
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Update editable fields whenever user switches between their selected approved testimonials
  useEffect(() => {
    const item = selectedTestimonials[activeIndex];
    if (item) {
      setQuoteText(item.content.replace(/^["“]|["”]$/g, ''));
      setAuthorName(item.authorName);
      setLocationOrRole(item.authorRole);
      setStarRating(item.rating || 5);
    }
  }, [activeIndex, selectedTestimonials]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Upload Custom Background Image from User's System
  const handleSystemBackgroundUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBackgroundUrl(event.target.result as string);
        showToast('Custom background image uploaded! The white place card remains locked in position.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Download High-Res 1080x1350 PNG Card
  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderEditorialPlaceCardCanvas({
        backgroundUrl,
        rating: starRating,
        quoteText,
        authorName,
        locationOrRole,
        bottomHandle,
      });
      const link = document.createElement('a');
      link.download = `${authorName.toLowerCase().replace(/\s+/g, '-')}-testimonial-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Downloaded HD 1080×1350 Testimonial Post (PNG)!');
    } finally {
      setIsExporting(false);
    }
  };

  // Post on Internet (Copies HD Image to Clipboard + Opens Selected Social Platform)
  const handlePostToSocialNetwork = async (
    platform: 'linkedin' | 'x' | 'whatsapp' | 'instagram'
  ) => {
    setIsExporting(true);
    try {
      const canvas = await renderEditorialPlaceCardCanvas({
        backgroundUrl,
        rating: starRating,
        quoteText,
        authorName,
        locationOrRole,
        bottomHandle,
      });

      const caption = `“${quoteText}”\n— ${authorName} (${locationOrRole}) ${'★'.repeat(
        starRating
      )}\n\n${bottomHandle}`;

      await navigator.clipboard.writeText(caption).catch(() => null);

      // Copy PNG directly to clipboard so user can press Ctrl+V inside LinkedIn / X / WhatsApp Web
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard
          .write([new ClipboardItem({ 'image/png': blob })])
          .catch(() => null);
      }

      if (platform === 'instagram') {
        const link = document.createElement('a');
        link.download = `${authorName}-instagram-post.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Instagram 4:5 Portrait PNG downloaded & caption copied!');
        return;
      }

      const encoded = encodeURIComponent(caption);
      if (platform === 'linkedin') {
        window.open(
          `https://www.linkedin.com/feed/?shareActive=true&text=${encoded}`,
          '_blank',
          'noopener,noreferrer'
        );
      } else if (platform === 'x') {
        window.open(
          `https://x.com/intent/post?text=${encoded}`,
          '_blank',
          'noopener,noreferrer'
        );
      } else if (platform === 'whatsapp') {
        window.open(
          `https://api.whatsapp.com/send?text=${encoded}`,
          '_blank',
          'noopener,noreferrer'
        );
      }

      showToast(
        `Opened ${platform.toUpperCase()}! Press Ctrl+V in the post box to paste your HD testimonial card.`
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Generate Live Website Embed Code for this Customized Card
  const embedHtmlSnippet = `<div data-pandapraise-card="editorial" data-workspace="${workspaceName}" data-author="${authorName}" data-role="${locationOrRole}" data-rating="${starRating}"></div>\n<script async src="https://pandapraise.com/widget.js"></script>`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans text-slate-900 pb-12">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBackToProof && (
            <button
              type="button"
              onClick={onBackToProof}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Proof</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6701e6]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6701e6]">
                Embeds & Post on Internet Studio
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-950">
              Customize Approved Testimonial Before Posting
            </h1>
          </div>
        </div>

        {/* If multiple approved testimonials were selected in Proof, switch between them here */}
        {selectedTestimonials.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-600 px-2">
              Selected Proof ({activeIndex + 1} of {selectedTestimonials.length}):
            </span>
            {selectedTestimonials.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  activeIndex === idx
                    ? 'bg-[#6701e6] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.authorName}
              </button>
            ))}
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {toastMessage}
          </span>
          <button type="button" onClick={() => setToastMessage(null)} className="cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* MAIN SPLIT: LIVE EDITORIAL TEMPLATE PREVIEW (LEFT) + CUSTOMIZER & POST CONTROLS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: EXACT DEFAULT TESTIMONIAL TEMPLATE (Variable Background + Constant Place Card) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div
            className="w-full max-w-[460px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 relative flex items-center justify-center p-7 sm:p-9 bg-cover bg-center transition-all duration-300"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
          >
            {/* Subtle bottom gradient for @handle legibility */}
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />

            {/* CONSTANT WHITE / CREAM PLACE CARD IN CENTER */}
            <div className="relative z-10 w-full bg-[#F4F2EA] rounded-[18px] px-7 py-8 sm:px-9 sm:py-10 shadow-[0_20px_50px_rgba(0,0,0,0.28)] border border-white/60 flex flex-col justify-between min-h-[54%]">
              {/* Top-Left 5 Olive-Bronze Stars */}
              <div>
                <div className="flex items-center gap-2 text-[#625834] text-lg sm:text-xl mb-4 select-none">
                  {Array.from({ length: starRating }).map((_, idx) => (
                    <span key={idx}>★</span>
                  ))}
                </div>

                {/* Variable Approved Testimonial Quote in Italic Serif */}
                <p
                  className="text-[14px] sm:text-[15.5px] leading-[1.68] text-[#4B432B] italic font-normal break-words"
                  style={{ fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif' }}
                >
                  {quoteText}
                </p>
              </div>

              {/* Constant Signature Footer: Author ─────────────────── City/Role */}
              <div
                className="mt-7 pt-2 flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#5C5233]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <span className="shrink-0">{authorName || 'Andrea'}</span>
                <span className="flex-1 h-[1.5px] bg-[#6E6340]/70 mx-2" />
                <span className="shrink-0">{locationOrRole || 'Any City'}</span>
              </div>
            </div>

            {/* Bottom @handle Watermark */}
            {bottomHandle && (
              <div
                className="absolute bottom-4 inset-x-0 text-center z-10 text-sm sm:text-base font-bold italic text-[#F5E6A8] drop-shadow"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {bottomHandle}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-3 text-center">
            Live Preview · Constant Place-Card Template (1080 × 1350 Portrait HD)
          </p>
        </div>

        {/* RIGHT COLUMN: CUSTOMIZATION & "POST ON INTERNET" CONTROLS */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          
          {/* 1. Variable Background Image Upload */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  1. Background Image (Variable)
                </h2>
                <p className="text-xs text-slate-500">
                  Upload any photo from your system. The center white place card stays constant.
                </p>
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6701e6] hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload from System</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSystemBackgroundUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Preset Switcher */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {PRESET_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setBackgroundUrl(bg.url)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                    backgroundUrl === bg.url
                      ? 'border-[#6701e6] bg-purple-50 text-[#6701e6]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Variable Content Editor (Pre-filled from Selected Proof) */}
          <div className="space-y-4 pb-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              2. Place-Card Content (Pulled from Approved Proof)
            </h2>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Testimonial Quote
              </label>
              <textarea
                rows={4}
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 focus:outline-none focus:border-[#6701e6]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Author Name (Left of Line)
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Andrea"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  City / Role / Company (Right of Line)
                </label>
                <input
                  type="text"
                  value={locationOrRole}
                  onChange={(e) => setLocationOrRole(e.target.value)}
                  placeholder="Any City"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Star Rating
                </label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setStarRating(num)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer ${
                        starRating >= num
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      {num} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Bottom Watermark Handle
                </label>
                <input
                  type="text"
                  value={bottomHandle}
                  onChange={(e) => setBottomHandle(e.target.value)}
                  placeholder="@reallygreatsite"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Post on Internet & Website Embed Actions */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              3. Post on Internet (Social Media & Website Embed)
            </h2>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPng}
              className="w-full py-3 px-4 rounded-xl bg-[#6701e6] hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res Testimonial Card (PNG)</span>
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handlePostToSocialNetwork('linkedin')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
              >
                Post to LinkedIn ↗
              </button>
              <button
                type="button"
                onClick={() => handlePostToSocialNetwork('x')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
              >
                Post to X ↗
              </button>
              <button
                type="button"
                onClick={() => handlePostToSocialNetwork('whatsapp')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
              >
                WhatsApp ↗
              </button>
              <button
                type="button"
                onClick={() => handlePostToSocialNetwork('instagram')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 cursor-pointer"
              >
                Instagram PNG
              </button>
            </div>

            {/* Website HTML Embed Code Box */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Or Embed This Card on Your Website
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(embedHtmlSnippet);
                    showToast('Website HTML embed code copied to clipboard!');
                  }}
                  className="text-xs font-bold text-[#6701e6] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Embed Code</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto">
                {embedHtmlSnippet}
              </pre>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DEFAULT UNIFIED CONTROLLER (Seamlessly Switches Proof -> Embeds on Click)
// ============================================================================
export default function ProofToEmbedsFlow({
  workspaceId = 'besteample',
  workspaceName = 'besteample',
}: {
  workspaceId?: string;
  workspaceName?: string;
}) {
  const [currentView, setCurrentView] = useState<'proof' | 'embeds'>('proof');
  const [selectedForInternet, setSelectedForInternet] = useState<ProofTestimonial[]>([]);

  return currentView === 'proof' ? (
    <ProofSection
      workspaceId={workspaceId}
      workspaceName={workspaceName}
      onPostOnInternet={(chosenList) => {
        setSelectedForInternet(chosenList);
        setCurrentView('embeds');
      }}
    />
  ) : (
    <EmbedsPostStudio
      workspaceName={workspaceName}
      selectedTestimonials={selectedForInternet}
      onBackToProof={() => setCurrentView('proof')}
    />
  );
}
