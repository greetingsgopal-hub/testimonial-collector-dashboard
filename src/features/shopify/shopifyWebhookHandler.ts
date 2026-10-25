import { ShopifyOrderEvent, ShopifyLineItem } from './types';
import { formatIndianPhoneNumber } from './shopifyAuth';

/**
 * Parses incoming raw Shopify Webhook payloads (orders/fulfilled, orders/updated)
 * into a normalized ShopifyOrderEvent structured for WhatsApp UGC triggers.
 */
export function parseShopifyOrderWebhook(payload: Record<string, any>): ShopifyOrderEvent {
  const customer = payload.customer || {};
  const shippingAddress = payload.shipping_address || {};
  const billingAddress = payload.billing_address || {};

  // Extract best available contact phone
  const rawPhone = customer.phone || shippingAddress.phone || billingAddress.phone || payload.phone;
  const customerPhone = formatIndianPhoneNumber(rawPhone) || undefined;

  // Extract customer name
  const firstName = customer.first_name || shippingAddress.first_name || 'Valued';
  const lastName = customer.last_name || shippingAddress.last_name || 'Customer';
  const customerName = `${firstName} ${lastName}`.trim();

  // Extract line items
  const lineItems: ShopifyLineItem[] = (payload.line_items || []).map((item: any) => ({
    id: item.id,
    title: item.title || item.name || 'Product',
    sku: item.sku || undefined,
    quantity: item.quantity || 1,
    price: item.price || '0',
    imageUrl: item.image?.src || item.featured_image?.url || undefined,
  }));

  // Financial status check (COD vs Prepaid)
  const gateway = (payload.gateway || '').toLowerCase();
  const paymentDetails = payload.payment_gateway_names || [];
  const isCod = gateway.includes('cod') || paymentDetails.some((g: string) => g.toLowerCase().includes('cash on delivery') || g.toLowerCase().includes('cod'));

  return {
    orderId: payload.id,
    orderNumber: payload.name || `#${payload.order_number || payload.id}`,
    customerName,
    customerPhone,
    customerEmail: customer.email || payload.email || undefined,
    shippingCity: shippingAddress.city || undefined,
    shippingState: shippingAddress.province || undefined,
    totalPrice: payload.total_price || '0',
    financialStatus: isCod ? 'cash_on_delivery' : (payload.financial_status === 'paid' ? 'paid' : 'pending'),
    fulfillmentStatus: payload.fulfillment_status === 'fulfilled' ? 'fulfilled' : 'delivered',
    lineItems,
    deliveredAt: payload.delivered_at || payload.updated_at,
    createdAt: payload.created_at || new Date().toISOString(),
  };
}
