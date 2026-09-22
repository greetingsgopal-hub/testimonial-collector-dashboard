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
    try {
      const data = await socialClient.getStatus();
      if (data?.publications) {
        setPublications(data.publications);
      }
    } catch (e) {
      console.error('Failed to fetch publication history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#6701e6]" />
              <span>Social Publishing Audit History</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified record of customer testimonials distributed across official social platform APIs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHistory}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Refresh history"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin text-[#6701e6]" />
              <p className="text-xs font-medium">Loading publication history...</p>
            </div>
          ) : publications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-800">No social publications recorded yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Approve a customer testimonial, click "Create Social Post", and use the 1-Click Publish button to broadcast it.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
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
                  <div key={pub.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-gray-900">
                          {pub.testimonialAuthor || 'Anonymous Customer'}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                          {pub.platform}
                        </span>
                        {isPublished && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Published</span>
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 italic">
                        "{pub.caption}"
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-0.5">
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
                        <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">Error: {pub.errorMessage}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pub.platformPostUrl ? (
                        <a
                          href={pub.platformPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border border-gray-200"
                        >
                          <span>View Post</span>
                          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No external link</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>Total Recorded Publications: {publications.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
