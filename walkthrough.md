# Walkthrough: Priority 0 Hardening – Global SaaS Standard

**Date:** Oct 14, 2026  
**Commit:** `d2e2b28`  
**Worker Deploy Version:** `845a36d1-80f0-4030-bb5b-d2e2175da1d9`  
**Test Suite:** 79/79 test files passed (481/481 tests)  
**Production Build:** Clean `tsc && vite build` (0 errors)

---

## Hardened Components & Manual Verification Steps

### 1. Email Verification Enforcement in Firestore Rules
- **Rule Changes:** `firestore.rules` now strictly requires `request.auth.token.email_verified == true` for:
  - Workspace creation (`match /workspaces/{workspaceId}`)
  - Project/Space creation (`match /projects/{projectId}`)
  - Widget creation (`match /widgets/{widgetId}`)
  - Collection form creation (`match /collection_forms/{formId}`)
- **Manual Verification Step:**
  1. Register a new user at `https://pandapraise.com/signup`.
  2. Notice the persistent amber warning banner: *"Please verify your email address to unlock full access"*.
  3. Attempt to create a project or workspace before clicking the verification link in the verification email.
  4. Verify the client displays the alert: *"Please verify your email address to create additional business spaces"*, and direct Firestore calls are rejected with `PERMISSION_DENIED`.
  5. Click verification link; reload dashboard; create project; verify creation succeeds.

### 2. Production-Grade Cloudflare KV Sliding Window Rate Limiting
- **Implementation:** Created Cloudflare KV namespace `RATE_LIMIT_KV` (`ed7ef4cc06c940c882448d3fcba25398`) bound in `wrangler.jsonc`.
- **Sliding Window:** 5 submissions per 10-minute window per IP (`public-submit:{ip}`).
- **Fail-Closed Behavior:**
  - If Cloudflare KV throws an unexpected error, the worker returns `503 Service Unavailable`.
  - In production (`pandapraise.com`), if `TURNSTILE_SECRET_KEY` is not configured, the worker returns `503 Service Unavailable` instead of failing open.
- **Manual Verification Step:**
  1. Open any public form (e.g. `https://pandapraise.com/c/demo-space-feedback`).
  2. Submit 5 reviews consecutively within 10 minutes.
  3. On the 6th submission attempt, verify the API returns `429 Too Many Requests` with:
     ```json
     { "error": "Too many submissions from this network. Please wait a few minutes before submitting another review.", "code": "RATE_LIMIT_EXCEEDED" }
     ```

### 3. Direct Public Firestore Write Path Closure
- **Implementation:** Completely removed the anonymous `allow create` rule in `firestore.rules` on `/reviews/{reviewId}`.
- **Architecture:** All public review submissions must route strictly via the Cloudflare Worker (`POST /api/testimonials/submit`).
- **Worker Auth:** The Worker verifies Turnstile + KV rate limit, then writes directly to Firestore via Google Service Account OAuth token (bypassing client-side rules).
- **Manual Verification Step:**
  1. Open browser developer console on any page.
  2. Run `firebase.firestore().collection('reviews').add({ content: 'Spam bypass' })` without authentication.
  3. Verify Firestore immediately responds with `FirebaseError: Missing or insufficient permissions`.

### 4. GDPR Self-Service Account Deletion Hardening
- **Implementation:**
  - `src/worker/lib/firebaseStorage.ts`: Calls Google Cloud Storage JSON API to purge all files under `avatars/{uid}/`, `videos/{uid}/`, and `{uid}/`.
  - `src/worker/handlers/accountDeletionHandler.ts`:
    - Requires uppercase `"DELETE"` confirmation.
    - Cancels Stripe customer and active subscriptions prior to auth deletion.
    - Uses `Promise.allSettled` to delete across all tenant collections (`workspaces`, `projects`, `collection_forms`, `reviews`, `public_reviews`, `widgets`, `social_connections`, `social_publications`, `users`).
    - Firebase Auth account is deleted last upon cascade completion.
- **Manual Verification Step:**
  1. Log in and navigate to **Settings > Danger Zone**.
  2. Click **Delete Account**.
  3. Type anything other than `DELETE` (e.g., `delete`); confirm button remains disabled.
  4. Type `DELETE` and confirm.
  5. Verify the user is immediately logged out, redirected to `/login`, all documents in Firestore and files in Storage are purged, and the Firebase Auth account is deleted.

### 5. Free-Tier Enforcement Completeness
- **Enforcement:**
  - Server-side testimonial cap: `existingCount >= 15` in `publicSubmissionHandler.ts` blocks public submissions with `403 FREE_TIER_LIMIT_REACHED`.
  - Server-side / Client space cap: Max 1 space on free tier enforced in `AuthContext.tsx`.
  - Stripe webhook is the authoritative updater of `plan` and `subscriptionStatus`. Client writes to billing fields are locked in `firestore.rules`.

