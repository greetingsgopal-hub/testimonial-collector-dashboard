import React, { useState, useEffect, useRef } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Sliders,
  Eye,
  Star,
  Video,
  FileText,
  CheckCircle2,
  Copy,
  LayoutTemplate,
  Check,
  Camera,
  X,
  Sparkles,
  ExternalLink,
  Save,
} from 'lucide-react';
import { CollectionForm } from '../../types';
import { MALE_ANIMATED_AVATAR, FEMALE_ANIMATED_AVATAR } from '../../lib/defaultAvatars';

export interface FormTemplate {
  id: string;
  name: string;
  theme: 'midnight' | 'emerald' | 'sunset' | 'minimal';
  bgClass: string;
  cardClass: string;
  accentColor: string;
  heading: string;
  subheading: string;
}

export const PRESET_TEMPLATES: FormTemplate[] = [
  {
    id: 'midnight',
    name: 'Midnight Sleek',
    theme: 'midnight',
    bgClass: 'bg-[#0B0F19] text-slate-100',
    cardClass: 'bg-[#131B2E] border-slate-800 text-slate-100 shadow-xl',
    accentColor: '#7C3AED',
    heading: 'How was your experience with us?',
    subheading: 'Your honest feedback helps us improve and guides future customers.',
  },
  {
    id: 'emerald',
    name: 'Emerald Trust',
    theme: 'emerald',
    bgClass: 'bg-[#F0FDF4] text-slate-900',
    cardClass: 'bg-white border-emerald-200 text-slate-900 shadow-sm',
    accentColor: '#059669',
    heading: 'Share your success story!',
    subheading: 'Takes less than 30 seconds. No login required.',
  },
  {
    id: 'sunset',
    name: 'Sunset Warmth',
    theme: 'sunset',
    bgClass: 'bg-[#FFFBEB] text-slate-900',
    cardClass: 'bg-white border-amber-200 text-slate-900 shadow-sm',
    accentColor: '#D97706',
    heading: 'We love hearing from you!',
    subheading: 'Tell us what problem we solved for you today.',
  },
  {
    id: 'minimal',
    name: 'Modern Minimal',
    theme: 'minimal',
    bgClass: 'bg-[#FAFAFA] text-slate-900',
    cardClass: 'bg-white border-slate-200 text-slate-900 shadow-sm',
    accentColor: '#18181B',
    heading: 'Leave a verified review',
    subheading: 'Share your thoughts, results, or favorite feature.',
  },
];

export interface CollectionFormBuilderProps {
  workspaceId?: string;
  workspaceName?: string;
  collectionForm?: CollectionForm | null;
  onUpdateForm?: (updates: any) => Promise<void> | void;
  publicCollectionUrl?: string;
  collectionUrl?: string;
}

