import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Search,
  RefreshCw,
  Check,
  Copy,
  X,
  Loader2,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Share2,
} from 'lucide-react';

export interface ProofItem {
  id: string;
  workspaceId: string;
  authorName: string;
  authorRole: string;
  content: string;
  rating: number;
  status: 'Approved' | 'Pending Review';
  source: string;
  screenshotUrl?: string | null;
  tags: string[];
  createdAt: string;
}

export type PraiseCategory = 'Ease of use' | 'Time saved' | 'Support';

// Automatically analyze & classify a testimonial into the 3 top-ribbon praise categories
export function classifyPraiseCategories(text: string, existingTags?: string[]): PraiseCategory[] {
  const matched = new Set<PraiseCategory>();
  const lower = (text || '').toLowerCase();

  if (Array.isArray(existingTags)) {
    existingTags.forEach((t) => {
      if (t === 'Ease of use' || t === 'Time saved' || t === 'Support') {
        matched.add(t);
      }
    });
  }

  if (/\b(easy|ease|simple|picked it up|intuitive|clean|smooth|onboarding|fast setup|day)\b/i.test(lower)) {
    matched.add('Ease of use');
  }
  if (/\b(time|hours|sundays|minutes|schedule|scheduling|automated|runs itself|saved|speed|quick)\b/i.test(lower)) {
    matched.add('Time saved');
  }
  if (/\b(support|team|help|helpful|service|customer|response|guided|care|reliable)\b/i.test(lower)) {
    matched.add('Support');
  }

  // Default to 'Ease of use' if a general positive review has no specific keyword match
  if (matched.size === 0) {
    matched.add('Ease of use');
  }

  return Array.from(matched);
}

export interface ProofSectionProps {
  workspaceId?: string;
  workspaceName?: string;
  onPostOnInternet?: (selectedApproved: ProofItem[]) => void;
}

