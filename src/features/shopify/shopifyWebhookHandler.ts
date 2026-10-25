import { ShopifyOrderEvent } from './types';

/**
 * Normalizes an Indian phone number to E.164 format (+91XXXXXXXXXX)
 */
export function normalizeIndianPhoneNumber(phone?: string): string | undefined {
  if (!phone) return undefined;
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  } else if (cleaned.length === 13 && cleaned.startsWith('+91')) {
    return cleaned;
  }
  return phone;
}

/**
 * Processes an incoming Shopify order webhook payload
 */
export function processShopifyOrderWebhook(payload: any): ShopifyOrderEvent {
  const isCod = payload.financial_status === 'pending' || 
    payload.payment_gateway_names?.some((gw: string) => gw.toLowerCase().includes('cod') || gw.toLowerCase().includes('cash')) ||
    payload.gateway?.toLowerCase().includes('cod');

  const rawPhone = payload.shipping_address?.phone || payload.customer?.phone || payload.phone;
  const normalizedPhone = normalizeIndianPhoneNumber(rawPhone);

  const lineItems = (payload.line_items || []).map((item: any) => ({
    id: String(item.id),
    title: item.title,
    variantTitle: item.variant_title,
    quantity: item.quantity,
    price: item.price,
    sku: item.sku
  }));

  return {
    orderId: String(payload.id || payload.order_number),
    orderNumber: String(payload.name || `#${payload.order_number || payload.id}`),
    customerName: `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim() || 'Verified Buyer',
    customerEmail: payload.customer?.email || payload.email,
    customerPhone: normalizedPhone,
    shippingCity: payload.shipping_address?.city || 'India',
    lineItems,
    totalPrice: payload.total_price || '0.00',
    currency: payload.currency || 'INR',
    isCodOrder: isCod,
    financialStatus: isCod ? 'cash_on_delivery' : (payload.financial_status === 'paid' ? 'paid' : 'pending'),
    fulfillmentStatus: payload.fulfillment_status === 'fulfilled' ? 'fulfilled' : 'delivered',
    createdAt: payload.created_at || new Date().toISOString()
  };
}

/**
 * Backward-compatible alias for existing callers
 */
export const parseShopifyOrderWebhook = processShopifyOrderWebhook;

/**
 * Generates a WhatsApp verification request message template tailored for Indian D2C brands
 */
export function generateWhatsAppVerificationMessage(order: ShopifyOrderEvent): {
  recipientPhone?: string;
  messageBody: string;
} {
  const firstName = order.customerName.split(' ')[0];
  const firstItem = order.lineItems[0]?.title || 'your order';

  const messageBody = `Namaste ${firstName}! 🙏\n\nYour order for *${firstItem}* has been delivered successfully. As a special thank you from our brand, how did you like the quality?\n\nReply with a quick review or photo and get an extra 10% OFF on your next prepaid order! ✨`;

  return {
    recipientPhone: order.customerPhone,
    messageBody
  };
}
