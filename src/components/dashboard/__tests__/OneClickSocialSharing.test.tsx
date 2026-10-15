// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { OneClickSocialSharing } from '../OneClickSocialSharing';

describe('OneClickSocialSharing Component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.stubGlobal('open', vi.fn());
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
  });

  it('renders all social sharing buttons', async () => {
    await act(async () => {
      root.render(<OneClickSocialSharing referralCode="test-ref-code" />);
    });

    expect(container.textContent).toContain('1-Click Social Sharing');
    expect(container.textContent).toContain('Share on X / Twitter');
    expect(container.textContent).toContain('Share on LinkedIn');
    expect(container.textContent).toContain('Share on WhatsApp');
  });

  it('clicking LinkedIn copies draft and opens LinkedIn feed composer intent with prefilled text and referral link', async () => {
    await act(async () => {
      root.render(<OneClickSocialSharing referralCode="test-ref-code" />);
    });

    const buttons = container.querySelectorAll('button');
    const linkedinBtn = Array.from(buttons).find((b) => b.textContent?.includes('Share on LinkedIn'));
    expect(linkedinBtn).not.toBeUndefined();

    await act(async () => {
      linkedinBtn?.click();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('https://pandapraise.com/r/test-ref-code')
    );
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://www.linkedin.com/feed/?shareActive=true&text='),
      '_blank',
      'noopener,noreferrer'
    );
    expect(container.textContent).toContain('Draft copied to clipboard & opened LINKEDIN');
  });

  it('clicking X / Twitter opens Twitter intent with prefilled text', async () => {
    await act(async () => {
      root.render(<OneClickSocialSharing referralCode="test-ref-code" />);
    });

    const buttons = container.querySelectorAll('button');
    const xBtn = Array.from(buttons).find((b) => b.textContent?.includes('Share on X / Twitter'));

    await act(async () => {
      xBtn?.click();
    });

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://x.com/intent/post?text='),
      '_blank',
      'noopener,noreferrer'
    );
    expect(container.textContent).toContain('Draft copied to clipboard & opened X');
  });

  it('clicking WhatsApp opens WhatsApp send intent with prefilled text', async () => {
    await act(async () => {
      root.render(<OneClickSocialSharing referralCode="test-ref-code" />);
    });

    const buttons = container.querySelectorAll('button');
    const waBtn = Array.from(buttons).find((b) => b.textContent?.includes('Share on WhatsApp'));

    await act(async () => {
      waBtn?.click();
    });

    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://api.whatsapp.com/send?text='),
      '_blank',
      'noopener,noreferrer'
    );
    expect(container.textContent).toContain('Draft copied to clipboard & opened WHATSAPP');
  });
});
