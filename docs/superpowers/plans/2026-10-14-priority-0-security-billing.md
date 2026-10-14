# Priority 0 Security, Compliance & Billing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement and harden all 4 remaining Priority 0 items for PandaPraise: Email Verification, Stripe Billing wiring & limits, Public Form Abuse Prevention (Turnstile + Rate Limiting), and Self-Service Account Deletion (GDPR Article 17 cascade).

**Architecture:** Extend existing Cloudflare Worker with secure edge endpoints (`/api/testimonials/submit`, `/api/account/delete`, `/api/stripe/*`) and integrate with Firestore Admin API, Stripe API, and Cloudflare Turnstile; update `firestore.rules` for email verification and free-tier limits; wire frontend AuthContext, PublicCollectorPage, WorkspaceSettings, and UpgradeModal.

**Tech Stack:** Cloudflare Workers (TypeScript), Firebase Auth & Firestore Rules, Stripe API, Cloudflare Turnstile, React 18, Vitest.

**Spec:** User Master Prompt "Fix All Remaining Priority 0 Issues – PandaPraise".

## Global Constraints

- Must maintain 100% pass rate on all existing 77 test suites (464+ tests).
- Never expose secrets in client-side `VITE_*` environment variables.
- Extend existing Cloudflare Worker (`src/worker/`) instead of introducing external services.
- Follow existing multi-tenant security model (`ownerId == request.auth.uid`).
- Strict TypeScript (`noUnusedLocals: true`).

## Review Focus

1. **Unverified email bypassing workspace creation:** Malicious unverified user attempts to create multiple workspaces directly via Firestore SDK.
2. **Free-tier bypass:** User submits reviews or creates projects past limits via raw API calls.
3. **Turnstile bypass on public collection form:** Spammer posts reviews directly without solving CAPTCHA or exceeds 5 submissions per 10 minutes.
4. **Account deletion incomplete cascade:** User deletes account but Stripe subscription keeps billing or orphaned reviews remain visible.
5. **Accidental account deletion:** User triggers deletion without typing exact "DELETE" confirmation or with an expired session.

---

### Task 1: Email Verification Enforcement (Critical)

**Files:**
- Modify: `firestore.rules` (require `request.auth.token.email_verified == true` for workspace create and sensitive mutations)
- Modify: `src/context/AuthContext.tsx` (ensure auto verification email dispatch, reactive check, gated creation)
- Modify: `src/components/auth/EmailVerificationBanner.tsx` (ensure prominent mounting and resend button)
- Modify: `src/pages/DashboardPage.tsx` (gate sensitive actions with verification prompt)
- Test: `src/worker/firestore.rules.test.ts` (test email_verified rule requirement)
- Test: `src/pages/__tests__/VerifyEmailPage.test.tsx` (test verification flow)

**Interfaces:**
- Consumes: Firebase Auth `sendEmailVerification`, `applyActionCode`, `request.auth.token.email_verified`.
- Produces: Hard rule rejection for unverified workspace creation; UI warning banner with resend and verification link.

- [ ] **Step 1: Write the failing tests for `email_verified` rule in `src/worker/firestore.rules.test.ts`**
```typescript
it('requires email_verified == true for workspace creation', () => {
  const block = workspaceBlock();
  expect(block).toMatch(/request\.auth\.token\.email_verified\s*==\s*true/);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node node_modules/vitest/vitest.mjs run src/worker/firestore.rules.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `firestore.rules` and `AuthContext.tsx`**
Update `match /workspaces/{workspaceId}` create rule in `firestore.rules`:
`allow create: if isAuthenticated() && request.auth.token.email_verified == true && request.resource.data.ownerId == request.auth.uid ...`
Update `AuthContext.tsx` and `DashboardPage.tsx` to display verification prompt when creating new projects/workspaces while unverified.

- [ ] **Step 4: Run tests to verify they pass**
Run: `node node_modules/vitest/vitest.mjs run src/worker/firestore.rules.test.ts src/pages/__tests__/VerifyEmailPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit Task 1**
```bash
git add firestore.rules src/context/AuthContext.tsx src/components/auth/EmailVerificationBanner.tsx src/worker/firestore.rules.test.ts
git commit -m "feat(p0-security): enforce email verification in firestore rules and onboarding"
```

---

