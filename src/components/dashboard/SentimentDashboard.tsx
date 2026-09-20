import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Smile,
  ThumbsUp,
  Sparkles,
  BarChart3,
  Tag,
} from 'lucide-react';
import { Review } from '../../types';
import { analyzeReviewBatch, computeSentimentStats } from '../../lib/ai-sentiment';

interface SentimentDashboardProps {
  reviews: Review[];
}

const EMOTION_ICONS: Record<string, typeof Heart> = {
  joy: Smile,
  trust: ThumbsUp,
  gratitude: Heart,
  surprise: Sparkles,
  frustration: TrendingDown,
  neutral: Minus,
};

const EMOTION_COLORS: Record<string, string> = {
  joy: 'text-amber-400',
  trust: 'text-blue-400',
  gratitude: 'text-pink-400',
  surprise: 'text-violet-400',
  frustration: 'text-red-400',
  neutral: 'text-zinc-400',
};

export const SentimentDashboard: React.FC<SentimentDashboardProps> = ({ reviews }) => {
  const stats = useMemo(() => {
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    const results = analyzeReviewBatch(approvedReviews);
    const s = computeSentimentStats(results);
    return s;
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-white/[0.02] border border-white/10 text-center">
        <BarChart3 size={32} className="mx-auto text-zinc-600 mb-3" />
        <p className="text-sm text-zinc-400">Collect some testimonials to see sentiment analysis here.</p>
      </div>
    );
  }

  const scorePercent = Math.round(stats.averageScore * 100);
  const total = stats.distribution.positive + stats.distribution.neutral + stats.distribution.negative;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Sparkles size={16} className="text-violet-400" />
          AI Sentiment Analysis
        </h3>
        <span className="text-[11px] text-zinc-500">{reviews.filter(r => r.status === 'approved').length} reviews analyzed</span>
      </div>

      {/* Score + Trend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-zinc-500 mb-2">Overall Sentiment</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-extrabold ${
              scorePercent >= 70 ? 'text-emerald-400' :
              scorePercent >= 40 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {scorePercent}%
            </span>
            <span className="text-xs text-zinc-500 mb-1">positive</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${total > 0 ? (stats.distribution.positive / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-700"
              style={{ width: `${total > 0 ? (stats.distribution.neutral / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-red-500 transition-all duration-700"
              style={{ width: `${total > 0 ? (stats.distribution.negative / total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Positive ({stats.distribution.positive})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Neutral ({stats.distribution.neutral})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Negative ({stats.distribution.negative})
            </span>
          </div>
        </div>

        {/* Trend */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-zinc-500 mb-2">Sentiment Trend</p>
          <div className="flex items-center gap-2">
            {stats.trendDirection === 'improving' ? (
              <>
                <TrendingUp size={24} className="text-emerald-400" />
                <div>
                  <p className="text-lg font-bold text-emerald-400">Improving</p>
                  <p className="text-[11px] text-zinc-500">Recent reviews are more positive</p>
                </div>
              </>
            ) : stats.trendDirection === 'declining' ? (
              <>
                <TrendingDown size={24} className="text-red-400" />
                <div>
                  <p className="text-lg font-bold text-red-400">Declining</p>
                  <p className="text-[11px] text-zinc-500">Recent reviews show lower sentiment</p>
                </div>
              </>
            ) : (
              <>
                <Minus size={24} className="text-zinc-400" />
                <div>
                  <p className="text-lg font-bold text-zinc-300">Stable</p>
                  <p className="text-[11px] text-zinc-500">Sentiment is consistent over time</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Emotion */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-zinc-500 mb-2">Primary Emotion</p>
          {stats.topEmotions.length > 0 ? (
            <div className="space-y-2">
              {stats.topEmotions.slice(0, 3).map(({ emotion, count }) => {
                const Icon = EMOTION_ICONS[emotion] || Smile;
                const color = EMOTION_COLORS[emotion] || 'text-zinc-400';
                return (
                  <div key={emotion} className="flex items-center gap-2">
                    <Icon size={16} className={color} />
                    <span className="text-sm font-medium text-zinc-300 capitalize flex-1">{emotion}</span>
                    <span className="text-xs text-zinc-500">{count}</span>
                    <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
                        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Not enough data</p>
          )}
        </div>
      </div>

      {/* Top Topics */}
      {stats.topTopics.length > 0 && (
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10">
          <p className="text-xs text-zinc-500 mb-3 flex items-center gap-1.5">
            <Tag size={12} />
            Most Mentioned Topics
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.topTopics.map(({ topic, count }) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                         bg-violet-500/10 border border-violet-500/20 text-violet-300"
              >
                {topic}
                <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-[10px]">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
