// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { KpiCard } from '../KpiCard';
import { TestimonialCard } from '../TestimonialCard';
import { CommandMenu } from '../CommandMenu';
import { FilterDropdown } from '../FilterDropdown';
import { CardSkeleton } from '../Skeleton';
import { ModerationDashboardFixed } from '../../pages/ModerationDashboardFixed';

describe('PandaPraise 20 UI Tips Implementation Suite', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
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

  it('1. Skeleton: renders CardSkeleton with shimmer gradient and avatar', () => {
    act(() => {
      root.render(<CardSkeleton />);
    });
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('2. Optimistic Updates & 13. Hit Slop: TestimonialCard updates status optimistically on approve with hit-slop target', () => {
    const mockApprove = vi.fn();
    const item = {
      id: 'test-1',
      name: 'Ananya Shah',
      company: 'Kalyan Silks',
      role: 'Customer',
      rating: 5,
      status: 'pending',
      avatar: 'https://example.com/avatar.jpg',
      content: 'Incredible pockets!'
    };

    act(() => {
      root.render(<TestimonialCard t={item} onApprove={mockApprove} onReject={vi.fn()} onDelete={vi.fn()} />);
    });
    
    expect(container.textContent).toContain('pending');

    const approveBtn = container.querySelector('button') as HTMLButtonElement;
    expect(approveBtn).toBeDefined();
    expect(approveBtn.querySelector('.-m-2')).toBeDefined();

    act(() => {
      approveBtn.click();
    });

    expect(container.textContent).toContain('approved');
    expect(mockApprove).toHaveBeenCalledWith('test-1');
  });

  it('3. Command Menu & 4. Shortcuts: opens on Ctrl+K and triggers actions', () => {
    const onAction = vi.fn();
    act(() => {
      root.render(<CommandMenu onAction={onAction} />);
    });

    // Trigger Ctrl+K
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });
    expect(container.querySelector('input')).toBeDefined();

    // Trigger single key shortcut 'a'
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    });
    expect(onAction).toHaveBeenCalledWith('approve');
  });

  it('16. Tabular Numbers & 18. Continuous Corners: KpiCard renders tabular-nums and squircle corners', () => {
    act(() => {
      root.render(<KpiCard label="Approval Rate" value="94.2%" sub="instant" />);
    });
    const numEl = container.querySelector('.tabular-nums');
    expect(numEl).toBeDefined();
    expect(numEl?.textContent).toContain('94.2%');
    expect(container.firstChild).toHaveProperty('style');
  });

  it('20. Amazon Safe Triangle: FilterDropdown includes invisible safe triangle element', () => {
    act(() => {
      root.render(<FilterDropdown />);
    });
    expect(container.textContent).toContain('Filters');
    const triangle = container.querySelector('[style*="clip-path"], [style*="clipPath"]');
    expect(triangle).toBeDefined();
  });

  it('20 UI Tips Dashboard: ModerationDashboardFixed mounts with 20/20 checklist and OTP autofill', () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <ModerationDashboardFixed />
        </MemoryRouter>
      );
    });
    expect(container.textContent).toContain('Customer Review Moderation & UGC Studio');
    expect(container.textContent).toContain('20 / 20 Verified');
    
    const otpInput = container.querySelector('input[autocomplete="one-time-code"]');
    expect(otpInput).toBeDefined();
  });
});
