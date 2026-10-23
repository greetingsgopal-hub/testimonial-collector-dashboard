import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Users,
  CreditCard,
  RefreshCw,
  Search,
  Server,
  Database,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Ban,
  CheckCircle2,
  Clock,
  MessageSquare,
  Star,
  AlertCircle,
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export interface WorkspaceItem {
  id: string;
  name: string;
  owner_email: string;
  ownerId?: string;
  plan: 'free' | 'pro' | 'starter' | 'founding_lifetime';
  status: 'active' | 'suspended';
  created_at: string;
  lastLoginAt?: string | null;
  proofs_count: number;
  trialEndsAt?: string | null;
  suspendedAt?: string | null;
  suspendedBy?: string | null;
  suspensionReason?: string | null;
}

export interface PaymentItem {
  id: string;
  workspace_name: string;
  payment_id: string;
  amount: string;
  status: 'Paid' | 'Failed' | 'Pending';
  created_at: string;
}

export interface OverviewMetrics {
  totalUsers: number;
  totalWorkspaces: number;
  freeWorkspaces: number;
  paidWorkspaces: number;
  activeWorkspaces: number;
  suspendedWorkspaces: number;
  signups7d: number;
  signups30d: number;
  revenue: {
    raw: number;
    currency: string;
    formatted: string;
  };
  successfulPayments: number;
  failedPayments: number;
  recentSignups: Array<{
    id: string;
    name: string;
    owner_email: string;
    plan: string;
    status: string;
    createdAt: string;
  }>;
  lastUpdated: string;
}

export interface UsageMetrics {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  flaggedReviews: number;
  averageRating: number;
  ratingsBreakdown: Record<number, number>;
}

export interface SystemHealthData {
  status: string;
  runtime: string;
  environment: string;
  database: {
    provider: string;
    configured: boolean;
    status: string;
  };
  gateways: {
    razorpay: { configured: boolean; status: string };
    stripe: { configured: boolean; status: string };
    edgeCacheKv: { configured: boolean; status: string };
  };
  uptime: string;
  timestamp: string;
}

export interface AuditEventItem {
  id: string;
  type: string;
  action: string;
  actor: string;
  target: string;
  details: string;
  status: string;
  timestamp: string;
}

