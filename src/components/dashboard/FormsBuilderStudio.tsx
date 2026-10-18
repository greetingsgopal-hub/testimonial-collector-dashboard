import React, { useState, useEffect } from 'react';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Sliders,
  Eye,
  Star,
  Video,
  FileText,
  Copy,
  ExternalLink,
  LayoutTemplate,
  Upload,
  Sparkles,
  Check,
  Camera,
  Crown,
  Mail,
} from 'lucide-react';

export type TemplateId = 'midnight' | 'emerald' | 'sunset' | 'custom_hero';

export interface FormTemplateConfig {
  id: TemplateId;
  name: string;
  type: 'default' | 'customizable';
  tagline: string;
  accentColor: string;
  previewShellBg: string;
  previewCardBg: string;
  previewInputBg: string;
  previewTextPrimary: string;
  previewTextSecondary: string;
}

// 3 Default Templates + 1 Customizable Hero Background Template (Pro & Agency)
export const FORM_TEMPLATES: FormTemplateConfig[] = [
  {
    id: 'midnight',
    name: 'Midnight Sleek',
    type: 'default',
    tagline: 'High-contrast dark mode glass card with vibrant accents.',
    accentColor: '#7C3AED',
    previewShellBg: 'bg-[#080C14]',
    previewCardBg: 'bg-[#111827] border-slate-800 text-white',
    previewInputBg: 'bg-[#1E293B]/90 border-slate-700/80 text-white placeholder-slate-400',
    previewTextPrimary: 'text-white',
    previewTextSecondary: 'text-slate-300',
  },
  {
    id: 'emerald',
    name: 'Emerald Trust',
    type: 'default',
    tagline: 'Clean daylight trust theme built for SaaS & B2B brands.',
    accentColor: '#059669',
    previewShellBg: 'bg-[#0F172A]',
    previewCardBg: 'bg-[#F0FDF4] border-emerald-200 text-slate-900',
    previewInputBg: 'bg-white border-emerald-200 text-slate-900 placeholder-slate-400',
    previewTextPrimary: 'text-slate-900',
    previewTextSecondary: 'text-slate-600',
  },
  {
    id: 'sunset',
    name: 'Sunset Warmth',
    type: 'default',
    tagline: 'Warm editorial cream aesthetic for creators, D2C & hospitality.',
    accentColor: '#D97706',
    previewShellBg: 'bg-[#0F172A]',
    previewCardBg: 'bg-[#FFFBEB] border-amber-200 text-slate-900',
    previewInputBg: 'bg-white border-amber-200 text-slate-900 placeholder-slate-400',
    previewTextPrimary: 'text-slate-900',
    previewTextSecondary: 'text-slate-600',
  },
  {
    id: 'custom_hero',
    name: 'Customizable Hero Background',
    type: 'customizable',
    tagline: 'Upload your website hero screenshot or brand photo. Auto-fits all social & web viewports.',
    accentColor: '#7C3AED',
    previewShellBg: 'bg-[#080C14]',
    previewCardBg: 'bg-slate-900/80 backdrop-blur-md border-white/20 text-white',
    previewInputBg: 'bg-slate-950/75 border-white/20 text-white placeholder-slate-300',
    previewTextPrimary: 'text-white',
    previewTextSecondary: 'text-slate-200',
  },
];

const DEFAULT_HERO_BG =
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80';

