import React, { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle2, AlertCircle, Clock, RefreshCw, Share2 } from 'lucide-react';
import { SocialPublication } from '../../types';
import { socialClient } from '../../lib/socialClient';

interface PublishHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishHistoryModal: React.FC<PublishHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [publications, setPublications] = useState<SocialPublication[]>([]);

  const fetchHistory = async () => {
    setLoading(true);
    const data = await socialClient.getStatus();
    if (data?.publications) {
      setPublications(data.publications);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/40">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-brand-400" />
              <span>Social Publishing Audit History</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verified record of customer testimonials distributed across official social platform APIs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHistory}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Refresh history"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
              <p className="text-xs">Loading publication history...</p>
            </div>
          ) : publications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-300">No social publications recorded yet</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Approve a customer testimonial, click "Create Social Post", and use the 1-Click Publish button to broadcast it.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/30">
              {publications.map((pub) => {
                const isPublished = pub.status === 'published';
                const isFailed = pub.status === 'failed';
                const dateStr = pub.publishedAt
                  ? new Date(pub.publishedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Pending';

                return (
                  <div key={pub.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/50 transition-colors">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">
                          {pub.testimonialAuthor || 'Anonymous Customer'}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {pub.platform}
                        </span>
                        {isPublished && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Published</span>
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 italic">
                        "{pub.caption}"
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-0.5">
                        <span>{dateStr}</span>
                        {pub.mediaType && (
                          <span>• {pub.mediaType === 'image' ? 'Image Graphic' : 'Text Post'}</span>
                        )}
                        {pub.platformPostId && (
                          <span className="font-mono text-[10px] truncate max-w-[150px]">
                            ID: {pub.platformPostId}
                          </span>
                        )}
                      </div>

                      {pub.errorMessage && (
                        <p className="text-[11px] text-rose-400">Error: {pub.errorMessage}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pub.platformPostUrl ? (
                        <a
                          href={pub.platformPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <span>View Post</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-500 italic">No external link</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-xs text-zinc-500">
          <span>Total Recorded Publications: {publications.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
