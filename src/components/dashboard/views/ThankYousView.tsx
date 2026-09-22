import React, { useState } from 'react';
import { HeartHandshake, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const ThankYousView: React.FC = () => {
  const { user } = useAuth();
  const displayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Founder');
  const [activeTab, setActiveTab] = useState<'not-thanked' | 'thanked' | 'notifications'>('not-thanked');

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* Header (Matches Senja 03:49) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display flex items-center gap-2">
            <span>Up late, {displayName} - a thank you before bed?</span>
            <span>🌙</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Send personal thank-you notes, videos, gifts and notes, at any size.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-[#6701e6] hover:bg-[#5200bd] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer">
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Thank customers</span>
        </button>
      </div>

      {/* Metrics Bar (Matches Senja 03:49) */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Spreading the thanks: How much love your team has sent
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-1">
          <div className="text-center sm:text-left">
            <span className="block text-2xl font-bold text-gray-900">0</span>
            <span className="text-[11px] text-gray-400 font-medium">Sent today</span>
          </div>
          <div className="text-center sm:text-left">
            <span className="block text-2xl font-bold text-gray-900">0</span>
            <span className="text-[11px] text-gray-400 font-medium">Sent this week</span>
          </div>
          <div className="text-center sm:text-left">
            <span className="block text-2xl font-bold text-gray-900">0</span>
            <span className="text-[11px] text-gray-400 font-medium">Sent this month</span>
          </div>
          <div className="text-center sm:text-left">
            <span className="block text-2xl font-bold text-gray-900">0</span>
            <span className="text-[11px] text-gray-400 font-medium">Sent so far</span>
          </div>
          <div className="text-center sm:text-left">
            <span className="block text-2xl font-bold text-emerald-600">0</span>
            <span className="text-[11px] text-gray-400 font-medium">Reactions so far</span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('not-thanked')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === 'not-thanked'
              ? 'bg-purple-50 text-[#6701e6] font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Not thanked 0
        </button>
        <button
          onClick={() => setActiveTab('thanked')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === 'thanked'
              ? 'bg-purple-50 text-[#6701e6] font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Thanked 0
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-purple-50 text-[#6701e6] font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Notifications
        </button>
      </div>

      {/* Table & Empty State (Matches Senja 03:49) */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs font-bold text-gray-700">
            People who'd love to hear from you — testimonials waiting on a thanks.
          </p>
        </div>

        <div className="p-16 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-gray-800">
            You're all caught up — no one is waiting on a thank you.
          </p>
          <p className="text-xs text-gray-400">
            When you collect new reviews, send personal video or note thank-yous here.
          </p>
        </div>
      </div>

    </div>
  );
};
