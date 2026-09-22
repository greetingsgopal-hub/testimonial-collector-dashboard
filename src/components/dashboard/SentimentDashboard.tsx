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
  joy: 'text-amber-500',
  trust: 'text-blue-500',
  gratitude: 'text-pink-500',
  surprise: 'text-purple-600',
  frustration: 'text-red-500',
  neutral: 'text-gray-400',
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
      <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-xs text-center">
        <BarChart3 size={32} className="mx-auto text-gray-400 mb-3" />
        <p className="text-sm text-gray-500">Collect some testimonials to see sentiment analysis here.</p>
      </div>
    );
  }

  const scorePercent = Math.round(stats.averageScore * 100);
  const total = stats.distribution.positive + stats.distribution.neutral + stats.distribution.negative;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={16} className="text-[#6701e6]" />
          AI Sentiment Analysis
        </h3>
        <span className="text-xs text-gray-500">{reviews.filter(r => r.status === 'approved').length} reviews analyzed</span>
      </div>

      {/* Score + Trend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Score */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 mb-2">Overall Sentiment</p>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-extrabold ${
              scorePercent >= 70 ? 'text-emerald-600' :
              scorePercent >= 40 ? 'text-amber-500' :
              'text-red-600'
            }`}>
              {scorePercent}%
            </span>
            <span className="text-xs text-gray-500 mb-1 font-medium">positive</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${total > 0 ? (stats.distribution.positive / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-700"
              style={{ width: `${total > 0 ? (stats.distribution.neutral / total) * 100 : 0}%` }}
            />
            <div
              className="h-full bg-red-400 transition-all duration-700"
              style={{ width: `${total > 0 ? (stats.distribution.negative / total) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-2.5 text-[11px] text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Positive ({stats.distribution.positive})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Neutral ({stats.distribution.neutral})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" /> Negative ({stats.distribution.negative})
            </span>
          </div>
        </div>

        {/* Trend */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 mb-2">Sentiment Trend</p>
          <div className="flex items-center gap-2">
            {stats.trendDirection === 'improving' ? (
              <>
                <TrendingUp size={24} className="text-emerald-600" />
                <div>
                  <p className="text-lg font-bold text-emerald-600">Improving</p>
                  <p className="text-xs text-gray-500">Recent reviews are more positive</p>
                </div>
              </>
            ) : stats.trendDirection === 'declining' ? (
              <>
                <TrendingDown size={24} className="text-red-500" />
                <div>
                  <p className="text-lg font-bold text-red-500">Declining</p>
                  <p className="text-xs text-gray-500">Recent reviews show lower sentiment</p>
                </div>
              </>
            ) : (
              <>
                <Minus size={24} className="text-gray-400" />
                <div>
                  <p className="text-lg font-bold text-gray-700">Stable</p>
                  <p className="text-xs text-gray-500">Sentiment is consistent over time</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Emotion */}
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 mb-2">Primary Emotion</p>
          {stats.topEmotions.length > 0 ? (
            <div className="space-y-2.5">
              {stats.topEmotions.slice(0, 3).map(({ emotion, count }) => {
                const Icon = EMOTION_ICONS[emotion] || Smile;
                const color = EMOTION_COLORS[emotion] || 'text-gray-400';
                return (
                  <div key={emotion} className="flex items-center gap-2">
                    <Icon size={16} className={color} />
                    <span className="text-sm font-medium text-gray-800 capitalize flex-1">{emotion}</span>
                    <span className="text-xs text-gray-500 font-semibold">{count}</span>
                    <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
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
            <p className="text-sm text-gray-400">Not enough data</p>
          )}
        </div>
      </div>

      {/* Top Topics */}
      {stats.topTopics.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
            <Tag size={12} />
            Most Mentioned Topics
          </p>
          <div className="flex flex-wrap gap-2">
            {stats.topTopics.map(({ topic, count }) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                         bg-purple-50 border border-purple-200 text-[#6701e6]"
              >
                {topic}
                <span className="px-1.5 py-0.2 rounded-full bg-purple-200/60 text-[10px] text-purple-900">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
