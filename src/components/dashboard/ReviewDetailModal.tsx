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
  ShieldCheck,
  Globe,
  Share2,
  Edit3,
  Save
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
  onOpenSocialCard?: (review: Review) => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  onClose,
  onUpdateStatus,
  onToggleFeatured,
  onDelete,
  onSaveTags,
  onEditReview,
  onOpenSocialCard,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Review Inspection
            </span>
            <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
              {review.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          
          {/* Reviewer Profile Card */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {review.avatarUrl ? (
                <img
                  src={review.avatarUrl}
                  alt={review.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-200 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-purple-100 text-[#6701e6] flex items-center justify-center font-bold text-lg shadow-xs border border-purple-200">
                  {review.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <span>{review.name}</span>
                  {review.isFeatured && (
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  )}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  {review.role} {review.company ? `• ${review.company}` : ''}
                </p>
                {review.email && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span>{review.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Feature Toggle */}
            <button
              disabled={!canBeFeatured}
              onClick={() => onToggleFeatured(review.id, review.isFeatured)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-center cursor-pointer ${
                !canBeFeatured
                  ? 'opacity-40 cursor-not-allowed bg-gray-100 border border-gray-200 text-gray-400'
                  : review.isFeatured
                  ? 'bg-amber-100 border border-amber-300 text-amber-800 shadow-xs'
                  : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-700'
              }`}
              title={!canBeFeatured ? 'Only approved reviews can be marked as featured' : ''}
            >
              <Star className={`w-3.5 h-3.5 ${review.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{review.isFeatured ? 'Featured Review' : 'Mark as Featured'}</span>
            </button>
          </div>

          {/* Edit Review Form / Display View */}
          {isEditing ? (
            <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6701e6] uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Customer Feedback
                </span>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">Author Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-700 font-semibold mb-1 block">Role / Title</label>
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 font-semibold mb-1 block">Company</label>
                    <input
                      type="text"
                      value={editCompany}
                      onChange={(e) => setEditCompany(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">Title / Headline</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">Rating (1 to 5 Stars)</label>
                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6]"
                  >
                    {[5, 4, 3, 2, 1].map((num) => (
                      <option key={num} value={num}>
                        {num} Star{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-700 font-semibold mb-1 block">Feedback Content</label>
                  <textarea
                    rows={4}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6] resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSavingEdit}
                    onClick={handleSaveEdit}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#6701e6] hover:bg-[#5200bd] text-white flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-1.5">
                    {review.rating}.0 Rating
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                  >
                    {copiedContent ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                    <span>{copiedContent ? 'Copied' : 'Copy Quote'}</span>
                  </button>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#6701e6] font-semibold cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {review.title && (
                <h4 className="text-lg font-bold text-gray-900 font-display">
                  "{review.title}"
                </h4>
              )}

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-sm leading-relaxed italic">
                "{review.content}"
              </div>
            </div>
          )}

          {/* Video Attachment */}
          {review.type === 'video' && sanitizeUrl(review.videoUrl) && (
            <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-700 text-xs font-semibold">
                <Video className="w-4 h-4" />
                <span>Video Testimonial attached</span>
              </div>
              <a
                href={sanitizeUrl(review.videoUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-pink-700 hover:text-pink-900 bg-white border border-pink-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Open Video Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Tags Manager */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Assigned Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                >
                  #{t}
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-600 ml-1 cursor-pointer"
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
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#6701e6] focus:border-[#6701e6]"
            />
          </div>

          {/* Unified Distribution Hub (Approved Testimonials Only) */}
          {review.status === 'approved' && (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6701e6]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                    Publish & Distribution Hub
                  </span>
                </div>
                <span className="text-[11px] text-gray-500">2 Independent Channels</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Channel 1: Website Widget */}
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        Website Widget
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-2.5 h-2.5" /> Live on Website
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                      Your website widget updates automatically. No website changes or developer involvement required.
                    </p>
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Broadcasting live to your embed code</span>
                  </div>
                </div>

                {/* Channel 2: Social Media */}
                <div className="p-3.5 rounded-xl bg-white border border-purple-200 flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-[#6701e6]" />
                        Social Media
                      </span>
                      <span className="text-[10px] font-bold text-[#6701e6] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        Ready to Share
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">
                      Turn this testimonial into a branded post for LinkedIn, X, Instagram, or Facebook.
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenSocialCard?.(review)}
                    className="w-full py-2 px-3 rounded-lg bg-[#6701e6] hover:bg-[#5200bd] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create Social Post</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Metadata & Consent */}
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Reviewer granted marketing & public website display consent upon submission.</span>
          </div>
        </div>

        {/* Footer Moderation Actions */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Approve */}
            <button
              onClick={() => onUpdateStatus(review.id, 'approved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                review.status === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{review.status === 'approved' ? 'Approved' : 'Approve'}</span>
            </button>

            {/* Reject */}
            <button
              onClick={() => onUpdateStatus(review.id, 'rejected')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                review.status === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              <X className="w-4 h-4" />
              <span>{review.status === 'rejected' ? 'Rejected' : 'Reject'}</span>
            </button>

            {/* Archive */}
            <button
              onClick={() => onUpdateStatus(review.id, 'archived')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                review.status === 'archived'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>Archive</span>
            </button>

            {/* Create Social Post (Only for approved reviews) */}
            {review.status === 'approved' && onOpenSocialCard && (
              <button
                onClick={() => onOpenSocialCard(review)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-[#6701e6] border border-purple-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ml-1"
                title="Create a branded social media graphic"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Social Post</span>
              </button>
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => {
              onDelete(review.id);
              onClose();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
