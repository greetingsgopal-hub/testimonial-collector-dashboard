import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dispatchRealCampaignTest } from '../CampaignsHub';

describe('dispatchRealCampaignTest Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('opens WhatsApp API with pre-filled message when channel is whatsapp', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    dispatchRealCampaignTest({
      channel: 'whatsapp',
      recipientPhone: '+91 98765 43210',
      subject: 'Ignored in WhatsApp',
      messageBody: 'Hi Alex, thank you!',
      collectionUrl: 'https://pandapraise.com/c/demo',
    });

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://api.whatsapp.com/send?phone=919876543210&text='),
      '_blank',
      'noopener,noreferrer'
    );
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('Leave%20your%20review%20here%3A%20https%3A%2F%2Fpandapraise.com%2Fc%2Fdemo'),
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('sets mailto link when channel is email', () => {
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { href: '' };

    dispatchRealCampaignTest({
      channel: 'email',
      recipientEmail: 'alex@example.com',
      subject: 'Review Request',
      messageBody: 'Hi Alex, please share your thoughts.',
      collectionUrl: 'https://pandapraise.com/c/demo',
    });

    expect(window.location.href).toContain('mailto:alex%40example.com?subject=Review%20Request&body=');
    expect(window.location.href).toContain('https%3A%2F%2Fpandapraise.com%2Fc%2Fdemo');
  });
});
