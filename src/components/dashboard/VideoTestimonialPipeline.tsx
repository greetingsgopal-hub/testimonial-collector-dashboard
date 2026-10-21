import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Camera,
  StopCircle,
  CheckCircle2,
  Upload,
  Trash2,
  Sparkles,
} from 'lucide-react';

export interface VideoTestimonialPayload {
  authorName: string;
  authorRole: string;
  content: string;
  rating: number;
  mediaType: 'video' | 'text';
  videoBlobUrl?: string; // Stored as a playable blob or local base64 preview (Zero external server storage)
  status: 'approved';
  createdAt: string;
}

export function BrowserVideoRecorder({
  onVideoRecorded,
}: {
  onVideoRecorded: (blobUrl: string, durationSec: number) => void;
}) {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Clean up media streams and timers on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getSupportedMimeType = (): string | undefined => {
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm',
      'video/mp4',
    ];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return undefined;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.play().catch(() => {});
      }

      chunksRef.current = [];
      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const type = mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type });
        const blobUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(blobUrl);
        onVideoRecorded(blobUrl, recordingTime);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250); // Collect data chunks every 250ms
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      alert('Camera or microphone access was denied. Please check your browser permissions.');
    }
  };

  const stopCamera = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setRecordedVideoUrl(blobUrl);
      onVideoRecorded(blobUrl, 15);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-4 p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
          <Video className="w-4 h-4" />
          <span>Browser Video Recorder (+2x Perk)</span>
        </span>
        {isRecording && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
            Recording · {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {recordedVideoUrl ? (
        <div className="space-y-3">
          <video src={recordedVideoUrl} controls className="w-full rounded-xl max-h-60 bg-black object-contain mx-auto" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Video recorded successfully! (Zero server storage)
            </span>
            <button
              type="button"
              onClick={() => setRecordedVideoUrl(null)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-center">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
            <video ref={liveVideoRef} muted playsInline className={`w-full h-full object-cover ${isRecording ? 'block' : 'hidden'}`} />
            {!isRecording && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Camera className="w-10 h-10 opacity-60" />
                <p className="text-xs">Click start camera to record your 30s video review</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {!isRecording ? (
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera Recording</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer animate-pulse"
              >
                <StopCircle className="w-4 h-4" />
                <span>Stop Recording</span>
              </button>
            )}

            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer">
              <Upload className="w-4 h-4 text-purple-400" />
              <span>Upload Video File</span>
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PLAYABLE VIDEO REVIEW CARD FOR DASHBOARD PROOF PULSE
// ============================================================================
export function PlayableVideoProofCard({
  authorName,
  authorRole,
  content,
  rating,
  videoBlobUrl,
  source,
  createdAt,
}: {
  authorName: string;
  authorRole: string;
  content: string;
  rating: number;
  videoBlobUrl?: string | null;
  source: string;
  createdAt?: string;
}) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            {authorName} <span className="text-slate-400 font-normal">·</span> {authorRole}
          </h4>
          <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">
            {source} · Video Submission{createdAt ? ` · ${new Date(createdAt).toLocaleDateString()}` : ''}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          Approved
        </span>
      </div>

      <div className="flex items-center text-amber-400 text-xs">
        {Array.from({ length: Math.max(1, rating) }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>

      {/* Playable Video Embedded Container (Zero External Server Storage Required) */}
      {videoBlobUrl ? (
        <div className="rounded-xl overflow-hidden bg-black border border-slate-200 relative">
          <video
            src={videoBlobUrl}
            controls
            preload="metadata"
            className="w-full max-h-56 object-contain bg-slate-950 mx-auto"
          />
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900 font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{content}</span>
        </div>
      )}

      <p className="text-xs text-slate-600 leading-relaxed italic">
        "{content}"
      </p>
    </div>
  );
}
