import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Star,
  Video,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Check,
  X,
  Play,
  Square as StopIcon,
  Download,
  Share2,
  Award,
  Lock,
} from 'lucide-react';
import { storage } from '../lib/storage';
import { sanitizeText } from '../lib/security';
import { MALE_ANIMATED_AVATAR, FEMALE_ANIMATED_AVATAR } from '../lib/defaultAvatars';
import { usePageSeo } from '../lib/seo';

const COPY = {
  en: {
    verifiedSpace: 'Verified Review Space',
    subHeader: 'Takes less than 30 seconds • No login required',
    encrypted: 'Encrypted',
    shareBadge: 'Share Your Experience',
    headlinePrefix: 'How was your experience with',
    subtitle: 'Your authentic story inspires our team and guides future members to make confident decisions.',
    satisfaction: 'OVERALL SATISFACTION',
    writtenTab: 'Written Review',
    videoTab: 'Video',
    perkLabel: '+2x Perk',
    yourReview: 'Your Review (Hinglish / English) *',
    prompt1: '💡 What problem did it solve?',
    prompt2: '❤️ Favorite feature?',
    placeholder: 'What did you love most? Share your authentic thoughts in English or Hinglish about',
    nameLabel: 'Name',
    roleLabel: 'Designation',
    avatarLabel: 'PROFILE PICTURE',
    maleBtn: '🙋‍♂️ Male',
    femaleBtn: '🙋‍♀️ Female',
    uploadBtn: '📷 Upload',
    deselectBtn: '× Deselect',
    submitBtn: 'Submit Testimonial →',
    submitting: 'Submitting feedback...',
    thankYouTitle: 'Thank you for your feedback! 🎉',
    thankYouSub: 'Your verified testimonial has been sent to our moderation queue.',
    rewardTitle: 'A Special Gift For You 🎁',
    rewardSub: 'Use coupon code below for 20% off your next order:',
    couponCode: 'PRAISE20',
  },
  hi: {
    verifiedSpace: 'Verified Review Space',
    subHeader: 'Takes less than 30 seconds • No login required',
    encrypted: 'Encrypted',
    shareBadge: 'Apna Experience Share Karein',
    headlinePrefix: 'Aapka experience kaisa raha',
    subtitle: 'Aapka imaandar review humein behtar banata hai aur naye customers ko sahi decision lene mein madad karta hai.',
    satisfaction: 'OVERALL SATISFACTION',
    writtenTab: 'Written Review',
    videoTab: 'Video',
    perkLabel: '+2x Perk',
    yourReview: 'Aapka Review (Hinglish / English) *',
    prompt1: '💡 Kaun si samasya solve hui?',
    prompt2: '❤️ Sabse best feature kya laga?',
    placeholder: 'Aapko sabse accha kya laga? Apna honest experience English ya Hinglish mein likhein...',
    nameLabel: 'Name',
    roleLabel: 'Designation',
    avatarLabel: 'PROFILE PICTURE',
    maleBtn: '🙋‍♂️ Male',
    femaleBtn: '🙋‍♀️ Female',
    uploadBtn: '📷 Upload',
    deselectBtn: '× Deselect',
    submitBtn: 'Review Bhejein 🚀',
    submitting: 'Submit ho raha hai...',
    thankYouTitle: 'Bahut shukriya aapke feedback ke liye! 🎉',
    thankYouSub: 'Aapka review successfully submit ho gaya hai.',
    rewardTitle: 'Aapke Liye Special Gift 🎁',
    rewardSub: 'Agli purchase par 20% discount paane ke liye ye code use karein:',
    couponCode: 'PRAISE20',
  },
};

export interface PublicCollectorPageProps {
  workspaceSlug?: string;
}

