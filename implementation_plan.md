# Implementation Plan: Replace Stripe with Razorpay (India-First Billing)

Fully replace Stripe with Razorpay across the Cloudflare Worker and React frontend without compromising any existing P0 security guarantees or Firestore billing locks.

## User Review Required
> [!IMPORTANT]
> - Razorpay requires `RAZORPAY_KEY_ID` (publishable/server), `RAZORPAY_KEY_SECRET` (server secret), and `RAZORPAY_WEBHOOK_SECRET`.
> - Subscription plans (`monthly`, `annual`) resolve to Razorpay Plan IDs (`plan_...`).
> - The Founding Lifetime purchase is handled via Razorpay Orders API (`order_...` with amount in paise, e.g., ₹11,999 or ₹14,999).
> - `/api/health` will report `razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET)`.

---

## Proposed Changes

### Cloudflare Worker Backend
1. **`src/worker/types.ts`**:
   - Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_PLAN_MONTHLY`, `RAZORPAY_PLAN_ANNUAL`, `RAZORPAY_FOUNDING_AMOUNT`.
2. **`src/worker/lib/razorpayClient.ts`**:
   - Web Crypto HMAC-SHA256 signature verification for `X-Razorpay-Signature`.
   - REST API clients for `POST /v1/subscriptions`, `POST /v1/orders`, `POST /v1/subscriptions/{id}/cancel`.
3. **`src/worker/handlers/razorpayCheckout.ts`**:
   - Route `POST /api/razorpay/checkout`.
   - Requires Firebase Bearer Auth. Resolves workspace and returns `{ keyId, subscriptionId }` or `{ keyId, orderId, amount, currency }`.
4. **`src/worker/handlers/razorpayWebhook.ts`**:
   - Route `POST /api/webhook/razorpay`.
   - Handles `subscription.activated`, `subscription.charged`, `subscription.pending`, `subscription.halted`, `subscription.cancelled`, `payment.captured`.
   - Idempotent ledger recorded in `razorpay_events`.
5. **`src/worker/index.ts` & `health.test.ts`**:
   - Route incoming requests to `razorpayCheckout.ts` and `razorpayWebhook.ts`.
   - Expose `razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET)` in `/api/health`.

### Firestore Security Rules
- **`firestore.rules`**:
  - Add `razorpayCustomerId`, `razorpaySubscriptionId`, `razorpayPaymentId`, `razorpayOrderId` to immutable fields on `/workspaces/{workspaceId}`.
  - Disallow client read/write to `/razorpay_events/{eventId}`.

### React Frontend
1. **`src/lib/razorpay.ts`**:
   - Dynamic script injection for `https://checkout.razorpay.com/v1/checkout.js`.
   - Calls `/api/razorpay/checkout` and opens Razorpay modal with styling `#6701e6`.
2. **`src/pages/PricingPage.tsx`**, **`src/components/dashboard/UpgradeModal.tsx`**, **`src/components/dashboard/WorkspaceSettings.tsx`**:
   - Migrate from `startStripeCheckout` to `startRazorpayCheckout`.
   - Display active status, cancellation, and past-due warning banners.

---

## Verification Plan
1. **Automated Unit Tests**:
   - `src/worker/lib/razorpayClient.test.ts`: Verify HMAC SHA-256 signature algorithm with known test vectors.
   - `src/worker/handlers/razorpayCheckout.test.ts`: Test auth requirement, plan validation, subscription creation, and founding order creation.
   - `src/worker/handlers/razorpayWebhook.test.ts`: Test signature verification, idempotency, subscription activation, cancellation, and lifetime payment capture.
   - `src/worker/health.test.ts`: Test `razorpayConfigured` reporting.
   - `src/lib/__tests__/razorpay.test.ts`: Test frontend checkout initiation and token handling.
2. **Full Regression Test Suite**:
   - Run all 79+ Vitest suites to ensure 0 regressions.
3. **Build & Worker Deployment**:
   - `npm run build` with 0 TypeScript/Vite errors.
   - `npx wrangler deploy`.
