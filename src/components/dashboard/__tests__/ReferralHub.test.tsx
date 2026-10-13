import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { ReferralHub } from '../ReferralHub';
import { Workspace } from '../../../types';

describe('ReferralHub Component (Task 1.4)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  const renderComponent = async (ui: React.ReactElement) => {
    const root = createRoot(container);
    await act(async () => {
      root.render(ui);
    });
    return { container, root };
  };

  const mockWorkspace: Workspace = {
    id: 'ws-ref-123',
    name: 'Growth Squad',
    ownerId: 'user-1',
    plan: 'free',
    testimonialCount: 5,
    projectCount: 1,
    seatCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders the Give 1 Month Get 1 Month program and referral link', async () => {
    await renderComponent(<ReferralHub workspace={mockWorkspace} />);

    expect(container.textContent).toContain('Give 1 Month, Get 1 Month');
    expect(container.textContent).toContain('https://pandapraise.com/r/ws-ref-123');
    expect(container.textContent).toContain('Share on X / Twitter');
    expect(container.textContent).toContain('Share on LinkedIn');
    expect(container.textContent).toContain('Share on WhatsApp');

    const copyBtn = container.querySelector('button[data-testid="copy-ref-btn"]');
    expect(copyBtn).not.toBeNull();
  });
});