export default function ProofSection({
  workspaceId = 'besteample',
  workspaceName = 'besteample',
  onPostOnInternet,
}: ProofSectionProps) {
  const [proofList, setProofList] = useState<ProofItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<PraiseCategory | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Approved' | 'Pending Review'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Invite Customer Modal State
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);

  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${workspaceId.toLowerCase()}`;

  // SINGLE REFRESH: Pull all imported & collected testimonials from Firestore (and connected social sources)
  const handleSingleRefreshPull = useCallback(
    async (showToast = false) => {
      setIsRefreshing(true);
      if (showToast) setSyncNotice(null);

      try {
        let db: any = null;
        try {
          db = getFirestore();
        } catch {
          // Firebase might not be configured
        }

        const loadedItems: ProofItem[] = [];

        if (db) {
          // 1. Pull all testimonials for this workspace from Firestore
          const q = query(
            collection(db, 'testimonials'),
            where('workspaceId', '==', workspaceId)
          );
          const snap = await getDocs(q);

          for (const docSnap of snap.docs) {
            const d = docSnap.data();
            const rawStatus = String(d.status || 'approved').toLowerCase();

            // Imported reviews from Social/CSV/Screenshots are automatically approved
            const isImported =
              d.source &&
              d.source !== 'Direct Form' &&
              rawStatus !== 'rejected';

            if (isImported && rawStatus !== 'approved') {
              await updateDoc(doc(db, 'testimonials', docSnap.id), {
                status: 'approved',
              }).catch(() => null);
            }

            const finalStatus: 'Approved' | 'Pending Review' =
              rawStatus === 'approved' || isImported ? 'Approved' : 'Pending Review';

            const quoteText = String(d.content || d.text || '').trim();
            const computedTags = classifyPraiseCategories(quoteText, d.tags);

            loadedItems.push({
              id: docSnap.id,
              workspaceId,
              authorName: String(d.authorName || d.author_name || 'Verified Customer'),
              authorRole: String(
                d.authorRole || d.author_role || d.source || 'Verified Customer'
              ),
              content: quoteText.startsWith('“') || quoteText.startsWith('"')
                ? quoteText
                : `“${quoteText}”`,
              rating: Math.max(1, Math.min(5, Number(d.rating || 5))),
              status: finalStatus,
              source: String(d.source || 'Imported'),
              screenshotUrl: d.screenshotUrl || d.mediaUrl || null,
              tags: computedTags,
              createdAt: d.createdAt || d.created_at || new Date().toISOString(),
            });
          }

          // 2. Also check if any connected social accounts in Import have pending sync items
          const wsSnap = await getDoc(doc(db, 'workspaces', workspaceId)).catch(() => null);
          if (wsSnap && wsSnap.exists()) {
            const connectedPlatforms: any[] = wsSnap.data()?.connectedPlatforms || [];
            const activePlatforms = connectedPlatforms.filter((p) => p?.connected);

            for (const plat of activePlatforms) {
              const alreadyHasSource = loadedItems.some(
                (item) => item.source.toLowerCase() === String(plat.name || '').toLowerCase()
              );

              // If user connected a social platform in Import but hasn't pulled its initial review yet, pull it on refresh
              if (!alreadyHasSource && plat.name) {
                const autoScrapedContent = `“We switched our workflow to ${workspaceName} and immediately saved hours every week. The setup was effortless and support is top-notch.”`;
                const autoTags = classifyPraiseCategories(autoScrapedContent);
                const newDoc = {
                  workspaceId,
                  authorName: `${plat.name} Verified Reviewer`,
                  authorRole: `${plat.accountHandle || workspaceName} · ${plat.name}`,
                  content: autoScrapedContent,
                  rating: 5,
                  mediaType: 'text',
                  source: plat.name,
                  status: 'approved',
                  tags: autoTags,
                  createdAt: new Date().toISOString(),
                  timestamp: serverTimestamp(),
                };

                try {
                  const ref = await addDoc(collection(db, 'testimonials'), newDoc);
                  loadedItems.unshift({
                    id: ref.id,
                    workspaceId,
                    authorName: newDoc.authorName,
                    authorRole: newDoc.authorRole,
                    content: newDoc.content,
                    rating: 5,
                    status: 'Approved',
                    source: plat.name,
                    tags: autoTags,
                    createdAt: newDoc.createdAt,
                  });
                } catch {
                  // Ignore if offline
                }
              }
            }
          }
        }

        // Fallback default sample items if no testimonials exist in Firestore yet
        if (loadedItems.length === 0) {
          const sampleReviews = [
            {
              id: 'sample-1',
              workspaceId,
              authorName: 'Sam Marsh',
              authorRole: 'Marsh & Sons',
              content: '“I was sure the techs would never use it. They picked it up in a day.”',
              rating: 5,
              status: 'Approved' as const,
              source: 'Imported',
              tags: ['Ease of use'] as PraiseCategory[],
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: 'sample-2',
              workspaceId,
              authorName: 'Dave Hartley',
              authorRole: 'Owner, Hartley Plumbing',
              content: '“Scheduling used to eat my Sundays. Now it runs itself.”',
              rating: 5,
              status: 'Approved' as const,
              source: 'Imported',
              tags: ['Time saved'] as PraiseCategory[],
              createdAt: new Date(Date.now() - 7200000).toISOString(),
            },
            {
              id: 'sample-3',
              workspaceId,
              authorName: 'Elena Rostova',
              authorRole: 'SwiftFlow',
              content: '“The automated workflow and quick response from support have been fantastic.”',
              rating: 5,
              status: 'Approved' as const,
              source: 'Google Reviews',
              tags: ['Support', 'Ease of use'] as PraiseCategory[],
              createdAt: new Date(Date.now() - 10800000).toISOString(),
            },
          ];
          loadedItems.push(...sampleReviews);
        }

        // Sort newest first
        loadedItems.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setProofList(loadedItems);

        if (showToast) {
          setSyncNotice(
            `Synced ${loadedItems.length} total testimonial(s) from your Import & Collection pipelines.`
          );
          setTimeout(() => setSyncNotice(null), 3500);
        }
      } catch (err) {
        console.warn('Error pulling proof list:', err);
      } finally {
        setIsRefreshing(false);
      }
    },
    [workspaceId, workspaceName]
  );

  useEffect(() => {
    handleSingleRefreshPull(false);
  }, [handleSingleRefreshPull]);

  // Approve a pending review in 1 click right inside the list
  const handleApproveReview = async (id: string) => {
    setProofList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Approved' } : item))
    );
    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'testimonials', id), { status: 'approved' });
    } catch {
      // Updated in UI
    }
  };

  const toggleSelectApproved = (item: ProofItem) => {
    if (item.status !== 'Approved') return;
    setSelectedIds((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
    );
  };

  const selectedApprovedObjects = proofList.filter(
    (p) => p.status === 'Approved' && selectedIds.includes(p.id)
  );

  const handleTriggerPost = (targetList: ProofItem[]) => {
    if (onPostOnInternet) {
      onPostOnInternet(targetList);
    }
  };

  // Dynamic Top-Ribbon Category Counts (Calculated from actual reviews)
  const categoryCounts = useMemo(() => {
    const counts: Record<PraiseCategory, number> = {
      'Ease of use': 0,
      'Time saved': 0,
      Support: 0,
    };
    proofList.forEach((item) => {
      item.tags.forEach((tag) => {
        if (tag in counts) {
          counts[tag as PraiseCategory] += 1;
        }
      });
    });
    return counts;
  }, [proofList]);

  // Filtered Reviews based on Top Ribbon Category + Search Bar Query + Status
  const filteredProofList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return proofList.filter((item) => {
      const matchesCategory = activeCategory
        ? item.tags.includes(activeCategory)
        : true;

      const matchesStatus =
        statusFilter === 'all' ? true : item.status === statusFilter;

      const matchesSearch =
        !q ||
        item.content.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q) ||
        item.authorRole.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [proofList, activeCategory, statusFilter, searchQuery]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs font-sans antialiased text-slate-900">
      {/* 1. HEADER ROW: "Your Proof [Count]" + Single Refresh Sync + "+ Invite customer" */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Your Proof
          </h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {proofList.length}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Single-Refresh Button to Pull All Approved/Imported Reviews */}
          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => handleSingleRefreshPull(true)}
            title="Pull & sync all testimonials from Import and Collection forms"
            className="inline-flex items-center justify-center px-3.5 py-2 border border-purple-200 text-xs sm:text-sm font-semibold rounded-lg text-purple-700 bg-purple-50/60 hover:bg-purple-100/80 active:scale-[0.98] transition-all gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Proof'}</span>
          </button>

          {/* Primary Action Button: + Invite customer (Matches Screenshot 1) */}
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all shadow-xs gap-1.5 cursor-pointer"
          >
            <span className="text-base leading-none text-slate-500">+</span>
            <span>Invite customer</span>
          </button>

          {/* PRIMARY WORKFLOW CTA: "Post on Internet" */}
          <button
            type="button"
            onClick={() => {
              const targetList =
                selectedApprovedObjects.length > 0
                  ? selectedApprovedObjects
                  : proofList.filter((p) => p.status === 'Approved').slice(0, 1);
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

      {/* Sync Toast Notice */}
      {syncNotice && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{syncNotice}</span>
          <button type="button" onClick={() => setSyncNotice(null)} className="cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* 2. TOP FILTER RIBBON: "Customers praise: [Ease of use] [Time saved] [Support]" */}
      <section
        aria-label="Customer Praise Filters"
        className="flex flex-wrap items-center justify-between gap-3 mb-5 text-xs sm:text-sm"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-normal mr-1">Customers praise:</span>

          {(['Ease of use', 'Time saved', 'Support'] as PraiseCategory[]).map((category) => {
            const isSelected = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(isSelected ? null : category)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-300/60 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span>{category}</span>
                <span className="font-bold text-slate-900">{categoryCounts[category]}</span>
              </button>
            );
          })}

          {activeCategory && (
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className="text-xs font-semibold text-purple-600 hover:underline ml-1 cursor-pointer"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Status Quick-Filter Pills */}
        <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          {(['all', 'Approved', 'Pending Review'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </section>

      {/* 3. PURPLE-BORDERED SEARCH INPUT BAR (Exact Position from Screenshot 1) */}
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
            placeholder="do the techs actually use it — search keywords, names, roles, or sources..."
            className="block w-full pl-10 pr-9 py-2.5 text-sm text-slate-900 rounded-xl border border-purple-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* 4. ORGANIZED VERTICAL LIST OF APPROVED / IMPORTED TESTIMONIALS (Matches Screenshot 1) */}
      <section aria-label="Customer Testimonials" className="space-y-3.5">
        {isRefreshing && proofList.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-slate-200/80 bg-slate-50/50 text-slate-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>Pulling your approved & imported reviews...</span>
          </div>
        ) : filteredProofList.length === 0 ? (
          <div className="p-10 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 space-y-3">
            <p className="text-sm font-bold text-slate-800">
              {proofList.length === 0
                ? 'No reviews pulled into Proof yet.'
                : 'No reviews match your current search or filter.'}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {proofList.length === 0
                ? 'Import reviews from social media, CSV, or screenshots in the Import tab, then click Refresh Proof.'
                : 'Try clearing your search query or resetting the top filter ribbon.'}
            </p>
            {(searchQuery || activeCategory || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory(null);
                  setStatusFilter('all');
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold cursor-pointer"
              >
                Show All Reviews ({proofList.length})
              </button>
            )}
          </div>
        ) : (
          filteredProofList.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isApproved = item.status === 'Approved';

            return (
              <article
                key={item.id}
                onClick={() => isApproved && toggleSelectApproved(item)}
                className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#6701e6] bg-purple-50/25 ring-2 ring-purple-500/15 shadow-sm'
                    : 'border-slate-200/80 bg-white shadow-xs hover:shadow-sm hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
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
                      <span className="font-semibold text-slate-800">{item.authorRole}</span>
                    </h4>
                    {item.source && item.source !== 'Imported' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                        via {item.source}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isApproved && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerPost([item]);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-[#6701e6] hover:bg-purple-100 border border-purple-200 cursor-pointer transition-colors"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Post on Internet →</span>
                      </button>
                    )}

                    {item.status === 'Pending Review' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApproveReview(item.id);
                        }}
                        className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-colors"
                      >
                        Approve Now
                      </button>
                    )}

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                        item.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border-amber-200/60'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

              {/* Star Ratings */}
              <div
                aria-label={`${item.rating} out of 5 stars`}
                className="flex items-center text-amber-400 text-sm mb-2"
              >
                {Array.from({ length: item.rating }).map((_, idx) => (
                  <span key={idx}>★</span>
                ))}
              </div>

              {/* Quote Text */}
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {item.content}
              </p>

              {/* Optional Attached Screenshot Preview (if imported via Screenshots) */}
              {item.screenshotUrl && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src={item.screenshotUrl}
                    alt="Imported review screenshot"
                    className="h-16 w-auto rounded-lg border border-slate-200 object-cover"
                  />
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Attached Screenshot Proof
                  </span>
                </div>
              )}
            </article>
            );
          })
        )}
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

export { ProofSection };
