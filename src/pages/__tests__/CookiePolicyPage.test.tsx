import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { CookiePolicyPage } from '../CookiePolicyPage';

describe('CookiePolicyPage Component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders the cookie policy sections and privacy disclosure table', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <CookiePolicyPage />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Cookie Policy');
    expect(container.textContent).toContain('Strictly Necessary (Essential)');
    expect(container.textContent).toContain('Functional & Attribution');
    expect(container.textContent).toContain('pp_cookie_consent');
    expect(container.textContent).toContain('pp_ref');
    expect(container.textContent).toContain('support@pandapraise.com');
  });
});
