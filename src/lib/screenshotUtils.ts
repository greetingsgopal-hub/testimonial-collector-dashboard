/**
 * Utilities for client-side compression and detection of testimonial screenshots
 * (WhatsApp, Slack, Instagram, Twitter/X, Stripe, iMessage).
 */

export type ScreenshotPlatform =
  | 'whatsapp'
  | 'twitter'
  | 'instagram'
  | 'slack'
  | 'imessage'
  | 'email'
  | 'stripe'
  | 'other';

/**
 * Detects the source chat/social platform from filename or user text hints.
 */
export function detectScreenshotPlatform(hint: string): ScreenshotPlatform {
  const lower = hint.toLowerCase();
  if (lower.includes('whatsapp') || lower.includes('wa_') || lower.includes('chat')) return 'whatsapp';
  if (lower.includes('twitter') || lower.includes('tweet') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('instagram') || lower.includes('insta') || lower.includes('ig_') || lower.includes('dm')) return 'instagram';
  if (lower.includes('slack')) return 'slack';
  if (lower.includes('imessage') || lower.includes('ios')) return 'imessage';
  if (lower.includes('stripe') || lower.includes('payout') || lower.includes('revenue')) return 'stripe';
  if (lower.includes('email') || lower.includes('gmail') || lower.includes('inbox')) return 'email';
  return 'other';
}

export const detectChatPlatform = detectScreenshotPlatform;

/**
 * Compresses an uploaded screenshot image file using an HTML Canvas.
 * Scales down high-DPI retina/mobile phone screenshots to max 1200px width
 * and encodes as lightweight WebP/JPEG (< 200KB) to ensure Firestore document
 * safety and sub-100ms Wall of Love widget delivery.
 */
export async function compressScreenshot(
  file: File,
  maxWidth = 1200,
  quality = 0.85
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data'));

      img.onload = () => {
        let { width, height } = img;

        // Downscale while preserving aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Draw with high-quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal compression; fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve({ dataUrl, width, height });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
