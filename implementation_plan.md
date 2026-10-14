# PandaPraise — Remaining Priority 0 Implementation Plan

**Objective:** Complete and harden all four critical Priority 0 security, compliance, and billing gaps:
1. **Email Verification:** Mandatory verification for sensitive operations & workspace creation; persistent banner with resend.
2. **Harden & Wire Stripe Billing:** End-to-end frontend checkout and billing portal calls; server-side free tier limits (15 reviews, 1 space, 1 widget).
3. **Protect Public Collection Forms:** Cloudflare Turnstile CAPTCHA verification, IP-based rate limiting (5 / 10m), and App Check.
4. **Self-Service Account Deletion (GDPR Right to Erasure):** Cascade deletion endpoint (`POST /api/account/delete`) purging Firestore, Storage, Stripe customer/subscriptions, and Firebase Auth, paired with a confirmation modal in Settings.

---

## Technical Architecture

```mermaid
graph TD
    subgraph Client ["Client Browser (React 18)"]
        UI_Signup[Signup Flow] -->|sendEmailVerification| Auth[AuthContext]
        UI_Dash[Dashboard & Settings] -->|Banner / Resend| VerifyPage[/verify-email]
        UI_Pricing[Pricing & UpgradeModal] -->|startStripeCheckout| StripeAPI[POST /api/stripe/checkout]
        UI_Settings[Settings Danger Zone] -->|Type 'DELETE'| DeleteAPI[POST /api/account/delete]
        UI_Public[PublicCollectorPage] -->|Turnstile + Review Payload| SubmitAPI[POST /api/testimonials/submit]
    end

    subgraph Edge ["Cloudflare Worker"]
        StripeAPI --> StripeHandler[stripeCheckout.ts]
        DeleteAPI --> DeleteHandler[accountDeletionHandler.ts]
        SubmitAPI --> RateLimiter[IP Rate Limiter 5/10m]
        RateLimiter --> TurnstileCheck[Verify Turnstile Token]
        TurnstileCheck --> SubmitHandler[publicSubmissionHandler.ts]
    end

    subgraph Services ["Cloud Services"]
        StripeHandler --> StripePlatform[Stripe API / Billing Portal]
        DeleteHandler --> FirestoreAdmin[Firestore Admin REST API]
        DeleteHandler --> StripePlatform
        DeleteHandler --> AuthAdmin[Firebase Auth Admin API]
        SubmitHandler --> FirestoreAdmin
    end

    subgraph Security ["Database Rules"]
        FirestoreAdmin -.-> Rules[firestore.rules]
        Rules --> Rule1["workspaces create requires request.auth.token.email_verified == true"]
        Rules --> Rule2["Billing fields locked to service account"]
        Rules --> Rule3["Free tier cap enforcement"]
    end
```

---

## Item 1: Email Verification
- **Rules Gate:** In `firestore.rules`, update `match /workspaces/{workspaceId}`:
  ```javascript
  allow create: if isAuthenticated() &&
                request.auth.token.email_verified == true &&
                request.resource.data.ownerId == request.auth.uid &&
                request.resource.data.plan == 'free' && ...
  ```
- **Auth Flow:**
  - Auto-call `sendEmailVerification(userCredential.user)` on `signUp`.
  - Mount `EmailVerificationBanner` persistently on dashboard views whenever `user.emailVerified === false`.
  - Add explicit verification modal or prompt if an unverified user attempts to create projects or publish widgets.

---

## Item 2: Harden & Wire Stripe Billing
- **Client Helper (`src/lib/stripe.ts`):**
  - `startStripeCheckout(priceId: string)`: Retrieves Firebase auth ID token, posts to `/api/stripe/checkout`, and redirects to `url`.
  - `openBillingPortal()`: Posts to `/api/stripe/billing-portal` and redirects to Stripe customer portal.
- **Frontend Wiring:**
  - `PricingPage.tsx`: Wire "Get Lifetime Access", "Annual Pro", and "Monthly Pro" buttons to invoke `startStripeCheckout`.
  - `UpgradeModal.tsx`: Wire plan selection directly to `startStripeCheckout`.
  - `WorkspaceSettings.tsx`: In the Billing tab, show current plan and provide "Manage Subscription" (portal) for paid users, or "Upgrade" (checkout) for free users.
- **Server Limits:**
  - Enforce free tier limits server-side: max 15 testimonials, max 1 project, max 1 widget.
  - Reject writes when limits are reached with informative error messages.

---

## Item 3: Protect Public Collection Forms
- **Edge Endpoint (`POST /api/testimonials/submit`):**
  - Extract client IP from `cf-connecting-ip`.
  - Enforce rate limit: max 5 requests per IP per 10-minute window (returns 429 if exceeded).
  - Verify Turnstile token against `https://challenges.cloudflare.com/turnstile/v0/siteverify` using `env.TURNSTILE_SECRET_KEY`.
  - Validate review input (name, rating, content, consent).
  - Check that target collection form is active.
  - Save to Firestore via Admin API.
- **Frontend Integration (`PublicCollectorPage.tsx`):**
  - Render Cloudflare Turnstile widget.
  - Submit through `/api/testimonials/submit`.
  - Display user-friendly rate limit or validation feedback.

---

## Item 4: Self-Service Account Deletion (GDPR Article 17)
- **Edge Endpoint (`POST /api/account/delete`):**
  - Require valid Firebase ID token in `Authorization: Bearer <token>`.
  - Require body payload: `{ confirmation: "DELETE" }`.
  - Query and delete:
    - All documents in `workspaces` where `ownerId == uid`.
    - All documents in `projects` where `ownerId == uid`.
    - All documents in `collection_forms` where `ownerId == uid`.
    - All documents in `reviews` and `public_reviews` where `ownerId == uid`.
    - All documents in `widgets` where `ownerId == uid || userId == uid`.
    - All documents in `social_connections` where `ownerId == uid`.
  - Cancel Stripe subscription and delete Stripe customer via Stripe API.
  - Delete Firebase Auth user record via Google Identity Toolkit REST API.
- **UI Confirmation Modal (`WorkspaceSettings.tsx`):**
  - Dedicated "Danger Zone" card under Settings.
  - Modal with red warning, explaining permanent data loss.
  - Input field requiring user to type exact string "DELETE" to enable button.
  - Calls `/api/account/delete`, signs out user, cleans local state, and redirects to `/`.

---

## Acceptance Criteria & Testing Plan

1. **Email Verification:**
   - Unverified user blocked from workspace creation in Firestore rules.
   - Tests in `src/worker/firestore.rules.test.ts` and `src/pages/__tests__/VerifyEmailPage.test.tsx`.
2. **Stripe Billing:**
   - Frontend triggers real checkout session creation and redirects.
   - Active subscribers can launch Stripe Billing Portal.
   - Free users blocked server-side past limits.
   - Tests in `src/worker/handlers/stripeCheckout.test.ts` and `src/lib/__tests__/stripeBilling.test.ts`.
3. **Public Form Protection:**
   - Spammers hitting public submission endpoint without Turnstile or > 5 times per 10m receive 400/429.
   - Legitimate submissions are verified and saved.
   - Tests in `src/worker/handlers/publicSubmissionHandler.test.ts`.
4. **GDPR Account Deletion:**
   - Full purge of user documents across all 6 collections, Stripe customer, and Auth record.
   - Tests in `src/worker/handlers/accountDeletionHandler.test.ts`.
5. **Zero Regressions:**
   - All 77 existing test suites (464+ tests) continue to pass.
   - Clean production build with zero TypeScript warnings.
