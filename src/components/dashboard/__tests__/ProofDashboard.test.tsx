// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ProofDashboard } from '../ProofDashboard';

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
      {
        id: 'mock-4',
        data: () => ({
          authorName: 'Marcus Vance',
          authorRole: 'Founder, Apex Craft',
          content: '“Panda Praise turns happy feedback into converted pipeline.”',
          rating: 5,
          status: 'pending',
          tags: ['Time saved'],
        }),
      },
    ],
  }),
}));

describe('ProofDashboard Stitch Component Suite', () => {
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

  it('1. Renders the browser shell with app.pandapraise.com/proof URL bar and macOS window controls', async () => {
    await act(async () => {
      root.render(<ProofDashboard workspaceId="besteample" userName="Erin Doyle" userRole="Admin" />);
    });

    expect(container.textContent).toContain('app.pandapraise.com/proof');
    expect(container.textContent).toContain('Erin Doyle');
    expect(container.textContent).toContain('Admin');
    expect(container.textContent).toContain('Your Proof');
  });

  it('2. Renders sidebar navigation groups: COLLECT, MANAGE, and SHARE', async () => {
    await act(async () => {
      root.render(<ProofDashboard workspaceId="besteample" userName="Erin Doyle" userRole="Admin" />);
    });

    expect(container.textContent).toContain('COLLECT');
    expect(container.textContent).toContain('Forms');
    expect(container.textContent).toContain('Import');
    expect(container.textContent).toContain('MANAGE');
    expect(container.textContent).toContain('Proof');
    expect(container.textContent).toContain('Tags');
    expect(container.textContent).toContain('SHARE');
    expect(container.textContent).toContain('Embeds');
    expect(container.textContent).toContain('Thank Yous');
    expect(container.textContent).toContain('Synced');
  });

  it('3. Renders praise attribute chips (Ease of use 42, Time saved 38, Support 29) and filters on click', async () => {
    await act(async () => {
      root.render(<ProofDashboard workspaceId="besteample" initialSearchQuery="" />);
    });

    expect(container.textContent).toContain('Customers praise:');
    expect(container.textContent).toContain('Ease of use');
    expect(container.textContent).toContain('42');
    expect(container.textContent).toContain('Time saved');
    expect(container.textContent).toContain('38');
    expect(container.textContent).toContain('Support');
    expect(container.textContent).toContain('29');

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
      root.render(<ProofDashboard workspaceId="besteample" initialSearchQuery="" />);
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

  it('5. Renders highlighted AI Case Study card', async () => {
    await act(async () => {
      root.render(<ProofDashboard workspaceId="besteample" />);
    });

    expect(container.textContent).toContain('How Hartley Plumbing cut missed jobs to zero in one month');
    expect(container.textContent).toContain('Case study generated with Panda Praise AI · 1 metric');
  });

  it('6. Invite Customer button opens modal and allows sending review invitation', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    await act(async () => {
      root.render(<ProofDashboard workspaceId="besteample" />);
    });

    const inviteBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Invite customer')
    );
    expect(inviteBtn).toBeDefined();

    await act(async () => {
      inviteBtn?.click();
    });

    // Modal should be open
    expect(container.textContent).toContain('Invite Customer for Review');
    expect(container.textContent).toContain('Send an automated review invitation link directly to your customer.');

    const nameInput = container.querySelector('input[placeholder="Customer Name"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[placeholder="customer@company.com"]') as HTMLInputElement;
    expect(nameInput).not.toBeNull();
    expect(emailInput).not.toBeNull();

    await act(async () => {
      const nativeInputSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputSetter?.call(nameInput, 'Alice Cooper');
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      nativeInputSetter?.call(emailInput, 'alice@acme.com');
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const sendBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Send Invite')
    );
    expect(sendBtn).toBeDefined();

    await act(async () => {
      sendBtn?.click();
    });

    expect(alertMock).toHaveBeenCalledWith('Invite sent successfully to alice@acme.com!');
    alertMock.mockRestore();
  });
});
