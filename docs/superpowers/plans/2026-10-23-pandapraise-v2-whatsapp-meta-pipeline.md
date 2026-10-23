# PandaPraise V2: WhatsApp Video to Meta Ads Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

---

## 🎯 Executive Summary & Strategic Goal

Pivot PandaPraise from a generic, low-retention "Wall of Love" testimonial widget into a **high-ticket, automated creative pipeline for Indian Shopify D2C brands** spending ₹2L–₹10L+/month on Meta ads.

* **Core Value:** Automated WhatsApp Collection (7 days post-delivery) ➔ Automated Hook & Hormozi Animated Captions ➔ 5 Ready-to-Run Meta Ads (9:16, 1:1, 4:5).
* **Target Audience:** Indian Shopify D2C apparel, beauty, wellness, and lifestyle brands.
* **Pricing Model:** ₹1,500 per pack of 5 Meta Ads | ₹2,999/mo for automated 20 ads collection. No free plan.
* **Positioning:** *"Real Customer Videos > AI Actors. Every Time."*

---

## 🏗️ Architecture & File Structure

```
testimonial-collector-dashboard/
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx                      # Upgraded: Pivot headline, Before/After player, INR pricing
│   │   ├── WhatsAppShopifyOnboardingPage.tsx    # New: 2-minute connection for Shopify + WhatsApp Cloud API
│   │   ├── VideoCollectionDashboardPage.tsx     # New: Collection Queue (Collected, Pending, Failed)
│   │   ├── MetaAdsLibraryPage.tsx               # New: Adscriptly-style creative grid with hook previews & download
│   │   └── BillingAndPlansPage.tsx              # Upgraded: Razorpay ₹1,500 pack & ₹2,999/mo subscription
│   ├── components/
│   │   ├── meta-ads/
│   │   │   ├── BeforeAfterVideoPlayer.tsx       # Interactive Raw WhatsApp vs. Hormozi Meta Ad slider/toggle
│   │   │   ├── AdCard.tsx                       # Creative card with hook badge, video preview, ratio selector
│   │   │   └── WhatsAppTemplatePreview.tsx      # WhatsApp template visual preview for brands
│   │   └── dashboard/
│   │       └── TopNavbar.tsx                    # Updated navigation (Collection, Ad Library, Settings, Billing)
│   └── services/
│       ├── metaAdsService.ts                    # Job triggering, status polling, and ad bundle packaging
│       ├── whatsappQueueService.ts              # WhatsApp template triggers, queue tracking, and customer reminders
│       └── razorpayService.ts                   # Razorpay payment checkout & verification
│
├── scripts/
│   └── make_meta_ads.py                         # Standalone python engine: Hook injector + Whisper + FFmpeg 9:16/1:1/4:5
│
└── docs/superpowers/plans/
    └── 2026-10-23-pandapraise-v2-whatsapp-meta-pipeline.md
```

---

## 📋 Task Decomposition

### Task 1: Transform Landing Page Copy & Before/After Comparison

**Files:**
- Modify: `src/pages/LandingPage.tsx`
- Create: `src/components/meta-ads/BeforeAfterVideoPlayer.tsx`

- [x] **Step 1:** Create `BeforeAfterVideoPlayer.tsx` showcasing an interactive toggle between:
  - *Raw WhatsApp Video:* Vertical shaky selfie video without captions or hooks.
  - *PandaPraise Meta Ad:* 9:16 reel with viral top-hook badge (`POV: You finally found a kurta with pockets`) + animated Hormozi word-level captions + proof sticker (`2.3% CTR on Meta`).
- [x] **Step 2:** Rewrite `LandingPage.tsx` hero section:
  - Badge: `Built for Indian Shopify D2C Brands Spending ₹2L+/mo on Meta`
  - Headline: `Turn WhatsApp Customer Videos into High-Converting Meta Ads in 24 Hours.`
  - Subhead: `Real Customer Videos > AI Actors. Every Single Time.`
  - Primary CTA: `Connect Your Shopify Store (Get 5 Ads for ₹1,500)`
- [x] **Step 3:** Replace the "Wall of Love" features section with the 3-step pipeline:
  - 1. Connect Shopify + WhatsApp in 2 mins
  - 2. Frictionless WhatsApp collection (Delivered + 7 days prompt with ₹100 incentive)
  - 3. 1-Click Meta Ad generator with 3 proven D2C hooks
- [x] **Step 4:** Update pricing cards to Indian Rupee (INR):
  - Starter Pack: ₹1,500 (5 Meta-Ready Ads)
  - Growth Plan: ₹2,999/month (20 Ads + Automated WhatsApp follow-ups)
- [x] **Step 5:** Run tests/build to verify landing page renders without typescript or layout errors.

---

### Task 2: Shopify & WhatsApp Onboarding Module

**Files:**
- Create: `src/pages/WhatsAppShopifyOnboardingPage.tsx`
- Create: `src/components/meta-ads/WhatsAppTemplatePreview.tsx`
- Modify: `src/App.tsx` (add routing `/dashboard/connect`)

- [x] **Step 1:** Build `WhatsAppTemplatePreview.tsx` displaying the realistic WhatsApp message bubble:
  - *"Hey {name}! Loved your {product}? Send a quick 20-sec video — get flat ₹100 off your next order. Just hold phone vertical and say what you loved."*
