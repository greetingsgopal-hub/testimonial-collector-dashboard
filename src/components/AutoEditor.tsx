import React from 'react';

interface AutoEditorProps {
  videoUrl?: string;
  storagePath?: string;
  testimonialId?: string;
}

/**
 * Preview the selected video. The production renderer currently accepts only
 * server-managed video records, so Firebase WhatsApp items cannot be exported
 * from this workflow until that backend is connected.
 */
export const AutoEditor: React.FC<AutoEditorProps> = ({ videoUrl, testimonialId }) => (
  <section className="rounded-[20px] bg-[#1C1C1F] border border-white/[0.06] p-6 w-full flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[20px] font-light text-white/20 tabular-nums font-mono">03</span>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] tracking-widest text-amber-400 font-mono">
          VIDEO STUDIO
        </span>
      </div>
      <h3 className="text-[14px] font-bold tracking-[0.15em] text-white">EDIT</h3>
      <p className="mt-2 text-[13px] text-white/50 leading-[1.6]">
        Review the selected customer video before editing.
      </p>

      {videoUrl ? (
        <video src={videoUrl} controls playsInline className="mt-5 max-h-56 w-full rounded-xl bg-black" />
      ) : (
        <div className="mt-5 min-h-24 rounded-[12px] bg-white/[0.04] border border-dashed border-white/[0.1] grid place-items-center px-4 text-center text-[12px] text-white/40">
          Select a real incoming WhatsApp video to continue.
        </div>
      )}
    </div>

    <div className="mt-5">
      <div className="w-full h-11 rounded-full bg-white/10 text-white/40 font-semibold text-[12px] flex items-center justify-center">
        {videoUrl ? 'Preview loaded' : 'Waiting for a selected video'}
      </div>
      <p className="mt-3 text-[11px] text-white/30 leading-relaxed">
        {testimonialId && videoUrl
          ? 'Automatic rendering is not connected to Firebase WhatsApp videos yet. No export is being reported as complete.'
          : 'Select a WhatsApp video to preview it here.'}
      </p>
    </div>
  </section>
);

export default AutoEditor;
