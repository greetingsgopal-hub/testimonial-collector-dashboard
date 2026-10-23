# PandaPraise — Shopify Flow Automation & Day 1 Concierge MVP Guide

This guide details two modes to run the WhatsApp UGC Video Review collection loop:
1. **Automated Mode:** Importable Shopify Flow JSON connecting directly to PandaPraise WhatsApp endpoint.
2. **Day 1 Concierge MVP (No-Code):** Internal Email trigger to validate the first 10 stores in 30 seconds per order.

---

## Mode 1: Automated Shopify Flow (Ready to Import)

### Step 1: Import Workflow into Shopify Flow
1. In your **Shopify Admin**, navigate to:
   `Apps` ➔ `Flow` ➔ `Create Workflow` ➔ Click **Import** (top right).
2. Upload the exported file: [`public/shopify-flow-pandapraise.json`](/shopify-flow-pandapraise.json) or paste the JSON below:

```json
{
  "name": "PandaPraise - Ask Video Review on Day 7",
  "trigger": {
    "type": "shopify/fulfillment/order_fulfilled",
    "description": "When order is fulfilled/delivered"
  },
  "conditions": [
    {
      "field": "order.tags",
      "operator": "NOT_CONTAINS",
      "value": "video_asked"
    }
  ],
  "actions": [
    {
      "type": "delay",
      "duration": "7_days",
      "description": "Wait 7 days for customer to use product"
    },
    {
      "type": "http_request",
      "method": "POST",
      "url": "https://pandapraise.com/api/v1/whatsapp/send-template",
      "headers": {
        "Content-Type": "application/json",
        "x-api-key": "{{YOUR_PANDAPRAISE_API_KEY}}"
      },
      "body": {
        "customer_phone": "{{order.customer.phone}}",
        "customer_name": "{{order.customer.firstName}}",
        "product_name": "{{order.lineItems.first.productTitle}}",
        "store_name": "{{shop.name}}",
        "reward_amount": "100",
        "order_id": "{{order.id}}",
        "template_name": "video_review_reward_7day"
      }
    },
    {
      "type": "add_tags",
      "tags": ["video_asked", "pandapraise_pending"]
    }
  ],
  "second_flow": {
    "name": "PandaPraise - Reminder 48h Later",
    "trigger": {
      "type": "tag_added",
      "tag": "pandapraise_pending"
    },
    "actions": [
      {
        "type": "delay",
        "duration": "2_days"
      },
      {
        "type": "condition",
        "field": "order.tags",
        "operator": "CONTAINS",
        "value": "video_received",
        "if_true": "STOP",
        "if_false": {
          "type": "http_request",
          "method": "POST",
          "url": "https://pandapraise.com/api/v1/whatsapp/send-template",
          "headers": {
            "Content-Type": "application/json",
            "x-api-key": "{{YOUR_PANDAPRAISE_API_KEY}}"
          },
          "body": {
            "customer_phone": "{{order.customer.phone}}",
            "customer_name": "{{order.customer.firstName}}",
            "template_name": "video_reminder_48h"
          }
        }
      }
    ]
  }
}
```

### Step 2: Configure Your Credentials
1. `{{YOUR_PANDAPRAISE_API_KEY}}`: Replace with your API key from the PandaPraise Developer Dashboard.
2. Endpoint: `https://pandapraise.com/api/v1/whatsapp/send-template` (also accepts `https://api.pandapraise.com/api/v1/whatsapp/send-template`).

---

## Mode 2: Day 1 Concierge MVP (No Code — Use TODAY)

If you have not set up Meta WhatsApp API approval yet, or want to launch with your first 10 stores in 10 minutes:

### The Shopify No-Code Trigger
1. In **Shopify Flow**:
   - **Trigger:** `Order Fulfilled`
   - **Action 1:** `Wait 7 Days`
   - **Action 2:** `Send Internal Email` to your store team / founder email:
     > **Subject:** `Deliver 7-Day Video Review WhatsApp for {{order.name}}`  
     > **Body:** `Order {{order.name}} for {{order.customer.firstName}} (Phone: {{order.customer.phone}}) delivered 7 days back. Send WhatsApp Template 1.`

### 30-Second Manual Send Flow
1. Copy **Template 1 (Collection)** from your phone.
2. Tap the customer's phone link and send:
   > *"Hey Anjali! 🐼 Your Flora roll-on was delivered 7 days back — how is it? Can you send a quick 20 sec video? 1 acchi baat, 1 kharab baat — ₹100 off code instantly!"*
3. If no video in 48h ➔ send **Template 2 (Nudge)**.

### Once the Video Arrives on WhatsApp
1. Save the incoming video into your workspace directory:
   `/uploads/{store_name}/video_01.mp4`
2. Run the Docker container pipeline:
   ```bash
   docker run -v ./uploads:/app/uploads pandapraise/meta-ugc-pipeline:latest --store {store_name}
   ```
3. Send the 5 generated 9:16 Meta-ready ads back to the store owner on WhatsApp.
4. Add tag `video_received` to the Shopify Order.
