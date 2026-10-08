import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { WidgetStudio } from '../WidgetStudio';
import { Review } from '../../../types';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    project: { id: 'test_project_123', name: 'Acme Pro', slug: 'acme-pro' },
  }),
}));

describe('WidgetStudio Restructure & Upgrades', () => {
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
  });

  it('1. Injects sample reviews fallback when reviews list has 0 approved testimonials', async () => {
    await act(async () => {
      root.render(<WidgetStudio reviews={[]} />);
    });

    // Verify sample preview badge is shown in the live preview header
    expect(container.textContent).toContain('Sample Preview');
    expect(container.textContent).toContain('Pre-loaded with sample reviews');

    // Verify sample testimonial authors are rendered (Sarah Jenkins, David Chen, Elena Rostova)
    expect(container.textContent).toContain('Sarah Jenkins');
    expect(container.textContent).toContain('David Chen');
    expect(container.textContent).toContain('Elena Rostova');

    // Verify the "No Matching Testimonials" blank dead-end is NOT shown
    expect(container.textContent).not.toContain('No Matching Testimonials');
  });

  it('2. Uses real approved reviews when provided and omits sample badge', async () => {
    const realReviews: Review[] = [
      {
        id: 'rev_real_1',
        projectId: 'test_project_123',
        authorName: 'Alex Real Customer',
        name: 'Alex Real Customer',
        email: 'alex@example.com',
        rating: 5,
        content: 'This is a genuine approved customer testimonial.',
        status: 'approved',
        isFeatured: true,
        source: 'google',
        type: 'text',
        consent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await act(async () => {
      root.render(<WidgetStudio reviews={realReviews} />);
    });

    expect(container.textContent).toContain('Alex Real Customer');
    expect(container.textContent).toContain('This is a genuine approved customer testimonial.');
    // Sample badge should not be present
    expect(container.textContent).not.toContain('Sample Preview');
    expect(container.textContent).not.toContain('Pre-loaded with sample reviews');
  });

  it('3. Supports 1-click theme switching (Light Gradient, Dark Mode, Minimalist)', async () => {
    await act(async () => {
      root.render(<WidgetStudio reviews={[]} />);
    });

    // Find Dark Mode button
    const darkModeBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Dark Mode')
    );
    expect(darkModeBtn).toBeDefined();

    await act(async () => {
      darkModeBtn!.click();
    });

    // The dark theme sets bg-[#0f172a] on canvas
    const darkCanvas = container.querySelector('.bg-\\[\\#0f172a\\]');
    expect(darkCanvas).not.toBeNull();

    // Find Minimalist button
    const minimalistBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Minimalist')
    );
    expect(minimalistBtn).toBeDefined();

    await act(async () => {
      minimalistBtn!.click();
    });

    // Minimalist theme sets shadow-xs on white canvas
    expect(container.querySelector('.bg-\\[\\#0f172a\\]')).toBeNull();
  });

  it('4. Compact platform selection updates installation guide and code snippet', async () => {
    await act(async () => {
      root.render(<WidgetStudio reviews={[]} />);
    });

    // Default is WordPress
    expect(container.textContent).toContain('WordPress Installation Guide');
    expect(container.textContent).toContain('data-project-id="test_project_123"');

    // Click Webflow quick pill button
    const webflowBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Webflow'
    );
    expect(webflowBtn).toBeDefined();

    await act(async () => {
      webflowBtn!.click();
    });

    expect(container.textContent).toContain('Webflow Installation Guide');
    expect(container.textContent).toContain('Webflow Designer');

    // Switch to iFrame via quick pill button
    const iframeBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'iFrame'
    );
    expect(iframeBtn).toBeDefined();

    await act(async () => {
      iframeBtn!.click();
    });

    expect(container.textContent).toContain('iFrame Fallback Installation Guide');
    expect(container.querySelector('pre')?.textContent).toContain('<iframe src=');
  });

  it('5. Permanent quick-action dock provides active platform indicator and copy trigger', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    await act(async () => {
      root.render(<WidgetStudio reviews={[]} />);
    });

    // Look for dock with "Snippet" and "Copy Embed Code"
    const copyDockBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Copy Embed Code') || b.textContent?.includes('Copy Code')
    );
    expect(copyDockBtn).toBeDefined();

    await act(async () => {
      copyDockBtn!.click();
    });

    expect(writeTextMock).toHaveBeenCalled();
    expect(container.textContent).toContain('Copied!');
  });

  it('6. Streamlined onboarding guide can expand 4 steps and be dismissed', async () => {
    await act(async () => {
      root.render(<WidgetStudio reviews={[]} />);
    });

    // Streamlined banner is initially visible
    expect(container.textContent).toContain('Fast 3-Step Setup');

    // Click "View 4 Steps"
    const viewStepsBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('View 4 Steps')
    );
    expect(viewStepsBtn).toBeDefined();

    await act(async () => {
      viewStepsBtn!.click();
    });

    expect(container.textContent).toContain('OPEN BUILDER');
    expect(container.textContent).toContain('PASTE & PUBLISH');

    // Click Dismiss button
    const dismissBtn = container.querySelector('button[aria-label="Dismiss guide"]') as HTMLButtonElement;
    expect(dismissBtn).not.toBeNull();

    await act(async () => {
      dismissBtn.click();
    });

    // Guide is now dismissed
    expect(container.textContent).not.toContain('Fast 3-Step Setup');
  });

  it('7. Responsive device preview switcher updates container width constraints', async () => {
    await act(async () => {
      root.render(<WidgetStudio reviews={[]} />);
    });

    const tabletBtn = container.querySelector('button[title*="Tablet"]') as HTMLButtonElement;
    const mobileBtn = container.querySelector('button[title*="Mobile"]') as HTMLButtonElement;
    const desktopBtn = container.querySelector('button[title*="Desktop"]') as HTMLButtonElement;

    expect(tabletBtn).not.toBeNull();
    expect(mobileBtn).not.toBeNull();
    expect(desktopBtn).not.toBeNull();

    // Switch to tablet
    await act(async () => {
      tabletBtn.click();
    });
    expect(container.querySelector('.max-w-md')).not.toBeNull();

    // Switch to mobile
    await act(async () => {
      mobileBtn.click();
    });
    expect(container.querySelector('.max-w-xs')).not.toBeNull();

    // Switch back to desktop
    await act(async () => {
      desktopBtn.click();
    });
    expect(container.querySelector('.max-w-xs')).toBeNull();
  });
});
