import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  ArrowLeft,
  Building2,
  Crown,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AdminWorkspace {
  id: string;
  name?: string;
  ownerId?: string;
  plan?: 'free' | 'starter' | 'pro' | 'founding_lifetime';
  billingCycle?: string;
  subscriptionStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState<AdminWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchWorkspaces = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = auth?.currentUser
        ? await auth.currentUser.getIdToken()
        : ((user as any)?.getIdToken ? await (user as any).getIdToken() : null);
      const res = await fetch('/api/admin/workspaces', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}: Failed to fetch workspaces`);
      }

      const data = await res.json();
      setWorkspaces(data.workspaces || []);
    } catch (err: any) {
      console.error('[AdminPage] Fetch failed:', err);
      setError(err.message || 'Failed to load workspaces.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [user]);

  const handleUpdatePlan = async (workspaceId: string, newPlan: string) => {
    if (!user) return;
    setUpdatingId(workspaceId);
    setToast(null);

    try {
      const token = auth?.currentUser
        ? await auth.currentUser.getIdToken()
        : ((user as any)?.getIdToken ? await (user as any).getIdToken() : null);
      const res = await fetch(`/api/admin/workspaces/${encodeURIComponent(workspaceId)}/plan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update plan');
      }

      // Update local state
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === workspaceId
            ? {
                ...w,
                plan: newPlan as any,
                billingCycle: newPlan === 'founding_lifetime' ? 'lifetime' : 'monthly',
                subscriptionStatus: 'active',
              }
            : w
        )
      );

      setToast({
        type: 'success',
        message: `Successfully upgraded workspace ${workspaceId} to ${newPlan.toUpperCase()}`,
      });
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      console.error('[AdminPage] Plan update error:', err);
      setToast({
        type: 'error',
        message: err.message || 'Failed to update workspace plan.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics computation
  const stats = useMemo(() => {
    const total = workspaces.length;
    const free = workspaces.filter((w) => !w.plan || w.plan === 'free').length;
    const starter = workspaces.filter((w) => w.plan === 'starter').length;
    const pro = workspaces.filter((w) => w.plan === 'pro').length;
    const lifetime = workspaces.filter((w) => w.plan === 'founding_lifetime').length;
    return { total, free, starter, pro, lifetime };
  }, [workspaces]);

  // Filtered workspaces
  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((w) => {
      const matchesSearch =
        (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.ownerId || '').toLowerCase().includes(searchQuery.toLowerCase());

      const plan = w.plan || 'free';
      const matchesPlan = planFilter === 'all' || plan === planFilter;

      return matchesSearch && matchesPlan;
    });
  }, [workspaces, searchQuery, planFilter]);

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'founding_lifetime':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Crown className="w-3 h-3" />
            Lifetime
          </span>
        );
      case 'pro':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Zap className="w-3 h-3" />
            Pro
          </span>
        );
      case 'starter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            Starter
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            Free
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex items-center gap-2 text-sm"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <div className="h-5 w-px bg-zinc-800" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white tracking-tight">Superadmin Console</h1>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                    Root
                  </span>
                </div>
                <p className="text-xs text-zinc-400">Cross-tenant workspace oversight & entitlement manager</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchWorkspaces}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors border border-zinc-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex flex-col gap-6">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="text-xs opacity-70 hover:opacity-100">
              Dismiss
            </button>
          </div>
        )}

        {/* Platform KPI Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
            <span className="text-xs font-medium text-zinc-400">Total Workspaces</span>
            <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
            <span className="text-xs font-medium text-zinc-400">Free Tier</span>
            <div className="text-2xl font-bold text-zinc-300 mt-1">{stats.free}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
            <span className="text-xs font-medium text-sky-400">Starter</span>
            <div className="text-2xl font-bold text-sky-300 mt-1">{stats.starter}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
            <span className="text-xs font-medium text-emerald-400">Pro</span>
            <div className="text-2xl font-bold text-emerald-300 mt-1">{stats.pro}</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4">
            <span className="text-xs font-medium text-amber-400">Founding Lifetime</span>
            <div className="text-2xl font-bold text-amber-300 mt-1">{stats.lifetime}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/40 p-3 rounded-xl border border-zinc-800">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by workspace name, ID, or owner UID..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Plan Filter:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="founding_lifetime">Founding Lifetime</option>
            </select>
          </div>
        </div>

        {/* Workspaces Table */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden flex-1 flex flex-col">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-zinc-400">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-3" />
              <p className="text-sm">Querying Firestore workspaces via Service Account...</p>
            </div>
          ) : error ? (
            <div className="py-20 flex flex-col items-center justify-center text-red-400 px-4 text-center">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="font-semibold">{error}</p>
              <button
                onClick={fetchWorkspaces}
                className="mt-4 px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs"
              >
                Try Again
              </button>
            </div>
          ) : filteredWorkspaces.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
              <Building2 className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-sm">No workspaces match your query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900/80 text-zinc-400 text-xs font-semibold uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-3.5">Workspace</th>
                    <th className="px-6 py-3.5">Owner UID</th>
                    <th className="px-6 py-3.5">Current Plan</th>
                    <th className="px-6 py-3.5">Created</th>
                    <th className="px-6 py-3.5 text-right">Plan Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredWorkspaces.map((ws) => (
                    <tr key={ws.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                          <span>{ws.name || 'Untitled Workspace'}</span>
                        </div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">{ws.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-zinc-300 bg-zinc-800/60 px-2 py-1 rounded">
                          {ws.ownerId || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getPlanBadge(ws.plan)}</td>
                      <td className="px-6 py-4 text-xs text-zinc-400">
                        {ws.createdAt ? new Date(ws.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <select
                            disabled={updatingId === ws.id}
                            value={ws.plan || 'free'}
                            onChange={(e) => handleUpdatePlan(ws.id, e.target.value)}
                            className="bg-zinc-950 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 disabled:opacity-50"
                          >
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="pro">Pro</option>
                            <option value="founding_lifetime">Founding Lifetime</option>
                          </select>
                          {updatingId === ws.id && (
                            <RefreshCw className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
