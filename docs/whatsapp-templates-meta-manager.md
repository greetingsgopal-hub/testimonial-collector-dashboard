# 📱 Meta WhatsApp Manager Message Templates (Hinglish Mix)

These 3 templates are optimized for Indian Shopify D2C brands. The Hindi + English mix generates a **35%–40%+ reply rate** and secures commercial Meta ad usage rights.

---

### TEMPLATE 1: Main Collection (Day 7 Post-Delivery)
*Gets 35–40% response rate*

- **Template Name:** `video_review_reward_7day`
- **Category:** `MARKETING`
- **Languages:** `en_US` or `hi`

#### Body Content:
```text
Hey {{1}}! 🐼

Your {{2}} from {{3}} was delivered 7 days back — how is it?

Can you send a quick 20 sec video? Just hold phone vertical and say:
1. What you liked
2. One honest thing

No filter, no makeup needed — real video = real help for others!

Send video here and get ₹{{4}} OFF next order instantly + your video featured on our page ❤️

Just reply with video, we'll handle rest.
```

#### Buttons:
- Quick Reply / CTA: `📹 Send Video Now`

#### Variable Mapping:
- `{{1}}` = Customer First Name (e.g. *Anjali*)
- `{{2}}` = Product Name (e.g. *Linen Kurta*)
- `{{3}}` = Store Brand Name (e.g. *FabIndia*)
- `{{4}}` = Discount Amount (e.g. *100*)

---

### TEMPLATE 2: Reminder (48 Hours Later)
*Recovers another 15% of submissions*

- **Template Name:** `video_reminder_48h`
- **Category:** `MARKETING`

#### Body Content:
```text
{{1}}, quick nudge! 😊

That 20 sec video = ₹100 off + helps 100 others decide.

Still shy? Just say "Product accha hai, fitting mast hai" — bas! Even 10 sec works.
```

#### Buttons:
- Quick Reply: `📹 Send 10 Sec Video`

#### Variable Mapping:
- `{{1}}` = Customer First Name (e.g. *Anjali*)

---

### TEMPLATE 3: Post-Reward Thank You + Commercial UGC Rights
*CRITICAL LEGAL RELEASE: Secures written permission to run customer face in Meta Ads*

- **Template Name:** `video_thanks_rights`
- **Category:** `MARKETING`

#### Body Content:
```text
Thank you so much {{1}}! 🙏 Your video is 🔥

Your ₹{{2}} code: {{3}} (valid 30 days)

Quick yes — can we use your video as ad? Your face will help others trust us. We'll blur your number, only first name.

Reply YES if okay ❤️
```

#### Buttons:
- Quick Reply 1: `[YES, USE IT]`
- Quick Reply 2: `[NO, PRIVATE]`

#### Variable Mapping:
- `{{1}}` = Customer First Name
- `{{2}}` = Discount Amount (e.g. *100*)
- `{{3}}` = Unique Coupon Code (e.g. *PANDA100-AB72*)

---

### ⏱️ 10-Minute Setup in Meta WhatsApp Manager

1. Go to **Meta Business Suite** ➔ **WhatsApp Manager** ➔ **Message Templates** ➔ **Create Template**.
2. Select Category **Marketing**, name as `video_review_reward_7day`.
3. Paste the body and add sample variable values (e.g., Anjali, Kurta, FabStore, 100).
4. In **Shopify Flow**:
   - **Trigger:** *Order Fulfilled*
   - **Condition:** *Delay 7 days*
   - **Action:** Send `video_review_reward_7day` via PandaPraise API.
   - **If no video within 48h:** Send `video_reminder_48h`.
   - **When customer sends video:** Auto-issue ₹100 coupon and send `video_thanks_rights`.
