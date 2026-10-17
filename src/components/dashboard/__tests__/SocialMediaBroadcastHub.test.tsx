import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SocialMediaBroadcastHub } from '../SocialMediaBroadcastHub';
import { Review } from '../../../types';

const sampleReviews: Review[] = [
  {
    id: 'rev_1',
    name: 'Alex Rivera',
    role: 'Product Lead',
    company: 'Acme Corp',
    content: 'PandaPraise increased our social conversion by 45%!',
    rating: 5,
    status: 'approved',
    type: 'text',
    createdAt: '2026-01-01',
  },
];

describe('SocialMediaBroadcastHub Suite', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    // Mock window.open
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('1. Renders the modal with 1-Click Social Broadcast Studio when isOpen=true', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <SocialMediaBroadcastHub
          isOpen={true}
          onClose={vi.fn()}
          reviews={sampleReviews}
        />
      );
    });

    expect(container.textContent).toContain('1-Click Social Broadcast Studio');
    expect(container.textContent).toContain('Direct Intent Engine');
    expect(container.textContent).toContain('1080×1080 Branded Card Preview');
    expect(container.textContent).toContain('Download 1080p PNG');
    expect(container.textContent).toContain('Copy Card Image');
  });

  it('2. Renders all 4 direct intent broadcast channels (LinkedIn, X, WhatsApp, Facebook)', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <SocialMediaBroadcastHub
          isOpen={true}
          onClose={vi.fn()}
          reviews={sampleReviews}
        />
      );
    });

    expect(container.textContent).toContain('LinkedIn');
    expect(container.textContent).toContain('Post on X');
    expect(container.textContent).toContain('WhatsApp');
    expect(container.textContent).toContain('Facebook');
  });

  it('3. Clicking a broadcast intent button invokes window.open with properly encoded intent URL', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <SocialMediaBroadcastHub
          isOpen={true}
          onClose={vi.fn()}
          reviews={sampleReviews}
        />
      );
    });

    const xButton = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Post on X')
    );
    expect(xButton).toBeDefined();

    await act(async () => {
      xButton?.click();
    });

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://x.com/intent/post?text='),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('4. Clicking close button triggers onClose handler', async () => {
    const onCloseMock = vi.fn();
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <SocialMediaBroadcastHub
          isOpen={true}
          onClose={onCloseMock}
          reviews={sampleReviews}
        />
      );
    });

    const closeBtn = container.querySelector('button[type="button"]');
    expect(closeBtn).not.toBeNull();

    await act(async () => {
      closeBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onCloseMock).toHaveBeenCalled();
  });
});