### Task 2: Harden & Wire Stripe Billing & Free-Tier Server Limits

**Files:**
- Create: `src/lib/stripe.ts` (frontend helper: `startStripeCheckout`, `openBillingPortal`)
- Modify: `src/pages/PricingPage.tsx` (wire checkout buttons to call `startStripeCheckout`)
- Modify: `src/components/dashboard/UpgradeModal.tsx` (wire plan selection directly to Stripe checkout)
- Modify: `src/components/dashboard/WorkspaceSettings.tsx` (add "Manage Subscription" button calling billing portal, handle `checkout=true`)
- Modify: `src/worker/handlers/stripeCheckout.ts` (support founding lifetime plan and plan tier resolution)
- Modify: `firestore.rules` (server-side rule enforcement for free-tier limits: max 15 testimonials, max 1 project, max 1 widget)
- Test: `src/worker/handlers/stripeCheckout.test.ts` (test checkout session creation with founding and subscriptions)
- Test: `src/lib/__tests__/stripeBilling.test.ts` (test client helper and plan limits)

**Interfaces:**
- Consumes: `POST /api/stripe/checkout`, `POST /api/stripe/billing-portal`, `POST /api/webhooks/stripe`.
- Produces: `startStripeCheckout(priceId: string): Promise<void>`, `openBillingPortal(): Promise<void>`.

- [ ] **Step 1: Write the failing tests in `src/worker/handlers/stripeCheckout.test.ts` and `src/lib/__tests__/stripeBilling.test.ts`**
Test that `startStripeCheckout` posts to `/api/stripe/checkout` with auth Bearer token and redirects to returned URL.
Test that free tier limit rejects reviews > 15 in Firestore rules / worker.

- [ ] **Step 2: Run test to verify it fails**
Run: `node node_modules/vitest/vitest.mjs run src/lib/__tests__/stripeBilling.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `src/lib/stripe.ts`, wire `PricingPage.tsx`, `UpgradeModal.tsx`, and `WorkspaceSettings.tsx`**
Wire real API checkout calls and add Billing Portal redirect for active paid subscribers.

- [ ] **Step 4: Run tests to verify they pass**
Run: `node node_modules/vitest/vitest.mjs run src/worker/handlers/stripeCheckout.test.ts src/lib/__tests__/stripeBilling.test.ts`
Expected: PASS

- [ ] **Step 5: Commit Task 2**
```bash
git add src/lib/stripe.ts src/pages/PricingPage.tsx src/components/dashboard/UpgradeModal.tsx src/components/dashboard/WorkspaceSettings.tsx src/worker/handlers/stripeCheckout.ts
git commit -m "feat(p0-billing): wire stripe checkout, billing portal, and server-side tier limits"
```

---

### Task 3: Protect Public Collection Forms (Turnstile + Rate Limiting + App Check)

**Files:**
- Create: `src/worker/handlers/publicSubmissionHandler.ts` (endpoint `POST /api/testimonials/submit`)
- Create: `src/worker/handlers/publicSubmissionHandler.test.ts`
- Modify: `src/worker/index.ts` (mount `case 'testimonials/submit'`)
- Modify: `src/pages/PublicCollectorPage.tsx` (render Turnstile widget, submit via `/api/testimonials/submit`)
- Modify: `src/lib/storage/firebaseAdapter.ts` (route public form submission to worker endpoint)
- Test: `src/pages/__tests__/PublicCollectorPage.test.tsx` (test Turnstile token submission and rate limit rejection)

**Interfaces:**
- Consumes: Cloudflare Turnstile siteverify API (`https://challenges.cloudflare.com/turnstile/v0/siteverify`), `request.headers.get('cf-connecting-ip')`.
- Produces: `POST /api/testimonials/submit` accepting `{ ...reviewData, turnstileToken: string }`, returning `{ success: true, id: string }` or `429 Too Many Requests` / `400 Invalid CAPTCHA`.

- [ ] **Step 1: Write the failing tests in `src/worker/handlers/publicSubmissionHandler.test.ts`**
Test rate limiting (6th request within 10 minutes from same IP returns 429).
Test Turnstile validation (rejects invalid token with 400).
Test successful submission writes document to Firestore.

