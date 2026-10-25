import { describe, it, expect } from 'vitest';
import {
  SHOPIFY_ROUTES_TEMPLATE,
  BILLING_ROUTES_TEMPLATE,
  SHOPIFY_CONNECT_BUTTON_TEMPLATE,
  BILLING_WIDGET_TEMPLATE,
  USAGE_GUARD_TEMPLATE,
  ENV_EXAMPLE_TEMPLATE,
} from '../shopifyRazorpayTemplates';

describe('Shopify OAuth + Razorpay Drop Enforcement Templates (v2.1.0)', () => {
  it('exports valid SHOPIFY_ROUTES_TEMPLATE with HMAC and OAuth flow', () => {
    expect(SHOPIFY_ROUTES_TEMPLATE).toBeDefined();
    expect(SHOPIFY_ROUTES_TEMPLATE).toContain('server/routes/shopify.js');
    expect(SHOPIFY_ROUTES_TEMPLATE).toContain('verifyHmac');
    expect(SHOPIFY_ROUTES_TEMPLATE).toContain('verifyWebhookHmac');
    expect(SHOPIFY_ROUTES_TEMPLATE).toContain('/auth/shopify');
    expect(SHOPIFY_ROUTES_TEMPLATE).toContain('/auth/shopify/callback');
    expect(SHOPIFY_ROUTES_TEMPLATE).toContain('timingSafeEqual');
  });

  it('exports valid BILLING_ROUTES_TEMPLATE with drop enforcement and order creation', () => {
    expect(BILLING_ROUTES_TEMPLATE).toBeDefined();
    expect(BILLING_ROUTES_TEMPLATE).toContain('server/routes/billing.js');
    expect(BILLING_ROUTES_TEMPLATE).toContain('requireAdsLeft');
    expect(BILLING_ROUTES_TEMPLATE).toContain('starter:');
    expect(BILLING_ROUTES_TEMPLATE).toContain('growth:');
    expect(BILLING_ROUTES_TEMPLATE).toContain('scale:');
    expect(BILLING_ROUTES_TEMPLATE).toContain('/api/billing/create-order');
    expect(BILLING_ROUTES_TEMPLATE).toContain('/api/billing/verify');
  });

  it('exports valid frontend components (ShopifyConnectButton, BillingWidget, UsageGuard)', () => {
    expect(SHOPIFY_CONNECT_BUTTON_TEMPLATE).toContain('ShopifyConnectButton');
    expect(SHOPIFY_CONNECT_BUTTON_TEMPLATE).toContain('your-store.myshopify.com');

    expect(BILLING_WIDGET_TEMPLATE).toContain('BillingWidget');
    expect(BILLING_WIDGET_TEMPLATE).toContain('Razorpay');

    expect(USAGE_GUARD_TEMPLATE).toContain('UsageGuard');
    expect(USAGE_GUARD_TEMPLATE).toContain('No ads left');
  });

  it('exports valid ENV_EXAMPLE_TEMPLATE with required variables', () => {
    expect(ENV_EXAMPLE_TEMPLATE).toContain('SHOPIFY_API_KEY');
    expect(ENV_EXAMPLE_TEMPLATE).toContain('SHOPIFY_API_SECRET');
    expect(ENV_EXAMPLE_TEMPLATE).toContain('RAZORPAY_KEY_ID');
    expect(ENV_EXAMPLE_TEMPLATE).toContain('RAZORPAY_KEY_SECRET');
    expect(ENV_EXAMPLE_TEMPLATE).toContain('WHATSAPP_TOKEN');
  });
});
