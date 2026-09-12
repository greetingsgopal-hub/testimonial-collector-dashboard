import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  ToggleLeft, 
  ToggleRight,
  AlertCircle,
  Save
} from 'lucide-react';
import { CollectionForm } from '../../types';
import { storage } from '../../lib/storage';

interface CollectionConfigModalProps {
  collectionForm: CollectionForm | null;
  projectId?: string;
  onClose: () => void;
  onSaved: (form: CollectionForm) => void;
}

export const CollectionConfigModal: React.FC<CollectionConfigModalProps> = ({
  collectionForm,
  projectId = 'proj-demo-1',
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState(collectionForm?.title || 'Share Your Experience');
  const [description, setDescription] = useState(
    collectionForm?.description || 'Your honest feedback helps our team and community grow.'
  );
  const [publicSlug, setPublicSlug] = useState(collectionForm?.publicSlug || 'feedback');
  const [isActive, setIsActive] = useState(collectionForm?.isActive ?? true);
  const [allowVideo, setAllowVideo] = useState(collectionForm?.allowVideo ?? true);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Validate slug formatting: alphanumeric and hyphens only
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setPublicSlug(sanitized);
    if (error) setError(null);
  };

  const publicUrl = `${window.location.origin}/c/${publicSlug || 'feedback'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Collection title is required.');
      return;
    }

    if (!publicSlug.trim()) {
      setError('Public URL slug is required.');
      return;
    }

    setIsSaving(true);
    try {
      let saved: CollectionForm;
      if (collectionForm?.id) {
        saved = await storage.updateCollectionForm(collectionForm.id, {
          title: title.trim(),
          description: description.trim(),
          publicSlug: publicSlug.trim(),
          isActive,
          allowVideo,
          projectId: collectionForm.projectId || projectId,
        });
      } else {
        saved = await storage.createCollectionForm({
          projectId,
          title: title.trim(),
          description: description.trim(),
          publicSlug: publicSlug.trim(),
          isActive,
          allowVideo,
        });
      }
      onSaved(saved);
      onClose();
    } catch (err: any) {
      console.error('[CollectionConfig] Save failed:', err);
      setError(err.message || 'Failed to save collection settings. Slug may already be taken.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Collection Settings</h3>
              <p className="text-xs text-zinc-400">Configure your customer-facing collection form</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Shareable Link Box */}
          <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Shareable Public URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white shrink-0 transition-colors"
                title="Preview public page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Collection Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Share Your Experience with Acme"
              className="glass-input w-full px-3.5 py-2 rounded-xl text-sm text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Instructions / Prompt for Customers
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What questions or topics should customers address?"
              className="glass-input w-full px-3.5 py-2 rounded-xl text-xs text-white leading-relaxed resize-none"
            />
          </div>

          {/* Public Slug */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              URL Identifier (Slug) *
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-zinc-900 border border-r-0 border-zinc-800 rounded-l-xl text-xs font-mono text-zinc-500 select-none">
                /c/
              </span>
              <input
                type="text"
                required
                value={publicSlug}
                onChange={handleSlugChange}
                placeholder="e.g. pulse-feedback"
                className="glass-input flex-1 px-3 py-2 rounded-r-xl text-xs font-mono text-white"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Lowercase letters, numbers, and hyphens only. Must be unique across the platform.
            </p>
          </div>

          {/* Status & Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Active Toggle */}
            <div
              onClick={() => setIsActive(!isActive)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <div>
                <div className="text-xs font-semibold">Active for Submissions</div>
                <div className="text-[10px] text-zinc-500">
                  {isActive ? 'Accepting new responses' : 'Closed / Paused'}
                </div>
              </div>
              {isActive ? (
                <ToggleRight className="w-6 h-6 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-zinc-600" />
              )}
            </div>

            {/* Video Toggle */}
            <div
              onClick={() => setAllowVideo(!allowVideo)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                allowVideo
                  ? 'bg-brand-500/10 border-brand-500/30 text-brand-300'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
              }`}
            >
              <div>
                <div className="text-xs font-semibold">Accept Video Links</div>
                <div className="text-[10px] text-zinc-500">
                  {allowVideo ? 'Loom / YouTube / Vimeo enabled' : 'Text-only form'}
                </div>
              </div>
              {allowVideo ? (
                <ToggleRight className="w-6 h-6 text-brand-400" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-zinc-600" />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-glow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Collection Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
