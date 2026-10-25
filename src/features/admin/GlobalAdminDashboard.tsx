import React, { useState, useMemo, useEffect } from 'react';
import {
  Menu,
  Inbox,
  Image as ImageIcon,
  MessageSquare,
  CreditCard,
  Shield,
  Key,
  X,
  CheckCircle2,
  ChevronDown,
  Search,
  Bell,
  ShieldCheck,
  Download,
  FileText,
  Globe,
  Smartphone,
  AlertTriangle,
  MoreHorizontal,
  Info,
  ArrowUpRight,
  Check,
  Minus,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  TeamMember,
  INITIAL_TEAM_MEMBERS,
  INITIAL_ROLE_QUOTAS,
  CAPABILITY_POLICIES,
  INITIAL_AUDIT_LOG,
  AuditLogEntry,
} from './adminData';

type NavTabId =
  | 'overview'
  | 'inbox'
  | 'adlib'
  | 'whatsapp'
  | 'billing'
  | 'rbac'
  | 'apikeys';

export const GlobalAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTabId>('rbac');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState('Kalyan Silks • IN');

  // Directory filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  // Action Gates states
  const [gates, setGates] = useState({
    dual: true,
    autopublish: false,
    ipwhitelist: true,
  });

  // Team Members State
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);

  // Invite Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'Agency/Editor' as TeamMember['role'],
    domain: 'IN' as TeamMember['domain'],
    mfa: true,
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOG);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        searchQuery === '' ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain =
        selectedDomain === 'ALL' || m.domain === selectedDomain;
      return matchesSearch && matchesDomain;
    });
  }, [members, searchQuery, selectedDomain]);

  // Dynamic Role Quotas based on current members
  const dynamicQuotas = useMemo(() => {
    return INITIAL_ROLE_QUOTAS.map((rq) => {
      const count = members.filter((m) => m.role === rq.role).length;
      const available = Math.max(0, rq.quota - count);
      return {
        ...rq,
        used: count,
        status: count >= rq.quota ? 'Quota Reached' : `${available} Available`,
      };
    });
  }, [members]);

  const handleIssueInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.includes('@')) {
      showToast('Enter valid work email');
      return;
    }

    const emailName = inviteForm.email.split('@')[0];
    const formattedName = emailName
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const initials = (formattedName.split(' ')[0]?.[0] || 'T') + (formattedName.split(' ')[1]?.[0] || 'M');

    const newMember: TeamMember = {
      id: String(Date.now()),
      name: formattedName || 'New Teammate',
      email: inviteForm.email,
      role: inviteForm.role,
      domain: inviteForm.domain,
      verified: !inviteForm.mfa,
      lastActive: 'Invited • Pending',
      initials: initials.toUpperCase(),
    };

    setMembers((prev) => [newMember, ...prev]);

    // Add entry to audit log
    const newLog: AuditLogEntry = {
      id: String(Date.now()),
      iconType: 'mfa',
      title: `Invite issued • ${inviteForm.email} → ${inviteForm.role}`,
      time: 'Just now',
      desc: `Invited with ${inviteForm.domain} scope • 2FA ${inviteForm.mfa ? 'Enforced' : 'Optional'}`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showToast(`Invite issued to ${inviteForm.email} • ${inviteForm.role}`);
    setInviteModalOpen(false);
    setInviteForm({
      email: '',
      role: 'Agency/Editor',
      domain: 'IN',
      mfa: true,
    });
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Event,Timestamp,Details']
        .concat(
          auditLogs.map(
            (log) =>
              `"${log.id}","${log.title.replace(/"/g, '""')}","${log.time}","${log.desc.replace(/"/g, '""')}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pandapraise-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit log CSV • exported successfully');
  };

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { id: 'overview' as NavTabId, label: 'Overview', icon: Menu },
        { id: 'inbox' as NavTabId, label: 'Inbox Pipeline', icon: Inbox },
        { id: 'adlib' as NavTabId, label: 'Ad Library', icon: ImageIcon },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        { id: 'whatsapp' as NavTabId, label: 'WhatsApp Health', icon: MessageSquare },
        { id: 'billing' as NavTabId, label: 'Billing', icon: CreditCard },
      ],
    },
    {
      group: 'ADMIN',
      items: [
        { id: 'rbac' as NavTabId, label: 'Team RBAC', icon: Shield },
        { id: 'apikeys' as NavTabId, label: 'API Keys', icon: Key },
      ],
    },
  ];

  return (
    <div
      className="min-h-screen text-[#f8f6f1] overflow-x-clip selection:bg-[#ffe600] selection:text-black font-sans"
      style={
        {
          '--bg': '#0a0a0b',
          '--raised': '#141416',
          '--raised-hover': '#1a1a1d',
          '--text': '#f8f6f1',
          '--muted': '#8a8a8a',
          '--accent': '#ffe600',
          '--success': '#25d366',
          '--error': '#ff4d4d',
          '--border': 'hsla(0, 0%, 100%, 0.06)',
          '--border-strong': 'hsla(0, 0%, 100%, 0.1)',
          backgroundColor: 'var(--bg)',
        } as React.CSSProperties
      }
    >
      {/* Fixed Left Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-[#0a0a0b] border-r border-white/[0.06] z-40 flex flex-col transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-[64px] flex items-center gap-3 px-6 border-b border-white/[0.06] shrink-0">
          <div className="w-7 h-7 rounded-[6px] bg-[#ffe600] text-black flex items-center justify-center font-bold text-[14px] tracking-tighter">
            P
          </div>
          <div className="leading-none">
            <div className="text-[13px] font-semibold tracking-[-0.01em] text-white">
              PandaPraise
            </div>
            <div className="text-[11px] font-mono text-zinc-400 -mt-[1px] tracking-wide">
              ADMIN OS
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden ml-auto p-1 text-zinc-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-7">
          {navGroups.map((group) => (
            <div key={group.group}>
              <div className="px-3 mb-2 text-[10px] font-mono tracking-[0.12em] text-zinc-400 font-medium uppercase">
                {group.group}
              </div>
              <div className="space-y-[2px]">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 h-8 rounded-[8px] text-[13px] font-[450] transition-all text-left ${
                        isActive
                          ? 'bg-white/[0.04] text-white border-l-2 border-[#ffe600] ml-[-2px] pl-[calc(0.75rem+2px)]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                      }`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={1.5}
                        className={isActive ? 'text-[#ffe600]' : 'text-zinc-400'}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ffe600]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Sidebar Status Indicators */}
        <div className="p-4 border-t border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between px-3 py-2 rounded-[10px] bg-[#141416] border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse" />
              <span className="text-[11px] font-mono text-zinc-400">
                API Latency
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-white">
              24ms
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 text-[11px] font-mono text-zinc-400">
            <CheckCircle2 size={14} className="text-[#25d366]" />
            <span>WhatsApp Engine Active</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#25d366]" />
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Layout */}
      <div className="lg:pl-[280px] min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-[64px] flex items-center justify-between gap-4 px-4 lg:px-8 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/[0.06]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
            >
              <Menu size={18} />
            </button>

            {/* Tenant Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                className="flex items-center gap-2.5 px-3 h-8 rounded-[10px] bg-[#141416] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
              >
                <div className="w-5 h-5 rounded-[6px] bg-white text-black flex items-center justify-center text-[10px] font-bold">
                  K
                </div>
                <div className="text-left hidden sm:block leading-tight">
                  <div className="text-[13px] font-medium leading-none text-white">
                    {selectedTenant.split(' • ')[0]}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400">
                    Shopify Plus • {selectedTenant.split(' • ')[1] || 'IN'}
                  </div>
                </div>
                <ChevronDown size={14} className="text-zinc-400" />
              </button>

              {tenantDropdownOpen && (
                <div className="absolute top-full mt-2 left-0 w-64 rounded-[12px] bg-[#141416] border border-white/[0.08] shadow-2xl p-1.5 z-50">
                  {['Kalyan Silks • IN', 'Kalyan Silks • US', 'Kalyan Silks • SG'].map(
                    (tenant) => (
                      <button
                        key={tenant}
                        type="button"
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setTenantDropdownOpen(false);
                          showToast(`Switched active storefront to ${tenant}`);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-[8px] text-[13px] transition ${
                          selectedTenant === tenant
                            ? 'bg-white/[0.08] text-white font-medium'
                            : 'text-zinc-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        {tenant}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Quick Search Input */}
            <div className="hidden md:flex items-center gap-2 h-8 px-3 rounded-[10px] bg-[#141416] border border-white/[0.08] min-w-[240px]">
              <Search size={14} className="text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team, policies…"
                className="bg-transparent outline-none text-[13px] w-full placeholder:text-zinc-500 text-white"
              />
              <div className="ml-auto flex items-center gap-1">
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-400">
                  ⌘
                </kbd>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-400">
                  K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-[#141416] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
              <div className="w-1.5 h-1.5 rounded-full bg-[#25d366]" />
              <span>Merchant Admin</span>
            </div>

            <button
              type="button"
              onClick={() => showToast('Zero unread security alerts')}
              className="w-8 h-8 rounded-[10px] bg-[#141416] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.04] text-zinc-400 hover:text-white transition"
            >
              <Bell size={16} strokeWidth={1.5} />
            </button>

            <div className="w-8 h-8 rounded-full bg-[#EDE8E0] text-black flex items-center justify-center text-[12px] font-bold">
              AM
            </div>
          </div>
        </header>

        {/* Main Viewport Container */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6">
          {activeTab === 'rbac' ? (
            /* --- Primary RBAC View --- */
            <>
              {/* Top Subheader with Compliance Badges */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400 tracking-wide">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25d366]" />
                    SOC2 TYPE II
                  </span>
                  <span>•</span>
                  <span>ORG-ID: PP-KALYAN-IND-9021</span>
                  <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                    <ShieldCheck size={11} className="text-[#25d366]" />
                    Zero-trust enforced
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div>
                    <h1 className="text-[32px] font-semibold tracking-[-0.02em] leading-[1.1] text-white">
                      Team, Roles &amp; Access Control
                    </h1>
                    <p className="mt-2 text-[13px] text-zinc-400 max-w-[540px]">
                      Manage merchant permissions, agency seats, webhook access. All actions cryptographically logged.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="h-9 px-3.5 rounded-[10px] border border-white/[0.08] bg-[#141416] text-[13px] font-medium text-zinc-200 hover:bg-white/[0.04] flex items-center gap-2 transition"
                    >
                      <Download size={14} />
                      <span>Export Audit Log CSV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => showToast('Security Policy • v2.4 verified')}
                      className="h-9 px-3.5 rounded-[10px] border border-white/[0.08] bg-[#141416] text-[13px] font-medium text-zinc-200 hover:bg-white/[0.04] flex items-center gap-2 transition"
                    >
                      <FileText size={14} />
                      <span>Security Policy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInviteModalOpen(true)}
                      className="h-9 px-4 rounded-[10px] bg-[#ffe600] text-black text-[13px] font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_2px_8px_rgba(255,230,0,0.25)] hover:brightness-105 flex items-center gap-1.5 transition"
                    >
                      + Invite Team Member
                    </button>
                  </div>
                </div>
              </div>

              {/* Global Health Ribbon */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 h-auto min-h-[36px] py-2 rounded-[12px] bg-[#141416] border border-white/[0.06] text-[11px] font-mono text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Globe size={12} className="text-zinc-400" />
                  Active Tenants{' '}
                  <strong className="text-white font-medium">3 Storefronts IN/US/SG</strong>
                </span>
                <span className="hidden sm:inline opacity-30">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Key size={12} className="text-zinc-400" />
                  API Credentials{' '}
                  <strong className="text-white font-medium">6 Active</strong>
                </span>
                <span className="hidden sm:inline opacity-30">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Smartphone size={12} className="text-[#25d366]" />
                  MFA{' '}
                  <strong className="text-[#25d366] font-medium">100% Enforced</strong>
                </span>
                <span className="hidden sm:inline opacity-30">•</span>
                <span>
                  Last check{' '}
                  <strong className="text-white font-medium">Today 14:32 IST</strong>
                </span>
              </div>

              {/* 4 Role Quota Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {dynamicQuotas.map((rq) => (
                  <div
                    key={rq.role}
                    className="group relative rounded-[12px] bg-[#141416] border border-white/[0.06] p-4 hover:bg-[#1a1a1d] hover:border-white/[0.1] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-[11px] font-mono font-medium tracking-wide text-zinc-400 uppercase">
                        {rq.role}
                      </div>
                      <div className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.06] text-zinc-300">
                        {rq.status}
                      </div>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <div className="font-serif text-[44px] leading-none tracking-[-0.02em] text-white">
                        {String(rq.used).padStart(2, '0')}
                        <span className="text-zinc-500 text-[28px]">
                          /{String(rq.quota).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        SEATS
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full bg-white transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (rq.used / rq.quota) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {rq.limit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Granular Policy Matrix Card */}
              <div className="rounded-[12px] bg-[#141416] border border-white/[0.06] overflow-hidden">
                <div className="flex items-center justify-between px-5 h-[48px] border-b border-white/[0.06]">
                  <h3 className="text-[13px] font-semibold text-white">
                    Granular Policy Matrix
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25d366] animate-pulse" />
                      Strict Zero-Trust Model active
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="text-[11px] font-mono text-zinc-400 border-b border-white/[0.06]">
                        <th className="text-left font-medium px-5 py-3 w-[28%]">
                          Capability
                        </th>
                        <th className="text-left font-medium px-3 py-3">
                          Owner / Super
                        </th>
                        <th className="text-left font-medium px-3 py-3">
                          Merchant Admin
                        </th>
                        <th className="text-left font-medium px-3 py-3">
                          Agency / Editor
                        </th>
                        <th className="text-left font-medium px-3 py-3">
                          Auditor
                        </th>
                        <th className="text-left font-medium px-5 py-3">
                          Approval Gate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {CAPABILITY_POLICIES.map((cp) => (
                        <tr
                          key={cp.capability}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3.5 text-[13px] font-medium text-white">
                            {cp.capability}
                          </td>
                          <td className="px-3 py-3.5">
                            <PolicyIndicator type={cp.owner} />
                          </td>
                          <td className="px-3 py-3.5">
                            <PolicyIndicator type={cp.merchant} />
                          </td>
                          <td className="px-3 py-3.5">
                            <PolicyIndicator type={cp.agency} />
                          </td>
                          <td className="px-3 py-3.5">
                            <PolicyIndicator type={cp.auditor} />
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex text-[11px] font-mono px-2 py-1 rounded-[6px] bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                              {cp.gate}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Team Directory Table */}
              <div className="rounded-[12px] bg-[#141416] border border-white/[0.06] overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 h-auto sm:h-[56px] py-3 sm:py-0 border-b border-white/[0.06]">
                  <h3 className="text-[13px] font-semibold text-white flex items-center gap-2">
                    <span>Store &amp; Agency Team Directory</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.06] text-zinc-300">
                      {filteredMembers.length} members
                    </span>
                  </h3>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name or email…"
                        className="h-8 pl-8 pr-3 w-[200px] sm:w-[240px] rounded-[10px] bg-[#0a0a0b] border border-white/[0.08] text-[13px] text-white outline-none focus:border-white/20"
                      />
                    </div>

                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="h-8 px-2.5 rounded-[10px] bg-[#0a0a0b] border border-white/[0.08] text-[12px] font-mono text-zinc-300 outline-none"
                    >
                      <option value="ALL">All Domains</option>
                      <option value="IN">IN</option>
                      <option value="US">US</option>
                      <option value="SG">SG</option>
                      <option value="GLOBAL">GLOBAL</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px]">
                    <thead>
                      <tr className="text-[11px] font-mono text-zinc-400 border-b border-white/[0.06]">
                        <th className="text-left font-medium px-5 py-3">
                          Member
                        </th>
                        <th className="text-left font-medium px-3 py-3">
                          Role
                        </th>
                        <th className="text-left font-medium px-3 py-3">
                          Domain Scope
                        </th>
                        <th className="text-left font-medium px-3 py-3">
                          2FA
                        </th>
                        <th className="text-left font-medium px-3 py-3">
                          Last Activity
                        </th>
                        <th className="text-right font-medium px-5 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredMembers.map((member) => (
                        <tr
                          key={member.id}
                          className="group hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-[11px] font-semibold font-mono text-white">
                                {member.initials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[13px] font-medium text-white truncate">
                                    {member.name}
                                  </span>
                                  {member.you && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#ffe600] text-black font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-zinc-400 truncate">
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <span className="inline-flex text-[11px] px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-zinc-200">
                              {member.role}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-zinc-300">
                              <Globe size={10} className="text-zinc-400" />
                              {member.domain}
                            </span>
                          </td>

                          <td className="px-3 py-3">
                            {member.verified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#25d366]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#25d366]" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3 text-[11px] font-mono text-zinc-400">
                            {member.lastActive}
                          </td>

                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => showToast(`${member.name} • permissions inspected`)}
                              className="w-7 h-7 rounded-[8px] hover:bg-white/[0.06] inline-flex items-center justify-center text-zinc-400 hover:text-white transition"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom 2-Column: Action Gates (Left) + Live Security Audit Log (Right) */}
              <div className="grid grid-cols-12 gap-3">
                {/* Left Card: Action Gates */}
                <div className="col-span-12 lg:col-span-5 rounded-[12px] bg-[#141416] border border-white/[0.06] p-5">
                  <h4 className="text-[13px] font-semibold text-white flex items-center gap-2">
                    <ShieldCheck size={15} className="text-[#ffe600]" />
                    <span>Action Gates &amp; Enforcement</span>
                  </h4>
                  <p className="text-[12px] text-zinc-400 mt-1 leading-relaxed">
                    Critical operations require explicit approval. Changes logged immutably.
                  </p>

                  <div className="mt-5 space-y-4">
                    {[
                      {
                        key: 'dual' as const,
                        title: 'Dual-approval >₹500',
                        desc: 'UPI payouts above ₹500 require 2 owners. Holds auto-applied.',
                      },
                      {
                        key: 'autopublish' as const,
                        title: 'Auto-publish to Meta',
                        desc: 'Publish approved UGC directly to ad catalog without manual sync.',
                      },
                      {
                        key: 'ipwhitelist' as const,
                        title: 'Office IP Whitelist',
                        desc: 'Restrict Owner actions to 203.0.113.0/24. VPN bypass disabled.',
                      },
                    ].map((g) => (
                      <div
                        key={g.key}
                        className="flex items-start justify-between gap-4 py-3 border-b border-white/[0.04] last:border-0"
                      >
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-white">
                            {g.title}
                          </div>
                          <div className="text-[12px] text-zinc-400 mt-1 leading-[1.4]">
                            {g.desc}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setGates((prev) => {
                              const updated = { ...prev, [g.key]: !prev[g.key] };
                              showToast(
                                `${g.title} is now ${updated[g.key] ? 'ENABLED' : 'DISABLED'}`
                              );
                              return updated;
                            });
                          }}
                          className={`relative w-[36px] h-[20px] rounded-full transition-colors shrink-0 mt-1 ${
                            gates[g.key] ? 'bg-[#ffe600]' : 'bg-white/15'
                          }`}
                        >
                          <div
                            className={`absolute top-[2px] w-4 h-4 rounded-full transition-all ${
                              gates[g.key]
                                ? 'left-[18px] bg-black shadow-sm'
                                : 'left-[2px] bg-white'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                    <Info size={12} />
                    <span>Policy v2.4 • 3 active gates • </span>
                    <button
                      type="button"
                      onClick={() => showToast('Granular policy config viewer')}
                      className="underline underline-offset-2 hover:text-white"
                    >
                      Configure
                    </button>
                  </div>
                </div>

                {/* Right Card: Live Audit Log */}
                <div className="col-span-12 lg:col-span-7 rounded-[12px] bg-[#141416] border border-white/[0.06] overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-5 h-[48px] border-b border-white/[0.06] shrink-0">
                    <h4 className="text-[13px] font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#25d366] animate-pulse" />
                      <span>Live Security Audit Log</span>
                    </h4>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Streaming • 4/min
                    </span>
                  </div>

                  <div className="p-3 space-y-2 flex-1">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="group flex gap-3 p-3 rounded-[10px] bg-[#0a0a0b] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-[8px] bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                          {log.iconType === 'role' && (
                            <Shield size={16} className="text-zinc-400 group-hover:text-white" />
                          )}
                          {log.iconType === 'key' && (
                            <Key size={16} className="text-zinc-400 group-hover:text-white" />
                          )}
                          {log.iconType === 'mfa' && (
                            <Smartphone size={16} className="text-zinc-400 group-hover:text-white" />
                          )}
                          {log.iconType === 'payout' && (
                            <AlertTriangle size={16} className="text-zinc-400 group-hover:text-white" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-[13px] font-medium leading-tight text-white">
                              {log.title}
                            </div>
                            <div className="text-[11px] font-mono text-zinc-400 shrink-0">
                              {log.time}
                            </div>
                          </div>
                          <div className="text-[11px] font-mono text-zinc-400 mt-1 truncate">
                            {log.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => showToast('Full ledger chain verified and displayed')}
                      className="text-[12px] font-medium text-zinc-200 inline-flex items-center gap-1.5 hover:underline"
                    >
                      <span>Show full ledger</span>
                      <ArrowUpRight size={13} />
                    </button>
                    <span className="text-[11px] font-mono text-zinc-400">
                      Hash chain verified • 14:32 IST
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="pt-6 pb-2 text-center text-[11px] font-mono text-zinc-500">
                PandaPraise Admin OS • v1.8.3 • SOC2 TYPE II • Zero-trust • Encrypted at rest
              </div>
            </>
          ) : activeTab === 'overview' ? (
            /* --- Overview Tab --- */
            <div className="space-y-6">
              <div>
                <h1 className="text-[28px] font-semibold text-white tracking-tight">
                  Global Merchant Intelligence
                </h1>
                <p className="text-[13px] text-zinc-400 mt-1">
                  High-level performance metrics across all connected Shopify storefronts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total UGC Videos', value: '1,428', change: '+18.4% this week', accent: '#ffe600' },
                  { label: 'WhatsApp Delivery', value: '98.6%', change: '24ms avg latency', accent: '#25d366' },
                  { label: 'Meta ROAS Multiplier', value: '3.42x', change: 'Across 48 ad sets', accent: '#60a5fa' },
                  { label: 'Cashback Disbursed', value: '₹1.42L', change: 'RazorpayX Instant', accent: '#f43f5e' },
                ].map((stat) => (
                  <div key={stat.label} className="p-5 rounded-[14px] bg-[#141416] border border-white/[0.06]">
                    <div className="text-[11px] font-mono uppercase text-zinc-400">{stat.label}</div>
                    <div className="text-[36px] font-bold text-white mt-1">{stat.value}</div>
                    <div className="text-[11px] font-mono text-zinc-400 mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.accent }} />
                      {stat.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'inbox' ? (
            /* --- Inbox Pipeline Tab --- */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[28px] font-semibold text-white tracking-tight">
                    Inbound UGC Video Review Pipeline
                  </h1>
                  <p className="text-[13px] text-zinc-400 mt-1">
                    Incoming customer WhatsApp videos awaiting editorial approval and cashback dispatch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('All pending UGC reviews synced')}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-white flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Refresh Pipeline
                </button>
              </div>

              <div className="rounded-[14px] bg-[#141416] border border-white/[0.06] p-6 text-center text-zinc-400">
                <Inbox size={32} className="mx-auto text-zinc-500 mb-2" />
                <div className="text-white text-sm font-medium">Pipeline Clear • 48 Reviews Processed Today</div>
                <div className="text-xs text-zinc-500 mt-1">Zero pending escalations from Kalyan Silks.</div>
              </div>
            </div>
          ) : activeTab === 'adlib' ? (
            /* --- Ad Library Tab --- */
            <div className="space-y-6">
              <div>
                <h1 className="text-[28px] font-semibold text-white tracking-tight">
                  Meta Ad Creative Catalog
                </h1>
                <p className="text-[13px] text-zinc-400 mt-1">
                  Synthesized 9:16 and 1:1 UGC Video Ad creatives deployed to Meta Ads Manager.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: 'Kalyan Silk Sarees • Hook Angle 1', roas: '4.1x ROAS', spend: '₹24,500' },
                  { name: 'Bridal Heritage • Testimonial Mashup', roas: '3.8x ROAS', spend: '₹38,200' },
                  { name: 'Festival Flash Sale • UGC Review', roas: '4.5x ROAS', spend: '₹19,000' },
                ].map((ad) => (
                  <div key={ad.name} className="p-4 rounded-[12px] bg-[#141416] border border-white/[0.06]">
                    <div className="w-full aspect-[9/12] bg-[#0a0a0b] rounded-lg mb-3 flex items-center justify-center text-zinc-600">
                      <ImageIcon size={32} />
                    </div>
                    <div className="text-sm font-bold text-white truncate">{ad.name}</div>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mt-2 font-mono">
                      <span className="text-[#25d366] font-bold">{ad.roas}</span>
                      <span>{ad.spend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'whatsapp' ? (
            /* --- WhatsApp Health Tab --- */
            <div className="space-y-6">
              <div>
                <h1 className="text-[28px] font-semibold text-white tracking-tight">
                  WhatsApp Cloud API Status
                </h1>
                <p className="text-[13px] text-zinc-400 mt-1">
                  Real-time webhook telemetry and token health for Meta Cloud API v20.0.
                </p>
              </div>

              <div className="rounded-[14px] bg-[#141416] border border-white/[0.06] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div>
                    <div className="text-sm font-bold text-white">System Health</div>
                    <div className="text-xs text-zinc-400">Direct webhook to Cloudflare Worker Edge</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                    OPERATIONAL • 100%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <div className="text-zinc-500">API VERSION</div>
                    <div className="text-white mt-1">v20.0 (Cloud)</div>
                  </div>
                  <div>
                    <div className="text-zinc-500">AVG RESPONSE</div>
                    <div className="text-[#25d366] mt-1">24ms</div>
                  </div>
                  <div>
                    <div className="text-zinc-500">429 RETRIES</div>
                    <div className="text-white mt-1">0 in 24h</div>
                  </div>
                  <div>
                    <div className="text-zinc-500">PHONE ID</div>
                    <div className="text-white mt-1">12345678...45</div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'billing' ? (
            /* --- Billing Tab --- */
            <div className="space-y-6">
              <div>
                <h1 className="text-[28px] font-semibold text-white tracking-tight">
                  Merchant Subscription &amp; Payouts
                </h1>
                <p className="text-[13px] text-zinc-400 mt-1">
                  Manage plan quotas, RazorpayX UPI cashback ledger, and invoices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-[14px] bg-[#141416] border border-white/[0.06] space-y-3">
                  <div className="text-xs font-mono text-zinc-400 uppercase">Current Tier</div>
                  <div className="text-2xl font-bold text-white">Enterprise • Global Plus</div>
                  <div className="text-xs text-zinc-400">₹6,999/month • Unlimited Reviews &amp; Ad Exports</div>
                </div>
                <div className="p-5 rounded-[14px] bg-[#141416] border border-white/[0.06] space-y-3">
                  <div className="text-xs font-mono text-zinc-400 uppercase">RazorpayX Balance</div>
                  <div className="text-2xl font-bold text-[#25d366]">₹48,500.00</div>
                  <div className="text-xs text-zinc-400">Auto-refill enabled at ₹10,000 threshold</div>
                </div>
              </div>
            </div>
          ) : (
            /* --- API Keys Tab --- */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[28px] font-semibold text-white tracking-tight">
                    API Credentials &amp; Tokens
                  </h1>
                  <p className="text-[13px] text-zinc-400 mt-1">
                    Manage secret keys for Shopify Flow HTTP requests and WhatsApp webhooks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('New secret API key generated: sk_live_...9f2a')}
                  className="px-4 py-2 rounded-xl bg-[#ffe600] text-black text-xs font-bold hover:brightness-105"
                >
                  + Generate Key
                </button>
              </div>

              <div className="rounded-[14px] bg-[#141416] border border-white/[0.06] p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0b] border border-white/[0.06]">
                  <div>
                    <div className="text-white font-bold">prod_whatsapp_v2 (Shopify Flow)</div>
                    <div className="text-zinc-500 mt-0.5">sk_live_9f2a...8c1d • Expires in 84 days</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Key copied to clipboard')}
                    className="px-3 py-1 rounded-md bg-white/[0.08] text-white hover:bg-white/[0.12]"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Invite Team Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[12px]"
            onClick={() => setInviteModalOpen(false)}
          />

          <div className="relative w-full max-w-[440px] rounded-[16px] bg-[#141416] border border-white/[0.08] shadow-2xl overflow-hidden animate-[in_0.2s_ease]">
            <div className="px-6 h-[56px] flex items-center justify-between border-b border-white/[0.06]">
              <h3 className="text-[14px] font-semibold text-white">
                Invite Team Member
              </h3>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="w-8 h-8 rounded-[10px] bg-white/[0.04] border border-white/[0.06] flex items-center justify-center hover:bg-white/[0.08] text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleIssueInvite} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">
                  Work Email
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="name@company.com"
                  className="mt-2 w-full h-10 px-3 rounded-[10px] bg-[#0a0a0b] border border-white/[0.08] text-[13px] text-white outline-none focus:border-white/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">
                    Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) =>
                      setInviteForm((prev) => ({
                        ...prev,
                        role: e.target.value as TeamMember['role'],
                      }))
                    }
                    className="mt-2 w-full h-10 px-3 rounded-[10px] bg-[#0a0a0b] border border-white/[0.08] text-[13px] text-white outline-none"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Merchant Admin">Merchant Admin</option>
                    <option value="Agency/Editor">Agency/Editor</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">
                    Domain Scope
                  </label>
                  <select
                    value={inviteForm.domain}
                    onChange={(e) =>
                      setInviteForm((prev) => ({
                        ...prev,
                        domain: e.target.value as TeamMember['domain'],
                      }))
                    }
                    className="mt-2 w-full h-10 px-3 rounded-[10px] bg-[#0a0a0b] border border-white/[0.08] text-[13px] text-white outline-none"
                  >
                    <option value="IN">IN</option>
                    <option value="US">US</option>
                    <option value="SG">SG</option>
                    <option value="GLOBAL">GLOBAL</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-[10px] bg-white/[0.03] border border-white/[0.06] cursor-pointer">
                <input
                  type="checkbox"
                  checked={inviteForm.mfa}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, mfa: e.target.checked }))
                  }
                  className="w-4 h-4 rounded accent-[#ffe600]"
                />
                <div>
                  <div className="text-[13px] font-medium text-white">
                    Enforce 2FA
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Member must verify with authenticator
                  </div>
                </div>
                <ShieldCheck size={16} className="ml-auto text-[#25d366]" />
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="h-9 px-4 rounded-[10px] border border-white/[0.08] bg-[#141416] text-[13px] font-medium text-zinc-300 hover:bg-white/[0.04]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-[10px] bg-[#ffe600] text-black text-[13px] font-semibold hover:brightness-105"
                >
                  Issue Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-full bg-white text-black text-[13px] font-medium shadow-[0_8px_24px_rgba(0,0,0,0.3)] border border-black/10 flex items-center gap-2 animate-[in_0.25s_ease]">
          <div className="w-1.5 h-1.5 rounded-full bg-black" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

function PolicyIndicator({ type }: { type: 'check' | 'block' | 'view' }) {
  if (type === 'check') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono">
        <Check size={16} className="text-[#25d366]" strokeWidth={2} />
        <span className="hidden xl:inline text-zinc-400">Allow</span>
      </span>
    );
  }
  if (type === 'block') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono">
        <Minus size={16} className="text-zinc-500" strokeWidth={1.5} />
        <span className="hidden xl:inline text-zinc-400">Block</span>
      </span>
    );
  }
  if (type === 'view') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono">
        <Eye size={16} className="text-zinc-400" strokeWidth={1.5} />
        <span className="hidden xl:inline text-zinc-400">View</span>
      </span>
    );
  }
  return null;
}
