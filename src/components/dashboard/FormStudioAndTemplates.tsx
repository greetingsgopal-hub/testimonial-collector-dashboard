import { useState, useEffect } from 'react';
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
  LayoutTemplate,
  Sparkles,
} from 'lucide-react';

export interface FormTemplate {
  id: string;
  name: string;
  theme: 'midnight' | 'emerald' | 'sunset' | 'minimal';
  bgClass: string;
  cardClass: string;
  accentColor: string;
}

export const PRESET_TEMPLATES: FormTemplate[] = [
  {
    id: 'midnight',
    name: 'Midnight Sleek',
    theme: 'midnight',
    bgClass: 'bg-[#0B0F19] text-slate-100',
    cardClass: 'bg-[#131B2E] border-slate-800 text-slate-100 shadow-xl',
    accentColor: '#7C3AED',
  },
  {
    id: 'emerald',
    name: 'Emerald Trust',
    theme: 'emerald',
    bgClass: 'bg-[#F0FDF4] text-slate-900',
    cardClass: 'bg-white border-emerald-200 text-slate-900 shadow-sm',
    accentColor: '#059669',
  },
  {
    id: 'sunset',
    name: 'Sunset Warmth',
    theme: 'sunset',
    bgClass: 'bg-[#FFFBEB] text-slate-900',
    cardClass: 'bg-white border-amber-200 text-slate-900 shadow-sm',
    accentColor: '#D97706',
  },
  {
    id: 'minimal',
    name: 'Modern Minimal',
    theme: 'minimal',
    bgClass: 'bg-[#FAFAFA] text-slate-900',
    cardClass: 'bg-white border-slate-200 text-slate-900 shadow-sm',
    accentColor: '#18181B',
  },
];

export interface FormStudioAndTemplatesProps {
  workspaceId?: string;
  workspaceName?: string;
  collectionForm?: any;
  onUpdateForm?: (updates: any) => Promise<void> | void;
  publicCollectionUrl?: string;
}