export default function FormsBuilderStudio({
  workspaceId = 'exampleanimal',
  workspaceName = 'exampleanimal',
  userPlan = 'pro', // 'starter' | 'pro' | 'agency' | 'lifetime'
  onNavigateToProof,
}: {
  workspaceId?: string;
  workspaceName?: string;
  userPlan?: 'starter' | 'pro' | 'agency' | 'lifetime';
  onNavigateToProof?: () => void;
}) {
  // Clean human-readable slug instead of raw Firebase UID (/c/Kvkgwc4me9usjjPhUggF)
  const cleanDefaultSlug = (workspaceName || workspaceId || 'main-product')
    .replace(/'s\s+workspace$/i, '')
    .replace(/\s+workspace$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');

  // Left Editor State
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('midnight');
  const [customSlug, setCustomSlug] = useState<string>(cleanDefaultSlug);
  const [formHeading, setFormHeading] = useState<string>(
    `Share your experience with ${workspaceName === 'exampleanimal' ? 'Main Product' : workspaceName}`
  );
  const [formSubheading, setFormSubheading] = useState<string>(
    'Your honest feedback helps us grow and serve you better.'
  );
  const [allowText, setAllowText] = useState<boolean>(true);
  const [allowVideo, setAllowVideo] = useState<boolean>(true);
  const [accentColor, setAccentColor] = useState<string>('#7C3AED');
  const [promptChip1, setPromptChip1] = useState<string>('💡 What problem did it solve?');
  const [promptChip2, setPromptChip2] = useState<string>('❤️ Favorite feature?');
  const [customBgUrl, setCustomBgUrl] = useState<string>(DEFAULT_HERO_BG);

  // Right Real-Time Interactive Preview State (Customer Input Simulation)
  const [previewLang, setPreviewLang] = useState<'en' | 'hi'>('en');
  const [previewMode, setPreviewMode] = useState<'text' | 'video'>('text');
  const [previewRating, setPreviewRating] = useState<number>(5);
  const [previewReviewText, setPreviewReviewText] = useState<string>(
    'Switching to this platform saved our team 6 hours every single week. Setup took less than 2 minutes!'
  );
  const [previewName, setPreviewName] = useState<string>('Rahul Sharma');
  const [previewRole, setPreviewRole] = useState<string>('Product Lead');
  const [previewAvatarMode, setPreviewAvatarMode] = useState<'male' | 'female' | 'upload' | 'none'>('male');
  const [previewCustomAvatar, setPreviewCustomAvatar] = useState<string | null>(null);

  // Operational State
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const activeTemplate =
    FORM_TEMPLATES.find((t) => t.id === selectedTemplateId) || FORM_TEMPLATES[0];

  const livePublicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${customSlug}`;

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load saved form configuration & pending submission count from Firebase Firestore
  useEffect(() => {
    try {
      const db = getFirestore();

      getDoc(doc(db, 'workspaces', workspaceId))
        .then((snap) => {
          if (snap.exists()) {
            const d = snap.data();
            if (d.formHeading) setFormHeading(d.formHeading);
            if (d.formSubheading) setFormSubheading(d.formSubheading);
            if (d.primaryColor) setAccentColor(d.primaryColor);
            if (d.customSlug) setCustomSlug(d.customSlug);
            if (d.promptChip1) setPromptChip1(d.promptChip1);
            if (d.promptChip2) setPromptChip2(d.promptChip2);
            if (d.customFormBgUrl) setCustomBgUrl(d.customFormBgUrl);
            if (d.allowText !== undefined) setAllowText(Boolean(d.allowText));
            if (d.allowVideo !== undefined) setAllowVideo(Boolean(d.allowVideo));
            if (d.templateTheme) {
              setSelectedTemplateId(d.templateTheme as TemplateId);
            }
          }
        })
        .catch(() => null);

      // Fetch real pending submissions count
      const qPending = query(
        collection(db, 'testimonials'),
        where('workspaceId', '==', workspaceId),
        where('status', '==', 'pending')
      );
      getDocs(qPending)
        .then((snap) => setPendingQueueCount(snap.size))
        .catch(() => null);
    } catch {
      // Firebase uninitialized in testing environment fallback
    }
  }, [workspaceId]);

  const handleSelectTemplate = (tpl: FormTemplateConfig) => {
    if (tpl.type === 'customizable' && userPlan === 'starter') {
      triggerToast(
        'Customizable Hero Background Template is a listed feature for Pro & Agency plans. Upgrade to unlock!',
        'error'
      );
      return;
    }
    setSelectedTemplateId(tpl.id);
    setAccentColor(tpl.accentColor);
  };

  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setCustomBgUrl(evt.target.result as string);
        setSelectedTemplateId('custom_hero');
        triggerToast('Custom Hero Background applied! Auto-scaled for all social & web viewports.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setPreviewCustomAvatar(evt.target.result as string);
        setPreviewAvatarMode('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFormLive = async () => {
    setIsSaving(true);
    try {
      const db = getFirestore();
      await setDoc(
        doc(db, 'workspaces', workspaceId),
        {
          formHeading: formHeading.trim(),
          formSubheading: formSubheading.trim(),
          allowText,
          allowVideo,
          primaryColor: accentColor,
          customSlug: customSlug.trim() || cleanDefaultSlug,
          promptChip1: promptChip1.trim(),
          promptChip2: promptChip2.trim(),
          templateTheme: selectedTemplateId,
          customFormBgUrl: selectedTemplateId === 'custom_hero' ? customBgUrl : null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      triggerToast(`Saved! Changes are now live at /c/${customSlug}`);
    } catch (err: any) {
      triggerToast(err.message || 'Saved locally for this session.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans antialiased text-slate-900 pb-12" data-testid="forms-builder-studio">
      {/* TOAST BANNER */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            {toastMessage.text}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TOP SPLIT: LEFT FORM BUILDER EDITOR + RIGHT REAL-TIME INTERACTIVE PREVIEW */}
      {/* Uses items-stretch so both columns end at the exact same bottom edge! */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: COLLECTION FORM BUILDER */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900">Collection FORM</h1>
                  <p className="text-xs text-slate-500">
                    Settings, questions & media permissions.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                Live Editor
              </span>
            </div>

            {/* 1. Form Heading Title */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Form Heading Title
              </label>
              <input
                type="text"
                data-testid="builder-heading-input"
                value={formHeading}
                onChange={(e) => setFormHeading(e.target.value)}
                placeholder="Share your experience with Main Product"
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* 2. Subheading / Instructions */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subheading / Instructions
              </label>
              <textarea
                rows={2}
                data-testid="builder-subheading-input"
                value={formSubheading}
                onChange={(e) => setFormSubheading(e.target.value)}
                placeholder="Your honest feedback helps us grow and serve you better."
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* 3. Editable Guided Prompt Chips (Syncs Live to Right Preview) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Guided Review Prompt Chips (Click-to-Insert Helpers)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  data-testid="builder-prompt-chip-1"
                  value={promptChip1}
                  onChange={(e) => setPromptChip1(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-600"
                />
                <input
                  type="text"
                  data-testid="builder-prompt-chip-2"
                  value={promptChip2}
                  onChange={(e) => setPromptChip2(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* 4. Media Permissions */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  data-testid="builder-allow-text-toggle"
                  checked={allowText}
                  onChange={(e) => setAllowText(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Written Review</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  data-testid="builder-allow-video-toggle"
                  checked={allowVideo}
                  onChange={(e) => setAllowVideo(e.target.checked)}
                  className="rounded text-purple-600 w-4 h-4"
                />
                <Video className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="text-xs font-bold text-slate-800">Video (+2x Perk)</span>
              </label>
            </div>

            {/* 5. Accent Color & Custom Share Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Accent / Brand Color
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    data-testid="builder-color-input"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-11 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
                  />
                  <span className="px-3 py-2 rounded-xl bg-slate-100 font-mono text-xs font-bold text-slate-700">
                    {accentColor.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Public Form Slug
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                  <span className="text-slate-400 font-mono">/c/</span>
                  <input
                    type="text"
                    data-testid="builder-slug-input"
                    value={customSlug}
                    onChange={(e) =>
                      setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                    }
                    className="bg-transparent font-mono font-bold text-purple-700 focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>

            {/* 6. Simple Form Layout Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Simple Form Layout
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                  Clean & High-Converting
                </span>
              </div>
              <ul className="space-y-1 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>One box for writing review (Hinglish/English)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>One box for Name & Designation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Upload or select/deselect Male & Female animated avatars</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-5 mt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-testid="builder-copy-link-btn"
                onClick={() => {
                  navigator.clipboard.writeText(livePublicUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-purple-600" />
                <span>{copiedLink ? 'Copied /c/' + customSlug : `Copy /c/${customSlug}`}</span>
              </button>

              <a
                href={`/c/${customSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
              >
                <span>Open</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            <button
              type="button"
              data-testid="builder-save-btn"
              disabled={isSaving}
              onClick={handleSaveFormLive}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span>{isSaving ? 'Saving...' : 'Apply & Save Live'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME FORM + LIVE REVIEW OUTPUT PREVIEW */}
        <div
          className={`lg:col-span-6 rounded-3xl border border-slate-800 p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden ${activeTemplate.previewShellBg}`}
        >
          {/* Preview Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-purple-400 uppercase">
              <Eye className="w-4 h-4" />
              <span>Preview · {activeTemplate.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Live Bilingual EN | Hinglish Switcher inside Preview */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold">
                <button
                  type="button"
                  data-testid="preview-lang-en-btn"
                  onClick={() => setPreviewLang('en')}
                  className={`px-2.5 py-0.5 rounded-md cursor-pointer ${
                    previewLang === 'en' ? 'bg-purple-600 text-white' : 'text-slate-400'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  data-testid="preview-lang-hi-btn"
                  onClick={() => setPreviewLang('hi')}
                  className={`px-2.5 py-0.5 rounded-md cursor-pointer ${
                    previewLang === 'hi' ? 'bg-purple-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Hinglish
                </button>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Interactive Live Card
              </span>
            </div>
          </div>

          {/* Interactive Form Card Container (Supports Custom Hero Background Image) */}
          <div
            className={`rounded-2xl p-5 sm:p-6 border transition-all relative overflow-hidden bg-cover bg-center ${activeTemplate.previewCardBg}`}
            style={
              selectedTemplateId === 'custom_hero' && customBgUrl
                ? { backgroundImage: `url(${customBgUrl})` }
                : undefined
            }
          >
            {/* Dark Backdrop Overlay when Custom Hero Background is Active so Text is 100% Legible */}
            {selectedTemplateId === 'custom_hero' && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] pointer-events-none" />
            )}

            <div className="relative z-10 space-y-4">
              {/* Top Heading */}
              <div className="text-center space-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest opacity-75 ${activeTemplate.previewTextSecondary}`}>
                  ★ VERIFIED SPACE • {cleanDefaultSlug.toUpperCase()}
                </span>
                <h3 className={`text-xl font-extrabold tracking-tight ${activeTemplate.previewTextPrimary}`}>
                  {formHeading}
                </h3>
                <p className={`text-xs max-w-md mx-auto ${activeTemplate.previewTextSecondary}`}>
                  {formSubheading}
                </p>
              </div>

              {/* Overall Satisfaction Star Box */}
              <div className={`rounded-2xl p-3.5 border ${activeTemplate.previewInputBg}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    {previewLang === 'hi' ? 'OVERALL SATISFACTION (कुल रेटिंग)' : 'OVERALL SATISFACTION'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {previewRating}.0 • Outstanding! 🔥
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 py-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      data-testid={`preview-star-${star}`}
                      onClick={() => setPreviewRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= previewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Written vs Video Mode Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                {allowText && (
                  <button
                    type="button"
                    data-testid="preview-mode-text-btn"
                    onClick={() => setPreviewMode('text')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      previewMode === 'text'
                        ? 'text-white shadow-sm'
                        : `${activeTemplate.previewInputBg} opacity-75`
                    }`}
                    style={
                      previewMode === 'text'
                        ? { backgroundColor: accentColor, borderColor: accentColor }
                        : undefined
                    }
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{previewLang === 'hi' ? 'Likhit Review' : 'Written Review'}</span>
                  </button>
                )}

                {allowVideo && (
                  <button
                    type="button"
                    data-testid="preview-mode-video-btn"
                    onClick={() => setPreviewMode('video')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      previewMode === 'video'
                        ? 'text-white shadow-sm'
                        : `${activeTemplate.previewInputBg} opacity-75`
                    }`}
                    style={
                      previewMode === 'video'
                        ? { backgroundColor: accentColor, borderColor: accentColor }
                        : undefined
                    }
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video (+2x Perk)</span>
                  </button>
                )}
              </div>

              {/* High-Contrast Review Textarea (Fixes the unreadable gray-on-gray box!) */}
              {previewMode === 'text' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={activeTemplate.previewTextSecondary}>
                      WRITE REVIEW (HINGLISH / ENGLISH)
                    </span>
                    <span className="opacity-60 font-mono">{previewReviewText.length} / 600</span>
                  </div>

                  {/* Interactive Prompt Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {promptChip1 && (
                      <button
                        type="button"
                        data-testid="preview-prompt-chip-1"
                        onClick={() =>
                          setPreviewReviewText((prev) =>
                            prev ? `${prev} It solved our biggest bottleneck.` : 'It solved our biggest bottleneck.'
                          )
                        }
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer hover:opacity-90 ${activeTemplate.previewInputBg}`}
                      >
                        {promptChip1}
                      </button>
                    )}
                    {promptChip2 && (
                      <button
                        type="button"
                        data-testid="preview-prompt-chip-2"
                        onClick={() =>
                          setPreviewReviewText((prev) =>
                            prev ? `${prev} My favorite feature is the 1-click setup.` : 'My favorite feature is the 1-click setup.'
                          )
                        }
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer hover:opacity-90 ${activeTemplate.previewInputBg}`}
                      >
                        {promptChip2}
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    maxLength={600}
                    data-testid="preview-review-input"
                    value={previewReviewText}
                    onChange={(e) => setPreviewReviewText(e.target.value)}
                    placeholder={
                      previewLang === 'hi'
                        ? 'Apna honest experience English ya Hinglish mein likhein...'
                        : `What did you love most? Share your authentic thoughts about ${cleanDefaultSlug}...`
                    }
                    className={`w-full rounded-xl border p-3 text-xs leading-relaxed focus:outline-none ${activeTemplate.previewInputBg}`}
                  />
                </div>
              ) : (
                <div className={`rounded-xl border border-dashed p-5 text-center space-y-2 ${activeTemplate.previewInputBg}`}>
                  <Video className="w-7 h-7 mx-auto text-purple-400" />
                  <p className="text-xs font-bold">Record or Upload a 30-Second Video Review</p>
                </div>
              )}

              {/* Name & Designation Inputs (High-Contrast & Editable) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${activeTemplate.previewTextSecondary}`}>
                    NAME
                  </label>
                  <input
                    type="text"
                    data-testid="preview-name-input"
                    value={previewName}
                    onChange={(e) => setPreviewName(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none ${activeTemplate.previewInputBg}`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${activeTemplate.previewTextSecondary}`}>
                    DESIGNATION
                  </label>
                  <input
                    type="text"
                    data-testid="preview-designation-input"
                    value={previewRole}
                    onChange={(e) => setPreviewRole(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold focus:outline-none ${activeTemplate.previewInputBg}`}
                  />
                </div>
              </div>

              {/* Profile Picture Selector (FIXED: Single Camera Icon & Single × Deselect!) */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${activeTemplate.previewInputBg}`}>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span>PROFILE PICTURE</span>
                  <span className="opacity-70 font-normal normal-case">Default Animated / Upload</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      data-testid="preview-avatar-male-btn"
                      onClick={() => setPreviewAvatarMode('male')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        previewAvatarMode === 'male'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200'
                      }`}
                    >
                      <span>🙋‍♂️</span>
                      <span>Male</span>
                      {previewAvatarMode === 'male' && <Check className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      data-testid="preview-avatar-female-btn"
                      onClick={() => setPreviewAvatarMode('female')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        previewAvatarMode === 'female'
                          ? 'bg-pink-600 text-white shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200'
                      }`}
                    >
                      <span>🙋‍♀️</span>
                      <span>Female</span>
                      {previewAvatarMode === 'female' && <Check className="w-3 h-3" />}
                    </button>

                    {/* Fixed: Single Camera Icon + "Upload" */}
                    <label
                      data-testid="preview-avatar-upload-btn"
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-800 border border-slate-200 text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:bg-slate-50"
                    >
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Fixed: Single × symbol + "Deselect" */}
                  {previewAvatarMode !== 'none' && (
                    <button
                      type="button"
                      data-testid="preview-avatar-deselect-btn"
                      onClick={() => setPreviewAvatarMode('none')}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer px-1"
                    >
                      × Deselect
                    </button>
                  )}
                </div>
              </div>

              {/* REAL-TIME GENERATED REVIEW PREVIEW STRIP (User sees the resulting review live!) */}
              <div className="p-3.5 rounded-xl bg-black/35 border border-white/15 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden border border-white/20">
                  {previewAvatarMode === 'upload' && previewCustomAvatar ? (
                    <img src={previewCustomAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : previewAvatarMode === 'male' ? (
                    '🙋‍♂️'
                  ) : previewAvatarMode === 'female' ? (
                    '🙋‍♀️'
                  ) : (
                    (previewName || 'R').slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white truncate">
                      {previewName || 'Your Name'}{' '}
                      <span className="font-normal text-slate-300">· {previewRole || 'Customer'}</span>
                    </p>
                    <span className="text-amber-400 text-xs shrink-0">
                      {'★'.repeat(previewRating)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 italic line-clamp-2 mt-0.5">
                    “{previewReviewText || 'Your real-time review preview appears here as you type...'}”
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                className="w-full py-3 rounded-xl text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                Submit Testimonial →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* BOTTOM SECTION: TEMPLATES COLLECTION (3 Default + 1 Customizable Pro) */}
      {/* ===================================================================== */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Templates Collection</h2>
              <p className="text-xs text-slate-500">
                Choose from 3 default themes or unlock the 4th <strong>Customizable Hero Background</strong> template (Pro & Agency).
              </p>
            </div>
          </div>

          {selectedTemplateId === 'custom_hero' && (
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-xs shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Background Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleHeroBgUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FORM_TEMPLATES.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;
            const isCustomHero = tpl.type === 'customizable';

            return (
              <div
                key={tpl.id}
                data-testid={`template-${tpl.id}`}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-600 ring-2 ring-purple-600/15 bg-purple-50/20'
                    : 'border-slate-200/80 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-slate-900 leading-snug">
                      {tpl.name}
                    </span>
                    {isCustomHero && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 shrink-0">
                        <Crown className="w-3 h-3 text-amber-600" />
                        <span>Pro & Agency</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{tpl.tagline}</p>

                  {isCustomHero && userPlan !== 'starter' && (
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Change Background Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroBgUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Single clean footer status (Fixes duplicate "Applied ✓" badge bug) */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: tpl.accentColor }}
                  />
                  <span className="font-bold text-purple-600">
                    {isSelected ? 'Applied ✓' : 'Apply →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* SUBMISSIONS QUEUE FOOTER BAR                                          */}
      {/* ===================================================================== */}
      <section className="rounded-2xl bg-[#F5F0FF] border border-purple-200/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white text-purple-600 flex items-center justify-center shadow-2xs shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {pendingQueueCount} Submission{pendingQueueCount === 1 ? '' : 's'} in Queue
            </h3>
            <p className="text-xs text-slate-600">
              Review, approve, and publish authentic stories to your Proof & Embeds studio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onNavigateToProof) onNavigateToProof();
            else window.location.href = '/proof';
          }}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer self-start sm:self-center"
        >
          Moderate →
        </button>
      </section>
    </div>
  );
}