---

# Walkthrough: Priority 2 Hardening – Global SaaS Scale

**Date:** Oct 14, 2026  
**Latest Worker Deploy Version:** `31b18c5c-a93a-4a66-867c-08157276db30`  
**Test Suite:** 79/79 test files passed (485/485 tests)  
**Production Build:** Clean `tsc && vite build` (0 errors)

---

## Priority 2 Hardened Workstreams & Verification Steps

### P2.1 — Conversion & Monetization Reliability
- **Implementation:**
  - Stripe checkout metadata stores explicit `priceId` alongside `workspaceId` and `plan`.
  - `stripeWebhook.ts` safely unwraps `workspace.data?.subscriptionStatus` or `workspace.subscriptionStatus` to transition subscriptions from `past_due` back to `active`.
  - Founding lifetime tier mapping correctly sets `plan: 'pro'` with lifetime duration.
  - `WorkspaceSettings.tsx` displays alert banners for:
    - Post-checkout success toast/banner (`/dashboard?checkout=success`).
    - Post-checkout canceled banner (`/dashboard?checkout=canceled`).
    - Urgent `past_due` warning banner with direct button to Stripe Customer Portal.
- **Manual Verification Step:**
  1. Navigate to `/dashboard?checkout=success`.
  2. Verify green celebration banner: *"🎉 Subscription Activated! Thank you for upgrading..."*.
  3. Change workspace state to `past_due` in dev tools or navigate with `past_due` workspace.
  4. Verify red warning banner: *"Action Required: Payment Past Due. Your last subscription payment could not be processed..."* with **Update Payment Method** button.

### P2.2 — Public Collection Funnel Quality & Anti-Spam
- **Implementation:**
  - Anti-spam heuristics in `publicSubmissionHandler.ts`:
    - Rejects strings with 5+ consecutively repeated identical characters (e.g. `aaaaaa`).
    - Rejects spam with 3+ repeated identical words.
    - Rejects known disposable/temporary email provider domains (10minutemail, mailinator, guerrillamail, tempmail, throwawaymail).
  - Mobile UX in `PublicCollectorPage.tsx`:
    - Triggers smooth scroll to `#collector-error-banner` when validation fails on mobile viewports.
    - Added touch-friendly 44px minimum target sizes for star ratings and submission buttons.
- **Manual Verification Step:**
  1. Open a public submission link (e.g., `https://pandapraise.com/c/demo-space-feedback`).
  2. Type a message consisting of `aaaaaaaaaa` or `test test test test test`.
  3. Submit review; verify HTTP 400 rejection: *"Please provide meaningful feedback without repetitive characters."*
  4. Type an email with `@mailinator.com`; verify HTTP 400 rejection: *"Please provide a valid permanent email address."*

### P2.3 — Embed / Widget Production Hardening
- **Implementation:**
  - `embedTestimonials.ts`: Queries only `public_reviews` collection where status is strictly `approved`.
  - PII Protection: Submitter email addresses, IPs, and user IDs are stripped; only public display name, rating, text, and avatar URL are returned.
  - Graceful empty states: Renders sleek transparent container when 0 approved reviews exist.
  - Workers log structured telemetry events for widget impressions.
- **Manual Verification Step:**
  1. Embed the widget snippet `<script src="https://pandapraise.com/embed.js" data-space="demo"></script>` into an empty test page.
  2. Inspect network tab to verify only approved testimonials are received with no sensitive PII fields.

### P2.4 — Onboarding & Activation (PLG)
- **Implementation:**
  - 5-step PLG checklist in `WelcomeView.tsx`:
    1. Create your first space
    2. Customize collection form
    3. Copy public link or QR code
    4. Approve your first testimonial
    5. Copy embed widget snippet
  - Unverified email users see an amber reminder banner locking live publish capabilities until email confirmation.
- **Manual Verification Step:**
  1. Sign in with a new account.
  2. Verify the 5-step interactive onboarding card is prominently shown on the dashboard overview with completion tracking.

### P2.5 — SEO & Marketing Site Integrity
- **Implementation:**
  - Stripped fabricated static ratings (`4.9`, `128`) from `seoHandler.ts` and programmatic SEO JSON-LD structured data.
  - Replaced with honest software schema (`SoftwareApplication` / `WebApplication`) without fabricated consumer reviews.
  - Added schema integrity assertion in `seoHandler.test.ts`.
- **Manual Verification Step:**
  1. Fetch `curl -s https://pandapraise.com/ | grep -i "application/ld+json"`.
  2. Verify JSON-LD contains legitimate software application schema with no fabricated aggregate ratings.

