# Razorpay Billing Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully replace Stripe billing with Razorpay (Subscriptions API & Orders API) on Cloudflare Worker and React frontend, providing an India-first monetization engine with zero weakening of P0 security or Firestore billing locks.

**Architecture:** 
A lightweight Razorpay client (`src/worker/lib/razorpayClient.ts`) executes server-to-server calls to Razorpay using Basic Auth (`RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET`) and verifies webhook signatures via Web Crypto HMAC-SHA256 (`X-Razorpay-Signature`).
Client requests (`POST /api/razorpay/checkout`) authenticate with Firebase Auth tokens and return checkout credentials (`subscription_id` or `order_id` + publishable `key_id`).
The frontend (`src/lib/razorpay.ts`) dynamically loads Razorpay Checkout.js (`https://checkout.razorpay.com/v1/checkout.js`) and handles checkout in `PricingPage.tsx`, `UpgradeModal.tsx`, and `WorkspaceSettings.tsx`.

**Tech Stack:** Cloudflare Workers (TypeScript, Web Crypto API), Razorpay REST API v1, Razorpay Checkout.js, Firebase Admin (OAuth REST), Vitest.

**Spec:** User Master Prompt "MASTER PROMPT: Replace Stripe with Razorpay (India-first billing) – PandaPraise".

---

## Global Constraints
- Preserve all P0 security gates: `request.auth.token.email_verified == true`, closed anonymous reviews, KV rate limiting (5/10 min), fail-closed Turnstile, and GDPR account deletion.
- Zero secrets in client-side bundles (`VITE_*`). Only `RAZORPAY_KEY_ID` is public; `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` must remain strictly server-only Worker secrets.
- Firestore client-immutable billing locks: clients can never write `plan`, `subscriptionStatus`, `razorpayCustomerId`, `razorpaySubscriptionId`, `razorpayPaymentId`, `razorpayOrderId`, `currentPeriodEnd`.
- Idempotent webhook handling with Firestore ledger collection `razorpay_events`.
- Keep 100% of existing test suites passing; add comprehensive Razorpay unit tests.

## Review Focus
1. Webhook Signature Verification failure returns 400 without state mutation or secret leaking.
2. Unauthenticated or invalid Firebase token requests to `/api/razorpay/checkout` return 401.
3. Subscription webhook events (`subscription.activated`, `subscription.charged`, `subscription.halted`, `subscription.cancelled`) correctly mutate workspace `plan` and `subscriptionStatus`.
4. One-time founding purchase (`payment.captured` / `order.paid`) assigns lifetime Pro plan.
5. `/api/health` reports `razorpayConfigured: true` when `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` exist.

---

### Task 1: Razorpay Worker Client & Web Crypto Signature Verification
**Files:**
- Create: `src/worker/lib/razorpayClient.ts`
- Test: `src/worker/lib/razorpayClient.test.ts`
- Modify: `src/worker/types.ts`

