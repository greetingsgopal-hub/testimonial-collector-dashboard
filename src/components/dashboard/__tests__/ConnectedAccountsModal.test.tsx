// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ConnectedAccountsModal } from '../ConnectedAccountsModal';

vi.mock('../../../lib/socialClient', () => ({
  socialClient: {
    getStatus: vi.fn().mockImplementation(() =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            connections: {
              linkedin: { connected: true, accountName: 'founder_lead' },
              twitter: { connected: false },
              facebook: { connected: false },
              instagram: { connected: false },
              google: { connected: false },
            },
            publications: [],
          });
        }, 50);
      })
    ),
    disconnect: vi.fn().mockResolvedValue({ success: true }),
    initOAuth: vi.fn().mockResolvedValue({ authUrl: 'https://oauth.example.com' }),
  },
}));

describe('ConnectedAccountsModal Component', () => {
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

  it('1. Renders loading state with spinning loader, OAuth 2.0 Secure pill, and privacy guarantee', async () => {
    await act(async () => {
      root.render(<ConnectedAccountsModal isOpen={true} onClose={() => {}} />);
    });

    // Check header and loading state text
    expect(container.textContent).toContain('Connected Social Accounts');
    expect(container.textContent).toContain('OAuth 2.0 Secure');
    expect(container.textContent).toContain('Checking account connection status…');
    expect(container.textContent).toContain('Panda Praise Privacy & Security Guarantee');
    expect(container.textContent).toContain('Done');
  });

  it('2. Renders list state with all 5 accounts, connect buttons, and privacy box after status resolves', async () => {
    await act(async () => {
      root.render(<ConnectedAccountsModal isOpen={true} onClose={() => {}} />);
    });

    // Wait for the mock promise to resolve
    await act(async () => {
      await new Promise((r) => setTimeout(r, 80));
    });

    expect(container.textContent).toContain('LinkedIn');
    expect(container.textContent).toContain('X (Twitter)');
    expect(container.textContent).toContain('Facebook Pages');
    expect(container.textContent).toContain('Instagram Business');
    expect(container.textContent).toContain('Google Business Profile');
    expect(container.textContent).toContain('Connect X (Twitter)');
    expect(container.textContent).toContain('Connect Facebook Pages');
    expect(container.textContent).toContain('Connect Instagram Business');
    expect(container.textContent).toContain('Connect Google Business');
    expect(container.textContent).toContain('founder_lead');
    expect(container.textContent).toContain('Disconnect');
  });
});
