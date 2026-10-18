import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import ReviewQrCardModal from '../ReviewQrCardModal';

describe('ReviewQrCardModal Global Standards & Canvas Renderer', () => {
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

  it('renders tabletop stand preview card with 5 stars, business name and full header', () => {
    act(() => {
      root.render(
        <ReviewQrCardModal
          isOpen={true}
          workspaceId="papasystem"
          workspaceName="Papa System"
        />
      );
    });

    expect(container.textContent).toContain('Review QR Card Studio');
    expect(container.textContent).toContain(
      'Customers scan with their phone camera to leave a verified review in seconds.'
    );
    expect(container.textContent).toContain('Papa System');
    expect(container.textContent).toContain('Leave us a review');
    expect(container.textContent).toContain('Scan with phone camera');
    expect(container.textContent).toContain('pandapraise.com/c/papasystem');
  });

  it('switches target between Review Form and Wall of Love', () => {
    act(() => {
      root.render(
        <ReviewQrCardModal
          isOpen={true}
          workspaceId="papasystem"
          workspaceName="Papa System"
        />
      );
    });

    expect(container.textContent).toContain('pandapraise.com/c/papasystem');

    const wallBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Wall of Love'
    );
    expect(wallBtn).toBeDefined();

    act(() => {
      wallBtn!.click();
    });

    expect(container.textContent).toContain('pandapraise.com/w/papasystem');
    expect(container.textContent).toContain('See why customers love us');
  });

  it('allows selecting theme styles (Clean Light, Midnight Dark, Royal Purple)', () => {
    act(() => {
      root.render(
        <ReviewQrCardModal
          isOpen={true}
          workspaceId="papasystem"
          workspaceName="Papa System"
        />
      );
    });

    expect(container.textContent).toContain('Clean Light');
    expect(container.textContent).toContain('Midnight Dark');
    expect(container.textContent).toContain('Royal Purple');

    const midnightBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Midnight Dark')
    );
    expect(midnightBtn).toBeDefined();

    act(() => {
      midnightBtn!.click();
    });
  });

  it('allows customizing center badge icon modes (Initials, Custom, Panda, None)', () => {
    act(() => {
      root.render(
        <ReviewQrCardModal
          isOpen={true}
          workspaceId="papasystem"
          workspaceName="Papa System"
        />
      );
    });

    expect(container.textContent).toContain('Initials (PA)');
    expect(container.textContent).toContain('Custom Logo');
    expect(container.textContent).toContain('🐼 Panda');
    expect(container.textContent).toContain('None');

    const pandaBadgeBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('🐼 Panda')
    );
    expect(pandaBadgeBtn).toBeDefined();

    act(() => {
      pandaBadgeBtn!.click();
    });

    expect(container.textContent).toContain('🐼');
  });

  it('renders full print actions including 4"x6" and 5"x7" tabletop options', () => {
    act(() => {
      root.render(
        <ReviewQrCardModal
          isOpen={true}
          workspaceId="papasystem"
          workspaceName="Papa System"
        />
      );
    });

    expect(container.textContent).toContain('Download Full Stand Card (300-DPI PNG)');
    expect(container.textContent).toContain('Raw QR Only (SVG)');
    expect(container.textContent).toContain('Copy Card Image');
    expect(container.textContent).toContain('4" × 6" (A6) Table Tent');
    expect(container.textContent).toContain('5" × 7" (A5) Countertop');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    act(() => {
      root.render(
        <ReviewQrCardModal
          isOpen={true}
          onClose={handleClose}
          workspaceId="papasystem"
          workspaceName="Papa System"
        />
      );
    });

    const closeBtn = container.querySelector('button[aria-label="Close modal"]') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();

    act(() => {
      closeBtn.click();
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
