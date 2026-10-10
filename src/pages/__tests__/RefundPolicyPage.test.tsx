import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { RefundPolicyPage } from '../RefundPolicyPage';

describe('RefundPolicyPage Component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders the 14-day money back guarantee and refund policy sections', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <RefundPolicyPage />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Refund & Cancellation Policy');
    expect(container.textContent).toContain('14-Day Unconditional Money-Back Guarantee');
    expect(container.textContent).toContain('Subscription Cancellations');
    expect(container.textContent).toContain('Refund Processing Timelines');
    expect(container.textContent).toContain('support@pandapraise.com');
  });
});
