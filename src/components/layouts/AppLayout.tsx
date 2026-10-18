import { useState, useEffect, useMemo } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Search, Sparkles } from 'lucide-react';
import { ImportTestimonialsHub, ImportedTestimonial } from '../dashboard/ImportTestimonialsHub';

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  company?: string;
  content: string;
  rating: number;
  status: 'Approved' | 'Pending Review';
  tags?: string[];
  createdAt?: string;
  screenshotUrl?: string | null;
}

export interface AppLayoutProps {
  workspaceId?: string;
  userName?: string;
  userRole?: string;
  initialNav?: string;
  initialSearchQuery?: string;
  children?: React.ReactNode;
}

export default function AppLayout({
  workspaceId = 'papasystem',
  userName = 'Gopal Thakur',
  userRole = 'Admin',
  initialNav = 'proof',
  initialSearchQuery = 'do the techs actually use it',
  children,
}: AppLayoutProps) {
  const [activeNav, setActiveNav] = useState<string>(initialNav);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleShiftNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.tab === 'proof') {
        setActiveNav('proof');
      }
    };
    window.addEventListener('pandapraise:navigate', handleShiftNav);
    return () => window.removeEventListener('pandapraise:navigate', handleShiftNav);
  }, []);

  // Load real testimonials from Firebase Firestore
  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const db = getFirestore();
      const q = query(collection(db, 'testimonials'), where('workspaceId', '==', workspaceId));
      const snap = await getDocs(q);

      const rows: Testimonial[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          authorName: data.authorName || data.author_name || 'Anonymous',
          authorRole: data.authorRole || data.author_role || data.company || 'Customer',
          company: data.company || '',
          content: data.content || data.text || '',
          rating: Number(data.rating || 5),
          status: data.status === 'approved' || !data.status ? 'Approved' : 'Pending Review',
          tags: data.tags || ['Ease of use', 'Time saved'],
          screenshotUrl: data.screenshotUrl || null,
        };
      });

      if (rows.length > 0) {
        setTestimonials(rows);
      } else {
        // Fallback default mock items matching Stitch design if collection is empty
        setTestimonials([
          {
            id: '1',
            authorName: 'Sam Marsh',
            authorRole: 'Marsh & Sons',
            content: '“I was sure the techs would never use it. They picked it up in a day.”',
            rating: 5,
            status: 'Approved',
            tags: ['Ease of use'],
          },
          {
            id: '2',
            authorName: 'Dave Hartley',
            authorRole: 'Owner, Hartley Plumbing',
            content: '“Scheduling used to eat my Sundays. Now it runs itself.”',
            rating: 5,
            status: 'Approved',
            tags: ['Time saved'],
          },
          {
            id: '3',
            authorName: 'Elena Rostova',
            authorRole: 'VP of Operations, SwiftFlow',
            content: '“We closed three enterprise deals after sharing the live wall of love embed. The automated collection saved our team dozens of hours.”',
            rating: 5,
            status: 'Approved',
            tags: ['Ease of use', 'Support'],
          },
          {
            id: '4',
            authorName: 'Marcus Vance',
            authorRole: 'Founder, Apex Craft',
            content: '“The automated video and text prompt flow makes asking clients painless. Panda Praise turns happy feedback into converted pipeline.”',
            rating: 5,
            status: 'Pending Review',
            tags: ['Time saved'],
          },
        ]);
      }
    } catch (err) {
      console.warn('Firestore load warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, [workspaceId]);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      const queryText = searchQuery.toLowerCase();
      const matchesSearch =
        t.content.toLowerCase().includes(queryText) ||
        t.authorName.toLowerCase().includes(queryText) ||
        t.authorRole.toLowerCase().includes(queryText);

      const matchesTag = selectedTag ? t.tags?.includes(selectedTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [testimonials, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-6 font-sans antialiased">
      {/* Outer Browser Mockup Shell (Full Dashboard Experience) */}
      <div className="w-full max-w-7xl bg-white md:rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col min-h-screen md:min-h-[850px]">
        
        {/* Browser Top Bar */}
        <header className="bg-slate-50/90 backdrop-blur border-b border-slate-200 px-5 py-3.5 flex items-center relative select-none shrink-0">
          <div className="flex items-center space-x-2 absolute left-5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-sm"></span>
          </div>
          <div className="w-full flex justify-center">
            <div className="bg-white/95 border border-slate-200/90 text-slate-600 text-xs sm:text-sm font-normal py-1.5 px-6 rounded-md shadow-xs flex items-center gap-2 max-w-xs sm:max-w-md w-full justify-center">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
              <span className="truncate tracking-wide text-slate-600">app.pandapraise.com/{activeNav}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex flex-col md:flex-row flex-1 bg-white">
          
          {/* Left Sidebar (Stitch Design System) */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200/80 p-6 flex flex-col justify-between shrink-0 bg-white">
            <div className="space-y-7">
              {/* User Profile Widget */}
              <div className="flex items-center space-x-3.5 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#ece8fd] text-purple-700 flex items-center justify-center font-bold text-base shadow-sm">
                  {userName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">{userName}</h2>
                  <p className="text-xs font-normal text-slate-400 mt-0.5">{userRole}</p>
                </div>
              </div>

              {/* Navigation Menu Groups */}
              <nav className="space-y-6">
                {/* Group: COLLECT */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-3">
                    COLLECT
                  </p>
                  <ul className="space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => setActiveNav('forms')}
                        className={`w-full text-left block px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                          activeNav === 'forms' ? 'text-slate-900 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Forms
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setActiveNav('import')}
                        className={`w-full text-left block px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                          activeNav === 'import' ? 'text-slate-900 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Import
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Group: MANAGE */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-3">
                    MANAGE
                  </p>
                  <ul className="space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => setActiveNav('proof')}
                        className={`w-full text-left block px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                          activeNav === 'proof' ? 'text-purple-700 bg-[#f4effe]' : 'text-slate-600 hover:text-slate-900 font-medium'
                        }`}
                      >
                        Proof
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Group: SHARE */}
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-3">
                    SHARE
                  </p>
                  <ul className="space-y-1">
                    <li>
                      <button
                        type="button"
                        onClick={() => setActiveNav('embeds')}
                        className={`w-full text-left block px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                          activeNav === 'embeds' ? 'text-slate-900 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Embeds
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => setActiveNav('thank-yous')}
                        className={`w-full text-left block px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                          activeNav === 'thank-yous' ? 'text-slate-900 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Thank Yous
                      </button>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>

            {/* Sidebar Footer Status */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Synced
              </span>
              <span>v2.4.0</span>
            </div>
          </aside>

          {/* Main Content Panel */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[820px] bg-white">
            {children ? (
              children
            ) : activeNav === 'proof' ? (
              <>
                {/* Header row */}
                <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950">Your Proof</h1>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {testimonials.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all shadow-xs gap-1.5 cursor-pointer"
                  >
                    <span className="text-base leading-none text-slate-500">+</span>
                    <span>Invite customer</span>
                  </button>
                </section>

                {/* Praise Attributes & Filters */}
                <section className="flex flex-wrap items-center gap-2 mb-5 text-xs sm:text-sm">
                  <span className="text-slate-500 font-normal mr-1">Customers praise:</span>
                  {[
                    { label: 'Ease of use', count: 42 },
                    { label: 'Time saved', count: 38 },
                    { label: 'Support', count: 29 },
                  ].map((filter) => {
                    const isActive = selectedTag === filter.label;
                    return (
                      <button
                        key={filter.label}
                        type="button"
                        onClick={() => setSelectedTag(isActive ? null : filter.label)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                          isActive
                            ? 'border-purple-400 bg-purple-50 text-purple-900 ring-2 ring-purple-300 font-semibold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span>{filter.label}</span>
                        <span className="font-bold text-slate-900">{filter.count}</span>
                      </button>
                    );
                  })}
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
                      className="block w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 rounded-xl border border-purple-300 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all"
                    />
                  </div>
                </section>

                {/* Highlighted AI Case Study Card */}
                <section className="mb-5">
                  <div className="p-4 sm:p-5 rounded-xl border border-purple-200 bg-[#fbf9fe] hover:border-purple-300 transition-colors">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      How Hartley Plumbing cut missed jobs to zero in one month
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-purple-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Case study generated with Panda Praise AI · 1 metric</span>
                    </p>
                  </div>
                </section>

                {/* Testimonial Proof Cards List */}
                <section className="space-y-3.5">
                  {isLoading ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Loading testimonials...</div>
                  ) : filteredTestimonials.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
                      No testimonials found matching your search.
                    </div>
                  ) : (
                    filteredTestimonials.map((t) => (
                      <article
                        key={t.id}
                        className="p-4 sm:p-5 rounded-xl border border-slate-200/80 bg-white shadow-xs hover:shadow-sm hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">
                            {t.authorName} <span className="text-slate-400 font-normal">·</span> {t.authorRole}
                          </h4>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                              t.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                : 'bg-amber-50 text-amber-700 border-amber-200/60'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>

                        <div className="flex items-center text-amber-400 text-sm mb-2">
                          {[...Array(Math.max(1, Math.min(5, t.rating)))].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>

                        {t.screenshotUrl && (
                          <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
                            <img
                              src={t.screenshotUrl}
                              alt={`${t.authorName} Proof`}
                              className="w-full max-h-48 object-contain object-top rounded-xl"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <p className="text-sm text-slate-700 leading-relaxed font-normal">
                          {t.content}
                        </p>
                      </article>
                    ))
                  )}
                </section>
              </>
            ) : activeNav === 'import' ? (
              <ImportTestimonialsHub
                workspaceId={workspaceId}
                workspaceName={workspaceId}
                onShiftToProof={(newItems: ImportedTestimonial[]) => {
                  if (newItems && newItems.length > 0) {
                    setTestimonials((prev) => [
                      ...newItems.map((item) => ({
                        id: item.id || String(Date.now()),
                        authorName: item.authorName,
                        authorRole: item.authorRole,
                        content: item.content,
                        rating: item.rating,
                        status: 'Approved' as const,
                        tags: item.tags,
                        screenshotUrl: item.screenshotUrl || null,
                      })),
                      ...prev,
                    ]);
                  }
                  setActiveNav('proof');
                }}
              />
            ) : (
              <div className="p-12 text-center text-slate-500">
                <h2 className="text-xl font-bold text-slate-800 capitalize">{activeNav} Section</h2>
                <p className="text-xs mt-1">Manage your {activeNav} configuration for this workspace.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Invite Customer Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Invite Customer for Review</h3>
            <p className="text-xs text-slate-500">Send an automated review invitation link directly to your customer.</p>
            <div className="space-y-3">
              <input type="text" placeholder="Customer Name" className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm" />
              <input type="email" placeholder="customer@company.com" className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button type="button" onClick={() => { alert('Invite sent successfully!'); setIsInviteModalOpen(false); }} className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white cursor-pointer">Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
