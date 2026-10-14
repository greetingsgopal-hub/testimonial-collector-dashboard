# PandaPraise: Remaining Priority 0 Tasks

## 1. Email Verification (Critical)
- [x] **1.1 Firestore Security Rules Gate**
  - [x] Update `firestore.rules` so workspace creation and sensitive writes require `request.auth.token.email_verified == true`.
  - [x] Add static analysis tests in `src/worker/firestore.rules.test.ts`.
- [x] **1.2 Auth & Onboarding Flow Hardening**
  - [x] Ensure `sendEmailVerification` is dispatched on `signUp`.
  - [x] Gate creation of new workspaces/projects in UI if user is unverified.
  - [x] Ensure persistent `EmailVerificationBanner` is visible across dashboard when `user.emailVerified === false`.
  - [x] Support direct "Resend verification email" with cooldown timer.

## 2. Harden & Wire Stripe Billing & Free-Tier Server Limits
- [x] **2.1 Frontend Stripe Client Wiring**
  - [x] Create `src/lib/stripe.ts` with `startStripeCheckout({ priceId })` and `openBillingPortal()`.
  - [x] Wire `PricingPage.tsx` checkout buttons to call `startStripeCheckout`.
  - [x] Wire `UpgradeModal.tsx` and `PlanLimitBanner.tsx` to initiate checkout directly.
  - [x] Add "Manage Subscription / Billing Portal" button in `WorkspaceSettings.tsx` (Billing tab) for active paid subscribers.
- [x] **2.2 Server-Side Tier Limits Enforcement**
  - [x] Enforce max 15 testimonials, max 1 project, max 1 widget server-side in Firestore rules and Worker.
  - [x] Ensure Stripe webhook correctly updates `plan`, `subscriptionStatus`, and `currentPeriodEnd`.
  - [x] Verify Founding lifetime price tier is handled as permanent Pro access.

## 3. Protect Public Collection Forms (Abuse Prevention)
- [x] **3.1 Cloudflare Turnstile & IP Rate Limiting Endpoint**
  - [x] Create Worker endpoint `POST /api/testimonials/submit` in `src/worker/handlers/publicSubmissionHandler.ts`.
  - [x] Verify Turnstile token server-side via `challenges.cloudflare.com/turnstile/v0/siteverify`.
  - [x] Implement IP rate limiting (max 5 submissions per IP per 10 minutes) returning 429 when exceeded.
  - [x] Verify active status of collection form before saving review to Firestore via Admin API.
- [x] **3.2 Public Form Integration & Firebase App Check**
  - [x] Integrate Turnstile widget in `src/pages/PublicCollectorPage.tsx` with graceful test bypass fallback.
  - [x] Route form submissions through `POST /api/testimonials/submit`.
  - [x] Retain strong input validation and Firebase App Check initialization.

## 4. Self-Service Account Deletion (GDPR Article 17)
- [x] **4.1 Cloudflare Worker Account Purge Endpoint**
  - [x] Create `POST /api/account/delete` in `src/worker/handlers/accountDeletionHandler.ts`.
  - [x] Require valid Firebase ID Token and explicit `{ confirmation: "DELETE" }`.
  - [x] Cascade delete: workspaces, projects, collection_forms, reviews, public_reviews, widgets, social_connections.
  - [x] Cancel Stripe subscriptions and delete customer in Stripe.
  - [x] Delete Firebase Auth user record via Identity Toolkit API.
- [x] **4.2 Settings UI Dangerous Deletion Modal**
  - [x] Add "Danger Zone: Delete Account & All Data" in `WorkspaceSettings.tsx`.
  - [x] Add confirmation modal requiring user to type "DELETE" before enabling action.
  - [x] On success, sign out, clear local cache, and redirect to homepage (`/`).

## 5. Verification & Walkthrough
- [x] Verify 100% test pass rate across all test suites (`npm test` - 79 suites, 474 tests passed).
- [x] Verify clean production build (`npm run build` - succeeded in 8.23s).
- [x] Produce `walkthrough.md` with verification steps and testing evidence.

