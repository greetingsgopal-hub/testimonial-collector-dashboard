import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { CookieConsentBanner } from '../CookieConsentBanner';

describe('CookieConsentBanner Component (Task 4.5)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('renders cookie banner when no previous consent is stored', async () => {
    const root = createRoot(container);
    await act(async () => {
      root.render(<CookieConsentBanner />);
    });

    expect(container.textContent).toContain('Privacy & Cookie Preferences');
    expect(container.textContent).toContain('GDPR and CCPA');
    expect(container.textContent).toContain('Accept All');
    expect(container.textContent).toContain('Essential Only');
  });

  it('does not render when consent has already been given', async () => {
    localStorage.setItem('pp_cookie_consent', 'accepted');
    const root = createRoot(container);
    await act(async () => {
      root.render(<CookieConsentBanner />);
    });

    expect(container.textContent).toBe('');
  });
});
