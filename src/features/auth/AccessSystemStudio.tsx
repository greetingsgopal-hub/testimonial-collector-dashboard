import React, { useState, useRef } from 'react';
import {
  Shield,
  Lock,
  Check,
  Copy,
  Eye,
  EyeOff,
  ShoppingBag,
  X,
  FileCode,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import {
  LOGIN_PAGE_TEMPLATE,
  AUTH_MIDDLEWARE_TEMPLATE,
  RBAC_TEMPLATE,
} from './accessTemplates';

export const AccessSystemStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copiedText, setCopiedText] = useState<string>('');

  // Interactive Live Login Simulator state
  const [osMode, setOsMode] = useState<'merchant' | 'admin'>('merchant');
  const [loginMode, setLoginMode] = useState<'idle' | 'shopify' | 'admin'>('idle');
  const [storeDomain, setStoreDomain] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [admin2fa, setAdmin2fa] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(true);

  const preRef = useRef<HTMLPreElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const currentTemplate =
    activeTab === 0
      ? LOGIN_PAGE_TEMPLATE
      : activeTab === 1
      ? AUTH_MIDDLEWARE_TEMPLATE
      : RBAC_TEMPLATE;

  const currentFilename =
    activeTab === 0
      ? 'app/(auth)/login/page.tsx'
      : activeTab === 1
      ? 'middleware/auth.js'
      : 'middleware/rbac.js + hooks/useAuth.tsx';

  const handleCopy = () => {
    const textarea = document.createElement('textarea');
    textarea.value = currentTemplate;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopiedText('Copied!');
      setTimeout(() => setCopiedText(''), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
    document.body.removeChild(textarea);
  };

  const handleConnectStore = () => {
    if (!storeDomain || !storeDomain.includes('.myshopify.com')) {
      showToast('Enter valid .myshopify.com domain');
      return;
    }
    showToast(`Shopify OAuth → ${storeDomain} → /dashboard`);
  };

  const handleVerifyAdmin = () => {
    if (!adminEmail || !adminPassword || admin2fa.length !== 6) {
      showToast('Complete email, password & 6-digit 2FA');
      return;
    }
    showToast('2FA verified • JWT issued → /admin');
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0B] text-white font-sans selection:bg-[#FFE600] selection:text-black">
      {/* Top Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0A0B]/85 border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1240px] px-5 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[#FFE600] text-black font-black flex items-center justify-center text-[18px]">
              P
            </div>
            <div className="leading-none">
              <div className="font-extrabold text-[17px] tracking-tight">
                PandaPraise Access System
              </div>
              <div className="text-[11px] text-white/40 tracking-widest font-mono font-medium mt-0.5">
                AUTH • RBAC • IMPERSONATION
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.06] text-white/60 font-mono">
              <ShieldCheck size={12} className="text-[#25D366]" />
              SOC2 Type II • Encrypted • 99.98%
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/20 font-medium font-mono">
              Production Ready
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mx-auto max-w-[1240px] px-5 pt-5 pb-2">
          <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight leading-none text-white">
            Login + Auth Middleware + RBAC
          </h1>
          <p className="text-[13px] text-white/50 mt-2 max-w-[720px] leading-relaxed">
            Global standard login, JWT verification with impersonation audit, and granular permission scopes. Three copy-paste-ready modules for Merchant OS &amp; Admin OS.
          </p>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mx-auto max-w-[1240px] px-5 flex gap-1 overflow-x-auto">
          {[
            { label: 'login.tsx', desc: 'Global Login', icon: FileCode },
            { label: 'middleware/auth.js', desc: 'JWT + Impersonation', icon: Lock },
            { label: 'middleware/rbac.js', desc: 'Permissions + Guards', icon: Shield },
          ].map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  setActiveTab(idx);
                  showToast(`Opened ${tab.label}`);
                }}
                className={`group flex items-center gap-2.5 px-4 h-[44px] border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-[#FFE600] text-white'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
              >
                <Icon
                  size={14}
                  className={isActive ? 'text-[#FFE600]' : 'text-white/40'}
                />
                <span className="text-[13px] font-medium">{tab.label}</span>
                <span className="text-[11px] opacity-50 hidden lg:inline font-mono">
                  {tab.desc}
                </span>
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2 py-2">
            <button
              type="button"
              onClick={handleCopy}
              className="h-8 px-3 rounded-full bg-white text-black text-[12px] font-semibold flex items-center gap-1.5 hover:bg-white/90 transition shadow-sm"
            >
              {copiedText ? (
                <Check size={14} className="text-black" />
              ) : (
                <Copy size={14} className="text-black" />
              )}
              <span>{copiedText || 'Copy code'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="mx-auto max-w-[1240px] px-0 sm:px-5 py-0 sm:py-6">
        {/* Tab 0: login.tsx */}
        {activeTab === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-0 sm:gap-5 items-start">
            {/* Left Interactive Login Box */}
            <div className="relative bg-[#0A0A0B] sm:rounded-[16px] border-0 sm:border border-white/[0.06] overflow-hidden min-h-[760px] flex flex-col">
              {/* Impersonation Banner */}
              {isImpersonating && (
                <div className="h-[40px] bg-[#FFE600] text-black text-[13px] font-semibold flex items-center justify-between px-4 shrink-0 shadow-sm">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-black animate-pulse shrink-0" />
                    <span className="truncate">
                      Impersonating Kalyan Silks • your-store.myshopify.com
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsImpersonating(false);
                      showToast('Exited impersonation • audit: IMPERSONATE_END logged');
                    }}
                    className="ml-3 flex items-center gap-1 underline underline-offset-4 shrink-0 hover:opacity-80"
                  >
                    <span>Exit Impersonation</span>
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Centered Login Card */}
              <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(600px_400px_at_50%_-10%,rgba(255,230,0,0.08),transparent)]">
                <div className="w-full max-w-[400px] rounded-[16px] bg-[#141416] border border-white/[0.06] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                  {/* Card Brand Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] bg-[#FFE600] text-black font-black text-[20px] flex items-center justify-center">
                        P
                      </div>
                      <div className="leading-tight">
                        <div className="text-white font-semibold text-[15px] tracking-tight">
                          PandaPraise
                        </div>
                        <div className="text-[11px] text-white/40">
                          Merchant &amp; Admin OS
                        </div>
                      </div>
                    </div>

                    <div className="flex bg-white/[0.06] rounded-full p-1 text-[11px] font-medium">
                      <button
                        type="button"
                        onClick={() => setOsMode('merchant')}
                        className={`px-3 py-1 rounded-full transition ${
                          osMode === 'merchant'
                            ? 'bg-white text-black font-bold'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Merchant OS
                      </button>
                      <button
                        type="button"
                        onClick={() => setOsMode('admin')}
                        className={`px-3 py-1 rounded-full transition ${
                          osMode === 'admin'
                            ? 'bg-white text-black font-bold'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        Admin OS
                      </button>
                    </div>
                  </div>

                  {/* Actions Stack */}
                  <div className="space-y-3">
                    {/* Shopify Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setLoginMode((prev) => (prev === 'shopify' ? 'idle' : 'shopify'))
                      }
                      className="w-full h-[48px] rounded-[12px] bg-[#95BF47] text-black font-medium flex items-center gap-3 px-4 hover:brightness-[1.05] transition text-left"
                    >
                      <div className="w-8 h-8 rounded-[8px] bg-black/10 flex items-center justify-center">
                        <ShoppingBag size={16} />
                      </div>
                      <div className="leading-tight flex-1">
                        <div className="text-[14px] font-semibold">
                          Continue with Shopify
                        </div>
                        <div className="text-[11px] opacity-75">
                          For merchants • your-store.myshopify.com
                        </div>
                      </div>
                      <div className="text-black/40">↗</div>
                    </button>

                    {loginMode === 'shopify' && (
                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-3 animate-in">
                        <div className="text-[11px] text-white/40 font-medium tracking-wide font-mono">
                          STORE DOMAIN
                        </div>
                        <input
                          type="text"
                          value={storeDomain}
                          onChange={(e) => setStoreDomain(e.target.value)}
                          placeholder="your-store.myshopify.com"
                          className="w-full h-10 rounded-lg bg-[#0A0A0B] border border-white/10 px-3 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-[#FFE600]/50 transition font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleConnectStore}
                          className="w-full h-10 rounded-lg bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition"
                        >
                          Connect Store
                        </button>
                      </div>
                    )}

                    {/* OR Separator */}
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[11px] text-white/25 tracking-widest font-mono font-medium">
                        OR
                      </span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {/* Admin Login Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setLoginMode((prev) => (prev === 'admin' ? 'idle' : 'admin'))
                      }
                      className="w-full h-[48px] rounded-[12px] border border-white/[0.1] text-white flex items-center gap-3 px-4 hover:bg-white/[0.04] transition text-left group"
                    >
                      <div className="w-8 h-8 rounded-[8px] bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition">
                        <Shield size={16} className="text-white/70" />
                      </div>
                      <div className="leading-tight flex-1">
                        <div className="text-[14px] font-medium">Admin Login</div>
                        <div className="text-[11px] text-white/50">
                          For PandaPraise team • 2FA required
                        </div>
                      </div>
                      <div className="text-white/20">↗</div>
                    </button>

                    {loginMode === 'admin' && (
                      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 space-y-3 animate-in">
                        <input
                          type="email"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@pandapraise.com"
                          className="w-full h-10 rounded-lg bg-[#0A0A0B] border border-white/10 px-3 text-[13px] text-white outline-none focus:border-[#FFE600]/50"
                        />
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full h-10 rounded-lg bg-[#0A0A0B] border border-white/10 px-3 pr-10 text-[13px] text-white outline-none focus:border-[#FFE600]/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center text-white/40 hover:text-white"
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <input
                          type="text"
                          value={admin2fa}
                          onChange={(e) => setAdmin2fa(e.target.value)}
                          placeholder="2FA code • 6 digits"
                          maxLength={6}
                          className="w-full h-10 rounded-lg bg-[#0A0A0B] border border-white/10 px-3 text-[13px] tracking-[0.32em] text-white placeholder:tracking-normal outline-none focus:border-[#FFE600]/50 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyAdmin}
                          className="w-full h-10 rounded-lg bg-[#FFE600] text-black text-[13px] font-semibold hover:brightness-105 transition"
                        >
                          Verify &amp; Enter Admin OS
                        </button>
                        <div className="flex items-center gap-2 text-[10px] text-white/30 justify-center font-mono">
                          <Lock size={10} />
                          <span>Encrypted • Hardware key supported</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Security Footer */}
                  <div className="mt-8 flex items-center justify-center gap-2.5 text-[11px] text-white/30 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      SOC2 Type II
                    </span>
                    <span>•</span>
                    <span>Encrypted</span>
                    <span>•</span>
                    <span>99.98% uptime</span>
                  </div>
                </div>
              </div>

              {/* Toast Pill */}
              {toastMessage && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white text-black text-[13px] px-4 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex items-center gap-2 z-10 animate-in font-medium">
                  <div className="w-5 h-5 rounded-full bg-black text-white grid place-items-center">
                    <Check size={12} />
                  </div>
                  <span>{toastMessage}</span>
                </div>
              )}
            </div>

            {/* Right Code Inspector Box */}
            <div className="bg-[#141416] sm:rounded-[16px] border-t sm:border border-white/[0.06] overflow-hidden flex flex-col">
              <div className="h-[44px] px-4 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center gap-2 text-[12px] text-white/60 font-mono">
                  <div className="w-2 h-2 rounded-full bg-[#FFE600]" />
                  <span>{currentFilename}</span>
                </div>
                <div className="text-[10px] text-white/30 font-mono">
                  400px • #141416 • 16px radius
                </div>
              </div>
              <pre
                ref={preRef}
                className="font-mono text-[11.5px] leading-[18px] p-4 overflow-auto whitespace-pre-wrap break-words text-white/80"
              >
                <code>{LOGIN_PAGE_TEMPLATE}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 1: middleware/auth.js */}
        {activeTab === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
            <div className="bg-[#141416] rounded-[16px] border border-white/[0.06] p-5 h-fit sticky top-[88px]">
              <div className="text-[13px] font-semibold mb-1 text-white">
                middleware/auth.js
              </div>
              <div className="text-[11px] text-white/40 mb-5 font-mono">
                Production hardening for PandaPraise
              </div>

              <div className="space-y-4 text-[12px]">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-[#FFE600]/10 text-[#FFE600] grid place-items-center shrink-0 mt-0.5">
                    <Lock size={12} />
                  </div>
                  <div>
                    <div className="font-medium text-white">verifyJWT</div>
                    <div className="text-white/40 text-[11px]">
                      Bearer • exp • iat • attach req.user
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-white/5 text-white/60 grid place-items-center shrink-0 mt-0.5">
                    <Shield size={12} />
                  </div>
                  <div>
                    <div className="font-medium text-white">requireRole</div>
                    <div className="text-white/40 text-[11px]">
                      Gate by super_admin, merchant_admin… 403 + audit
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-white/5 text-white/60 grid place-items-center shrink-0 mt-0.5">
                    <ShoppingBag size={12} />
                  </div>
                  <div>
                    <div className="font-medium text-white">requireStore</div>
                    <div className="text-white/40 text-[11px]">
                      Merchant can’t cross store • impersonation scoped
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-[#FFE600] text-black grid place-items-center shrink-0 mt-0.5">
                    <Terminal size={12} />
                  </div>
                  <div>
                    <div className="font-medium text-white">Impersonation</div>
                    <div className="text-white/40 text-[11px]">
                      ?impersonate= • super_admin only • audit IMPERSONATE • header X-Impersonating
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-[#FFE600]/5 border border-[#FFE600]/10">
                <div className="text-[11px] font-semibold text-[#FFE600] font-mono">
                  Security Note
                </div>
                <div className="text-[11px] text-white/50 mt-1 leading-relaxed">
                  Always validate store format with regex, log every impersonation with IP, never allow client to set storeDomain directly. Use httpOnly cookies + short admin TTL.
                </div>
              </div>
            </div>

            <div className="bg-[#141416] rounded-[16px] border border-white/[0.06] overflow-hidden">
              <div className="h-[44px] px-4 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02]">
                <span className="font-mono text-[12px] text-white/60">
                  middleware/auth.js
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-white/10 text-white/50 font-mono">
                  Node • Express • jsonwebtoken
                </span>
              </div>
              <pre className="font-mono text-[12px] leading-[19px] p-5 overflow-auto text-white/85 whitespace-pre-wrap break-words">
                <code>{AUTH_MIDDLEWARE_TEMPLATE}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: middleware/rbac.js */}
        {activeTab === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
            <div className="bg-[#141416] rounded-[16px] border border-white/[0.06] p-5 h-fit sticky top-[88px]">
              <div className="text-[13px] font-semibold mb-1 text-white">
                RBAC + Guards
              </div>
              <div className="text-[11px] text-white/40 mb-5 font-mono">
                Scopes • can() • hooks • banners
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                {Object.entries({
                  merchant_admin: 'Inbox, Approve, Reward, Billing',
                  agency_editor: 'Inbox, Ad Library, Analytics',
                  auditor: 'Read-only all',
                  super_admin: '* wildcard',
                }).map(([role, scopes]) => (
                  <div
                    key={role}
                    className="flex justify-between gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                  >
                    <span className="text-[#FFE600] font-bold">{role}</span>
                    <span className="text-white/40 text-right">{scopes}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[11px] text-white/30 font-mono">JWT TTL</div>
                  <div className="text-[12px] font-semibold text-white mt-1">
                    Merchant 7d • Admin 8h
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[11px] text-white/30 font-mono">Storage</div>
                  <div className="text-[12px] font-semibold text-white mt-1">
                    httpOnly • Secure
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[11px] text-white/40 leading-relaxed font-mono">
                Frontend guards use <span className="text-white">useAuth()</span> +{' '}
                <span className="text-white">RequireAuth</span> wrapper. Impersonation banner reads{' '}
                <span className="text-white">user.impersonatedStore</span> and sticks top.
              </div>
            </div>

            <div className="bg-[#141416] rounded-[16px] border border-white/[0.06] overflow-hidden">
              <div className="h-[44px] px-4 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02]">
                <span className="font-mono text-[12px] text-white/60">
                  middleware/rbac.js + hooks/useAuth.tsx + guards.tsx + .env.example
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-[#FFE600]/10 text-[#FFE600] border border-[#FFE600]/20 font-mono">
                  copy-paste ready
                </span>
              </div>
              <pre className="font-mono text-[12px] leading-[19px] p-5 overflow-auto text-white/85 whitespace-pre-wrap break-words">
                <code>{RBAC_TEMPLATE}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mx-auto max-w-[1240px] px-5 py-10 text-[11px] text-white/20 flex items-center justify-between font-mono">
        <span>© PandaPraise • Merchant OS / Admin OS • Access System v2.1</span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>All checks passing</span>
        </span>
      </div>
    </div>
  );
};
