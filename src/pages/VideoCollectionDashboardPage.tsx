import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Video, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Layers
} from 'lucide-react';


interface RawSubmission {
  id: string;
  customerName: string;
  phone: string;
  product: string;
  orderId: string;
  duration: string;
  status: 'ready' | 'pending' | 'reminded' | 'rendered';
  receivedAt: string;
}

const SAMPLE_QUEUE: RawSubmission[] = [
  {
    id: 'sub_1',
    customerName: 'Ananya Sharma',
    phone: '+91 98201 11223',
    product: 'Oversized Lavender Hoodie',
    orderId: '#ORD-4921',
    duration: '0:22',
    status: 'ready',
    receivedAt: '12 mins ago',
  },
  {
    id: 'sub_2',
    customerName: 'Rohit Mehta',
    phone: '+91 98112 33445',
    product: 'Matte Clay Hair Pomade',
    orderId: '#ORD-4918',
    duration: '0:18',
    status: 'ready',
    receivedAt: '1 hour ago',
  },
  {
    id: 'sub_3',
    customerName: 'Sneha Patel',
    phone: '+91 99203 44556',
    product: 'Chanderi Silk Saree',
    orderId: '#ORD-4902',
    duration: '0:25',
    status: 'rendered',
    receivedAt: 'Yesterday',
  },
  {
    id: 'sub_4',
    customerName: 'Karan Kapoor',
    phone: '+91 98450 77889',
    product: 'Ergonomic Desk Mat',
    orderId: '#ORD-4899',
    duration: '—',
    status: 'pending',
    receivedAt: 'Triggered 2 days ago',
  },
  {
    id: 'sub_5',
    customerName: 'Divya Nair',
    phone: '+91 97110 55667',
    product: 'Cold Brew Coffee Kit',
    orderId: '#ORD-4882',
    duration: '—',
    status: 'reminded',
    receivedAt: '48h Reminder Sent',
  },
];

export const VideoCollectionDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<RawSubmission[]>(SAMPLE_QUEUE);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleMakeAds = (id: string) => {
    setProcessingId(id);
    setTimeout(() => {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'rendered' } : item))
      );
      setProcessingId(null);
      navigate('/dashboard/ads');
    }, 1200);
  };

  const readyCount = queue.filter((i) => i.status === 'ready').length;
  const pendingCount = queue.filter((i) => i.status === 'pending' || i.status === 'reminded').length;
  const renderedCount = queue.filter((i) => i.status === 'rendered').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
              <span>🐼 PandaPraise V2</span>
              <span>•</span>
              <span>WhatsApp Pipeline</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Customer Video Collection Queue
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/dashboard/studio"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-purple-600/30"
            >
              <Sparkles className="w-4 h-4" />
              Live Render Studio
            </Link>
            <Link
              to="/dashboard/connect"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              ⚙️ WhatsApp &amp; Shopify
            </Link>
            <Link
              to="/dashboard/ads"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Layers className="w-4 h-4" />
              Meta Ads Library ({renderedCount})
            </Link>
          </div>
        </div>

        {/* 3 Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Videos Collected &amp; Ready
              </span>
              <div className="text-3xl font-black text-emerald-400 mt-1">{readyCount}</div>
              <span className="text-[11px] text-slate-500">Awaiting 1-click ad generation</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Video className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pending WhatsApp Replies
              </span>
              <div className="text-3xl font-black text-amber-400 mt-1">{pendingCount}</div>
              <span className="text-[11px] text-slate-500">Auto-nag timer running</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generated Meta Ads
              </span>
              <div className="text-3xl font-black text-indigo-400 mt-1">{renderedCount}</div>
              <span className="text-[11px] text-slate-500">Ready in 9:16, 1:1, 4:5</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Incoming Customer Videos Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Incoming Customer Submissions</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real customer vertical videos submitted via WhatsApp in exchange for your ₹100 discount coupon.
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-mono">
              Auto-Polling Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Customer &amp; Phone</th>
                  <th className="py-4 px-6">Product &amp; Order</th>
                  <th className="py-4 px-6">Length</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{item.customerName}</div>
                      <div className="text-xs font-mono text-slate-500">{item.phone}</div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="text-slate-200 font-medium">{item.product}</div>
                      <div className="text-xs font-mono text-slate-500">{item.orderId}</div>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-400">
                      {item.duration}
                    </td>

                    <td className="py-4 px-6">
                      {item.status === 'ready' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Edit
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" /> Waiting Reply
                        </span>
                      )}
                      {item.status === 'reminded' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> 48h Reminder Sent
                        </span>
                      )}
                      {item.status === 'rendered' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold">
                          <Sparkles className="w-3.5 h-3.5" /> 5 Ads Ready
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {item.status === 'ready' && (
                        <button
                          type="button"
                          onClick={() => handleMakeAds(item.id)}
                          disabled={processingId === item.id}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 ml-auto cursor-pointer shadow-md shadow-emerald-500/20"
                        >
                          {processingId === item.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Generating Hooks...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              Make Meta Ads
                            </>
                          )}
                        </button>
                      )}

                      {item.status === 'rendered' && (
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard/ads')}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition ml-auto cursor-pointer"
                        >
                          View 5 Ads →
                        </button>
                      )}

                      {item.status === 'pending' && (
                        <span className="text-xs text-slate-500 italic">Waiting on customer</span>
                      )}

                      {item.status === 'reminded' && (
                        <span className="text-xs text-slate-500 italic">Auto-nudge sent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