- [x] **Step 2:** Build `WhatsAppShopifyOnboardingPage.tsx`:
  - Input field 1: Shopify store domain (`yourbrand.myshopify.com`) + Access Token
  - Input field 2: WhatsApp Cloud API Phone Number ID & Business Account ID
  - Automation setting: Trigger delay slider (Default: `7 days after delivery`)
  - Status Indicator: `Connected — ready to message customers after 7 days`
- [x] **Step 3:** Add route `/dashboard/connect` in `src/App.tsx` and link it in dashboard navigation.

---

### Task 3: Video Collection Queue Dashboard

**Files:**
- Create: `src/pages/VideoCollectionDashboardPage.tsx`
- Create: `src/services/whatsappQueueService.ts`
- Modify: `src/App.tsx` (route `/dashboard/collection`)

- [x] **Step 1:** Implement `whatsappQueueService.ts` with mock data & types for:
  - `CustomerVideoSubmission`: `id`, `customerName`, `customerPhone`, `orderId`, `productName`, `videoUrl`, `status` (`pending`, `collected`, `failed`, `edited`), `createdAt`.
- [x] **Step 2:** Build `VideoCollectionDashboardPage.tsx` with top KPI metrics:
  - `Collected Videos (12)`
  - `Pending WhatsApp Replies (8)`
  - `48h Reminders Sent (5)`
- [x] **Step 3:** Implement incoming submissions table with:
  - Customer name & product badge
  - In-line mini video player preview
  - Action button: `⚡ Make Meta Ads` (triggers editing module)
- [x] **Step 4:** Add route `/dashboard/collection` in `src/App.tsx`.

---

### Task 4: Automated Hook & Video Generation Engine

**Files:**
- Create: `scripts/make_meta_ads.py`
- Create: `src/services/metaAdsService.ts`

- [x] **Step 1:** Implement `scripts/make_meta_ads.py` that accepts any raw video input:
  - Auto-generates 3 proven Indian D2C hooks:
    - *Hook 1:* `POV: You finally found a {product} with pockets`
    - *Hook 2:* `I wore this for 10 hours, here's the honest truth`
    - *Hook 3:* `Don't buy this before watching this`
  - Leverages our existing faster-whisper + FFmpeg pipeline (`ai-video-captions`) to burn Hormozi yellow/cyan animated captions.
  - Generates 3 aspect ratios:
    - `9:16` (Instagram & Facebook Reels / Stories)
    - `1:1` (Square Feed)
    - `4:5` (Vertical Feed)
- [x] **Step 2:** Implement API service `metaAdsService.ts` to trigger ad compilation jobs and report real-time rendering progress (10% ➔ 50% ➔ 100%).

---

### Task 5: Adscriptly-Style Creative Library & Delivery Grid

**Files:**
- Create: `src/pages/MetaAdsLibraryPage.tsx`
- Create: `src/components/meta-ads/AdCard.tsx`
- Modify: `src/App.tsx` (route `/dashboard/ads`)

- [x] **Step 1:** Build `AdCard.tsx`:
  - Video player with hover-to-play
  - Top hook overlay pill (`Hook: POV Kurta with Pockets`)
  - Ratio badge tabs (`9:16`, `1:1`, `4:5`)
  - Direct download button (`.mp4`)
  - Performance placeholder: `Track Meta ROAS (Upload CTR after campaign)`
- [x] **Step 2:** Build `MetaAdsLibraryPage.tsx`:
  - Filter bar: Filter by Product, Hook style, or Date
  - Batch Action: `📦 Download All 5 Ads (.zip)`
  - One-click action: `🛍️ Push to Shopify Product Page as Video Review`
- [x] **Step 3:** Add route `/dashboard/ads` in `src/App.tsx`.

---

### Task 6: Razorpay INR Billing & Monetization Gate

**Files:**
- Modify: `src/pages/BillingAndPlansPage.tsx`
- Create: `src/services/razorpayService.ts`

- [x] **Step 1:** Build `razorpayService.ts` with Razorpay checkout SDK integration for Indian UPI/Cards/Netbanking.
- [x] **Step 2:** Update `BillingAndPlansPage.tsx`:
  - Pack 1: `5 Meta Ads Pack` @ **₹1,500** (Pay-per-pack)
  - Pack 2: `D2C Growth Plan` @ **₹2,999/month** (20 Meta Ads + Automated WhatsApp reminders)
  - Remove all free plan / Wall of Love widget tiers.
- [x] **Step 3:** Wire checkout button with instant UPI modal and invoice generation.

---

### Task 7: End-to-End Verification & Walkthrough

- [x] **Step 1:** Run `npm run build` or Vite build in `testimonial-collector-dashboard` to verify zero type errors.
- [x] **Step 2:** Launch local preview dev server and verify the complete flow:
  - Landing page Before/After video player
  - Dashboard navigation
  - Collection queue with `Make Meta Ads` trigger
  - Adscriptly library grid with 9:16 previews
  - Razorpay INR pricing cards
- [x] **Step 3:** Create final walkthrough documentation for the user.