**Interfaces:**
- Consumes: `WorkerEnv` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`)
- Produces:
  - `verifyRazorpayWebhookSignature(rawBody: string, signature: string | null, secret: string): Promise<boolean>`
  - `createRazorpaySubscription(params: { planId: string; totalCount?: number; notes?: Record<string, string> }, env: WorkerEnv): Promise<any>`
  - `createRazorpayOrder(params: { amount: number; currency?: string; receipt: string; notes?: Record<string, string> }, env: WorkerEnv): Promise<any>`
  - `cancelRazorpaySubscription(subscriptionId: string, cancelAtCycleEnd: boolean, env: WorkerEnv): Promise<any>`

- [ ] **Step 1: Write unit tests for Razorpay Client and HMAC-SHA256 signature verification**
- [ ] **Step 2: Run test to verify it fails (`vitest run src/worker/lib/razorpayClient.test.ts`)**
- [ ] **Step 3: Implement `razorpayClient.ts` with Web Crypto HMAC and REST fetch wrappers**
- [ ] **Step 4: Update `WorkerEnv` in `src/worker/types.ts` with Razorpay environment variables**
- [ ] **Step 5: Run tests and ensure PASS**
- [ ] **Step 6: Commit `feat(razorpay): add razorpay client and web crypto webhook signature verification`**

---

### Task 2: Razorpay Server Endpoints (Checkout & Webhooks)
**Files:**
- Create: `src/worker/handlers/razorpayCheckout.ts`
- Create: `src/worker/handlers/razorpayWebhook.ts`
- Test: `src/worker/handlers/razorpayCheckout.test.ts`
- Test: `src/worker/handlers/razorpayWebhook.test.ts`
- Modify: `src/worker/index.ts`
- Modify: `src/worker/health.test.ts`

**Interfaces:**
- Consumes: `handleRazorpayCheckout`, `handleRazorpayWebhook`, `handleRazorpayCancel`
- Produces:
  - Route `POST /api/razorpay/checkout`
  - Route `POST /api/razorpay/webhook`
  - Route `POST /api/razorpay/cancel`
  - `/api/health` includes `razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET)`

- [ ] **Step 1: Write unit tests for checkout session creation, input validation, and plan resolving**
- [ ] **Step 2: Write unit tests for webhook signature validation, idempotency, and state transitions**
- [ ] **Step 3: Implement `razorpayCheckout.ts` handling monthly/annual subscriptions & founding order**
- [ ] **Step 4: Implement `razorpayWebhook.ts` handling subscription and payment events idempotently**
- [ ] **Step 5: Wire routes and update `/api/health` in `src/worker/index.ts`**
- [ ] **Step 6: Update `src/worker/health.test.ts` to assert `razorpayConfigured`**
- [ ] **Step 7: Run all tests and ensure PASS**
- [ ] **Step 8: Commit `feat(razorpay): implement razorpay checkout, webhook, and health check routes`**

---

### Task 3: Firestore Security Rules & Idempotency Ledger
**Files:**
- Modify: `firestore.rules`
- Test: `src/lib/storage/firebaseAdapter.rules.test.ts`

**Interfaces:**
- Consumes: Firestore Rules engine
- Produces:
  - Locks `razorpayCustomerId`, `razorpaySubscriptionId`, `razorpayPaymentId`, `razorpayOrderId` on workspaces
  - Disallows client read/write to `/razorpay_events/{eventId}`

- [ ] **Step 1: Add unit test verifying clients cannot forge Razorpay IDs or write to `razorpay_events`**
- [ ] **Step 2: Update `firestore.rules` to disallow client mutation of Razorpay fields**
- [ ] **Step 3: Run rules tests and ensure PASS**
- [ ] **Step 4: Commit `fix(rules): lock razorpay billing fields and event ledger in firestore rules`**

---

### Task 4: Frontend Razorpay Integration
**Files:**
- Create: `src/lib/razorpay.ts`
- Test: `src/lib/__tests__/razorpay.test.ts`
- Modify: `src/pages/PricingPage.tsx`
- Modify: `src/components/dashboard/UpgradeModal.tsx`
- Modify: `src/components/dashboard/WorkspaceSettings.tsx`

**Interfaces:**
- Consumes: `startRazorpayCheckout(plan: 'monthly' | 'annual' | 'founding')`
- Produces: Seamless modal Razorpay checkout with live script loading and optimistic Firestore refresh

- [ ] **Step 1: Write unit test for `src/lib/razorpay.ts`**
- [ ] **Step 2: Implement dynamic script loader and checkout launcher in `src/lib/razorpay.ts`**
- [ ] **Step 3: Wire `PricingPage.tsx`, `UpgradeModal.tsx`, and `WorkspaceSettings.tsx` to use `startRazorpayCheckout`**
- [ ] **Step 4: Update `WorkspaceSettings.tsx` with subscription status badges (`active`, `halted`, `pending`, `cancelled`)**
- [ ] **Step 5: Run frontend and component tests to ensure 100% PASS**
- [ ] **Step 6: Commit `feat(frontend): integrate razorpay checkout and subscription status management`**

---

### Task 5: Documentation, Deployment & End-to-End Verification
**Files:**
- Modify: `.env.example`
- Modify: `task.md`
- Modify: `walkthrough.md`

- [ ] **Step 1: Document all Razorpay environment variables in `.env.example`**
- [ ] **Step 2: Run full Vitest suite (all 79+ files) to ensure 100% PASS**
- [ ] **Step 3: Run `npm run build` production build to ensure 0 errors**
- [ ] **Step 4: Deploy Cloudflare Worker (`npx wrangler deploy`)**
- [ ] **Step 5: Document secret setup instructions (`wrangler secret put RAZORPAY_...`) and walkthrough in `walkthrough.md`**
- [ ] **Step 6: Commit all documentation and push to GitHub `origin/main`**
