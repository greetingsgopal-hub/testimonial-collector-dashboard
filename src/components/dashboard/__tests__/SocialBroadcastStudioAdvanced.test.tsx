import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

// Mock Firestore & Auth to isolate component test from network and async races
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
  setDoc: vi.fn().mockResolvedValue(undefined),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn().mockReturnValue({ currentUser: null }),
}));

import SocialBroadcastHub, {
  renderAdvancedSocialCard,
  SocialTestimonial,
} from '../SocialBroadcastHub';

const sampleTestimonials: SocialTestimonial[] = [
  {
    id: 't-1',
    authorName: 'Sarah Jenkins',
    authorRole: 'Head of Growth at FinFlow',
    content: 'PandaPraise completely transformed our customer social proof and conversions.',
    rating: 5,
  },
  {
    id: 't-2',
    authorName: 'Marcus Vance',
    authorRole: 'Founder at SaaSHQ',
    content: 'The 1-click broadcast studio saves our team 5 hours every single week.',
    rating: 5,
  },
  {
    id: 't-3',
    authorName: 'Elena Rostova',
    authorRole: 'VP Product at CloudSync',
    content: 'Having our live website screenshot as the card background proves the review is real.',
    rating: 5,
  },
];

describe('Advanced Social Broadcast Studio & Canvas Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'open').mockImplementation(() => null);

    // Mock HTMLCanvasElement 2D context for jsdom environment
    const mockCtx = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      measureText: vi.fn(() => ({ width: 50 })),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
    };

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx as any);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,mockRenderedCardPNGData'
    );
  });

  describe('renderAdvancedSocialCard', () => {
    it('generates a PNG data URL for Single Testimonial layout', async () => {
      const result = await renderAdvancedSocialCard(
        [sampleTestimonials[0]],
        'Project Potato Workspace',
        { layoutClass: 'single', backgroundStyle: 'gradient' }
      );

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/png;base64');
    });

    it('generates a PNG data URL for Double Testimonials layout', async () => {
      const result = await renderAdvancedSocialCard(
        [sampleTestimonials[0], sampleTestimonials[1]],
        'Project Potato Workspace',
        { layoutClass: 'double', backgroundStyle: 'light' }
      );

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/png;base64');
    });

    it('generates a PNG data URL for Triple Testimonials cascading layout', async () => {
      const result = await renderAdvancedSocialCard(
        sampleTestimonials,
        'Project Potato Workspace',
        { layoutClass: 'triple', backgroundStyle: 'neon' }
      );

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/png;base64');
    });

    it('supports custom website hero screenshot with contrast scrim', async () => {
      // Mock Image onload in jsdom
      const originalImage = window.Image;
      class MockImage {
        crossOrigin = '';
        src = '';
        onload: (() => void) | null = null;
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }
      (window as any).Image = MockImage;

      const mockScreenshot =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const result = await renderAdvancedSocialCard(
        [sampleTestimonials[0]],
        'Project Potato',
        {
          layoutClass: 'single',
          backgroundStyle: 'hero_screenshot',
          heroScreenshotDataUrl: mockScreenshot,
          overlayOpacity: 0.85,
        }
      );

      expect(result).toBeTruthy();
      expect(result).toContain('data:image/png;base64');

      (window as any).Image = originalImage;
    });
  });

  describe('SocialBroadcastHub Component Interaction', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    it('renders layout class selector with Single, Double, and Triple options', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(
          <SocialBroadcastHub
            workspaceId="ws_test"
            workspaceName="Project Potato"
            workspaceSlug="projectpotato"
            initialApprovedTestimonials={sampleTestimonials}
          />
        );
      });

      expect(container.textContent).toContain('Template Layout Class:');
      expect(container.textContent).toContain('1️⃣ Single Quote');
      expect(container.textContent).toContain('2️⃣ Double Stack');
      expect(container.textContent).toContain('3️⃣ Triple Cascade');
      expect(container.textContent).toContain('Website Hero Screenshot');
    });

    it('switches layout class to Triple and allows selecting up to 3 cards', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(
          <SocialBroadcastHub
            workspaceId="ws_test"
            workspaceName="Project Potato"
            workspaceSlug="projectpotato"
            initialApprovedTestimonials={sampleTestimonials}
          />
        );
      });

      const tripleBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Triple Cascade')
      );
      expect(tripleBtn).toBeDefined();

      await act(async () => {
        tripleBtn?.click();
      });

      expect(container.textContent).toContain('TRIPLE Layout');
      expect(container.textContent).toContain('Pick 3');

      // Click card 2
      const card2 = container.querySelector('[data-testid="review-card-t-2"]');
      await act(async () => {
        card2?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      // Click card 3
      const card3 = container.querySelector('[data-testid="review-card-t-3"]');
      await act(async () => {
        card3?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Ready to broadcast (3/3)');
    });

    it('truncates selection cap when switching from Triple down to Single layout', async () => {
      const root = createRoot(container);
      await act(async () => {
        root.render(
          <SocialBroadcastHub
            workspaceId="ws_test"
            workspaceName="Project Potato"
            workspaceSlug="projectpotato"
            initialApprovedTestimonials={sampleTestimonials}
          />
        );
      });

      // Switch to Triple
      const tripleBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Triple Cascade')
      );
      await act(async () => {
        tripleBtn?.click();
      });

      // Select card 2 and card 3
      const card2 = container.querySelector('[data-testid="review-card-t-2"]');
      const card3 = container.querySelector('[data-testid="review-card-t-3"]');
      await act(async () => {
        card2?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        card3?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.textContent).toContain('Ready to broadcast (3/3)');

      // Switch back to Single
      const singleBtn = Array.from(container.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Single Quote')
      );
      await act(async () => {
        singleBtn?.click();
      });

      expect(container.textContent).toContain('SINGLE Layout: Pick 1');
      expect(container.textContent).toContain('Ready to broadcast (1/1)');
    });
  });
});
