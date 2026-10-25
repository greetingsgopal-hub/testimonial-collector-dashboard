export const SERVER_JS_TEMPLATE = `/**
 * PandaPraise - Step 1: WhatsApp Template Sender
 * POST /api/v1/whatsapp/send-template
 * 
 * Single-file server.js - Copy paste ready for Antigravity Node project
 * Stack: Express + dotenv + axios + WhatsApp Cloud API
 * 
 * .env EXAMPLE:
 * ----------------
 * PORT=3000
 * PANDAPRAISE_API_KEY=sk_live_xxx_shopify_flow_secret
 * WHATSAPP_CLOUD_API_TOKEN=EAAK...Meta_long_lived_token
 * WHATSAPP_PHONE_NUMBER_ID=123456789012345
 * WHATSAPP_BUSINESS_ACCOUNT_ID=987654321
 * SHOPIFY_FLOW_ALLOWED_IPS= (optional)
 * ----------------
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json({ limit: '50kb' }));

// --- CONFIG ---
const CONFIG = {
  port: process.env.PORT || 3000,
  apiKey: process.env.PANDAPRAISE_API_KEY,
  waToken: process.env.WHATSAPP_CLOUD_API_TOKEN,
  waPhoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  waApiVersion: 'v20.0',
  templateName: 'video_review_reward_7day',
};

// --- 1. AUTH MIDDLEWARE (Shopify Flow -> x-api-key) ---
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!CONFIG.apiKey) {
    console.error('[CONFIG] PANDAPRAISE_API_KEY missing in .env');
    return res.status(500).json({ success: false, error: 'Server misconfigured' });
  }
  if (!key || key !== CONFIG.apiKey) {
    console.warn(\`[AUTH] Invalid API key from \${req.ip}\`);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid x-api-key' });
  }
  next();
}

// --- 2. PHONE VALIDATION + INDIAN NORMALIZATION ---
/**
 * Normalizes to E.164.
 * - Strips spaces, -, (), .
 * - Indian logic: 10 digit (9876543210) => +91..., 0 prefix removed, 91 prefix => +91
 * - Final check: /^\\+[1-9]\\d{7,14}$/
 */
function normalizeAndValidatePhone(raw) {
  if (!raw || typeof raw !== 'string') throw new Error('PHONE_MISSING');
  let p = raw.replace(/[\\s\\-\\(\\)\\.]/g, '');

  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (p.startsWith('0') && !p.startsWith('+')) p = p.slice(1);
  
  // Indian 10-digit without country code
  if (/^\\d{10}$/.test(p)) p = '+91' + p;
  // Indian with 91 prefix but no +
  if (/^91\\d{10}$/.test(p)) p = '+' + p;
  
  const E164 = /^\\+[1-9]\\d{7,14}$/;
  if (!E164.test(p)) {
    const err = new Error(\`Invalid phone format: \${raw} => \${p}. Expected E.164 like +919876543210\`);
    err.name = 'PHONE_INVALID';
    throw err;
  }
  return p;
}

// --- 3. WHATSAPP CLOUD API SENDER with 429 RETRY ---
async function sendWhatsAppTemplate({ to, customerName, productName }, attempt = 1) {
  const url = \`https://graph.facebook.com/v\${CONFIG.waApiVersion}/\${CONFIG.waPhoneId}/messages\`;

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: CONFIG.templateName,
      language: { code: 'en' },
      components: [
        {
          type: 'header',
          parameters: [{ type: 'text', text: productName || 'your purchase' }],
        },
        {
          type: 'body',
          parameters: [
            { type: 'text', text: customerName || 'there' }, // {{1}}
            { type: 'text', text: productName || 'your recent purchase' }, // {{2}}
          ],
        },
      ],
    },
  };

  try {
    const { data } = await axios.post(url, payload, {
      headers: {
        Authorization: \`Bearer \${CONFIG.waToken}\`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    return data; // { messaging_product, contacts, messages: [{id}] }
  } catch (error) {
    const status = error.response?.status;
    const metaError = error.response?.data?.error;

    // 429 Rate Limit -> Exponential backoff retry (max 3 attempts)
    if (status === 429 && attempt <= 3) {
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      console.warn(\`[WA] 429 Rate limit. Retry \${attempt}/3 in \${delay}ms\`);
      await new Promise((r) => setTimeout(r, delay));
      return sendWhatsAppTemplate({ to, customerName, productName }, attempt + 1);
    }

    // Template not approved / does not exist
    if (metaError?.code === 132001 || metaError?.error_subcode === 2494010 || metaError?.message?.includes('template')) {
      const err = new Error(\`Template \${CONFIG.templateName} not approved or not found. Check Meta Business Manager.\`);
      err.name = 'TEMPLATE_NOT_APPROVED';
      err.meta = metaError;
      throw err;
    }

    // Invalid phone / user not on WhatsApp
    if (status === 400 && metaError?.code === 131030) {
      const err = new Error('Phone number not on WhatsApp or invalid');
      err.name = 'PHONE_NOT_WHATSAPP';
      err.meta = metaError;
      throw err;
    }

    throw error;
  }
}

// --- 4. MAIN ENDPOINT ---
/**
 * POST /api/v1/whatsapp/send-template
 * Body: { customerPhone, customerName, productName, orderId, shopDomain }
 */
app.post('/api/v1/whatsapp/send-template', requireApiKey, async (req, res) => {
  const started = Date.now();
  const { customerPhone, customerName, productName, orderId, shopDomain } = req.body || {};

  // Basic required fields
  if (!customerPhone || !orderId) {
    return res.status(400).json({ success: false, error: 'Missing required: customerPhone, orderId' });
  }

  let normalizedPhone;
  try {
    normalizedPhone = normalizeAndValidatePhone(customerPhone);
  } catch (e) {
    console.warn(\`[VALIDATION] Phone failed: \${customerPhone} | Order \${orderId}\`);
    return res.status(400).json({ success: false, error: 'PHONE_INVALID', details: e.message });
  }

  try {
    console.log(\`[SEND] Order \${orderId} | \${shopDomain} | To \${normalizedPhone} | Product: \${productName}\`);

    const waRes = await sendWhatsAppTemplate({
      to: normalizedPhone,
      customerName: customerName?.trim() || 'there',
      productName: productName?.trim() || 'your recent order',
    });

    const messageId = waRes.messages?.[0]?.id;

    // Save to DB for followup tracking: orderId, phone, messageId, status=sent, sentAt=now
    console.log(\`[SUCCESS] \${orderId} -> WA ID \${messageId} (\${Date.now() - started}ms)\`);

    return res.status(200).json({
      success: true,
      messageId,
      to: normalizedPhone,
      template: CONFIG.templateName,
      nextAction: 'auto-followup in 24h if no reply',
      orderId,
    });
  } catch (err) {
    console.error(\`[ERROR] Order \${orderId} | \${err.name}: \${err.message}\`, err.meta || '');

    if (err.name === 'TEMPLATE_NOT_APPROVED') {
      return res.status(422).json({ success: false, error: 'TEMPLATE_NOT_APPROVED', details: err.message });
    }
    if (err.name === 'PHONE_NOT_WHATSAPP') {
      return res.status(400).json({ success: false, error: 'PHONE_NOT_ON_WHATSAPP', details: err.message });
    }
    const status = err.response?.status || 500;
    return res.status(status).json({
      success: false,
      error: 'WHATSAPP_API_ERROR',
      details: err.response?.data || err.message,
    });
  }
});

// --- 5. AUTO-FOLLOWUP JOB STUB (Called by cron / QStash / Shopify Flow Wait) ---
/**
 * POST /api/v1/whatsapp/followup
 * Body: { orderId, customerPhone } OR no body => processes all pending from last 24h (if DB connected)
 * For now: stateless stub. In production, query DB where status=sent AND createdAt < now-24h AND no reply.
 */
app.post('/api/v1/whatsapp/followup', requireApiKey, async (req, res) => {
  const { orderId, customerPhone, customerName, productName } = req.body || {};
  console.log(\`[FOLLOWUP] Triggered for \${orderId || 'batch'}\`);

  if (orderId && customerPhone) {
    // Single order manual trigger for testing
    try {
      const to = normalizeAndValidatePhone(customerPhone);
      console.log(\`[FOLLOWUP] Would send followup to \${to} for \${orderId}\`);
      return res.json({ success: true, mode: 'single', orderId, nextAction: 'sent followup template' });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  return res.json({
    success: true,
    mode: 'batch-stub',
    message: 'Followup job executed (stub). Connect DB to enable real batch processing.',
    hint: 'Set up cron: 0 * * * * curl -X POST https://yourdomain.com/api/v1/whatsapp/followup -H "x-api-key: $KEY"',
  });
});

// --- Health ---
app.get('/health', (req, res) => res.json({ ok: true, service: 'panda-praise-whatsapp', version: 'step1' }));

// --- Start ---
if (require.main === module) {
  app.listen(CONFIG.port, () => {
    console.log(\`PandaPraise API running on :\${CONFIG.port}\`);
    console.log(\`Template: \${CONFIG.templateName} | PhoneID: \${CONFIG.waPhoneId?.slice(0, 6)}...\`);
  });
}

module.exports = app;

/*
=================================================================
TEMPLATE APPROVAL JSON - Submit in Meta Business Manager > WhatsApp > Message Templates
=================================================================
{
  "name": "video_review_reward_7day",
  "category": "MARKETING",
  "language": "en",
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Thanks for buying {{1}}!"
    },
    {
      "type": "BODY",
      "text": "Hi {{1}},\\n\\nLoved {{2}}? Record a 15-sec video review & get ₹100 cashback via RazorpayX instantly.\\n\\nYour review helps others shop better. Takes less than a minute!",
      "example": {
        "body_text": [
          ["Aarav", "The Cozy Hoodie"]
        ]
      }
    },
    {
      "type": "FOOTER",
      "text": "Offer valid for 7 days from delivery"
    },
    {
      "type": "BUTTONS",
      "buttons": [
        {
          "type": "QUICK_REPLY",
          "text": "📹 Send Video Review"
        },
        {
          "type": "QUICK_REPLY",
          "text": "Not now"
        },
        {
          "type": "URL",
          "text": "See Reward Info",
          "url": "https://pandapraise.in/rewards?type=video&order={{1}}",
          "example": ["1234"]
        }
      ]
    }
  ]
}
- {{1}} = customerName
- {{2}} = productName
- Header uses productName to catch eye
- Buttons: Quick reply triggers webhook -> Step 2
=================================================================
SHOPIFY FLOW ACTION JSON - Custom Action (HTTP Request)
=================================================================
{
  "name": "PandaPraise - Send WhatsApp Review Request",
  "description": "Triggers PandaPraise API after order fulfilled (7 days post delivery)",
  "trigger": "shopify/fulfillment/fulfilled OR order/created + 7d delay",
  "action_type": "http_request",
  "config": {
    "method": "POST",
    "url": "https://api.pandapraise.in/api/v1/whatsapp/send-template",
    "headers": {
      "Content-Type": "application/json",
      "x-api-key": "{{ env.PANDAPRAISE_API_KEY }}"
    },
    "body": {
      "customerPhone": "{{ order.customer.phone }}",
      "customerName": "{{ order.customer.firstName }}",
      "productName": "{{ order.lineItems[0].product.title }}",
      "orderId": "{{ order.name }}",
      "shopDomain": "{{ shop.domain }}",
      "fulfillmentDate": "{{ fulfillment.createdAt }}",
      "lineItems": "{{ order.lineItems }}"
    },
    "retry": {
      "enabled": true,
      "max_attempts": 3,
      "backoff": "exponential"
    },
    "timeout": "10s"
  },
  "flow_export": {
    "flow_name": "PandaPraise 7-Day Review",
    "steps": [
      { "type": "trigger", "event": "fulfillment_created" },
      { "type": "condition", "if": "{{ fulfillment.status == 'success' }}" },
      { "type": "delay", "duration": "7_days" },
      { "type": "action", "ref": "pandapraise_http_action" }
    ]
  }
}
- In Flow UI: Add Action > Send HTTP Request > Paste URL + x-api-key
- Map fields: order.customer.phone MUST be E.164 (+91...)
- Test with: Development store order with your own number
=================================================================
*/
`;

