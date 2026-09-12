import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Check, 
  Trash2, 
  Archive, 
  Sparkles, 
  Copy, 
  CheckCheck, 
  Mail, 
  Video, 
  ExternalLink,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { Review, ReviewStatus } from '../../types';

interface ReviewDetailModalProps {
  review: Review | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ReviewStatus) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onSaveTags?: (id: string, tags: string[]) => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  onClose,
  onUpdateStatus,
  onToggleFeatured,
  onDelete,
  onSaveTags,
}) => {
  const [copiedContent, setCopiedContent] = useState(false);
  const [tags, setTags] = useState<string[]>(review?.tags || []);
  const [newTag, setNewTag] = useState('');

  if (!review) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${review.content}"\n— ${review.name}, ${review.role}${review.company ? ` at ${review.company}` : ''}`);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      const cleaned = newTag.trim().replace(/^#/, '');
      if (!tags.includes(cleaned)) {
        const updated = [...tags, cleaned];
        setTags(updated);
        onSaveTags?.(review.id, updated);
      }
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter(t => t !== tagToRemove);
    setTags(updated);
    onSaveTags?.(review.id, updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Review Inspection
            </span>
            <span className="font-mono text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {review.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Reviewer Profile Card */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {review.avatarUrl ? (
                <img
                  src={review.avatarUrl}
                  alt={review.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-brand-500/30 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md">
                  {review.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>{review.name}</span>
                  {review.isFeatured && (
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                  )}
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5">
                  {review.role} {review.company ? `• ${review.company}` : ''}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
                  <Mail className="w-3 h-3" />
                  <span>{review.email}</span>
                </div>
              </div>
            </div>

            {/* Featured toggle & Date */}
            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
              <button
                onClick={() => onToggleFeatured(review.id, review.isFeatured)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  review.isFeatured
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${review.isFeatured ? 'fill-amber-400' : ''}`} />
                <span>{review.isFeatured ? 'Featured Testimonial' : 'Pin to Featured'}</span>
              </button>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Rating & Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                    }`}
                  />
                ))}
                <span className="text-sm font-bold text-amber-300 ml-2">
                  {review.rating}.0 / 5.0
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
              >
                {copiedContent ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedContent ? 'Copied to Clipboard' : 'Copy Quote'}</span>
              </button>
            </div>

            {review.title && (
              <h4 className="text-lg font-semibold text-white font-display">
                "{review.title}"
              </h4>
            )}

            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 text-sm leading-relaxed italic">
              "{review.content}"
            </div>
          </div>

          {/* Video Attachment */}
          {review.type === 'video' && review.videoUrl && (
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-pink-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-400 text-xs font-medium">
                <Video className="w-4 h-4" />
                <span>Video Testimonial attached</span>
              </div>
              <a
                href={review.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Open Video Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Tags Manager */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Assigned Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700"
                >
                  #{t}
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-400 ml-1"
                    title="Remove tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag and hit Enter..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-zinc-300"
            />
          </div>

          {/* Metadata & Consent */}
          <div className="flex items-center gap-2 text-xs text-emerald-400/80 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Reviewer granted marketing & public website display consent upon submission.</span>
          </div>
        </div>

        {/* Footer Moderation Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Approve */}
            <button
              onClick={() => onUpdateStatus(review.id, 'approved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                review.status === 'approved'
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{review.status === 'approved' ? 'Approved' : 'Approve'}</span>
            </button>

            {/* Reject */}
            <button
              onClick={() => onUpdateStatus(review.id, 'rejected')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                review.status === 'rejected'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30'
              }`}
            >
              <X className="w-4 h-4" />
              <span>{review.status === 'rejected' ? 'Rejected' : 'Reject'}</span>
            </button>

            {/* Archive */}
            <button
              onClick={() => onUpdateStatus(review.id, 'archived')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                review.status === 'archived'
                  ? 'bg-zinc-700 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>Archive</span>
            </button>
          </div>

          {/* Delete */}
          <button
            onClick={() => {
              onDelete(review.id);
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
