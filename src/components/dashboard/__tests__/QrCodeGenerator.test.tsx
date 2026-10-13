import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { QrCodeGenerator } from '../QrCodeGenerator';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    project: { id: 'test_project_123', name: 'Acme Coffee Co', slug: 'acme-coffee' },
    collectionForm: {
      id: 'form_123',
      publicSlug: 'acme-reviews',
      settings: { brandName: 'Acme Coffee Co' },
    },
  }),
}));

describe('QrCodeGenerator Modernized Standee Modal', () => {
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

  it('renders the acrylic standee card mockup with 5 stars and business name', () => {
    act(() => {
      root.render(<QrCodeGenerator />);
    });

    expect(container.textContent).toContain('Review QR Card');
    expect(container.textContent).toContain('Acme Coffee Co');
    expect(container.textContent).toContain('Leave us a review');
    expect(container.textContent).toContain('Scan with phone camera');
    expect(container.querySelector('[aria-label="5 out of 5 stars"]')).not.toBeNull();
  });

  it('does not display redundant color or geometry option controls', () => {
    act(() => {
      root.render(<QrCodeGenerator />);
    });

    // Control selectors for Finish Color and Corner Geometry are removed
    expect(container.textContent).not.toContain('Finish Color');
    expect(container.textContent).not.toContain('Corner Geometry');
    expect(container.querySelector('button[aria-label="Space Black"]')).toBeNull();
    expect(container.querySelector('button[aria-label="Pacific Blue"]')).toBeNull();
  });

  it('allows switching destination between Review Form and Wall of Love', () => {
    act(() => {
      root.render(<QrCodeGenerator />);
    });

    expect(container.textContent).toContain('acme-reviews');

    const wallBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Wall of Love'
    );
    expect(wallBtn).toBeDefined();

    act(() => {
      wallBtn!.click();
    });

    expect(container.textContent).toContain('acme-coffee');
    expect(container.textContent).toContain('See our wall of love');
  });

  it('calls onClose callback when modal close button is clicked', () => {
    const handleClose = vi.fn();
    act(() => {
      root.render(<QrCodeGenerator onClose={handleClose} />);
    });

    const closeBtn = container.querySelector('button[aria-label="Close modal"]') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();

    act(() => {
      closeBtn.click();
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders tiered action buttons for digital download and standee printing', () => {
    act(() => {
      root.render(<QrCodeGenerator />);
    });

    expect(container.textContent).toContain('Download QR Code (PNG)');
    expect(container.textContent).toContain('Save Vector (SVG)');
    expect(container.textContent).toContain('Copy Image');
    expect(container.textContent).toContain('Print Tabletop Cards');
    expect(container.textContent).toContain('4" × 6" Table Tent');
    expect(container.textContent).toContain('5" × 7" Countertop');
  });
});
