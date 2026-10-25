import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publishAdToMetaManager } from '../metaMarketingApi';

describe('Phase 4: Meta Marketing API Direct Push', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('successfully creates an ad creative on Meta Ads Manager', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/adcreatives')) {
        return Promise.resolve({
          json: () => Promise.resolve({ id: '23851928374650' }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await publishAdToMetaManager({
      shopDomain: 'brand.myshopify.com',
      accessToken: 'EAABfakeToken123',
      adAccountId: 'act_987654321',
      pageId: '1029384756',
      creativeTitle: 'Mulmul Cotton Kurti - var-1',
      primaryText: 'Real customer review from Pune...',
      headline: 'Mulmul Cotton Kurti ⭐⭐⭐⭐⭐',
      ctaType: 'SHOP_NOW',
      destinationUrl: 'https://brand.in/products/mulmul-cotton-kurti',
    });

    expect(result.success).toBe(true);
    expect(result.adSetId).toBe('23851928374650');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('uploads image hash first when imageUrl is provided', async () => {
    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/adimages')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            images: {
              'image.png': { hash: 'img_hash_abcdef123' },
            },
          }),
        });
      }
      if (url.includes('/adcreatives')) {
        return Promise.resolve({
          json: () => Promise.resolve({ id: '23851928374651' }),
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await publishAdToMetaManager({
      shopDomain: 'brand.myshopify.com',
      accessToken: 'EAABfakeToken123',
      adAccountId: '987654321', // without act_ prefix, should be sanitized
      pageId: '1029384756',
      creativeTitle: 'Mulmul Cotton Kurti - var-2',
      primaryText: 'Real customer review from Pune...',
      headline: 'Mulmul Cotton Kurti ⭐⭐⭐⭐⭐',
      imageUrl: 'https://cdn.shopify.com/files/kurti.png',
      ctaType: 'SHOP_NOW',
      destinationUrl: 'https://brand.in/products/mulmul-cotton-kurti',
    });

    expect(result.success).toBe(true);
    expect(result.adSetId).toBe('23851928374651');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Check act_ prefix was applied
    expect(mockFetch.mock.calls[0][0]).toContain('act_987654321/adimages');
  });

  it('captures Meta API error gracefully and returns success: false', async () => {
    const mockFetch = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        json: () => Promise.resolve({
          error: {
            message: 'Invalid OAuth 2.0 Access Token',
            type: 'OAuthException',
            code: 190,
          },
        }),
      });
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await publishAdToMetaManager({
      shopDomain: 'brand.myshopify.com',
      accessToken: 'expired_token',
      adAccountId: 'act_987654321',
      pageId: '1029384756',
      creativeTitle: 'Mulmul Cotton Kurti',
      primaryText: 'Real review',
      headline: 'Kurti',
      ctaType: 'SHOP_NOW',
      destinationUrl: 'https://brand.in',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid OAuth 2.0 Access Token');
  });
});
