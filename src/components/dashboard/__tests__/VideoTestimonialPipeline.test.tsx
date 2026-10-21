import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BrowserVideoRecorder, PlayableVideoProofCard } from '../VideoTestimonialPipeline';

describe('VideoTestimonialPipeline Component Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = '';
  });

  describe('BrowserVideoRecorder', () => {
    it('renders initial state with start camera and upload buttons', () => {
      const onRecorded = vi.fn();
      act(() => {
        root.render(<BrowserVideoRecorder onVideoRecorded={onRecorded} />);
      });

      expect(container.textContent).toContain('Browser Video Recorder (+2x Perk)');
      expect(container.textContent).toContain('Start Camera Recording');
      expect(container.textContent).toContain('Upload Video File');
      expect(container.textContent).toContain('Click start camera to record your 30s video review');
    });

    it('handles simulated file upload and invokes onVideoRecorded callback', () => {
      const onRecorded = vi.fn();
      // Mock URL.createObjectURL
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-video-url-123');
      const originalCreateObjectURL = window.URL.createObjectURL;
      window.URL.createObjectURL = mockCreateObjectURL;

      try {
        act(() => {
          root.render(<BrowserVideoRecorder onVideoRecorded={onRecorded} />);
        });

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).not.toBeNull();

        const fakeFile = new File(['fake-video-content'], 'review.mp4', { type: 'video/mp4' });
        act(() => {
          Object.defineProperty(fileInput, 'files', {
            value: [fakeFile],
            writable: false,
          });
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        });

        expect(mockCreateObjectURL).toHaveBeenCalledWith(fakeFile);
        expect(onRecorded).toHaveBeenCalledWith('blob:mock-video-url-123', 15);
        expect(container.textContent).toContain('Video recorded successfully! (Zero server storage)');
        expect(container.textContent).toContain('Retake');
      } finally {
        window.URL.createObjectURL = originalCreateObjectURL;
      }
    });
  });

  describe('PlayableVideoProofCard', () => {
    it('renders with inline video player when videoBlobUrl is provided', () => {
      act(() => {
        root.render(
          <PlayableVideoProofCard
            authorName="Alex Rivera"
            authorRole="Head of Product"
            content="Panda Praise doubled our social proof conversion in 14 days!"
            rating={5}
            videoBlobUrl="blob:https://pandapraise.com/video-uuid-456"
            source="Public Form"
            createdAt="2026-10-21T12:00:00Z"
          />
        );
      });

      expect(container.textContent).toContain('Alex Rivera');
      expect(container.textContent).toContain('Head of Product');
      expect(container.textContent).toContain('Public Form · Video Submission');
      expect(container.textContent).toContain('Approved');
      expect(container.textContent).toContain('Panda Praise doubled our social proof conversion in 14 days!');

      const videoElement = container.querySelector('video') as HTMLVideoElement;
      expect(videoElement).not.toBeNull();
      expect(videoElement.src).toContain('video-uuid-456');
      expect(videoElement.controls).toBe(true);
    });

    it('renders text fallback card when videoBlobUrl is absent', () => {
      act(() => {
        root.render(
          <PlayableVideoProofCard
            authorName="Sara Chen"
            authorRole="Founder"
            content="Text only feedback"
            rating={4}
            videoBlobUrl={null}
            source="Import"
          />
        );
      });

      expect(container.textContent).toContain('Sara Chen');
      expect(container.querySelector('video')).toBeNull();
      expect(container.textContent).toContain('Text only feedback');
    });
  });
});