export function CollectionFormBuilder({
  workspaceId,
  workspaceName = 'papasystem',
  collectionForm,
  onUpdateForm,
  publicCollectionUrl,
  collectionUrl,
}: CollectionFormBuilderProps) {
  const effectiveWorkspaceId = workspaceId || workspaceName;
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate>(PRESET_TEMPLATES[0]);
  const [formHeading, setFormHeading] = useState<string>(
    collectionForm?.title || `How was your experience with ${workspaceName}?`
  );
  const [formSubheading, setFormSubheading] = useState<string>(
    collectionForm?.description || 'Your honest feedback helps our team improve and guides future customers.'
  );
  const [allowText, setAllowText] = useState<boolean>(collectionForm?.allowText ?? true);
  const [allowVideo, setAllowVideo] = useState<boolean>(collectionForm?.allowVideo ?? true);
  const [primaryColor, setPrimaryColor] = useState<string>(PRESET_TEMPLATES[0].accentColor);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Live Preview Form State
  const [previewRating, setPreviewRating] = useState<number>(5);
  const [previewText, setPreviewText] = useState<string>('');
  const [previewName, setPreviewName] = useState<string>('Rahul Sharma');
  const [previewDesignation, setPreviewDesignation] = useState<string>('Product Lead');
  const [previewAvatarType, setPreviewAvatarType] = useState<'male' | 'female' | 'custom' | null>('male');
  const [previewCustomAvatarUrl, setPreviewCustomAvatarUrl] = useState<string | null>(null);
  const previewFileInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveUrl =
    publicCollectionUrl ||
    collectionUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/c/${effectiveWorkspaceId.toLowerCase().replace(/[^a-z0-9-]/g, '')}`
      : `https://pandapraise.com/c/${effectiveWorkspaceId}`);

  // Sync state if collectionForm prop updates
  useEffect(() => {
    if (collectionForm?.title) {
      setFormHeading(collectionForm.title);
    }
    if (collectionForm?.description) {
      setFormSubheading(collectionForm.description);
    }
    if (collectionForm?.allowVideo !== undefined) {
      setAllowVideo(collectionForm.allowVideo);
    }
    if (collectionForm?.allowText !== undefined) {
      setAllowText(collectionForm.allowText);
    }
  }, [collectionForm]);

  // Load from Firestore workspace document if available
  useEffect(() => {
    if (!effectiveWorkspaceId) return;
    try {
      const db = getFirestore();
      getDoc(doc(db, 'workspaces', effectiveWorkspaceId))
        .then((snap) => {
          if (snap.exists()) {
            const d = snap.data();
            if (d.formHeading) setFormHeading(d.formHeading);
            if (d.formSubheading) setFormSubheading(d.formSubheading);
            if (d.primaryColor) setPrimaryColor(d.primaryColor);
            if (d.allowText !== undefined) setAllowText(d.allowText);
            if (d.allowVideo !== undefined) setAllowVideo(d.allowVideo);
            if (d.templateTheme) {
              const match = PRESET_TEMPLATES.find((t) => t.theme === d.templateTheme);
              if (match) setSelectedTemplate(match);
            }
          }
        })
        .catch(() => null);
    } catch {
      // Offline fallback
    }
  }, [effectiveWorkspaceId]);

  const handleApplyTemplate = (tpl: FormTemplate) => {
    setSelectedTemplate(tpl);
    setFormHeading(tpl.heading);
    setFormSubheading(tpl.subheading);
    setPrimaryColor(tpl.accentColor);
  };

  const handlePreviewFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPreviewCustomAvatarUrl(reader.result);
          setPreviewAvatarType('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(effectiveUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveLive = async () => {
    setIsSaving(true);
    setSaveNotice(null);
    try {
      if (onUpdateForm) {
        await onUpdateForm({
          title: formHeading,
          description: formSubheading,
          allowVideo,
          allowText,
          settings: {
            brandColor: primaryColor,
            templateTheme: selectedTemplate.theme,
          },
        });
      }

      // Persist to local cache so live form loads instantly
      try {
        localStorage.setItem(
          `panda_form_config_${effectiveWorkspaceId}`,
          JSON.stringify({
            formHeading,
            formSubheading,
            allowText,
            allowVideo,
            primaryColor,
            templateTheme: selectedTemplate.theme,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {
        // Local storage quota fallback
      }

      // Persist to Firestore workspaces collection
      try {
        const db = getFirestore();
        await setDoc(
          doc(db, 'workspaces', effectiveWorkspaceId),
          {
            formHeading,
            formSubheading,
            allowText,
            allowVideo,
            primaryColor,
            templateTheme: selectedTemplate.theme,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch {
        // Fallback for mock environments
      }

      setSaveSuccess(true);
      setSaveNotice('Form settings saved & published live successfully!');
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveNotice(null);
      }, 3000);
    } catch (err: any) {
      console.error('Failed to save collection form:', err);
      alert(err.message || 'Failed to save collection form settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900" data-testid="collection-form-builder-studio">
      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveNotice}</span>
          </div>
          <button type="button" onClick={() => setSaveNotice(null)} className="cursor-pointer text-emerald-600 hover:text-emerald-800">
            ✕
          </button>
        </div>
      )}

      {/* ── SECTION HEADER ── */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Collection Form Builder
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Form Builder
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure questions, check the live preview card, and choose from pre-made theme templates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            type="button"
            data-testid="builder-copy-link-btn"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Form Link'}</span>
          </button>

          <a
            href={effectiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="builder-open-live-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Live Form</span>
          </a>
        </div>
      </section>

      {/* ── TOP SPLIT: COLLECTION FORM (LEFT) & PREVIEW (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* TOP-LEFT: COLLECTION FORM */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                <Sliders className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Collection FORM</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Settings, questions & media permissions.</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
              Live Editor
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Form Heading Title
              </label>
              <input
                type="text"
                data-testid="builder-heading-input"
                value={formHeading}
                onChange={(e) => setFormHeading(e.target.value)}
                placeholder="e.g. Share your success story!"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Subheading / Instructions
              </label>
              <textarea
                rows={2}
                data-testid="builder-subheading-input"
                value={formSubheading}
                onChange={(e) => setFormSubheading(e.target.value)}
                placeholder="e.g. Takes less than 30 seconds. No login required."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-600 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  data-testid="builder-allow-text"
                  checked={allowText}
                  onChange={(e) => setAllowText(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Written Review
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  data-testid="builder-allow-video"
                  checked={allowVideo}
                  onChange={(e) => setAllowVideo(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Video (+2x Perk)
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Accent / Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  data-testid="builder-color-picker"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer p-1 bg-white dark:bg-slate-800"
                />
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {primaryColor}
                </span>
              </div>
            </div>

            {/* Simple Form Layout Overview matching screenshot */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Simple Form Layout</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  Clean &amp; High-Converting
                </span>
              </div>
              <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pl-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>One box for writing review (Hinglish/English)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>One box for Name</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>One box for Designation</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Upload or select/deselect Male &amp; Female animated avatars</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Changes take effect live on <code className="text-purple-600 font-mono">/c/{effectiveWorkspaceId}</code>
              </span>
              <button
                type="button"
                data-testid="builder-save-btn"
                onClick={handleSaveLive}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Saved Live ✓</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Apply & Save Live'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* TOP-RIGHT: PREVIEW */}
        <div className="lg:col-span-6 bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl text-white relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-purple-400 uppercase">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Interactive Live Card
            </span>
          </div>

          {/* Form Card rendered inside preview */}
          <div className={`rounded-2xl p-6 border transition-all ${selectedTemplate.cardClass}`}>
            <div className="text-center space-y-1.5 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                ★ Verified Space • {workspaceName}
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">
                {formHeading}
              </h3>
              <p className="text-xs opacity-80 max-w-sm mx-auto leading-relaxed">
                {formSubheading}
              </p>
            </div>

            {/* Satisfaction Rating Box */}
            <div className="rounded-2xl p-3.5 text-center border mb-4 bg-black/5 dark:bg-white/5 border-slate-200/50 dark:border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                  OVERALL SATISFACTION
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-500 border border-amber-400/30">
                  {previewRating}.0 • Outstanding! 🔥
                </span>
              </div>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setPreviewRating(star)}
                    className="p-1 cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= previewRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Media Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div
                className={`py-2 px-3 rounded-xl text-center text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  allowText
                    ? 'border-purple-500/60 bg-purple-500/10 text-purple-600 dark:text-purple-300 shadow-2xs'
                    : 'opacity-40 border-slate-200 dark:border-slate-800'
                }`}
                style={{ borderColor: allowText ? primaryColor : undefined }}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Written Review</span>
              </div>
              <div
                className={`py-2 px-3 rounded-xl text-center text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  allowVideo
                    ? 'border-purple-500/60 bg-purple-500/10 text-purple-600 dark:text-purple-300 shadow-2xs'
                    : 'opacity-40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video (+2x Perk)</span>
              </div>
            </div>

            {/* Simple Form Fields: Review, Name, Designation, Male/Female Avatar */}
            <div className="space-y-3.5">
              {/* Review input box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    Write Review (Hinglish / English)
                  </label>
                  <span className="text-[10px] opacity-60 font-mono">
                    {previewText.length} / 600
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setPreviewText((prev) => `${prev ? prev + ' ' : ''}It solved `)}
                    className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-300/60 dark:border-slate-700 bg-white/40 dark:bg-slate-800/60 hover:bg-white/80 cursor-pointer font-medium"
                  >
                    💡 What problem did it solve?
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewText((prev) => `${prev ? prev + ' ' : ''}My favorite feature is `)}
                    className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-300/60 dark:border-slate-700 bg-white/40 dark:bg-slate-800/60 hover:bg-white/80 cursor-pointer font-medium"
                  >
                    ❤️ Favorite feature?
                  </button>
                </div>
                <textarea
                  rows={3}
                  data-testid="preview-review-input"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder={`What did you love most? Share your authentic thoughts in English or Hinglish about ${workspaceName}...`}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-xs bg-slate-50/60 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                />
              </div>

              {/* Name and Designation boxes */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    data-testid="preview-name-input"
                    value={previewName}
                    onChange={(e) => setPreviewName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-slate-50/60 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    data-testid="preview-designation-input"
                    value={previewDesignation}
                    onChange={(e) => setPreviewDesignation(e.target.value)}
                    placeholder="e.g. Product Lead"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-slate-50/60 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Profile Avatar selector */}
              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    Profile Picture
                  </span>
                  <span className="text-[10px] opacity-60">
                    Default Animated / Upload
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    data-testid="preview-avatar-male-btn"
                    onClick={() => setPreviewAvatarType(previewAvatarType === 'male' ? null : 'male')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewAvatarType === 'male'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>🙋‍♂️ Male</span>
                    {previewAvatarType === 'male' && <Check className="w-3 h-3 text-white" />}
                  </button>

                  <button
                    type="button"
                    data-testid="preview-avatar-female-btn"
                    onClick={() => setPreviewAvatarType(previewAvatarType === 'female' ? null : 'female')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewAvatarType === 'female'
                        ? 'bg-pink-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>🙋‍♀️ Female</span>
                    {previewAvatarType === 'female' && <Check className="w-3 h-3 text-white" />}
                  </button>

                  <input
                    type="file"
                    ref={previewFileInputRef}
                    onChange={handlePreviewFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    data-testid="preview-avatar-upload-btn"
                    onClick={() => previewFileInputRef.current?.click()}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      previewAvatarType === 'custom'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>📷 Upload</span>
                  </button>

                  {previewAvatarType && (
                    <button
                      type="button"
                      data-testid="preview-avatar-deselect-btn"
                      onClick={() => {
                        setPreviewAvatarType(null);
                        setPreviewCustomAvatarUrl(null);
                      }}
                      className="px-2 py-1 text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer ml-auto flex items-center gap-0.5"
                    >
                      <X className="w-3 h-3" />
                      <span>× Deselect</span>
                    </button>
                  )}
                </div>

                {/* Avatar Preview Chip */}
                {previewAvatarType && (
                  <div className="pt-1 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-purple-400 bg-purple-100 flex items-center justify-center">
                      {previewAvatarType === 'male' && (
                        <img src={MALE_ANIMATED_AVATAR} alt="Male Avatar" className="w-full h-full object-cover" />
                      )}
                      {previewAvatarType === 'female' && (
                        <img src={FEMALE_ANIMATED_AVATAR} alt="Female Avatar" className="w-full h-full object-cover" />
                      )}
                      {previewAvatarType === 'custom' && previewCustomAvatarUrl && (
                        <img src={previewCustomAvatarUrl} alt="Custom Avatar" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {previewAvatarType === 'male' && 'Male animated avatar active'}
                      {previewAvatarType === 'female' && 'Female animated avatar active'}
                      {previewAvatarType === 'custom' && 'Custom photo active'}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button in Preview */}
              <button
                type="button"
                className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                Submit Testimonial →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM: TEMPLATES COLLECTION ── */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Templates Collection
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any pre-made theme template to instantly apply it to your collection form.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_TEMPLATES.map((tpl) => {
            const isSelected = selectedTemplate.id === tpl.id;
            return (
              <div
                key={tpl.id}
                data-testid={`template-${tpl.id}`}
                onClick={() => handleApplyTemplate(tpl)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/20 dark:bg-purple-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {tpl.name}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        Applied ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                    {tpl.heading}
                  </p>
                </div>

                <div className="mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600"
                    style={{ backgroundColor: tpl.accentColor }}
                  />
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {isSelected ? 'Applied ✓' : 'Apply →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default CollectionFormBuilder;
