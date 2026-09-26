import React, { useState } from 'react';
import { Search, Star, Mail, Trash2 } from 'lucide-react';
import { Review } from '../../../types';

interface FeedbackViewProps {
  feedbackList?: Review[];
  onDeleteFeedback?: (id: string) => void;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({
  feedbackList = [],
  onDeleteFeedback,
}) => {
  const [search, setSearch] = useState('');

  const filtered = feedbackList.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.content.toLowerCase().includes(search.toLowerCase()) ||
    (f.email && f.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6 font-sans">
      
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display">Private Feedback</h1>
        <p className="text-xs text-gray-500">
          Low ratings stay private. Use this feedback to respond to unhappy customers and improve the experience before publishing anything publicly.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search feedback..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6] shadow-2xs"
        />
      </div>

      {/* List or Empty State */}
      {filtered.length === 0 ? (
        <div className="py-24 text-center space-y-3 bg-white border border-gray-200/80 rounded-2xl shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
            <Search className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-800">No private feedback yet.</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            When customers submit 1-3 star ratings with notes on how to improve, their private constructive feedback will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">{item.name}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed italic">
                  "{item.content}"
                </p>

                {item.email && (
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span>{item.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.email && (
                  <a
                    href={`mailto:${item.email}?subject=Thank%20you%20for%20your%20feedback`}
                    className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 text-xs font-semibold transition-colors"
                  >
                    Reply by Email
                  </a>
                )}
                {onDeleteFeedback && (
                  <button
                    onClick={() => onDeleteFeedback(item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete feedback"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
