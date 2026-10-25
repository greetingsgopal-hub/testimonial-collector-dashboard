import { describe, it, expect } from 'vitest';
import { 
  normalizeIndianPhoneNumber, 
  processShopifyOrderWebhook, 
  generateWhatsAppVerificationMessage 
} from '../shopifyWebhookHandler';
import { buildShopifyAuthUrl, isValidShopifyDomain } from '../shopifyAuth';

describe('Shopify Pipeline & WhatsApp/COD Logic', () => {
  it('normalizes Indian phone numbers correctly', () => {
    expect(normalizeIndianPhoneNumber('9876543210')).toBe('+919876543210');
    expect(normalizeIndianPhoneNumber('919876543210')).toBe('+919876543210');
    expect(normalizeIndianPhoneNumber('+919876543210')).toBe('+919876543210');
    expect(normalizeIndianPhoneNumber('invalid')).toBe('invalid');
    expect(normalizeIndianPhoneNumber(undefined)).toBeUndefined();
  });

  it('detects COD orders and parses line items from webhook payload', () => {
    const mockPayload = {
      id: 12345,
      name: '#1001',
      financial_status: 'pending',
      payment_gateway_names: ['Cash on Delivery (COD)'],
      customer: {
        first_name: 'Rahul',
        last_name: 'Sharma',
        phone: '9876543210'
      },
      shipping_address: {
        city: 'Mumbai',
        phone: '9876543210'
      },
      line_items: [
        { id: 1, title: 'Oversized Cotton T-Shirt', quantity: 1, price: '999.00' }
      ],
      total_price: '999.00',
      currency: 'INR',
      created_at: '2026-10-25T10:00:00Z'
    };

    const result = processShopifyOrderWebhook(mockPayload);

    expect(result.isCodOrder).toBe(true);
    expect(result.customerPhone).toBe('+919876543210');
    expect(result.shippingCity).toBe('Mumbai');
    expect(result.lineItems[0].title).toBe('Oversized Cotton T-Shirt');
  });

  it('generates a WhatsApp review verification message with recipient phone', () => {
    const order = processShopifyOrderWebhook({
      id: 999,
      name: '#ORD-999',
      customer: { first_name: 'Ananya', last_name: 'Kapoor', phone: '9876543210' },
      line_items: [{ id: 1, title: 'Lavender Kurti', quantity: 1, price: '1299.00' }],
    });

    const msg = generateWhatsAppVerificationMessage(order);
    expect(msg.recipientPhone).toBe('+919876543210');
    expect(msg.messageBody).toContain('Namaste Ananya!');
    expect(msg.messageBody).toContain('Lavender Kurti');
    expect(msg.messageBody).toContain('10% OFF');
  });

  it('validates myshopify.com domains and builds auth URL', () => {
    expect(isValidShopifyDomain('my-brand.myshopify.com')).toBe(true);
    expect(isValidShopifyDomain('invalid-site.com')).toBe(false);

    const authUrl = buildShopifyAuthUrl({
      shopDomain: 'my-brand.myshopify.com',
      clientId: 'test_client_id',
      redirectUri: 'https://app.pandapraise.com/callback',
      state: 'nonce_123',
    });
    expect(authUrl).toContain('my-brand.myshopify.com');
    expect(authUrl).toContain('client_id=test_client_id');
  });
});
