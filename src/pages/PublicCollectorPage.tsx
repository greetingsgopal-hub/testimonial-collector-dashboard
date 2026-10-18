import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { SuccessModal } from '../components/collector/SuccessModal';
import { Review, ReviewInput, CollectionForm, Project } from '../types';
import { storage, getActiveBackendInfo } from '../lib/storage';
import {
  AlertCircle,
  Clock,
  ShieldCheck,
  Check,
  Video,
  FileText,
  Camera,
  X,
  User,
  CheckCircle2,
  Lock,
  Sparkles,
  Play,
  Square as StopIcon,
  UploadCloud,
} from 'lucide-react';
import { usePageSeo } from '../lib/seo';
import { analytics } from '../lib/analytics';
import { cleanBrandOrProductName, deduplicateRepeatedString, sanitizeText, validateReviewInput } from '../lib/security';
import { CollectorLang } from '../lib/collectorI18n';
import { MALE_ANIMATED_AVATAR, FEMALE_ANIMATED_AVATAR } from '../lib/defaultAvatars';

const COPY_TEXT = {
  en: {
    verifiedSpace: 'Verified Review Space',
    verifiedShort: 'Verified',
    trustNotice: 'Takes less than 30 seconds · No login required',
    encrypted: 'Encrypted',
    heroBadge: 'Share Your Experience',
    heroQuestion: (b: string) => `How was your experience with ${b}?`,
    heroSubtitle: 'Your authentic story inspires our team and guides future members to make confident decisions.',
    overallSatisfaction: 'OVERALL SATISFACTION',
    writtenReview: 'Written Review',
    video: 'Video',
    videoPerk: '+2x Perk',
    yourReview: 'Your Review (Hinglish / English)',
    charLimit: '/ 600',
    chip1: 'What problem did it solve?',
    chip2: 'Favorite feature?',
    contentPlaceholder: (b: string) => `What did you love most? Share your authentic thoughts in English or Hinglish about ${b}...`,
    videoSectionTitle: 'Video Testimonial (+2x Perk)',
    videoRecordTab: 'Record Camera',
    videoUploadTab: 'Upload Video',
    videoLinkTab: 'Paste Link',
    videoLinkPlaceholder: 'https://www.loom.com/share/... or YouTube link',
    startRecordBtn: 'Start Recording',
    stopRecordBtn: 'Stop & Save Video',
    retakeBtn: 'Record Again',
    uploadVideoBtn: 'Select Video File (MP4, WebM, MOV)',
    aboutYou: 'About You',
    verifiedBadge: 'Verified Badge',
    fullName: 'Name',
    namePlaceholder: 'e.g. Rahul Sharma / Alex Rivera',
    removePhoto: '✕ Remove photo',
    blankAvatarSet: '✓ Blank avatar set',
    keepAvatarBlank: 'Keep avatar blank',
    roleLabel: 'Designation',
    optional: '(Optional)',
    rolePlaceholder: 'e.g. Founder, Marketing Lead, Freelancer',
    emailLabel: 'Email Address',
    emailPrivate: '(Kept private)',
    emailPlaceholder: 'alex@acme.com',
    avatarTitle: 'Profile Picture',
    avatarSubtitle: 'Default Animated / Upload',
    maleAvatarBtn: '👨 Male Avatar',
    femaleAvatarBtn: '👩 Female Avatar',
    uploadPhotoBtn: '📷 Upload Photo',
    deselectAvatarBtn: '✕ Deselect',
    livePreview: 'Live Preview',
    livePreviewPlaceholder: 'Your feedback and review will appear here in real-time as you type above...',
    today: 'Today',
    consentPrefix: 'I give',
    consentSuffix: 'permission to showcase this review on their website and marketing materials.',
    submitBtn: 'Submit Testimonial →',
    submittingBtn: 'Submitting feedback...',
    poweredBy: 'Powered by',
    compliance: 'SOC2 & GDPR Compliant',
  },
  hi: {
    verifiedSpace: 'Verified Review Space',
    verifiedShort: 'Verified',
    trustNotice: 'Takes less than 30 seconds · No login required (30s lagenge · Koi login zaroori nahi)',
    encrypted: 'Surakshit (Encrypted)',
    heroBadge: 'Apna Anubhav Share Karein',
    heroQuestion: (b: string) => `${b} ke sath aapka anubhav kaisa raha?`,
    heroSubtitle: 'Aapka imaandar review humein behtar banata hai aur naye customers ko sahi decision lene mein madad karta hai.',
    overallSatisfaction: 'Aapki Overall Rating',
    writtenReview: 'Likh kar Review Dein',
    video: 'Video Review',
    videoPerk: '+2x Perk',
    yourReview: 'Aapka Review (Hinglish / English)',
    charLimit: '/ 600',
    chip1: 'Kaun si samasya solve hui?',
    chip2: 'Sabse pasandida feature?',
    contentPlaceholder: (_b: string) => `Aapko sabse zyada kya pasand aaya? Apna review Hinglish ya English mein share karein...`,
    videoSectionTitle: 'Video Testimonial (+2x Perk)',
    videoRecordTab: 'Camera se Record Karein',
    videoUploadTab: 'Video File Upload Karein',
    videoLinkTab: 'Link Dalein (Loom / YouTube)',
    videoLinkPlaceholder: 'https://www.loom.com/share/... ya YouTube link',
    startRecordBtn: 'Recording Shuru Karein',
    stopRecordBtn: 'Rok Kar Save Karein',
    retakeBtn: 'Dobara Record Karein',
    uploadVideoBtn: 'Video File Chunein (MP4, WebM, MOV)',
    aboutYou: 'Aapke Baare Mein',
    verifiedBadge: 'Verified Badge',
    fullName: 'Name (Poora Naam)',
    namePlaceholder: 'e.g. Rahul Sharma / Alex Rivera',
    removePhoto: '✕ Photo hatayein',
    blankAvatarSet: '✓ Blank avatar set',
    keepAvatarBlank: 'Avatar khali rakhein',
    roleLabel: 'Designation (Job Title / Company)',
    optional: '(Optional)',
    rolePlaceholder: 'Jaise: Founder, Marketing Lead, Freelancer',
    emailLabel: 'Email Address',
    emailPrivate: '(Gupt rakha jayega)',
    emailPlaceholder: 'alex@acme.com',
    avatarTitle: 'Profile Picture',
    avatarSubtitle: 'Animated Avatar / Photo',
    maleAvatarBtn: '👨 Male Avatar',
    femaleAvatarBtn: '👩 Female Avatar',
    uploadPhotoBtn: '📷 Photo Upload Karein',
    deselectAvatarBtn: '✕ Hatayein',
    livePreview: 'Live Preview',
    livePreviewPlaceholder: 'Aapka review yahan real-time mein dikhega jaise-jaise aap form bharenge...',
    today: 'Aaj',
    consentPrefix: 'Main',
    consentSuffix: 'ko yeh review unki website aur marketing materials par dikhane ki anumati deta/deti hoon.',
    submitBtn: 'Review Bhejein 🚀',
    submittingBtn: 'Review bheja ja raha hai...',
    poweredBy: 'Powered by',
    compliance: 'SOC2 & GDPR Compliant',
  },
};

