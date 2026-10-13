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

  it('renders classic corner geometry and space black finish', () => {
    act(() => {
      root.render(<QrCodeGenerator />);
    });

    expect(container.textContent).toContain('Finish Color');
    expect(container.textContent).toContain('Space Black');

    // Space Black swatch button is present and active
    const spaceBlackBtn = container.querySelector('button[aria-label="Space Black"]') as HTMLButtonElement;
    expect(spaceBlackBtn).not.toBeNull();

    // Removed colors like Pacific Blue are not present
    const pacificBlueBtn = container.querySelector('button[aria-label="Pacific Blue"]');
    expect(pacificBlueBtn).toBeNull();

    // Classic geometry is rendered and other geometries (Squircle, Dots) are removed
    expect(container.textContent).toContain('Classic');
    expect(container.textContent).not.toContain('Squircle');
    expect(container.textContent).not.toContain('Dots');
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
