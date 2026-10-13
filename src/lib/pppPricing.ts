export type PppCurrency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'BRL';

export interface PppPlanPrice {
  starter: number;
  pro: number;
  business: number;
  founding?: number;
  symbol: string;
  name: string;
  discountPercent: number; // relative to USD standard
  localMethods: string[];
}

export const PPP_CURRENCY_RATES: Record<PppCurrency, PppPlanPrice> = {
  USD: {
    starter: 19,
    pro: 49,
    business: 99,
    symbol: '$',
    name: 'US Dollar',
    discountPercent: 0,
    localMethods: ['Card', 'Apple Pay', 'Google Pay'],
  },
  INR: {
    starter: 799,
    pro: 1999,
    business: 3999,
    founding: 4999,
    symbol: '₹',
    name: 'Indian Rupee',
    discountPercent: 55,
    localMethods: ['UPI', 'Netbanking', 'RuPay', 'Cards'],
  },
  EUR: {
    starter: 17,
    pro: 45,
    business: 89,
    symbol: '€',
    name: 'Euro',
    discountPercent: 10,
    localMethods: ['iDEAL', 'SEPA', 'Bancontact', 'Cards'],
  },
  GBP: {
    starter: 15,
    pro: 39,
    business: 79,
    symbol: '£',
    name: 'British Pound',
    discountPercent: 10,
    localMethods: ['Bacs', 'Apple Pay', 'Cards'],
  },
  BRL: {
    starter: 59,
    pro: 149,
    business: 299,
    symbol: 'R$',
    name: 'Brazilian Real',
    discountPercent: 45,
    localMethods: ['Pix', 'Boleto', 'Cards'],
  },
};

const COUNTRY_TO_CURRENCY: Record<string, PppCurrency> = {
  IN: 'INR',
  BR: 'BRL',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
};

export function detectCurrencyFromCountry(countryCode?: string | null): PppCurrency {
  if (!countryCode) return 'USD';
  const upper = countryCode.toUpperCase().trim();
  return COUNTRY_TO_CURRENCY[upper] || 'USD';
}

export function getPppDiscountBanner(currency: PppCurrency, countryCode?: string): string | null {
  const plan = PPP_CURRENCY_RATES[currency];
  if (!plan || plan.discountPercent <= 0) return null;

  const countryName = countryCode === 'IN' ? 'India' : countryCode === 'BR' ? 'Brazil' : 'your region';
  return `Special Purchasing Power Parity (PPP) pricing for visitors in ${countryName}: ${plan.discountPercent}% off standard USD rates!`;
}