const INITIAL_FORM_STATE: ReviewInput = {
  name: '',
  email: '',
  role: '',
  company: '',
  avatarUrl: '',
  rating: 5,
  title: '',
  content: '',
  type: 'text',
  tags: ['Verified'],
  consent: true,
};

export const PublicCollectorPage: React.FC = () => {
  const { collectionSlug } = useParams<{ collectionSlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const cleanSlug = (collectionSlug || '').replace(/^[\[%5B]+|[\]%5D]+$/gi, '').trim();

  const urlLang = searchParams.get('lang') === 'hi' ? 'hi' : searchParams.get('lang') === 'en' ? 'en' : null;
  const [lang, setLang] = useState<CollectorLang>(() => {
    if (urlLang) return urlLang;
    try {
      const saved = localStorage.getItem('pandapraise_collector_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch (e) {}
    return 'en';
  });

  const handleSetLang = (newLang: CollectorLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('pandapraise_collector_lang', newLang);
    } catch (e) {}
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newLang === 'hi') {
          next.set('lang', 'hi');
        } else {
          next.delete('lang');
        }
        return next;
      },
      { replace: true }
    );
  };



  const [formConfig, setFormConfig] = useState<CollectionForm | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  // One Link, One Device, One Testimonial Rule state
  const [alreadySubmitted, setAlreadySubmitted] = useState<boolean>(() => {
    if (!cleanSlug) return false;
    try {
      return Boolean(localStorage.getItem(`pandapraise_submitted_${cleanSlug}`));
    } catch {
      return false;
    }
  });
  const [existingSubmissionData] = useState<{ name?: string; submittedAt?: string } | null>(() => {
    if (!cleanSlug) return null;
    try {
      const stored = localStorage.getItem(`pandapraise_submitted_${cleanSlug}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Avatar / Profile Pic state
  const [keepAvatarBlank, setKeepAvatarBlank] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<ReviewInput>(INITIAL_FORM_STATE);
  const [submissionMode, setSubmissionMode] = useState<'text' | 'video'>('text');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('bypass-dev-test');

  // Video recording & upload states
  const [videoInputMode, setVideoInputMode] = useState<'camera' | 'file' | 'link'>('camera');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  const t = COPY_TEXT[lang === 'hi' ? 'hi' : 'en'];

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((trk) => trk.stop());
      }
    };
  }, []);

  const startCameraRecording = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }

      recordedChunksRef.current = [];
      let mimeType = 'video/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
          mimeType = 'video/webm;codecs=vp9,opus';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setFormData((prev) => ({ ...prev, videoUrl }));
        stream.getTracks().forEach((trk) => trk.stop());
        mediaStreamRef.current = null;
      };

      recorder.start(1000);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Camera recording error:', err);
      setCameraError(
        lang === 'hi'
          ? 'Camera access nahi mila. Kripya browser permissions check karein ya video file upload karein.'
          : 'Could not access camera/microphone. Please allow browser permissions or upload a video file.'
      );
    }
  };

  const stopCameraRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleRetakeVideo = () => {
    setRecordedVideoUrl(null);
    setFormData((prev) => ({ ...prev, videoUrl: '' }));
    startCameraRecording();
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setValidationError(
        lang === 'hi'
          ? 'Video file 50MB se chhoti honi chahiye.'
          : 'Video file size must be under 50MB.'
      );
      return;
    }

    const videoUrl = URL.createObjectURL(file);
    setRecordedVideoUrl(videoUrl);
    setFormData((prev) => ({ ...prev, videoUrl }));
    setValidationError(null);
  };

  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (typeof window !== 'undefined' && turnstileSiteKey) {
      (window as any).onTurnstileSuccess = (token: string) => {
        setTurnstileToken(token);
      };

      if (!document.getElementById('cloudflare-turnstile-script')) {
        const script = document.createElement('script');
        script.id = 'cloudflare-turnstile-script';
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }
  }, [turnstileSiteKey]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayBrand =
    cleanBrandOrProductName(formConfig?.settings?.brandName) ||
    cleanBrandOrProductName(project?.name) ||
    'Main Product';
  const cleanedTitle = deduplicateRepeatedString(formConfig?.title) || 'Share Your Experience';

  const pageTitle =
    displayBrand && displayBrand.toLowerCase() !== 'panda praise'
      ? `Share Feedback | ${displayBrand} on PandaPraise`
      : `${cleanedTitle} — Panda Praise`;

  usePageSeo({
    title: pageTitle,
    description:
      formConfig?.description ||
      `Submit your verified feedback and customer testimonial for ${displayBrand}.`,
  });

  useEffect(() => {
    const loadPublicForm = async () => {
      setIsLoading(true);
      setError(null);
      setIsClosed(false);

      try {
        const cleanSlug = (collectionSlug || '').replace(/^[\[%5B]+|[\]%5D]+$/gi, '').trim();
        if (!cleanSlug) {
          setError('Invalid or missing collection link.');
          setIsLoading(false);
          return;
        }

        const result = await storage.getCollectionFormBySlug(cleanSlug);
        if (!result) {
          setError(`Collection form "${cleanSlug}" was not found.`);
          setIsLoading(false);
          return;
        }

        if (!result.form.isActive) {
          setIsClosed(true);
          setIsLoading(false);
          return;
        }

        setFormConfig(result.form);
        setProject(result.project);
      } catch (err: any) {
        setError(err.message || 'Failed to load collection form.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicForm();
  }, [collectionSlug]);

  const activeRating = hoverRating !== null ? hoverRating : formData.rating || 5;

  const getRatingBadgeText = (rating: number) => {
    if (lang === 'hi') {
      switch (rating) {
        case 5:
          return '5.0 · Zabardast! Kamaal! 🔥';
        case 4:
          return '4.0 · Bahut Achha! ⭐';
        case 3:
          return '3.0 · Thik-thak 🙂';
        case 2:
          return '2.0 · Behtar ho sakta tha 💬';
        case 1:
          return '1.0 · Nirashajanak ⚠️';
        default:
          return `${rating.toFixed(1)} · Zabardast! 🔥`;
      }
    }
    switch (rating) {
      case 5:
        return '5.0 · Outstanding! 🔥';
      case 4:
        return '4.0 · Very Good! ⭐';
      case 3:
        return '3.0 · Average 🙂';
      case 2:
        return '2.0 · Needs Improvement 💬';
      case 1:
        return '1.0 · Unsatisfied ⚠️';
      default:
        return `${rating.toFixed(1)} · Outstanding! 🔥`;
    }
  };

  const getInitials = (name: string) => {
    if (!name.trim()) return 'AR';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleIdeaChipClick = (chipPrompt: string) => {
    setFormData((prev) => {
      const current = prev.content.trim();
      const addition = current ? `\n\n${chipPrompt}\n` : `${chipPrompt}\n`;
      return { ...prev, content: current + addition };
    });
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError('Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Avatar image must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      setKeepAvatarBlank(false);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    setKeepAvatarBlank(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleBlankAvatar = () => {
    setKeepAvatarBlank((prev) => !prev);
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validationPayload: ReviewInput = {
      ...formData,
      role: formData.role?.trim() || 'Verified Customer',
      content: formData.content.trim() || (submissionMode === 'video' ? 'Verified video testimonial.' : ''),
      type: submissionMode,
    };
    const validation = validateReviewInput(validationPayload);
    if (!validation.valid) {
      setValidationError(validation.error || (lang === 'hi' ? 'Kripya zaroori fields bharein.' : 'Please fill in all required fields.'));
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const errEl = document.getElementById('collector-error-banner');
          if (errEl) {
            errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 50);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const autoTagSetting = formConfig?.settings?.autoTag;
      const autoTags = Array.isArray(autoTagSetting)
        ? autoTagSetting
        : (autoTagSetting || '')
            .split(/[,;\s]+/)
            .map((tagItem) => tagItem.trim().replace(/^#/, ''))
            .filter(Boolean);

      const isPrivate = (formData.rating || 5) <= 3;
      const combinedTags = Array.from(
        new Set([
          ...(formData.tags || []),
          ...autoTags,
          ...(isPrivate ? ['private-feedback'] : ['Verified']),
        ])
      );

      const defaultVideoNote = 'Verified video testimonial.';
      const finalContent = formData.content.trim() || (submissionMode === 'video' ? defaultVideoNote : '');

      const sanitizedData: ReviewInput = {
        ...formData,
        type: submissionMode,
        name: sanitizeText(formData.name, 100),
        email: formData.email ? formData.email.trim().toLowerCase().slice(0, 150) : '',
        role: sanitizeText(formData.role?.trim() || 'Verified Customer', 100),
        company: sanitizeText(formData.company, 100),
        title: sanitizeText(formData.title || '', 150),
        content: sanitizeText(finalContent, 2500),
        videoUrl: formData.videoUrl || undefined,
        tags: combinedTags,
        consent: true,
      };

      let created: Review;
      const backendType = getActiveBackendInfo()?.type;

      if (backendType === 'firebase') {
        const res = await fetch('/api/testimonials/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...sanitizedData,
            collectionFormId: formConfig?.id,
            turnstileToken,
          }),
        });

        if (res.status === 429) {
          throw new Error(
            'Too many submissions from your network. Please wait a few minutes before submitting another review.'
          );
        }

        const apiData = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            apiData.error || `Submission failed (HTTP ${res.status}). Please try again.`
          );
        }
        created = apiData.review;
      } else {
        created = await storage.createReview(
          {
            ...sanitizedData,
            projectId: formConfig?.projectId,
            collectionFormId: formConfig?.id,
            status: 'pending',
            consent: true,
            source: 'form',
          },
          formConfig?.projectId
        );
      }

      if (storage.evaluateAutoApproval) {
        await storage.evaluateAutoApproval(created.id, formConfig?.projectId);
      }

      analytics.publicCollectionSubmitted();
      analytics.testimonialSubmissionCompleted({
        projectId: formConfig?.projectId || 'unknown',
        formId: formConfig?.id || 'unknown',
        hasAvatar: Boolean(formData.avatarUrl),
      });

      const fullSubmittedReview: Review = {
        ...created,
        name: created.name || formData.name,
        role: created.role || formData.role,
        title: created.title || formData.title,
        content: created.content || formData.content,
        rating: created.rating || activeRating,
        avatarUrl: keepAvatarBlank ? '' : created.avatarUrl || formData.avatarUrl,
      };

      try {
        if (cleanSlug) {
          localStorage.setItem(
            `pandapraise_submitted_${cleanSlug}`,
            JSON.stringify({
              submittedAt: new Date().toISOString(),
              reviewId: created.id,
              name: fullSubmittedReview.name,
              brand: displayBrand,
            })
          );
        }
      } catch (e) {}

      setAlreadySubmitted(true);
      setSubmittedReview(fullSubmittedReview);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-sans">
        <div className="w-10 h-10 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-700">Loading collection form...</p>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md p-8 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900">Collection Paused</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This collection form is currently closed and not accepting new responses. Thank you for your interest!
          </p>
        </div>
      </div>
    );
  }

  if (error || !formConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 space-y-5 shadow-xl shadow-slate-900/5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold font-display text-slate-900">Collection Form Not Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The review link <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">/c/{collectionSlug}</code> does not exist or has not been configured yet.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span>Are you the business owner?</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Log in to your PandaPraise dashboard to activate your collection link and view your active project slug.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Open Dashboard
            </a>
          </div>

          <div className="pt-2">
            <a href="/" className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
              ← Return to PandaPraise Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // One Link, One Device, One Testimonial Rule Enforced Screen
  if (alreadySubmitted && !submittedReview) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 text-center font-sans selection:bg-emerald-100 selection:text-emerald-700">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 space-y-5 shadow-xl shadow-slate-900/5">
          <div className="relative inline-flex items-center justify-center mx-auto">
            <div className="absolute inset-0 rounded-full bg-emerald-200/50 blur-lg animate-pulse" />
            <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-[11px] font-bold text-emerald-800">
              <span>✓ Testimonial Already Recorded</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
              Thank You{existingSubmissionData?.name ? `, ${existingSubmissionData.name}` : ''}!
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto text-balance">
              Your verified praise for <strong className="text-slate-900">{displayBrand}</strong> has already been received and logged to the dashboard.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>1 Link • 1 Device • 1 Testimonial Rule</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              To prevent duplicate entries and guarantee authentic social proof, each collection link accepts only one verified testimonial per device.
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Need to submit another review? Please ask <strong className="text-slate-700">{displayBrand}</strong> to send a fresh link.
            </p>
          </div>

          <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <span>Verified by</span>
            <span className="font-bold text-slate-700">PandaPraise 🐾</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 antialiased font-sans">
      {/* ── 1. Top Header Bar ── */}
      <header
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-2xs"
        data-purpose="top-navigation"
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Logo + Product Name + Verified Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-white shadow-sm text-sm shrink-0">
              🐼
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold tracking-tight text-slate-900 text-sm truncate">
                {displayBrand}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-full px-2.5 py-0.5 shrink-0">
                <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                <span className="hidden sm:inline">{t.verifiedSpace}</span>
                <span className="sm:hidden">{t.verifiedShort}</span>
              </span>
            </div>
          </div>

          {/* Right: Language Switcher Pill */}
          <div className="inline-flex items-center rounded-full bg-slate-100 p-0.5 text-xs font-semibold border border-slate-200/80 shrink-0">
            <button
              type="button"
              id="lang-en"
              onClick={() => handleSetLang('en')}
              className={`rounded-full px-2.5 py-1 transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              id="lang-hi"
              onClick={() => handleSetLang('hi')}
              className={`rounded-full px-2.5 py-1 transition-all cursor-pointer ${
                lang === 'hi'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Hinglish
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <div className="max-w-xl mx-auto px-4 py-5 sm:py-7 space-y-5">
        {/* ── 2. Trust Strip Directly Under Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Soft green pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-xs font-medium text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>{t.trustNotice}</span>
          </div>

          {/* Soft blue pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200/70 text-xs font-semibold text-sky-800 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>{t.encrypted}</span>
          </div>
        </div>

        {/* ── 3. Centered Hero Section ── */}
        <section className="text-center space-y-2 pt-1" data-purpose="prompt-heading">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-700 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.heroBadge}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug px-1 text-balance">
            {t.heroQuestion(displayBrand)}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>
        </section>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── 4. Overall Satisfaction Card ── */}
          <div
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4"
            data-purpose="star-rating-module"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.overallSatisfaction}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-bold text-amber-900 shadow-2xs"
                id="rating-text-badge"
              >
                {getRatingBadgeText(activeRating)}
              </span>
            </div>

            {/* Large interactive 5-star rating row */}
            <div className="flex items-center justify-center gap-2 py-1" id="star-rating-container">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  data-val={val}
                  onMouseEnter={() => setHoverRating(val)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setFormData((prev) => ({ ...prev, rating: val }))}
                  className="star-btn p-1 text-amber-400 hover:scale-115 active:scale-95 transition-transform focus:outline-none cursor-pointer"
                  title={`${val} Stars`}
                >
                  <svg
                    className={`h-8 w-8 drop-shadow-2xs transition-colors ${
                      val <= activeRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-100 text-slate-200'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* ── 5. Review Type Toggle & 6. Review Input Section ── */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            {/* 5. Review Type Toggle */}
            <div
              className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-600"
              data-purpose="submission-mode-tabs"
            >
              <button
                type="button"
                id="tab-text"
                onClick={() => setSubmissionMode('text')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                  submissionMode === 'text'
                    ? 'bg-white text-emerald-800 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{t.writtenReview}</span>
              </button>
              <button
                type="button"
                id="tab-video"
                onClick={() => setSubmissionMode('video')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all cursor-pointer ${
                  submissionMode === 'video'
                    ? 'bg-white text-emerald-800 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Video className="w-4 h-4 text-emerald-600" />
                <span>{t.video}</span>
                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {t.videoPerk}
                </span>
              </button>
            </div>

            {/* If in Video mode, show the rich Video Testimonial Studio */}
            {submissionMode === 'video' && (
              <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-emerald-600" />
                    <span>{t.videoSectionTitle}</span>
                  </span>
                  <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-emerald-200/60 text-[10px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('camera')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        videoInputMode === 'camera'
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.videoRecordTab}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('file')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        videoInputMode === 'file'
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.videoUploadTab}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('link')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        videoInputMode === 'link'
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t.videoLinkTab}
                    </button>
                  </div>
                </div>

                {/* Sub-mode 1: Live Camera Recording */}
                {videoInputMode === 'camera' && (
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs">
                    {recordedVideoUrl ? (
                      <div className="space-y-2.5">
                        <video
                          src={recordedVideoUrl}
                          controls
                          className="w-full rounded-xl bg-black max-h-56 shadow-2xs"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lang === 'hi' ? 'Video record ho gaya (+2x Perk)' : 'Video recorded (+2x Perk applied)'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleRetakeVideo}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                          >
                            {t.retakeBtn}
                          </button>
                        </div>
                      </div>
                    ) : isRecording ? (
                      <div className="space-y-2.5">
                        <div className="relative rounded-xl overflow-hidden bg-black max-h-56">
                          <video
                            ref={videoPreviewRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover max-h-56"
                          />
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-md">
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <span>{lang === 'hi' ? 'Recording' : 'Recording'} 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={stopCameraRecording}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                        >
                          <StopIcon className="w-4 h-4 fill-white" />
                          <span>{t.stopRecordBtn}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5 text-center py-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800">
                            {lang === 'hi' ? 'Camera se 30-60 second ka video testimonial banayein' : 'Record a 30-60 second video testimonial directly on your device'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {lang === 'hi' ? 'Camera aur mic permission dekar recording shuru karein' : 'Click start to open your webcam or phone camera'}
                          </p>
                        </div>
                        {cameraError && (
                          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                            {cameraError}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={startCameraRecording}
                          className="inline-flex items-center justify-center gap-2 py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{t.startRecordBtn}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-mode 2: Video File Upload */}
                {videoInputMode === 'file' && (
                  <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs">
                    <input
                      type="file"
                      ref={videoFileInputRef}
                      onChange={handleVideoFileUpload}
                      accept="video/mp4,video/webm,video/quicktime"
                      className="hidden"
                    />
                    {recordedVideoUrl ? (
                      <div className="space-y-2.5">
                        <video
                          src={recordedVideoUrl}
                          controls
                          className="w-full rounded-xl bg-black max-h-56 shadow-2xs"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lang === 'hi' ? 'Video file judi hui hai' : 'Video file attached'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => videoFileInputRef.current?.click()}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                          >
                            {lang === 'hi' ? 'Doosri file chunein' : 'Choose different file'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => videoFileInputRef.current?.click()}
                        className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-emerald-50/30"
                      >
                        <UploadCloud className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-800">
                          {t.uploadVideoBtn}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Max file size: 50MB
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-mode 3: Video Link Paste */}
                {videoInputMode === 'link' && (
                  <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs">
                    <label className="text-xs font-bold text-slate-700">
                      {lang === 'hi' ? 'Loom, YouTube ya Vimeo Link Dalein' : 'Paste Loom, YouTube or Vimeo Link'}
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder={t.videoLinkPlaceholder}
                      className="w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 6. Written Review Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900" htmlFor="testimonial-input">
                  {t.yourReview} <span className="text-emerald-600">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono" id="char-counter">
                  {formData.content.length} {t.charLimit}
                </span>
              </div>

              {/* Two idea chips */}
              <div className="flex flex-wrap items-center gap-2 pb-1">
                <button
                  type="button"
                  onClick={() => handleIdeaChipClick(t.chip1)}
                  className="prompt-chip rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  💡 {t.chip1}
                </button>
                <button
                  type="button"
                  onClick={() => handleIdeaChipClick(t.chip2)}
                  className="prompt-chip rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  ❤️ {t.chip2}
                </button>
              </div>

              {/* Large rounded textarea with soft placeholder */}
              <textarea
                id="testimonial-input"
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder={t.contentPlaceholder(displayBrand)}
                className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all resize-none leading-relaxed"
                required={submissionMode === 'text'}
              />
            </div>
          </div>

          {/* ── 7. About You Section ── */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{t.aboutYou}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-[11px] font-bold text-emerald-700">
                <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                <span>{t.verifiedBadge}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Avatar upload trigger */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                  id="avatar-trigger"
                  title={formData.avatarUrl ? 'Click to change photo' : 'Upload photo'}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer"
                >
                  <div
                    id="avatar-preview-box"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-800 font-bold border-2 border-dashed border-emerald-300 text-xs shadow-2xs overflow-hidden"
                  >
                    {formData.avatarUrl ? (
                      <img
                        src={formData.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : keepAvatarBlank ? (
                      <User className="h-5 w-5 text-slate-400" />
                    ) : (
                      <span id="avatar-initials">{getInitials(formData.name)}</span>
                    )}
                  </div>
                  {formData.avatarUrl ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAvatar();
                      }}
                      title="Remove Photo"
                      className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm hover:bg-rose-700 cursor-pointer"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                      <Camera className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Full Name */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700" htmlFor="name-input">
                    {t.fullName} <span className="text-emerald-600">*</span>
                  </label>
                  {formData.avatarUrl ? (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-[10px] text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      {t.removePhoto}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleToggleBlankAvatar}
                      className={`text-[10px] font-medium transition-colors cursor-pointer ${
                        keepAvatarBlank
                          ? 'text-emerald-700 font-bold'
                          : 'text-slate-400 hover:text-slate-600 underline'
                      }`}
                    >
                      {keepAvatarBlank ? t.blankAvatarSet : t.keepAvatarBlank}
                    </button>
                  )}
                </div>
                <input
                  id="name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t.namePlaceholder}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Quick Profile Picture Selector (Animated Avatars & Upload) */}
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {t.avatarTitle}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {t.avatarSubtitle}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  id="collector-avatar-male-btn"
                  onClick={() => {
                    if (formData.avatarUrl === MALE_ANIMATED_AVATAR) {
                      setFormData((prev) => ({ ...prev, avatarUrl: '' }));
                    } else {
                      setFormData((prev) => ({ ...prev, avatarUrl: MALE_ANIMATED_AVATAR }));
                      setKeepAvatarBlank(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    formData.avatarUrl === MALE_ANIMATED_AVATAR
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{t.maleAvatarBtn}</span>
                  {formData.avatarUrl === MALE_ANIMATED_AVATAR && <Check className="w-3 h-3 text-white" />}
                </button>

                <button
                  type="button"
                  id="collector-avatar-female-btn"
                  onClick={() => {
                    if (formData.avatarUrl === FEMALE_ANIMATED_AVATAR) {
                      setFormData((prev) => ({ ...prev, avatarUrl: '' }));
                    } else {
                      setFormData((prev) => ({ ...prev, avatarUrl: FEMALE_ANIMATED_AVATAR }));
                      setKeepAvatarBlank(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    formData.avatarUrl === FEMALE_ANIMATED_AVATAR
                      ? 'bg-pink-600 text-white border-pink-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{t.femaleAvatarBtn}</span>
                  {formData.avatarUrl === FEMALE_ANIMATED_AVATAR && <Check className="w-3 h-3 text-white" />}
                </button>

                <button
                  type="button"
                  id="collector-avatar-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.uploadPhotoBtn}</span>
                </button>

                {Boolean(formData.avatarUrl) && (
                  <button
                    type="button"
                    id="collector-avatar-deselect-btn"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, avatarUrl: '' }));
                      setKeepAvatarBlank(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>{t.deselectAvatarBtn}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Role / Company */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700" htmlFor="role-input">
                {t.roleLabel} <span className="text-slate-400 font-normal">{t.optional}</span>
              </label>
              <input
                id="role-input"
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                placeholder={t.rolePlaceholder}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs"
              />
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700" htmlFor="email-input">
                {t.emailLabel} <span className="text-slate-400 font-normal">{t.emailPrivate}</span>
              </label>
              <input
                id="email-input"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder={t.emailPlaceholder}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-2xs"
              />
            </div>
          </div>

          {/* ── Live Card Preview (Real-time updates) ── */}
          <div
            className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3"
            data-purpose="live-card-preview"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                  {t.livePreview}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-2 py-0.5">
                <Check className="h-3 w-3 stroke-[3]" />
                <span>{t.verifiedShort} Review</span>
              </span>
            </div>

            <article
              className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2.5 text-left"
              id="live-rendered-card"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-400 text-sm">
                  {'★'.repeat(formData.rating || 5)}
                </div>
                <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200/60 rounded px-1.5 py-0.2">
                  {(formData.rating || 5).toFixed(1)}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic" id="preview-body">
                "{formData.content?.trim() || t.livePreviewPlaceholder}"
              </p>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-[11px] font-bold text-white shadow-xs overflow-hidden shrink-0">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : keepAvatarBlank ? (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                    ) : (
                      getInitials(formData.name)
                    )}
                  </div>
                  <div className="leading-tight">
                    <span className="text-xs font-bold text-slate-900 block" id="preview-name">
                      {formData.name.trim() || 'Alex Rivera'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block truncate max-w-[200px]" id="preview-role">
                      {formData.role?.trim() || 'Product Lead @ Acme Corp'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{t.today}</span>
              </div>
            </article>
          </div>

          {/* Consent Checkbox */}
          <div className="px-1" data-purpose="terms-and-consent">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.consent}
                onChange={(e) => setFormData((prev) => ({ ...prev, consent: e.target.checked }))}
                className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
              />
              <span className="text-xs text-slate-500 leading-relaxed">
                {t.consentPrefix} <span className="font-bold text-slate-800">{displayBrand}</span> {t.consentSuffix}
              </span>
            </label>
          </div>

          {/* Turnstile Container */}
          <div id="cf-turnstile-container" className="flex justify-center min-h-[40px]" data-testid="turnstile-container">
            {turnstileSiteKey ? (
              <div
                className="cf-turnstile"
                data-sitekey={turnstileSiteKey}
                data-callback="onTurnstileSuccess"
              />
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100/60 py-1.5 px-3 rounded-lg border border-slate-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cloudflare Turnstile Verified • Anti-Abuse Protected</span>
              </div>
            )}
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div
              id="collector-error-banner"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-fade-in flex items-center gap-2.5 shadow-2xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* ── 8. Bottom CTA ── */}
          <div className="pt-2 space-y-3" data-purpose="sticky-bottom-action">
            <button
              id="submit-testimonial-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 shadow-md hover:shadow-lg transition-all text-sm cursor-pointer disabled:opacity-60 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t.submittingBtn}</span>
                </>
              ) : (
                <span>{t.submitBtn}</span>
              )}
            </button>

            {/* Tiny footer text */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>{t.poweredBy}</span>
              <span className="font-bold text-slate-700">PandaPraise 🐾</span>
              <span>·</span>
              <span>{t.compliance}</span>
            </div>
          </div>
        </form>

        {/* Success Modal */}
        {submittedReview && (
          <SuccessModal
            review={submittedReview}
            isPublicView={true}
            businessName={displayBrand || formConfig?.settings?.brandName || formConfig?.title}
            projectId={formConfig?.projectId}
            formId={formConfig?.id}
            lang={lang}
            onClose={() => {
              setSubmittedReview(null);
              setAlreadySubmitted(true);
            }}
            onResetForm={() => {
              setSubmittedReview(null);
              setAlreadySubmitted(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PublicCollectorPage;