export const ENV_TEMPLATE = `PORT=3000
PANDAPRAISE_API_KEY=sk_live_YourSecure32CharKeyHere
WHATSAPP_CLOUD_API_TOKEN=EAAJ...YourMetaToken
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=9876543210
# Optional
NODE_ENV=production
`;

export const TEMPLATE_JSON = `{
  "name": "video_review_reward_7day",
  "category": "MARKETING",
  "language": "en",
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Thanks for buying {{1}}!"
    },
    {
      "type": "BODY",
      "text": "Hi {{1}},\\n\\nLoved {{2}}? Record a 15-sec video review & get ₹100 cashback via RazorpayX instantly.\\n\\nYour review helps others shop better. Takes less than a minute!",
      "example": {
        "body_text": [["Aarav", "The Cozy Hoodie"]]
      }
    },
    {
      "type": "FOOTER",
      "text": "Offer valid for 7 days from delivery"
    },
    {
      "type": "BUTTONS",
      "buttons": [
        { "type": "QUICK_REPLY", "text": "📹 Send Video Review" },
        { "type": "QUICK_REPLY", "text": "Not now" },
        {
          "type": "URL",
          "text": "See Reward Info",
          "url": "https://pandapraise.in/rewards?type=video&order={{1}}",
          "example": ["1234"]
        }
      ]
    }
  ]
}`;

export const SHOPIFY_FLOW_JSON = `{
  "name": "PandaPraise - Send WhatsApp Review Request",
  "trigger": "shopify/fulfillment/fulfilled + 7d delay",
  "action_type": "http_request",
  "config": {
    "method": "POST",
    "url": "https://api.pandapraise.in/api/v1/whatsapp/send-template",
    "headers": {
      "Content-Type": "application/json",
      "x-api-key": "{{ env.PANDAPRAISE_API_KEY }}"
    },
    "body": {
      "customerPhone": "{{ order.customer.phone }}",
      "customerName": "{{ order.customer.firstName }}",
      "productName": "{{ order.lineItems[0].product.title }}",
      "orderId": "{{ order.name }}",
      "shopDomain": "{{ shop.domain }}"
    },
    "retry": { "enabled": true, "max_attempts": 3, "backoff": "exponential" },
    "timeout": "10s"
  }
}`;
