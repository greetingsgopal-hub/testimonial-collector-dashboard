# Razorpay Billing Replacement – Task Checklist

## Task 1: Razorpay Worker Client & Web Crypto Signature Verification
- [x] Write unit tests for Razorpay client and HMAC-SHA256 signature verification in `src/worker/lib/razorpayClient.test.ts`.
- [x] Implement `src/worker/lib/razorpayClient.ts` with Web Crypto HMAC verification and REST APIs for Subscriptions, Orders, and Cancel.
- [x] Add Razorpay environment types in `src/worker/types.ts`.
- [x] Run vitest on `razorpayClient.test.ts` and ensure all tests pass (9/9 tests passing).
- [x] Commit: `feat(razorpay): add razorpay client and web crypto webhook signature verification`.

## Task 2: Razorpay Server Endpoints (Checkout & Webhooks)
- [x] Write unit tests for checkout session creation in `src/worker/handlers/razorpayCheckout.test.ts`.
- [x] Implement `src/worker/handlers/razorpayCheckout.ts` (`POST /api/razorpay/checkout`).
- [x] Write unit tests for webhook handling and idempotency in `src/worker/handlers/razorpayWebhook.test.ts`.
- [x] Implement `src/worker/handlers/razorpayWebhook.ts` (`POST /api/webhook/razorpay`).
- [x] Update `src/worker/index.ts` with routes `/api/razorpay/checkout`, `/api/webhook/razorpay`, `/api/razorpay/cancel`.
- [x] Update `/api/health` in `src/worker/index.ts` to output `razorpayConfigured`.
- [x] Update `src/worker/health.test.ts` to assert `razorpayConfigured`.
- [x] Run vitest on Razorpay handler tests and ensure all tests pass (15/15 tests passing).
- [x] Commit: `feat(razorpay): implement razorpay checkout, webhook, and health check routes`.

## Task 3: Firestore Security Rules & Idempotency Ledger
- [x] Update `firestore.rules` to lock `razorpayCustomerId`, `razorpaySubscriptionId`, `razorpayPaymentId`, `razorpayOrderId`.
- [x] Add explicit deny for `/razorpay_events/{eventId}` in `firestore.rules`.
- [x] Run rules tests in `src/lib/storage/firebaseAdapter.rules.test.ts` and `src/worker/firestore.rules.test.ts` (32/32 tests passing).
- [x] Deploy live firestore.rules to Firebase production project.
- [x] Commit: `fix(rules): lock razorpay billing fields and event ledger in firestore rules`.

## Task 4: Frontend Razorpay Integration
- [x] Write tests in `src/lib/__tests__/razorpay.test.ts` (4/4 tests passing).
- [x] Implement `src/lib/razorpay.ts` (script loader + checkout runner).
- [x] Update `src/pages/PricingPage.tsx` to use `startRazorpayCheckout`.
- [x] Update `src/components/dashboard/UpgradeModal.tsx` to use `startRazorpayCheckout`.
- [x] Update `src/components/dashboard/WorkspaceSettings.tsx` to use `startRazorpayCheckout` and display Razorpay subscription status.
- [x] Run component and frontend tests.
- [x] Commit: `feat(frontend): integrate razorpay checkout and subscription status management`.

## Task 5: Documentation, Deployment & Full Verification
- [x] Update `.env.example` with Razorpay keys, plan IDs, and founding amounts.
- [x] Run full vitest suite (83 test files, 513 tests — 100% passing).
- [x] Run `npm run build` production bundle check (0 errors).
- [x] Deploy Cloudflare Worker (`npx wrangler deploy`) to `pandapraise.com/*`.
- [x] Update `walkthrough.md` with Razorpay test instructions and secret management steps.
- [x] Push all commits to `origin/main`.
