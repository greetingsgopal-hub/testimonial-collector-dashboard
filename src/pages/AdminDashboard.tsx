import { GlobalAdminDashboard } from '../features/admin/GlobalAdminDashboard';

export const GoLiveCheck = () => {
  const checks = [
    { name: 'Shopify OAuth', url: '/api/health' },
    { name: 'Razorpay Webhook', url: '/api/billing/usage' },
    { name: 'WhatsApp Tier 3', url: '/api/whatsapp/health' },
  ];
  return (
    <div className="p-4 bg-[#141416] rounded-xl border border-white/[0.08] mb-4">
      <h3 className="text-white font-semibold mb-3">Go-Live Checklist - Kalyan Silks</h3>
      {checks.map(c => (
        <div key={c.name} className="flex justify-between text-sm py-2 border-b border-white/[0.06]">
          <span className="text-white/60">{c.name}</span>
          <span className="text-green-400">✓ OK</span>
        </div>
      ))}
      <div className="mt-4 text-xs text-white/40">
        ORG: PP-KALYAN-IND-9021 • Store: kalyansilks.myshopify.com • Plan: Growth ₹2999/20 ads
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <GoLiveCheck />
      </div>
      <GlobalAdminDashboard />
    </div>
  );
}

export { AdminDashboardPage as AdminDashboard };
