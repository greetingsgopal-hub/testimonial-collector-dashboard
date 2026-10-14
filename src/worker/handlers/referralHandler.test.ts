import { describe, it, expect } from 'vitest';
import { handleReferralRedirect } from './referralHandler';

describe('Referral Handler (Task 1.4)', () => {
  it('redirects /r/:code to root with a 60-day attribution cookie', async () => {
    const request = new Request('https://pandapraise.com/r/growth-squad-42');
    const response = await handleReferralRedirect(request, {} as any);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://pandapraise.com/?ref=growth-squad-42');
    const cookie = response.headers.get('Set-Cookie');
    expect(cookie).toContain('pp_ref=growth-squad-42');
    expect(cookie).toContain('Max-Age=5184000'); // 60 days
    expect(cookie).toContain('SameSite=Lax');
  });

  it('handles invalid or empty referral code safely', async () => {
    const request = new Request('https://pandapraise.com/r/');
    const response = await handleReferralRedirect(request, {} as any);

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe('https://pandapraise.com/');
  });

  it('returns clean zero baseline stats for referral code', async () => {
    const { handleReferralStats } = await import('./referralHandler');
    const request = new Request('https://pandapraise.com/api/referral/stats?code=growth42');
    const response = await handleReferralStats(request, {} as any);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.code).toBe('growth42');
    expect(data.clicks).toBe(0);
    expect(data.signups).toBe(0);
    expect(data.monthsEarned).toBe(0);
    expect(data.rewardValueUSD).toBe(0);
    expect(data.status).toBe('active');
  });
});
