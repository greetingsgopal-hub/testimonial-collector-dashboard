// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import ProofSection, { classifyPraiseCategories } from '../ProofSection';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Mock Firebase Firestore
const mockDocs = [
  {
    id: 'proof-1',
    data: () => ({
      authorName: 'Sam Marsh',
      authorRole: 'Marsh & Sons',
      content: 'I was sure the techs would never use it. They picked it up in a day.',
      rating: 5,
      status: 'approved',
      source: 'Google',
      tags: ['Ease of use'],
      createdAt: '2026-10-18T10:00:00Z',
    }),
  },
  {
    id: 'proof-2',
    data: () => ({
      authorName: 'Dave Hartley',
      authorRole: 'Owner, Hartley Plumbing',
      content: 'Scheduling used to eat my Sundays. Now it runs itself and saves hours.',
      rating: 5,
      status: 'approved',
      source: 'CSV Import',
      tags: ['Time saved'],
      createdAt: '2026-10-17T10:00:00Z',
    }),
  },
  {
    id: 'proof-3',
    data: () => ({
      authorName: 'Elena Rostova',
      authorRole: 'VP Operations, SwiftFlow',
      content: 'The support team guided us through every step with incredible care.',
      rating: 5,
      status: 'pending review',
      source: 'Direct Form',
      tags: ['Support'],
      createdAt: '2026-10-16T10:00:00Z',
      screenshotUrl: 'https://example.com/screenshot.png',
    }),
  },
];

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  getDocs: vi.fn().mockImplementation(async () => ({
    docs: mockDocs,
  })),
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({
    exists: () => false,
    data: () => ({}),
  }),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  addDoc: vi.fn().mockResolvedValue({ id: 'new-doc-id' }),
  serverTimestamp: vi.fn(() => new Date().toISOString()),
}));

describe('classifyPraiseCategories logic', () => {
  it('correctly classifies "picked it up in a day" into "Ease of use"', () => {
    const categories = classifyPraiseCategories('They picked it up in a day and setup was fast');
    expect(categories).toContain('Ease of use');
  });

  it('correctly classifies "saved hours" into "Time saved"', () => {
    const categories = classifyPraiseCategories('Scheduling used to eat my Sundays. Saved hours every week.');
    expect(categories).toContain('Time saved');
  });

  it('correctly classifies "support team was helpful" into "Support"', () => {
    const categories = classifyPraiseCategories('The customer support team gave fast response.');
    expect(categories).toContain('Support');
  });

  it('preserves existing matched tags', () => {
    const categories = classifyPraiseCategories('Great product', ['Support']);
    expect(categories).toContain('Support');
  });

  it('defaults to "Ease of use" for general reviews without specific keywords', () => {
    const categories = classifyPraiseCategories('Just wonderful experience overall!');
    expect(categories).toContain('Ease of use');
  });
});

describe('ProofSection Component', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
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

  it('renders "Your Proof" heading, count badge, and "+ Invite customer" button', async () => {
    await act(async () => {
      root.render(<ProofSection workspaceId="testeample" workspaceName="Test Eample" />);
    });

    expect(container.textContent).toContain('Your Proof');
    expect(container.textContent).toContain('Invite customer');
    expect(container.textContent).toContain('Refresh Proof');
  });

  it('renders the "Customers praise:" ribbon with dynamic category counts', async () => {
    await act(async () => {
      root.render(<ProofSection workspaceId="testeample" workspaceName="Test Eample" />);
    });

    expect(container.textContent).toContain('Customers praise:');
    expect(container.textContent).toContain('Ease of use');
    expect(container.textContent).toContain('Time saved');
    expect(container.textContent).toContain('Support');
  });

  it('renders the purple-bordered search bar and allows filtering reviews', async () => {
    await act(async () => {
      root.render(<ProofSection workspaceId="testeample" workspaceName="Test Eample" />);
    });

    const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(searchInput).toBeTruthy();
    expect(searchInput.className).toContain('border-purple-300');

    // Filter by 'Dave Hartley'
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeSetter?.call(searchInput, 'Hartley');
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('Dave Hartley');
    expect(container.textContent).not.toContain('Sam Marsh');
  });

  it('displays attached screenshot proof preview when screenshotUrl is present', async () => {
    await act(async () => {
      root.render(<ProofSection workspaceId="testeample" workspaceName="Test Eample" />);
    });

    const img = container.querySelector('img[src="https://example.com/screenshot.png"]');
    expect(img).toBeTruthy();
    expect(container.textContent).toContain('Attached Screenshot Proof');
  });

  it('opens Invite Customer modal on clicking "+ Invite customer"', async () => {
    await act(async () => {
      root.render(<ProofSection workspaceId="testeample" workspaceName="Test Eample" />);
    });

    const inviteButtons = Array.from(container.querySelectorAll('button')).filter((b) =>
      b.textContent?.includes('Invite customer')
    );
    expect(inviteButtons.length).toBeGreaterThan(0);

    await act(async () => {
      inviteButtons[0].click();
    });

    expect(container.textContent).toContain('Invite Customer for Review');
    const input = container.querySelector('input[readonly]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toContain('/c/testeample');
  });
});