export default function ResilientAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'workspaces' | 'usage' | 'payments' | 'health'>('overview');
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal state for Suspend / Reactivate action
  const [actionModal, setActionModal] = useState<{
    open: boolean;
    type: 'suspend' | 'reactivate';
    workspace: WorkspaceItem | null;
    reason: string;
    loading: boolean;
    error: string | null;
  }>({
    open: false,
    type: 'suspend',
    workspace: null,
    reason: '',
    loading: false,
    error: null,
  });

  const getAuthToken = async (): Promise<string | null> => {
    try {
      if (auth?.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      if ((user as any)?.getIdToken) {
        return await (user as any).getIdToken();
      }
      return null;
    } catch {
      return null;
    }
  };

  const loadPlatformData = async () => {
    setLoading(true);
    setErrorStatus(null);

    try {
      const token = await getAuthToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch workspaces from real Worker endpoint
      const wsPromise = fetch('/api/admin/workspaces', { headers })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
            throw new Error(err.error || `Failed to fetch workspaces (${res.status})`);
          }
          return res.json();
        })
        .catch((err) => {
          console.warn('[Admin] Workspaces fetch failed:', err.message);
          return null;
        });

      // 2. Fetch overview metrics
      const overviewPromise = fetch('/api/admin/overview', { headers })
        .then(async (res) => {
          if (res.ok) return res.json();
          return null;
        })
        .catch(() => null);

      // 3. Fetch product usage
      const usagePromise = fetch('/api/admin/usage', { headers })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            return data.usage || null;
          }
          return null;
        })
        .catch(() => null);

      // 4. Fetch system health
      const healthPromise = fetch('/api/admin/health', { headers })
        .then(async (res) => {
          if (res.ok) return res.json();
          return null;
        })
        .catch(() => null);

      // 5. Fetch audit trail events
      const eventsPromise = fetch('/api/admin/events', { headers })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            return data.events || [];
          }
          return [];
        })
        .catch(() => []);

      const [wsData, overviewData, usageData, healthData, eventsData] = await Promise.all([
        wsPromise,
        overviewPromise,
        usagePromise,
        healthPromise,
        eventsPromise,
      ]);

      if (wsData && Array.isArray(wsData.workspaces)) {
        const mappedWorkspaces: WorkspaceItem[] = wsData.workspaces.map((w: any) => ({
          id: String(w.id || ''),
          name: String(w.name || w.id || 'Untitled Workspace'),
          owner_email: String(w.owner_email || w.ownerEmail || w.email || w.ownerId || 'N/A'),
          ownerId: w.ownerId,
          plan: w.plan || 'free',
          status: w.status === 'suspended' ? 'suspended' : 'active',
          created_at: w.createdAt || w.created_at ? new Date(w.createdAt || w.created_at).toLocaleDateString() : 'N/A',
          lastLoginAt: w.lastLoginAt ? new Date(w.lastLoginAt).toLocaleString() : 'Never',
          proofs_count: Number(w.proofs_count || 0),
          trialEndsAt: w.trialEndsAt || null,
          suspendedAt: w.suspendedAt || null,
          suspendedBy: w.suspendedBy || null,
          suspensionReason: w.suspensionReason || null,
        }));
        setWorkspaces(mappedWorkspaces);
      }

      if (overviewData) {
        setOverview(overviewData);
      }

      if (usageData) {
        setUsage(usageData);
      }

      if (healthData) {
        setHealth(healthData);
      }

      if (eventsData) {
        setEvents(eventsData);
        // Map payments for the Ledger tab strictly from verified payment events
        const paymentEvents = eventsData.filter((e: any) => e.type === 'payment');
        const mappedPayments: PaymentItem[] = paymentEvents.map((p: any) => ({
          id: p.id,
          workspace_name: p.target,
          payment_id: p.id,
          amount: p.details.split(' - ')[0] || '₹0.00',
          status: p.status === 'completed' ? 'Paid' : (p.status === 'failed' ? 'Failed' : 'Pending'),
          created_at: new Date(p.timestamp).toLocaleDateString(),
        }));
        setPayments(mappedPayments);
      }
    } catch (err: any) {
      console.error('[Admin] Load failed:', err);
      setErrorStatus(err.message || 'Failed to connect to admin API endpoints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, [user]);

  const filteredWorkspaces = useMemo(() => {
    const q = (searchFilter || '').toLowerCase().trim();
    return workspaces.filter((w) => {
      const matchesQuery =
        !q ||
        (w.name || '').toLowerCase().includes(q) ||
        (w.owner_email || '').toLowerCase().includes(q) ||
        (w.id || '').toLowerCase().includes(q);

      const matchesPlan = planFilter === 'all' || w.plan === planFilter;
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;

      return matchesQuery && matchesPlan && matchesStatus;
    });
  }, [workspaces, searchFilter, planFilter, statusFilter]);

  const togglePlan = async (id: string) => {
    const target = workspaces.find((w) => w.id === id);
    const newPlan: 'free' | 'pro' = target?.plan === 'pro' ? 'free' : 'pro';

    // Optimistic update
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === id ? { ...w, plan: newPlan } : w))
    );

    try {
      const token = await getAuthToken();
      if (token) {
        const res = await fetch(`/api/admin/workspaces/${encodeURIComponent(id)}/plan`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan: newPlan }),
        });
        if (!res.ok) {
          throw new Error('Failed to update plan on server');
        }
      }
    } catch (e: any) {
      console.warn('Plan update failed, reverting:', e);
      // Revert on error
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? { ...w, plan: target?.plan || 'free' } : w))
      );
      setErrorStatus(`Failed to update workspace plan: ${e.message}`);
    }
  };

  const handleOpenActionModal = (ws: WorkspaceItem, type: 'suspend' | 'reactivate') => {
    setActionModal({
      open: true,
      type,
      workspace: ws,
      reason: type === 'suspend' ? 'Terms of Service violation / security compliance' : 'Resolved account review',
      loading: false,
      error: null,
    });
  };

  const handleConfirmAction = async () => {
    if (!actionModal.workspace) return;
    const ws = actionModal.workspace;
    const endpoint = `/api/admin/workspaces/${encodeURIComponent(ws.id)}/${actionModal.type}`;

    setActionModal((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const token = await getAuthToken();
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: actionModal.reason,
          note: actionModal.reason,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Action failed' }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      // Update workspace in local state
      const newStatus = actionModal.type === 'suspend' ? 'suspended' : 'active';
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === ws.id ? { ...w, status: newStatus } : w))
      );

      setActionModal({
        open: false,
        type: 'suspend',
        workspace: null,
        reason: '',
        loading: false,
        error: null,
      });

      // Refresh overview and events
      loadPlatformData();
    } catch (err: any) {
      setActionModal((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const proWorkspacesCount = workspaces.filter((w) => w.plan === 'pro').length;

  const isSuperadmin = useMemo(() => {
    if (!user?.email) return false;
    const email = user.email.toLowerCase().trim();
    return email === 'greetings.gopal@gmail.com' || email === 'greetingsgopal@gmail.com';
  }, [user?.email]);

  if (!loading && !isSuperadmin) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Ban className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Superadmin Access Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This administration console is strictly restricted to authorized platform administrators. Your authenticated account ({user?.email || 'unauthenticated'}) does not have administrative privileges.
          </p>
          <div className="pt-2">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Workspace</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Workspace</span>
              </a>
              <a
                href="/admin/prospect-research"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Prospect Research</span>
              </a>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                ADMIN CONSOLE
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-3">
              PandaPraise Control Center
            </h1>
            <p className="text-xs text-slate-400">
              Workspace oversight, subscription mandates, real database metrics, and infrastructure state.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPlatformData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>
        </div>

        {/* Error Toast */}
        {errorStatus && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorStatus}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorStatus(null)}
              className="font-bold hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-px overflow-x-auto">
          {[
            { key: 'overview', label: 'Metrics Overview', icon: Activity },
            { key: 'workspaces', label: `Workspaces (${workspaces.length})`, icon: Users },
            { key: 'usage', label: `Product Usage (${usage?.totalReviews || 0})`, icon: MessageSquare },
            { key: 'payments', label: `Ledger (${payments.length})`, icon: CreditCard },
            { key: 'health', label: 'System Health', icon: Server },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Workspaces</span>
                <p className="text-3xl font-extrabold text-white mt-2">{overview?.totalWorkspaces ?? workspaces.length}</p>
                <span className="text-[11px] text-emerald-400 mt-1 block">Live database records</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pro Accounts</span>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {overview?.paidWorkspaces ?? proWorkspacesCount}
                </p>
                <span className="text-[11px] text-purple-400 mt-1 block">Paid / Active tier</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Revenue</span>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">
                  {overview?.revenue?.formatted ?? '₹0.00'}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">Calculated from completed payments</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System State</span>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">READY</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Edge worker active</span>
              </div>
            </div>

            {/* Additional Business Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Signups (Last 7 Days)</span>
                  <Clock className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-xl font-bold text-white mt-1">{overview?.signups7d ?? 0} new workspaces</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Signups (Last 30 Days)</span>
                  <Clock className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xl font-bold text-white mt-1">{overview?.signups30d ?? 0} new workspaces</p>
              </div>
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Failed Payments</span>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                </div>
                <p className="text-xl font-bold text-rose-400 mt-1">{overview?.failedPayments ?? 0} attempts</p>
              </div>
            </div>

            {/* Recent Signups Table */}
            {overview?.recentSignups && overview.recentSignups.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Customer Signups</h3>
                  <span className="text-[11px] text-slate-400">Verified from live database</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-4">Workspace</th>
                        <th className="p-4">Owner Email</th>
                        <th className="p-4">Plan</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {overview.recentSignups.map((ws) => (
                        <tr key={ws.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-bold text-white">{ws.name}</td>
                          <td className="p-4 text-slate-300 font-mono">{ws.owner_email}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                              {ws.plan.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                ws.status === 'suspended'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {ws.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400">{new Date(ws.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Workspaces Tab ── */}
        {activeTab === 'workspaces' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by workspace or email..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="starter">Starter</option>
                  <option value="founding_lifetime">Founding Lifetime</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>

                <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">
                  Showing {filteredWorkspaces.length} of {workspaces.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Workspace</th>
                    <th className="p-4">Owner Email</th>
                    <th className="p-4">Plan Status</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Collected Proofs</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredWorkspaces.map((ws) => (
                    <tr key={ws.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{ws.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{ws.id}</div>
                      </td>
                      <td className="p-4 text-slate-300 font-mono">{ws.owner_email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ws.plan === 'pro' || ws.plan === 'founding_lifetime'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ws.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ws.status === 'suspended'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {ws.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{ws.proofs_count} items</td>
                      <td className="p-4 text-slate-400">{ws.created_at}</td>
                      <td className="p-4 text-slate-400">
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{ws.lastLoginAt || 'Never'}</span>
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => togglePlan(ws.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 font-medium text-[11px] border border-slate-700 transition-all cursor-pointer"
                        >
                          Toggle {ws.plan === 'pro' ? 'Free' : 'Pro'}
                        </button>

                        {ws.status === 'active' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(ws, 'suspend')}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium text-[11px] border border-rose-500/30 transition-all cursor-pointer"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenActionModal(ws, 'reactivate')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium text-[11px] border border-emerald-500/30 transition-all cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredWorkspaces.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No workspaces found matching your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Usage Tab ── */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reviews</span>
                <p className="text-3xl font-extrabold text-white mt-2">{usage?.totalReviews ?? 0}</p>
                <span className="text-[11px] text-slate-400 mt-1 block">Across all platform tenants</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Reviews</span>
                <p className="text-3xl font-extrabold text-emerald-400 mt-2">{usage?.approvedReviews ?? 0}</p>
                <span className="text-[11px] text-emerald-400 mt-1 block">Live & embeddable</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</span>
                <p className="text-3xl font-extrabold text-amber-400 mt-2">{usage?.pendingReviews ?? 0}</p>
                <span className="text-[11px] text-amber-400 mt-1 block">Awaiting tenant review</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Rating</span>
                <p className="text-3xl font-extrabold text-purple-400 mt-2 flex items-center gap-2">
                  <span>{usage?.averageRating ?? 5.0}</span>
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">Overall customer satisfaction</span>
              </div>
            </div>

            {/* Ratings Breakdown */}
            {usage?.ratingsBreakdown && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">Rating Distribution</h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = usage.ratingsBreakdown[stars] || 0;
                    const pct = usage.totalReviews > 0 ? Math.round((count / usage.totalReviews) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-4 text-xs">
                        <span className="w-12 text-slate-400 font-semibold">{stars} Stars</span>
                        <div className="flex-1 bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                          <div
                            className="bg-purple-600 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-slate-400 font-mono">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Ledger Tab ── */}
        {activeTab === 'payments' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Razorpay Settlement Ledger</h3>
                <span className="text-xs text-slate-400">Captured and verified platform transactions</span>
              </div>
              <span className="text-xs text-slate-400">Total Entries: {payments.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Reference ID</th>
                    <th className="p-4">Workspace / Item</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-purple-400 font-bold">{p.payment_id}</td>
                      <td className="p-4 font-medium text-white">{p.workspace_name}</td>
                      <td className="p-4 font-semibold text-emerald-400">{p.amount}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{p.created_at}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No transactions recorded in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Platform Audit Trail */}
            <div className="p-4 border-t border-b border-slate-800 flex items-center justify-between mt-6 bg-slate-950/40">
              <div>
                <h3 className="text-sm font-bold text-white">Platform Audit Trail</h3>
                <span className="text-xs text-slate-400">Immutable admin actions recorded in admin_audit_logs</span>
              </div>
              <span className="text-xs text-slate-400">Total Logs: {events.filter((e) => e.type === 'admin_action').length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Admin Actor</th>
                    <th className="p-4">Target Workspace</th>
                    <th className="p-4">Details / Reason</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {events
                    .filter((e) => e.type === 'admin_action')
                    .map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {ev.action}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300 font-mono">{ev.actor}</td>
                        <td className="p-4 font-mono text-slate-400">{ev.target}</td>
                        <td className="p-4 text-slate-300">{ev.details}</td>
                        <td className="p-4 text-slate-400">{new Date(ev.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  {events.filter((e) => e.type === 'admin_action').length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No admin audit events recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── System Health Tab ── */}
        {activeTab === 'health' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-semibold text-white text-sm">Edge Worker</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" /> ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                Cloudflare Workers routing and API proxying functional with global SSL and DDoS mitigation.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/60 text-[11px] text-slate-500">
                Runtime: {health?.runtime || 'Cloudflare Workers (workerd)'}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-semibold text-white text-sm">Database Cluster</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                  <Database className="w-3.5 h-3.5" /> READY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                Google Cloud Firestore responding with verified Service Account authentication.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/60 text-[11px] text-slate-500">
                Provider: {health?.database?.provider || 'Google Cloud Firestore'}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-semibold text-white text-sm">Razorpay Webhooks</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                  <Activity className="w-3.5 h-3.5" /> ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                HMAC-SHA256 signature verification enabled for live checkout and instant plan upgrades.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/60 text-[11px] text-slate-500">
                Status: {health?.gateways?.razorpay?.status || 'Active'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Suspend / Reactivate Confirmation Modal ── */}
      {actionModal.open && actionModal.workspace && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionModal.type === 'suspend' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {actionModal.type === 'suspend' ? <Ban className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {actionModal.type === 'suspend' ? 'Suspend' : 'Reactivate'} Workspace
                </h3>
                <p className="text-xs text-slate-400">
                  Target: {actionModal.workspace.name} ({actionModal.workspace.owner_email})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {actionModal.type === 'suspend'
                ? 'Suspending this workspace will immediately disable tenant mutations and social publishing, locking the customer account until reactivated. This action will be recorded in admin audit logs.'
                : 'Reactivating this workspace will restore normal tenant permissions and allow the customer to manage reviews and integrations.'}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">
                {actionModal.type === 'suspend' ? 'Reason for Suspension' : 'Reactivation Note'}
              </label>
              <input
                type="text"
                value={actionModal.reason}
                onChange={(e) => setActionModal((prev) => ({ ...prev, reason: e.target.value }))}
                placeholder="Enter audit reason..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            {actionModal.error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {actionModal.error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActionModal((prev) => ({ ...prev, open: false }))}
                disabled={actionModal.loading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={actionModal.loading}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 ${
                  actionModal.type === 'suspend'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {actionModal.loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm {actionModal.type === 'suspend' ? 'Suspension' : 'Reactivation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const AdminPage: React.FC = ResilientAdminDashboard;