export function FormStudioAndTemplates({
  workspaceId = 'besteample',
  workspaceName = 'besteample',
  collectionForm,
  onUpdateForm,
  publicCollectionUrl: customPublicUrl,
}: FormStudioAndTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate>(PRESET_TEMPLATES[0]);
  const [formHeading, setFormHeading] = useState<string>(
    collectionForm?.title || 'How was your experience with us?'
  );
  const [formSubheading, setFormSubheading] = useState<string>(
    collectionForm?.description || 'Your honest feedback helps us improve and guides future customers.'
  );
  const [allowText, setAllowText] = useState<boolean>(collectionForm?.allowText ?? true);
  const [allowVideo, setAllowVideo] = useState<boolean>(collectionForm?.allowVideo ?? true);
  const [primaryColor, setPrimaryColor] = useState<string>('#7C3AED');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Avatar customization state for preview
  const [avatarMode, setAvatarMode] = useState<'male' | 'female' | 'upload' | null>('male');

  const effectivePublicUrl = customPublicUrl || (typeof window !== 'undefined'
    ? `${window.location.origin}/c/${workspaceId.toLowerCase()}`
    : `https://pandapraise.com/c/${workspaceId.toLowerCase()}`);

  // Load existing form configuration from Firestore
  useEffect(() => {
    try {
      const db = getFirestore();
      getDoc(doc(db, 'workspaces', workspaceId))
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
      // Offline or mock environment fallback
    }
  }, [workspaceId]);

  const handleApplyTemplate = (tpl: FormTemplate) => {
    setSelectedTemplate(tpl);
    setPrimaryColor(tpl.accentColor);
  };

  const handleSaveLive = async () => {
    setIsSaving(true);
    setSaveNotice(null);
    try {
      if (onUpdateForm) {
        await onUpdateForm({
          title: formHeading,
          description: formSubheading,
          allowText,
          allowVideo,
        });
      }

      try {
        const db = getFirestore();
        await setDoc(
          doc(db, 'workspaces', workspaceId),
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
        // Fallback for demo environments
      }

      setSaveNotice('Form settings saved & published live successfully!');
      setTimeout(() => setSaveNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save form settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(effectivePublicUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 font-sans text-slate-900 pb-12" data-testid="form-studio-and-templates">
      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>{saveNotice}</span>
          <button type="button" onClick={() => setSaveNotice(null)} className="cursor-pointer font-bold px-2">✕</button>
        </div>
      )}

      {/* TOP SPLIT: COLLECTION FORM SETTINGS (LEFT) & LIVE PREVIEW (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: COLLECTION FORM EDITOR */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Collection FORM</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Settings, questions &amp; media permissions.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Form Heading Title
              </label>
              <input
                type="text"
                data-testid="builder-heading-input"
                value={formHeading}
                onChange={(e) => setFormHeading(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Subheading / Instructions
              </label>
              <textarea
                rows={3}
                data-testid="builder-subheading-input"
                value={formSubheading}
                onChange={(e) => setFormSubheading(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-600 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="builder-allow-text"
                  checked={allowText}
                  onChange={(e) => setAllowText(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Written Review
                </span>
              </label>

              <label className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="builder-allow-video"
                  checked={allowVideo}
                  onChange={(e) => setAllowVideo(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Video (+2x Perk)
                </span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Accent / Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  data-testid="builder-color-picker"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-11 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer p-1 bg-white dark:bg-slate-800"
                />
                <span className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {primaryColor}
                </span>
              </div>
            </div>

            {/* Feature Highlights Box matching screenshot */}
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Simple Form Layout</span>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                  Clean &amp; High-Converting
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pl-5 list-disc">
                <li>One box for writing review (Hinglish/English)</li>
                <li>One box for Name</li>
                <li>One box for Designation</li>
                <li>Upload or select/deselect Male &amp; Female animated avatars</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400 font-medium truncate">
                Changes take effect live on <strong className="text-purple-600">/c/{workspaceId}</strong>
              </span>
              <button
                type="button"
                disabled={isSaving}
                data-testid="builder-save-btn"
                onClick={handleSaveLive}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Apply & Save Live'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW (Dark Theme Container matching screenshot) */}
        <div className="lg:col-span-6 bg-[#0B0F19] rounded-3xl border border-slate-800 p-6 shadow-2xl text-white relative">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-purple-400 uppercase">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="builder-copy-link-btn"
                onClick={handleCopyLink}
                className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedLink ? 'Link Copied!' : 'Copy Link'}
              </button>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Interactive Live Card
              </span>
            </div>
          </div>

          {/* Rendered Live Card Preview */}
          <div
            data-testid="builder-preview-card"
            className={`rounded-2xl p-6 border transition-all ${selectedTemplate.cardClass}`}
          >
            <div className="text-center space-y-1.5 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                ★ VERIFIED SPACE • {workspaceName.toUpperCase()}
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">{formHeading}</h3>
              <p className="text-xs opacity-80 max-w-sm mx-auto">{formSubheading}</p>
            </div>

            {/* Satisfaction Rating Box */}
            <div className="bg-black/20 rounded-2xl p-4 text-center border border-white/10 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-75 block mb-1">
                OVERALL SATISFACTION
              </span>
              <div className="flex justify-center gap-1.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-current" />
                ))}
              </div>
            </div>

            {/* Media Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {allowText && (
                <div
                  className="py-2.5 rounded-xl text-center text-xs font-bold border border-white/20 bg-white/10"
                  style={{ borderColor: primaryColor }}
                >
                  Written Review
                </div>
              )}
              {allowVideo && (
                <div className="py-2.5 rounded-xl text-center text-xs font-bold border border-white/10 opacity-70">
                  Video (+2x Perk)
                </div>
              )}
            </div>

            {/* Input fields preview */}
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">
                  WRITE REVIEW (HINGLISH / ENGLISH)
                </span>
                <textarea
                  rows={3}
                  readOnly
                  placeholder="Share your authentic review in English or Hinglish..."
                  className="w-full rounded-xl border border-white/20 p-3 text-xs bg-black/20 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">NAME</span>
                  <input
                    type="text"
                    readOnly
                    value="Rahul Sharma"
                    className="w-full rounded-xl border border-white/20 px-3 py-2 text-xs bg-black/20 text-white"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75 mb-1">DESIGNATION</span>
                  <input
                    type="text"
                    readOnly
                    value="Product Lead"
                    className="w-full rounded-xl border border-white/20 px-3 py-2 text-xs bg-black/20 text-white"
                  />
                </div>
              </div>

              {/* Profile picture toggle preview */}
              <div className="p-3 rounded-xl border border-white/10 bg-black/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">PROFILE PICTURE</span>
                  <span className="text-[10px] opacity-60">Default Animated / Upload</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAvatarMode(avatarMode === 'male' ? null : 'male')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      avatarMode === 'male' ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-200'
                    }`}
                  >
                    🙋‍♂️ Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarMode(avatarMode === 'female' ? null : 'female')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      avatarMode === 'female' ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-200'
                    }`}
                  >
                    🙋‍♀️ Female
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarMode(avatarMode === 'upload' ? null : 'upload')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      avatarMode === 'upload' ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-200'
                    }`}
                  >
                    📷 Upload
                  </button>
                  {avatarMode && (
                    <button
                      type="button"
                      onClick={() => setAvatarMode(null)}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 px-1.5 cursor-pointer ml-auto"
                    >
                      × Deselect
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3.5 rounded-2xl text-white font-bold text-xs shadow-md transition-all cursor-pointer hover:brightness-105"
                style={{ backgroundColor: primaryColor }}
              >
                Submit Testimonial →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM: TEMPLATES COLLECTION */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Templates Collection</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click any pre-made theme template to instantly apply it to your collection form.</p>
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
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 ring-2 ring-purple-600/15 bg-purple-50/20 dark:bg-purple-950/20'
                    : 'border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{tpl.name}</span>
                    {isSelected && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">Applied ✓</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    {tpl.theme === 'midnight' ? 'Your honest feedback helps us improve and guides future...' : 'Takes less than 30 seconds. No login required.'}
                  </p>
                </div>

                <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600" style={{ backgroundColor: tpl.accentColor }} />
                  <span className="font-bold text-purple-600 dark:text-purple-400">{isSelected ? 'Applied ✓' : 'Apply →'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default FormStudioAndTemplates;
