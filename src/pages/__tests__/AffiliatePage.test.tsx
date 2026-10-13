import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AffiliatePage } from '../AffiliatePage';

describe('AffiliatePage Component (Task 3.4)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders affiliate calculator and partner command center', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AffiliatePage />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Turn Your Audience Into');
    expect(container.textContent).toContain('Affiliate Earnings Calculator');
    expect(container.textContent).toContain('Your Live Referral Hub');
    expect(container.textContent).toContain('60-Day Cookie Attribution');
    expect(container.textContent).toContain('Direct Payouts via Stripe Connect');
    expect(container.textContent).toContain('Standard Affiliate');
    expect(container.textContent).toContain('Agency & Enterprise Partner');
  });

  it('displays estimated recurring monthly income', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <AffiliatePage />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('/month');
    expect(container.textContent).toContain('recurring every year');
  });
});
