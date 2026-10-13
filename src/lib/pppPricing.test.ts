import { describe, it, expect } from 'vitest';
import {
  PPP_CURRENCY_RATES,
  detectCurrencyFromCountry,
  getPppDiscountBanner,
} from './pppPricing';

describe('Purchasing Power Parity (PPP) Engine (Task 4.2)', () => {
  it('correctly maps country codes to local PPP currencies', () => {
    expect(detectCurrencyFromCountry('IN')).toBe('INR');
    expect(detectCurrencyFromCountry('in')).toBe('INR');
    expect(detectCurrencyFromCountry('BR')).toBe('BRL');
    expect(detectCurrencyFromCountry('DE')).toBe('EUR');
    expect(detectCurrencyFromCountry('FR')).toBe('EUR');
    expect(detectCurrencyFromCountry('GB')).toBe('GBP');
    expect(detectCurrencyFromCountry('US')).toBe('USD');
    expect(detectCurrencyFromCountry('CA')).toBe('USD');
    expect(detectCurrencyFromCountry(null)).toBe('USD');
  });

  it('provides complete pricing configurations with local payment rails for each currency', () => {
    const inr = PPP_CURRENCY_RATES.INR;
    expect(inr.symbol).toBe('₹');
    expect(inr.discountPercent).toBe(55);
    expect(inr.localMethods).toContain('UPI');

    const brl = PPP_CURRENCY_RATES.BRL;
    expect(brl.symbol).toBe('R$');
    expect(brl.discountPercent).toBe(45);
    expect(brl.localMethods).toContain('Pix');

    const eur = PPP_CURRENCY_RATES.EUR;
    expect(eur.symbol).toBe('€');
    expect(eur.localMethods).toContain('iDEAL');
  });

  it('generates friendly PPP discount banner for eligible regions', () => {
    const inrBanner = getPppDiscountBanner('INR', 'IN');
    expect(inrBanner).toContain('55% off standard USD rates');
    expect(inrBanner).toContain('India');

    const usdBanner = getPppDiscountBanner('USD', 'US');
    expect(usdBanner).toBeNull();
  });
});