### P2.6 — Observability, Reliability & Ops
- **Implementation:**
  - Created `src/worker/lib/logger.ts` emitting structured JSON logs (`logWorkerEvent`) for Cloudflare Tail Workers and Datadog/Axiom ingestion.
  - Enhanced `/api/health` endpoint:
    - Returns `{ status: "ok", service: "pandapraise-api", bindings: { rateLimitKv: true, firebaseConfigured: true, stripeConfigured: boolean } }`.
    - Never exposes secret keys or tokens.
  - Updated `.env.example` with complete configuration options for Cloudflare KV, Turnstile, Firebase Service Accounts, and Stripe.
- **Manual Verification Step:**
  1. Run `curl https://pandapraise.com/api/health`.
  2. Verify response is HTTP 200 with `rateLimitKv: true` and `firebaseConfigured: true`.

### P2.7 — Referral & Partner/Affiliate Realism
- **Implementation:**
  - Removed all hardcoded mock metrics (`clicks: 218`, `conversions: 14`, `totalRevenueAttributedUsd: 1386.00`) from `affiliateHandler.ts` and `referralHandler.ts`.
  - Replaced with honest zero baselines (`clicks: 0`, `conversions: 0`, `earnings: 0`) for unpopulated partners.
  - Updated `createDefaultAffiliateProfile` in `src/lib/affiliate.ts` and dynamic conversion rate formatting in `AffiliatePage.tsx`.
- **Manual Verification Step:**
  1. Navigate to `https://pandapraise.com/affiliates`.
  2. Inspect the Partner Command Center stats:
     - Referral Clicks: `0`
     - Conversions: `0` (`0.0% conv. rate`)
     - Attributed MRR: `$0`
     - Unpaid Balance: `$0`
  3. No inflated vanity numbers are shown.

### P2.8 — End-to-End Suite Verification
- **Full Test Suite:** 83 test files, 513 tests, 100% passing.
- **Production Bundle:** Clean build via `tsc && vite build`.
- **Live Deployment:** Cloudflare Worker deployed to zone `pandapraise.com/*`.
- **Git Push:** All commits pushed to `origin/main`.

---

# Walkthrough: Razorpay Billing (India-First Monetization)

**Date:** Oct 14, 2026  
**Latest Worker Deploy Version:** `9bc0697d-f32c-49ea-bba7-95d7839ad9a6`  
**Test Suite:** 83/83 test files passed (513/513 tests)  
**Production Build:** Clean `tsc && vite build` (0 errors)

---

## 1. Cloudflare Worker Architecture & Webhook Verification
- **Handlers:**
  - `POST /api/razorpay/checkout`: Authenticated session creator for Subscriptions and One-time Orders.
  - `POST /api/webhook/razorpay`: Cryptographically verified via Web Crypto HMAC-SHA256 with `X-Razorpay-Signature`.
- **Idempotency:** Webhook events are checked and recorded in `/razorpay_events/{eventId}` with Firestore service account credentials.
- **Firestore Locks:** `firestore.rules` strictly prohibits clients from writing `razorpayCustomerId`, `razorpaySubscriptionId`, `razorpayPaymentId`, `razorpayOrderId`.

## 2. Cloudflare Secrets Setup Commands

To activate Razorpay in Test or Live mode, run the following commands:

```bash
# 1. API Keys (From Razorpay Dashboard > Settings > API Keys)
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET

# 2. Webhook Secret (From Razorpay Dashboard > Settings > Webhooks > Secret)
npx wrangler secret put RAZORPAY_WEBHOOK_SECRET

# 3. (Optional) Plan IDs (From Razorpay Dashboard > Products > Plans)
# If omitted, default fallbacks are used
npx wrangler secret put RAZORPAY_PLAN_MONTHLY
npx wrangler secret put RAZORPAY_PLAN_ANNUAL
npx wrangler secret put RAZORPAY_FOUNDING_AMOUNT
```

## 3. Webhook Configuration in Razorpay Dashboard
- **Webhook URL:** `https://pandapraise.com/api/webhook/razorpay`
- **Active Events to Select:**
  - `subscription.activated`
  - `subscription.charged`
  - `subscription.pending`
  - `subscription.halted`
  - `subscription.cancelled`
  - `payment.captured` (for Lifetime Founding Pro)
  - `order.paid`

## 4. Verification Checkpoints

1. **Health Probe:**
   ```bash
   curl -s https://pandapraise.com/api/health
   # Returns:
   # bindings: {
   #   rateLimitKv: true,
   #   firebaseConfigured: true,
   #   razorpayConfigured: true, // when RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET are set
   # }
   ```
2. **Frontend Checkout Flow:**
   - Navigate to `/pricing` or open the Upgrade Modal.
   - Click **Upgrade to Pro** or **Founding Member**.
   - Razorpay Checkout.js modal opens smoothly with branding `#6701e6`.
   - Test card payments succeed in Razorpay Test Mode and trigger automatic subscription activation.