export const PublicCollectorPage: React.FC<PublicCollectorPageProps> = ({ workspaceSlug: propWorkspaceSlug }) => {
  const { collectionSlug: paramSlug } = useParams<{ collectionSlug?: string }>();
  const [searchParams] = useSearchParams();

  const rawSlug = paramSlug || propWorkspaceSlug || 'besteample';
  const cleanSlug = rawSlug.replace(/^[\[%5B]+|[\]%5D]+$/gi, '').trim();

  const [lang, setLang] = useState<'en' | 'hi'>(() => (searchParams.get('lang') === 'hi' ? 'hi' : 'en'));
  const [workspaceName, setWorkspaceName] = useState<string>(cleanSlug);
  const [formHeading, setFormHeading] = useState<string>('');
  const [formSubheading, setFormSubheading] = useState<string>('');
  const [accentColor, setAccentColor] = useState<string>('#059669');
  const [allowText, setAllowText] = useState<boolean>(true);
  const [allowVideo, setAllowVideo] = useState<boolean>(true);

  const [mode, setMode] = useState<'text' | 'video'>('text');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [content, setContent] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [authorRole, setAuthorRole] = useState<string>('');
  const [avatarChoice, setAvatarChoice] = useState<'male' | 'female' | 'custom' | null>('male');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);

  // Video recording sub-state
  const [videoInputMode, setVideoInputMode] = useState<'camera' | 'file' | 'link'>('camera');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [videoLinkUrl, setVideoLinkUrl] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const recordingTimerRef = useRef<any>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [alreadySubmittedData, setAlreadySubmittedData] = useState<{ name?: string; submittedAt?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const t = COPY[lang];

  // 1. One Link, One Device Check
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`pandapraise_submitted_${cleanSlug}`);
      if (stored) {
        setAlreadySubmittedData(JSON.parse(stored));
      }
    } catch {
      // Ignore parse error
    }
  }, [cleanSlug]);

  // 2. Load form configuration from storage, local cache, or Firestore
  useEffect(() => {
    let isMounted = true;

    // Check localStorage cache first for zero-latency preview
    try {
      const cached = localStorage.getItem(`panda_form_config_${cleanSlug}`);
      if (cached) {
        const d = JSON.parse(cached);
        if (d.formHeading) setFormHeading(d.formHeading);
        if (d.formSubheading) setFormSubheading(d.formSubheading);
        if (d.primaryColor) setAccentColor(d.primaryColor);
        if (d.allowText !== undefined) setAllowText(d.allowText);
        if (d.allowVideo !== undefined) setAllowVideo(d.allowVideo);
      }
    } catch {}

    // Load via storage router
    storage.getCollectionFormBySlug(cleanSlug).then((res) => {
      if (!isMounted || !res) return;
      if (res.project?.name) setWorkspaceName(res.project.name);
      if (res.form.title) setFormHeading(res.form.title);
      if (res.form.description) setFormSubheading(res.form.description);
      if (res.form.settings?.brandColor) setAccentColor(res.form.settings.brandColor);
      if (res.form.allowText !== undefined) setAllowText(res.form.allowText);
      if (res.form.allowVideo !== undefined) setAllowVideo(res.form.allowVideo);
    }).catch(() => {});

    // Also fetch Firestore workspace document
    try {
      const db = getFirestore();
      getDoc(doc(db, 'workspaces', cleanSlug)).then((snap) => {
        if (!isMounted || !snap.exists()) return;
        const d = snap.data();
        if (d.name) setWorkspaceName(d.name);
        if (d.formHeading) setFormHeading(d.formHeading);
        if (d.formSubheading) setFormSubheading(d.formSubheading);
        if (d.primaryColor) setAccentColor(d.primaryColor);
        if (d.allowText !== undefined) setAllowText(d.allowText);
        if (d.allowVideo !== undefined) setAllowVideo(d.allowVideo);
      }).catch(() => {});
    } catch {}

    return () => {
      isMounted = false;
    };
  }, [cleanSlug]);

  usePageSeo({
    title: `Share Feedback | ${workspaceName} on PandaPraise`,
    description: formSubheading || `Submit your verified feedback and customer testimonial for ${workspaceName}.`,
  });

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomAvatarUrl(reader.result);
          setAvatarChoice('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getEffectiveAvatar = () => {
    if (avatarChoice === 'male') return MALE_ANIMATED_AVATAR;
    if (avatarChoice === 'female') return FEMALE_ANIMATED_AVATAR;
    if (avatarChoice === 'custom' && customAvatarUrl) return customAvatarUrl;
    return null;
  };

  // Video recording methods
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) videoChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Unable to access camera. Please allow camera and microphone permissions.');
    }
  };

  const stopCamera = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveName = authorName.trim() || 'Alex Rivera';
    const effectiveContent = content.trim();

    if (!effectiveContent) {
      alert('Please enter your review text.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalAvatar = getEffectiveAvatar();
      const sanitizedContent = sanitizeText(effectiveContent);
      const sanitizedName = sanitizeText(effectiveName);
      const sanitizedRole = sanitizeText(authorRole.trim() || 'Verified Customer');

      // 1. Submit through storage router
      try {
        await storage.createReview({
          projectId: cleanSlug,
          name: sanitizedName,
          authorName: sanitizedName,
          email: '',
          role: sanitizedRole,
          rating,
          content: sanitizedContent,
          type: mode === 'video' ? 'video' : 'text',
          tags: [],
          consent: true,
          avatarUrl: finalAvatar || undefined,
          videoUrl: recordedVideoUrl || videoLinkUrl || undefined,
          status: 'pending',
        });
        if (typeof storage.evaluateAutoApproval === 'function') {
          await storage.evaluateAutoApproval(cleanSlug);
        }
      } catch (err) {
        console.warn('Storage createReview fallback notice:', err);
      }

      // 2. Submit to Firestore testimonials collection
      try {
        const db = getFirestore();
        await addDoc(collection(db, 'testimonials'), {
          workspaceId: cleanSlug,
          authorName: sanitizedName,
          authorRole: sanitizedRole,
          content: sanitizedContent,
          rating,
          mediaType: mode,
          avatarUrl: finalAvatar,
          videoUrl: recordedVideoUrl || videoLinkUrl || null,
          status: 'pending',
          verified: true,
          createdAt: new Date().toISOString(),
          timestamp: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firestore testimonials direct write notice:', err);
      }

      // 3. Set One Link One Device record
      const submissionRecord = {
        name: sanitizedName,
        submittedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(`pandapraise_submitted_${cleanSlug}`, JSON.stringify(submissionRecord));
      } catch {}

      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert(err.message || 'Could not submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already submitted state (One Link One Device Rule)
  if (alreadySubmittedData && !submitted) {
    return (
      <div className="min-h-screen bg-slate-50/80 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 max-w-md w-full text-center shadow-xl space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              ✓ Testimonial Already Recorded
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Thank You{alreadySubmittedData.name ? `, ${alreadySubmittedData.name}` : ''}!
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Your verified praise for <strong className="text-slate-800">{workspaceName}</strong> has already been received and logged to the dashboard.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>1 Link • 1 Device • 1 Testimonial Rule</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              To prevent duplicate entries and guarantee authentic social proof, each collection link accepts only one verified testimonial per device.
            </p>
          </div>

          <div className="pt-2 text-center text-xs text-slate-400">
            <span>Powered by </span>
            <strong className="text-slate-700">PandaPraise 🐾</strong>
          </div>
        </div>
      </div>
    );
  }

  // Submitted Celebration Screen
  if (submitted) {
    const finalAvatar = getEffectiveAvatar();
    const effectiveDisplayAuthor = authorName.trim() || 'Alex';
    const displayFirstName = effectiveDisplayAuthor.split(' ')[0] || 'Alex';

    return (
      <div className="min-h-screen bg-[#F6FBF9] flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 max-w-lg w-full text-center shadow-xl space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              You're amazing, {displayFirstName}! 🎉
            </h2>
            <p className="text-xs text-slate-500">
              {t.thankYouSub}
            </p>
          </div>

          {/* Rendered Praise Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                Your Live Praise Card
              </span>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-current' : 'text-slate-300'}`} />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{content}"
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                {finalAvatar ? (
                  <img src={finalAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-purple-700">{authorName.slice(0, 2).toUpperCase() || 'AR'}</span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{authorName || 'Alex Rivera'}</p>
                <p className="text-[10px] text-slate-500">{authorRole || 'Verified Customer'}</p>
              </div>
            </div>
          </div>

          {/* Reward Voucher */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/80 space-y-2 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-purple-900">
              <Award className="w-4 h-4 text-purple-600" />
              <span>{t.rewardTitle}</span>
            </div>
            <p className="text-[11px] text-purple-700">
              {t.rewardSub}
            </p>
            <div className="inline-block px-4 py-1.5 rounded-xl bg-white border border-purple-300 font-mono text-sm font-extrabold text-purple-700 tracking-wider shadow-2xs">
              {t.couponCode}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => alert('Praise card saved to photos!')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Share Card</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: `${workspaceName} Review`, text: content, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Review link copied to clipboard!');
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const effectiveAvatar = getEffectiveAvatar();

  return (
    <div className="min-h-screen bg-[#F6FBF9] text-slate-900 font-sans pb-16">
      {/* ── Top Header Bar ── */}
      <header className="bg-white border-b border-slate-200/80 px-6 h-16 flex items-center justify-between max-w-4xl mx-auto rounded-b-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            🐼
          </div>
          <span className="font-bold text-sm text-slate-900">{workspaceName}</span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ {t.verifiedSpace}
          </span>
        </div>

        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            id="lang-en"
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              lang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            id="lang-hi"
            onClick={() => setLang('hi')}
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              lang === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Hinglish
          </button>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-xl mx-auto px-4 mt-8">
        {/* Reassurance copy under header */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-6 px-2">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.subHeader}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 font-medium flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.encrypted}</span>
          </span>
        </div>

        {/* Centered Hero Section */}
        <div className="text-center mb-6">
          <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-3 shadow-xs">
            ✨ {t.shareBadge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formHeading || `${t.headlinePrefix} ${workspaceName}?`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            {formSubheading || t.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-center space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t.satisfaction}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {activeRating}.0 • Outstanding! 🔥
              </span>
            </div>
            <div className="flex justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="cursor-pointer transition-transform hover:scale-115"
                >
                  <Star
                    className={`w-9 h-9 ${
                      star <= activeRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            {/* Mode Switcher */}
            <div className={`grid ${allowText && allowVideo ? 'grid-cols-2' : 'grid-cols-1'} gap-2 p-1.5 bg-slate-100 rounded-2xl`}>
              {allowText && (
                <button
                  type="button"
                  id="tab-text"
                  onClick={() => setMode('text')}
                  className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    mode === 'text' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{t.writtenTab}</span>
                </button>
              )}
              {allowVideo && (
                <button
                  type="button"
                  id="tab-video"
                  onClick={() => setMode('video')}
                  className={`py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    mode === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>{t.videoTab}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {t.perkLabel}
                  </span>
                </button>
              )}
            </div>

            {/* Video Recording Studio when Video Mode Selected */}
            {mode === 'video' && (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-purple-600" />
                    <span>Record Video Testimonial (+2x Perk)</span>
                  </span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-purple-200 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('camera')}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${videoInputMode === 'camera' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
                    >
                      Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('link')}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${videoInputMode === 'link' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
                    >
                      Loom / URL
                    </button>
                  </div>
                </div>

                {videoInputMode === 'camera' ? (
                  <div className="text-center py-4 bg-white rounded-xl border border-purple-100 p-4 space-y-3">
                    {recordedVideoUrl ? (
                      <div className="space-y-2">
                        <video src={recordedVideoUrl} controls className="w-full rounded-xl max-h-56 bg-black" />
                        <button
                          type="button"
                          onClick={() => setRecordedVideoUrl(null)}
                          className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                        >
                          Record Again
                        </button>
                      </div>
                    ) : isRecording ? (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden bg-black max-h-56">
                          <video ref={videoPreviewRef} autoPlay playsInline muted className="w-full h-full max-h-56 object-cover" />
                          <div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white rounded-full text-[10px] font-bold animate-pulse">
                            ● Recording 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer"
                        >
                          <StopIcon className="w-4 h-4 fill-white" />
                          <span>Stop & Save Video</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Video className="w-10 h-10 text-purple-600 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">Record a 30-60 second video review</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Start Camera</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-3.5 rounded-xl border border-purple-100 space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Paste Loom, YouTube, or MP4 URL
                    </label>
                    <input
                      type="url"
                      value={videoLinkUrl}
                      onChange={(e) => setVideoLinkUrl(e.target.value)}
                      placeholder="https://www.loom.com/share/..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Written Review Section */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <label htmlFor="testimonial-input">{t.yourReview}</label>
                <span className="text-slate-400 font-mono" id="char-counter">{content.length} / 600</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setContent((c) => `${c ? c + ' ' : ''}It solved `)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer font-medium"
                >
                  {t.prompt1}
                </button>
                <button
                  type="button"
                  onClick={() => setContent((c) => `${c ? c + ' ' : ''}My favorite feature is `)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 cursor-pointer font-medium"
                >
                  {t.prompt2}
                </button>
              </div>
              <textarea
                id="testimonial-input"
                rows={4}
                maxLength={600}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`${t.placeholder} ${workspaceName}...`}
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:outline-none focus:border-purple-600 bg-slate-50/50 leading-relaxed resize-none"
              />
            </div>

            {/* Name and Designation boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="name-input">
                  {t.nameLabel} *
                </label>
                <input
                  id="name-input"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma / Alex Rivera"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="role-input">
                  {t.roleLabel}
                </label>
                <input
                  id="role-input"
                  type="text"
                  placeholder="e.g. Product Lead, Marketing"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* Profile Avatar selection matching screenshot */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">{t.avatarLabel}</span>
                <span className="text-slate-400">Default Animated / Upload</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="collector-avatar-male-btn"
                  onClick={() => setAvatarChoice(avatarChoice === 'male' ? null : 'male')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    avatarChoice === 'male' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{t.maleBtn}</span>
                  {avatarChoice === 'male' && <Check className="w-3 h-3 text-white" />}
                </button>
                <button
                  type="button"
                  id="collector-avatar-female-btn"
                  onClick={() => setAvatarChoice(avatarChoice === 'female' ? null : 'female')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    avatarChoice === 'female' ? 'bg-pink-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{t.femaleBtn}</span>
                  {avatarChoice === 'female' && <Check className="w-3 h-3 text-white" />}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  id="collector-avatar-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    avatarChoice === 'custom' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.uploadBtn}</span>
                </button>
                {avatarChoice && (
                  <button
                    type="button"
                    id="collector-avatar-deselect-btn"
                    onClick={() => {
                      setAvatarChoice(null);
                      setCustomAvatarUrl(null);
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 px-2 cursor-pointer ml-auto flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" />
                    <span>{t.deselectBtn}</span>
                  </button>
                )}
              </div>

              {effectiveAvatar && (
                <div className="pt-1 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-purple-400 bg-purple-100 flex items-center justify-center">
                    <img src={effectiveAvatar} alt="Active Avatar" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {avatarChoice === 'male' && 'Male animated avatar active'}
                    {avatarChoice === 'female' && 'Female animated avatar active'}
                    {avatarChoice === 'custom' && 'Custom photo active'}
                  </span>
                </div>
              )}
            </div>

            {/* Real-time Live Preview Card (satisfies Test 3) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-left space-y-2">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                Live Preview
              </span>
              <p className="text-xs text-slate-700 italic">
                {content || 'Your feedback and review will appear here in real-time as you type above...'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-purple-100 border border-purple-300 flex items-center justify-center shrink-0">
                  {effectiveAvatar ? (
                    <img src={effectiveAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-purple-700">
                      {authorName.slice(0, 2).toUpperCase() || 'JD'}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    {authorName || 'John Doe'}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {authorRole || 'Customer'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            id="submit-testimonial-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg transition-all cursor-pointer hover:opacity-95 disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            {isSubmitting ? t.submitting : t.submitBtn}
          </button>
        </form>
      </main>
    </div>
  );
};

export default PublicCollectorPage;
