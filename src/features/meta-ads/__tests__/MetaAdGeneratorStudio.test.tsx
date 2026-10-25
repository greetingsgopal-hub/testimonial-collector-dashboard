import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MetaAdGeneratorStudio } from '../components/MetaAdGeneratorStudio';
import { ParsedHighIntentReview } from '../../reviews/types';

describe('MetaAdGeneratorStudio Component', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  const mockReview: ParsedHighIntentReview = {
    id: 'rev_test_1',
    author: 'Rhea Sen',
    authorName: 'Rhea Sen',
    buyerCity: 'Mumbai',
    authorCity: 'Mumbai',
    productTitle: 'Mulberry Silk Night Suit',
    originalText: 'I was hesitant about Instagram brands, but this fabric is incredible and everyone asked where I got it!',
    cleanedText: 'I was hesitant about Instagram brands, but this fabric is incredible and everyone asked where I got it!',
    intentCategory: 'quality_proof',
    source: 'whatsapp',
    rating: 5,
    isCodMentioned: true,
    isDeliveryMentioned: false,
    isRepeatBuyer: false,
    mediaType: 'video',
    mediaUrl: '/demo_meta_ad.mp4',
    intentScore: 92,
    extractedKeywords: ['fabric', 'incredible'],
    extractedKeyPhrase: 'fabric is incredible and everyone asked where I got it',
    adAngleSuggestion: 'Skeptic to Believer',
    suggestedAdAngles: ['Skeptic to Believer', 'Social Proof'],
    isEligibleForMetaAd: true,
  };

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

  it('renders studio header, review author, video player, and format selectors', async () => {
    await act(async () => {
      root.render(<MetaAdGeneratorStudio selectedReview={mockReview} brandName="Silken D2C" />);
    });

    expect(container.textContent).toContain('Review-to-Meta-Ad Studio');
    expect(container.textContent).toContain('Rhea Sen');
    expect(container.textContent).toContain('9:16 Reels');
    expect(container.textContent).toContain('1:1 Feed');
    expect(container.textContent).toContain('4:5 Catalog');
    expect(container.textContent).toContain('Silken D2C');
    expect(container.textContent).toContain('COD Available • 7-Day Exchange');
  });

  it('renders all viral hooks and allows selecting hook angle', async () => {
    await act(async () => {
      root.render(<MetaAdGeneratorStudio selectedReview={mockReview} brandName="Silken D2C" />);
    });

    // Check hook angles
    expect(container.textContent).toContain('Select High-Converting D2C Hook');
    expect(container.textContent).toContain('Don\'t buy Mulberry Silk Night Suit');
    expect(container.textContent).toContain('I honestly thought Instagram brands were all hype');

    // Check Meta Ads Manager copy pack
    expect(container.textContent).toContain('Meta Ads Manager Copy Pack');
    expect(container.textContent).toContain('Cash on Delivery Available');
    expect(container.textContent).toContain('Save to Meta Ads Library');
  });

  it('saves creative to library and triggers onAdSaved callback', async () => {
    const onAdSaved = vi.fn();

    await act(async () => {
      root.render(
        <MetaAdGeneratorStudio 
          selectedReview={mockReview} 
          brandName="Silken D2C" 
          onAdSaved={onAdSaved} 
        />
      );
    });

    const saveBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Save to Meta Ads Library')
    );
    expect(saveBtn).toBeTruthy();

    await act(async () => {
      saveBtn?.click();
    });

    expect(onAdSaved).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain('Saved to Meta Ads Library!');
  });
});
