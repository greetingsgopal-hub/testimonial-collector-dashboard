import { describe, it, expect } from 'vitest';
import {
  buildShopifyAuthUrl,
  isValidShopifyDomain,
  formatIndianPhoneNumber,
  parseShopifyOrderWebhook,
} from '../index';

describe('Shopify Integration Pipeline', () => {
  it('validates myshopify.com domains correctly', () => {
    expect(isValidShopifyDomain('aesthetic-apparel.myshopify.com')).toBe(true);
    expect(isValidShopifyDomain('https://bombay-shirts.myshopify.com/')).toBe(true);
    expect(isValidShopifyDomain('invalid-domain.com')).toBe(false);
    expect(isValidShopifyDomain('')).toBe(false);
  });

  it('builds Shopify OAuth authorization URL with correct parameters', () => {
    const url = buildShopifyAuthUrl({
      shopDomain: 'brand-delhi.myshopify.com',
      clientId: 'shpat_test123',
      redirectUri: 'https://app.pandapraise.com/api/shopify/callback',
      state: 'random_nonce_999',
    });

    expect(url).toContain('https://brand-delhi.myshopify.com/admin/oauth/authorize');
    expect(url).toContain('client_id=shpat_test123');
    expect(url).toContain('read_orders');
    expect(url).toContain('state=random_nonce_999');
  });

  it('normalizes Indian phone numbers to E.164 (+91) format for WhatsApp', () => {
    expect(formatIndianPhoneNumber('9876543210')).toBe('+919876543210');
    expect(formatIndianPhoneNumber('+91 98765 43210')).toBe('+919876543210');
    expect(formatIndianPhoneNumber('09876543210')).toBe('+919876543210');
    expect(formatIndianPhoneNumber(null)).toBeNull();
  });

  it('parses incoming Shopify orders webhook accurately for D2C review triggering', () => {
    const rawWebhook = {
      id: 884920194,
      name: '#ORD-2026-901',
      total_price: '2499.00',
      gateway: 'Cash on Delivery (COD)',
      financial_status: 'pending',
      fulfillment_status: 'fulfilled',
      customer: {
        first_name: 'Pooja',
        last_name: 'Hegde',
        phone: '9812345678',
        email: 'pooja@example.in',
      },
      shipping_address: {
        city: 'Bengaluru',
        province: 'Karnataka',
      },
      line_items: [
        {
          id: 101,
          title: 'Handloom Chanderi Kurta Set',
          quantity: 1,
          price: '2499.00',
        },
      ],
      created_at: '2026-10-24T12:00:00Z',
    };

    const parsed = parseShopifyOrderWebhook(rawWebhook);
    expect(parsed.orderNumber).toBe('#ORD-2026-901');
    expect(parsed.customerName).toBe('Pooja Hegde');
    expect(parsed.customerPhone).toBe('+919812345678');
    expect(parsed.financialStatus).toBe('cash_on_delivery');
    expect(parsed.lineItems[0].title).toBe('Handloom Chanderi Kurta Set');
    expect(parsed.shippingCity).toBe('Bengaluru');
  });
});
