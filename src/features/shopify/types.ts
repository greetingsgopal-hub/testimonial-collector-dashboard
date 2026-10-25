/**
 * Shopify Store & Webhook Integration Types
 * Tailored for Indian Shopify D2C Merchants
 */

export interface ShopifyStoreConfig {
  shopDomain: string; // e.g. 'aesthetic-apparel.myshopify.com'
  storeName: string;
  accessToken?: string;
  scopes?: string[];
  installedAt?: string;
  currency: 'INR' | string;
  countryCode: 'IN' | string;
  primaryDomain?: string;
  webhookSecret?: string;
}

export interface ShopifyLineItem {
  id: string | number;
  title: string;
  variantTitle?: string;
  sku?: string;
  quantity: number;
  price: string;
  imageUrl?: string;
}

export interface ShopifyOrderEvent {
  orderId: string | number;
  orderNumber: string;
  customerName: string;
  customerPhone?: string; // Formatted +91 for WhatsApp
  customerEmail?: string;
  shippingCity?: string;
  shippingState?: string;
  totalPrice: string;
  currency?: string;
  isCodOrder?: boolean;
  financialStatus?: 'paid' | 'pending' | 'cash_on_delivery';
  fulfillmentStatus?: 'fulfilled' | 'delivered' | 'partial';
  lineItems: ShopifyLineItem[];
  deliveredAt?: string;
  createdAt: string;
}

export interface ShopifyConnectionState {
  isConnected: boolean;
  shopDomain: string | null;
  storeName: string | null;
  status: 'active' | 'syncing' | 'disconnected' | 'error';
  lastSyncedAt?: string;
  totalOrdersProcessed?: number;
  errorMessage?: string;
}
