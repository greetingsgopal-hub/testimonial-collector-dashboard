import { describe, it, expect, beforeEach } from 'vitest';
import {
  captureReferralCode,
  getStoredReferralCode,
  generateReferralUrl,
  clearStoredReferralCode,
} from '../referral';

describe('Referral Utilities (Task 1.4)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('captures referral code from URL search string and persists to storage', () => {
    const code = captureReferralCode('?ref=founder-vip-99');
    expect(code).toBe('founder-vip-99');
    expect(getStoredReferralCode()).toBe('founder-vip-99');
  });

  it('generates standard referral link for a workspace', () => {
    const url = generateReferralUrl('acme-corp');
    expect(url).toBe('https://pandapraise.com/r/acme-corp');
  });

  it('returns null when no referral code is in storage', () => {
    clearStoredReferralCode();
    expect(getStoredReferralCode()).toBeNull();
  });
});
