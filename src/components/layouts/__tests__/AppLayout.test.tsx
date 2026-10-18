// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import AppLayout from '../AppLayout';

// Mock Firebase Firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    docs: [
      {
        id: 'mock-1',
        data: () => ({
          authorName: 'Sam Marsh',
          authorRole: 'Marsh & Sons',
          content: '“I was sure the techs would never use it. They picked it up in a day.”',
          rating: 5,
          status: 'approved',
          tags: ['Ease of use'],
        }),
      },
      {
        id: 'mock-2',
        data: () => ({
          authorName: 'Dave Hartley',
          authorRole: 'Owner, Hartley Plumbing',
          content: '“Scheduling used to eat my Sundays. Now it runs itself.”',
          rating: 5,
          status: 'approved',
          tags: ['Time saved'],
        }),
      },
      {
        id: 'mock-3',
        data: () => ({
          authorName: 'Elena Rostova',
          authorRole: 'VP of Operations, SwiftFlow',
          content: '“We closed three enterprise deals after sharing the live wall of love embed.”',
          rating: 5,
          status: 'approved',
          tags: ['Ease of use', 'Support'],
        }),
      },
    ],
  }),
}));

describe('AppLayout Stitch Master Layout Suite', () => {
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
    vi.clearAllMocks();
  });

  it('1. Renders the browser shell with app.pandapraise.com/{activeNav} and macOS window controls', async () => {
    await act(async () => {
      root.render(<AppLayout workspaceId="test-ws" userName="Gopal Thakur" userRole="Admin" />);
    });

    expect(container.textContent).toContain('app.pandapraise.com/proof');
    expect(container.textContent).toContain('Gopal Thakur');
    expect(container.textContent).toContain('Admin');
    expect(container.textContent).toContain('Your Proof');
  });

  it('2. Renders navigation groups: COLLECT, MANAGE, and SHARE and updates activeNav', async () => {
    await act(async () => {
      root.render(<AppLayout workspaceId="test-ws" userName="Gopal Thakur" userRole="Admin" />);
    });

    expect(container.textContent).toContain('COLLECT');
    expect(container.textContent).toContain('Forms');
    expect(container.textContent).toContain('Import');
    expect(container.textContent).toContain('MANAGE');
    expect(container.textContent).toContain('Proof');
    expect(container.textContent).toContain('SHARE');
    expect(container.textContent).toContain('Embeds');
    expect(container.textContent).toContain('Campaigns');

    // Click on 'Forms' under COLLECT
    const formsBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Forms'
    );
    expect(formsBtn).toBeDefined();

    await act(async () => {
      formsBtn!.click();
    });

    expect(container.textContent).toContain('app.pandapraise.com/forms');
    expect(container.textContent).toContain('forms Section');

    // Click on 'Campaigns' under SHARE
    const campaignsBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Campaigns'
    );
    expect(campaignsBtn).toBeDefined();

    await act(async () => {
      campaignsBtn!.click();
    });
    expect(container.textContent).toContain('app.pandapraise.com/campaigns');
    expect(container.textContent).toContain('campaigns Section');

    // Click back to Proof
    const proofBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Proof'
    );
    expect(proofBtn).toBeDefined();

    await act(async () => {
      proofBtn!.click();
    });
    expect(container.textContent).toContain('app.pandapraise.com/proof');
    expect(container.textContent).toContain('Your Proof');
  });

  it('3. Renders praise attribute chips and filters on click', async () => {
    await act(async () => {
      root.render(<AppLayout workspaceId="test-ws" initialSearchQuery="" />);
    });

    expect(container.textContent).toContain('Customers praise:');
    expect(container.textContent).toContain('Ease of use');
    expect(container.textContent).toContain('Time saved');
    expect(container.textContent).toContain('Support');

    // Click on 'Support' chip
    const supportBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Support')
    );
    expect(supportBtn).toBeDefined();

    await act(async () => {
      supportBtn?.click();
    });

    // Should only show Elena Rostova who has 'Support' tag
    expect(container.textContent).toContain('Elena Rostova');
    expect(container.textContent).not.toContain('Dave Hartley');
  });

  it('4. Real-time search bar filters testimonials by keyword', async () => {
    await act(async () => {
      root.render(<AppLayout workspaceId="test-ws" initialSearchQuery="" />);
    });

    const searchInput = container.querySelector('#proof-search') as HTMLInputElement;
    expect(searchInput).not.toBeNull();

    await act(async () => {
      const nativeInputSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputSetter?.call(searchInput, 'Hartley');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('Dave Hartley');
    expect(container.textContent).not.toContain('Sam Marsh');
  });

  it('5. Invite Customer button opens modal and displays invite link', async () => {
    await act(async () => {
      root.render(<AppLayout workspaceId="test-ws" />);
    });

    const inviteBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Invite customer')
    );
    expect(inviteBtn).toBeDefined();

    await act(async () => {
      inviteBtn!.click();
    });

    expect(container.textContent).toContain('Invite Customer for Review');
    const linkInput = container.querySelector('input[readonly]') as HTMLInputElement;
    expect(linkInput?.value).toContain('/c/');

    const copyBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Copy')
    );
    expect(copyBtn).toBeDefined();
  });
});