- [ ] **Step 2: Run test to verify it fails**
Run: `node node_modules/vitest/vitest.mjs run src/worker/handlers/publicSubmissionHandler.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `publicSubmissionHandler.ts`, mount in `src/worker/index.ts`, and integrate Turnstile in `PublicCollectorPage.tsx`**
Implement in-memory / KV rate limiter (5 per 10 mins per IP), Turnstile verification, and connect to `PublicCollectorPage.tsx`.

- [ ] **Step 4: Run tests to verify they pass**
Run: `node node_modules/vitest/vitest.mjs run src/worker/handlers/publicSubmissionHandler.test.ts src/pages/__tests__/PublicCollectorPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit Task 3**
```bash
git add src/worker/handlers/publicSubmissionHandler.ts src/worker/handlers/publicSubmissionHandler.test.ts src/worker/index.ts src/pages/PublicCollectorPage.tsx
git commit -m "feat(p0-security): add turnstile verification and ip rate limiting to public forms"
```

---

### Task 4: Self-Service Account Deletion (GDPR Article 17)

**Files:**
- Create: `src/worker/handlers/accountDeletionHandler.ts` (endpoint `POST /api/account/delete`)
- Create: `src/worker/handlers/accountDeletionHandler.test.ts`
- Modify: `src/worker/index.ts` (mount `case 'account/delete'`)
- Modify: `src/components/dashboard/WorkspaceSettings.tsx` (add Dangerous "Delete Account & All Data" modal requiring typing "DELETE")
- Test: `src/worker/handlers/accountDeletionHandler.test.ts` (test full cascade deletion: workspaces, projects, forms, reviews, widgets, stripe customer, auth user)
- Test: `src/components/dashboard/__tests__/WorkspaceSettings.test.tsx` (test delete confirmation UI)

**Interfaces:**
- Consumes: Firebase ID Token, `POST /api/account/delete` with `{ confirmation: "DELETE" }`.
- Produces: Complete purge of all user records, cancelation of Stripe subscriptions, deletion of Auth record, followed by client logout and redirect to `/`.

- [ ] **Step 1: Write the failing tests in `src/worker/handlers/accountDeletionHandler.test.ts`**
Test that endpoint rejects requests without `confirmation === "DELETE"`.
Test that all collections (`workspaces`, `projects`, `collection_forms`, `reviews`, `widgets`, `social_connections`) are queried and deleted.
Test that Stripe customer is retrieved and deleted/canceled.
Test that Firebase Auth user is deleted.

- [ ] **Step 2: Run test to verify it fails**
Run: `node node_modules/vitest/vitest.mjs run src/worker/handlers/accountDeletionHandler.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement `accountDeletionHandler.ts`, mount in `src/worker/index.ts`, and add confirmation modal to `WorkspaceSettings.tsx`**
Implement transactional/cascading purge and front-end dangerous confirmation modal.

- [ ] **Step 4: Run tests to verify they pass**
Run: `node node_modules/vitest/vitest.mjs run src/worker/handlers/accountDeletionHandler.test.ts src/components/dashboard/__tests__/WorkspaceSettings.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit Task 4**
```bash
git add src/worker/handlers/accountDeletionHandler.ts src/worker/handlers/accountDeletionHandler.test.ts src/worker/index.ts src/components/dashboard/WorkspaceSettings.tsx
git commit -m "feat(p0-compliance): implement gdpr self-service account deletion cascade"
```

---

### Task 5: Verification, End-to-End Build & Walkthrough

**Files:**
- Create: `walkthrough.md`
- Run: Full vitest test suite (`node node_modules/vitest/vitest.mjs run`)
- Run: Production build (`cmd /c npm run build`)
- Run: Cloudflare deploy verification (`cmd /c npx wrangler deploy`)

- [ ] **Step 1: Run full test suite and confirm 100% pass rate**
Run: `node node_modules/vitest/vitest.mjs run`
Expected: ALL test suites pass (475+ tests).

- [ ] **Step 2: Run production build and verify bundle**
Run: `cmd /c npm run build`
Expected: Clean build in < 10s with zero errors.

- [ ] **Step 3: Produce `walkthrough.md` documenting verification proofs**
Document testing steps, API payloads, and UI behaviors for all 4 P0 items.

- [ ] **Step 4: Commit and push**
```bash
git add task.md implementation_plan.md walkthrough.md
git commit -m "docs: finalize priority 0 security, compliance, and billing implementation"
```
