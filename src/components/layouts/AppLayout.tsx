import { useState, useEffect } from 'react';
import { ImportTestimonialsHub } from '../dashboard/ImportTestimonialsHub';
import ProofSection from '../dashboard/ProofSection';
import { AutoSyncedEmbedsStudio } from '../dashboard/UnifiedDashboardPipeline';

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
  children,
}: AppLayoutProps) {
  const [activeNav, setActiveNav] = useState<string>(initialNav);
  const [selectedForEmbeds, setSelectedForEmbeds] = useState<any[]>([]);

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
                        onClick={() => setActiveNav('campaigns')}
                        className={`w-full text-left block px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                          activeNav === 'campaigns' ? 'text-slate-900 bg-slate-100 font-semibold' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Campaigns
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
              <ProofSection
                workspaceId={workspaceId}
                workspaceName={workspaceId}
                onPostOnInternet={(items) => {
                  setSelectedForEmbeds(items);
                  setActiveNav('embeds');
                }}
              />
            ) : activeNav === 'embeds' ? (
              <AutoSyncedEmbedsStudio
                workspaceId={workspaceId}
                workspaceName={workspaceId}
                preselectedTestimonials={selectedForEmbeds}
              />
            ) : activeNav === 'import' ? (
              <ImportTestimonialsHub
                workspaceId={workspaceId}
                workspaceName={workspaceId}
                onShiftToProof={() => {
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
    </div>
  );
}
