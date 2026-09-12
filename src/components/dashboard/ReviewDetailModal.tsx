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
import { sanitizeUrl } from '../../lib/security';

interface ReviewDetailModalProps {
  review: Review | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ReviewStatus) => void;
  onToggleFeatured: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onSaveTags?: (id: string, tags: string[]) => void;
  onEditReview?: (id: string, updates: Partial<Review>) => Promise<void>;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  onClose,
  onUpdateStatus,
  onToggleFeatured,
  onDelete,
  onSaveTags,
  onEditReview,
}) => {
  const [copiedContent, setCopiedContent] = useState(false);
  const [tags, setTags] = useState<string[]>(review?.tags || []);
  const [newTag, setNewTag] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(review?.name || '');
  const [editRole, setEditRole] = useState(review?.role || '');
  const [editCompany, setEditCompany] = useState(review?.company || '');
  const [editRating, setEditRating] = useState(review?.rating || 5);
  const [editTitle, setEditTitle] = useState(review?.title || '');
  const [editContent, setEditContent] = useState(review?.content || '');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  const handleSaveEdit = async () => {
    if (!onEditReview) return;
    setIsSavingEdit(true);
    try {
      await onEditReview(review.id, {
        name: editName.trim() || review.name,
        role: editRole.trim() || review.role,
        company: editCompany.trim(),
        rating: editRating,
        title: editTitle.trim(),
        content: editContent.trim() || review.content,
      });
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save review edits:', e);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const canBeFeatured = review.status === 'approved';

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
                {review.email && (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-1">
                    <Mail className="w-3 h-3 text-zinc-500" />
                    <span>{review.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Featured State Toggle (Enforced: Approved only) */}
            <div className="flex flex-col sm:items-end gap-1.5">
              <button
                disabled={!canBeFeatured}
                onClick={() => onToggleFeatured(review.id, review.isFeatured)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  !canBeFeatured
                    ? 'opacity-40 cursor-not-allowed bg-zinc-900 border border-zinc-800 text-zinc-500'
                    : review.isFeatured
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30 hover:bg-amber-400/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                }`}
                title={canBeFeatured ? 'Toggle featured status' : 'Only approved testimonials can be featured'}
              >
                <Star className={`w-3.5 h-3.5 ${review.isFeatured ? 'fill-amber-400' : ''}`} />
                <span>
                  {review.isFeatured
                    ? 'Featured Testimonial'
                    : canBeFeatured
                    ? 'Mark as Featured'
                    : 'Featured (Approved Only)'}
                </span>
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

          {/* EDIT MODE vs VIEW MODE */}
          {isEditing ? (
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-brand-500/30 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                  Moderator Editing Mode
                </span>
                <span className="text-[11px] text-zinc-400">
                  Correct typos or formatting without distorting feedback.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Company</label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Rating (Stars)</label>
                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-white"
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num} className="bg-zinc-900 text-white">
                        {num} Stars
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Testimonial Headline</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Headline or summary (optional)"
                  className="glass-input w-full px-3 py-1.5 rounded-lg text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Testimonial Text</label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-lg text-xs text-white leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white transition-colors"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Edits'}
                </button>
              </div>
            </div>
          ) : (
            /* Rating & Content View */
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
                  >
                    <span>Edit Testimonial</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
                  >
                    {copiedContent ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedContent ? 'Copied' : 'Copy Quote'}</span>
                  </button>
                </div>
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
          )}

          {/* Video Attachment */}
          {review.type === 'video' && sanitizeUrl(review.videoUrl) && (
            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-pink-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-400 text-xs font-medium">
                <Video className="w-4 h-4" />
                <span>Video Testimonial attached</span>
              </div>
              <a
                href={sanitizeUrl(review.videoUrl)}
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
