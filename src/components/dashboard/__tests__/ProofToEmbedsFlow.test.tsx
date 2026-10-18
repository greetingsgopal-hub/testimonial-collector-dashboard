import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import ProofToEmbedsFlow, {
  ProofSection,
  EmbedsPostStudio,
  classifyPraiseTags,
} from '../ProofToEmbedsFlow';

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  getDocs: vi.fn().mockResolvedValue({
    docs: [
      {
        id: 'proof-1',
        data: () => ({
          authorName: 'Andrea',
          authorRole: 'Any City',
          content: 'What really stood out was the attention to detail. Every meal was delicious and beautifully presented.',
          rating: 5,
          status: 'approved',
          source: 'Google Reviews',
          tags: ['Ease of use', 'Support'],
          createdAt: new Date().toISOString(),
        }),
      },
      {
        id: 'proof-2',
        data: () => ({
          authorName: 'Sam Marsh',
          authorRole: 'Marsh & Sons',
          content: 'I was sure the techs would never use it. They picked it up in a day.',
          rating: 5,
          status: 'approved',
          source: 'Direct Form',
          tags: ['Ease of use'],
          createdAt: new Date().toISOString(),
        }),
      },
    ],
  }),
  doc: vi.fn(),
  updateDoc: vi.fn().mockResolvedValue(undefined),
}));

describe('ProofToEmbedsFlow & Editorial Place-Card Studio', () => {
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
    document.body.innerHTML = '';
  });

  it('classifies praise tags correctly', () => {
    expect(classifyPraiseTags('simple to use and fast setup')).toContain('Ease of use');
    expect(classifyPraiseTags('saved hours on scheduling')).toContain('Time saved');
    expect(classifyPraiseTags('attentive staff and quick care')).toContain('Support');
  });

  it('renders ProofSection with checkboxes and Post on Internet action', async () => {
    await act(async () => {
      root.render(
        <ProofSection
          workspaceId="testeample"
          workspaceName="Test Eample"
          onPostOnInternet={() => {}}
        />
      );
    });

    expect(container.textContent).toContain('Your Proof');
    expect(container.textContent).toContain('Post on Internet →');
    expect(container.textContent).toContain('Customers praise:');
    expect(container.textContent).toContain('Andrea');
    expect(container.textContent).toContain('Sam Marsh');
  });

  it('switches to EmbedsPostStudio when Post on Internet is clicked in unified ProofToEmbedsFlow', async () => {
    await act(async () => {
      root.render(
        <ProofToEmbedsFlow workspaceId="testeample" workspaceName="Test Eample" />
      );
    });

    expect(container.textContent).toContain('Your Proof');

    const postBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Post on Internet')
    );
    expect(postBtn).toBeDefined();

    await act(async () => {
      postBtn!.click();
    });

    // Successfully transitioned to Embeds Studio!
    expect(container.textContent).toContain('Embeds & Post on Internet Studio');
    expect(container.textContent).toContain('Customize Approved Testimonial Before Posting');
    expect(container.textContent).toContain('Upload from System');
    expect(container.textContent).toContain('Download High-Res Testimonial Card (PNG)');
    expect(container.textContent).toContain('Post to LinkedIn ↗');
    expect(container.textContent).toContain('Back to Proof');
  });

  it('renders EmbedsPostStudio with Editorial Place-Card elements and live edits', async () => {
    const mockTestimonial = {
      id: 'proof-1',
      workspaceId: 'testeample',
      authorName: 'Andrea',
      authorRole: 'Any City',
      content: 'What really stood out was the attention to detail.',
      rating: 5,
      status: 'Approved' as const,
      source: 'Google Reviews',
      tags: ['Ease of use' as const],
      createdAt: new Date().toISOString(),
    };

    await act(async () => {
      root.render(
        <EmbedsPostStudio
          workspaceName="Test Eample"
          selectedTestimonials={[mockTestimonial]}
        />
      );
    });

    expect(container.textContent).toContain('Andrea');
    expect(container.textContent).toContain('Any City');
    expect(container.textContent).toContain('Resort Courtyard (Default)');
    expect(container.textContent).toContain('Download High-Res Testimonial Card (PNG)');
    expect(container.textContent).toContain('Copy Embed Code');
  });

  it('allows clicking Back to Proof to return from Embeds studio', async () => {
    await act(async () => {
      root.render(
        <ProofToEmbedsFlow workspaceId="testeample" workspaceName="Test Eample" />
      );
    });

    // Go to embeds
    const postBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Post on Internet')
    );
    await act(async () => {
      postBtn!.click();
    });
    expect(container.textContent).toContain('Embeds & Post on Internet Studio');

    // Click Back to Proof
    const backBtn = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Back to Proof')
    );
    expect(backBtn).toBeDefined();
    await act(async () => {
      backBtn!.click();
    });

    expect(container.textContent).toContain('Your Proof');
  });
});
