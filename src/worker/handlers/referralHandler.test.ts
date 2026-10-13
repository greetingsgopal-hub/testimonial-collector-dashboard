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
});
