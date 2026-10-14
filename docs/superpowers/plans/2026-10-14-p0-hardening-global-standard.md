# P0 Hardening Implementation Plan – Bringing Priority 0 to Global SaaS Standard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all security, rate-limiting, rule bypass, and cascade deletion gaps identified in the Priority 0 audit to bring PandaPraise to global SaaS production standard.

**Architecture:** Harden Firestore security rules by locking all resource creation (`workspaces`, `projects`, `collection_forms`, `widgets`) behind verified email tokens and completely eliminating the anonymous client write path on `/reviews`. Upgrade public submission rate limiting to use Cloudflare KV with fail-closed semantics and mandatory Turnstile in production. Extend GDPR cascade account deletion to purge Firebase Storage media assets and execute resilient `Promise.allSettled` deletion across all tenant data before revoking Firebase Auth.

**Tech Stack:** Cloudflare Workers (TypeScript & KV), Firebase Auth & Firestore Rules, Firebase Storage API, Cloudflare Turnstile, Vitest.

**Spec:** User audit report on commit `70bee07` detailing P0 hardening requirements.

## Global Constraints
- Do not work on Priority 1 or lower features (SEO, affiliates, i18n polish).
- Maintain 100% test pass rate across all existing Vitest test files.
- Zero secrets in client-side environment variables (`VITE_*`).
- Extend existing Cloudflare Worker only.

## Review Focus
1. **Rule bypass regression**: If direct anonymous write to `/reviews` is removed, does `PublicCollectorPage.tsx` successfully submit reviews via `/api/testimonials/submit` using the service account?
2. **KV Rate limiting fail-closed**: If KV fails or is unavailable in production, does the Worker fail closed (503) instead of allowing spammers to flood?
3. **Turnstile fail-closed in production**: If `TURNSTILE_SECRET_KEY` is omitted in production, does `/api/testimonials/submit` reject submissions with 503 rather than failing open?
4. **GDPR storage purge**: Does `accountDeletionHandler` delete media files in Firebase Storage under the user's path without breaking if a storage bucket is empty?
5. **Email verification enforcement**: Do rules prevent creating workspaces, projects, or widgets if `request.auth.token.email_verified != true`?

---

### Task 1: Email Verification – Enforce in Firestore Rules & Client Guards

**Files:**
- Modify: `firestore.rules:25-70`
- Test: `src/worker/firestore.rules.test.ts`
- Modify: `src/context/AuthContext.tsx`

- [ ] **Step 1: Write failing tests in `firestore.rules.test.ts`**
  - Add tests requiring `request.auth.token.email_verified == true` for `workspaces`, `projects`, `collection_forms`, and `widgets`.
- [ ] **Step 2: Update `firestore.rules`**
  - Enforce `request.auth.token.email_verified == true` on `create` for `workspaces`, `projects`, `collection_forms`, and `widgets`.
- [ ] **Step 3: Run `firestore.rules.test.ts`**
  - Verify all rules tests pass.
- [ ] **Step 4: Verify `AuthContext.tsx`**
  - Confirm `sendEmailVerification` is dispatched on `signUp`, persistent banner is active, and project creation gates unverified users.

---

### Task 2: Close Direct Public Firestore Write Path

**Files:**
- Modify: `firestore.rules:145-180`
- Test: `src/worker/firestore.rules.test.ts`
- Modify: `src/pages/PublicCollectorPage.tsx`

- [ ] **Step 1: Write failing test in `firestore.rules.test.ts`**
  - Verify that anonymous creation on `/reviews/{reviewId}` is NOT permitted (only authenticated owners may write directly).
- [ ] **Step 2: Remove anonymous `allow create` from `firestore.rules`**
  - Keep owner-scoped manual/CSV create: `allow create: if isAuthenticated() && request.auth.uid == request.resource.data.ownerId && ...`
  - Remove the anonymous create rule completely so all public form reviews must be written by the Worker Admin API.
- [ ] **Step 3: Update `PublicCollectorPage.tsx`**
  - Remove fallback to `storage.createReview` for anonymous users; submission must strictly succeed via `POST /api/testimonials/submit` or report error.
- [ ] **Step 4: Run tests**
  - Verify `firestore.rules.test.ts` and `PublicCollectorPage.test.tsx` pass.

---

### Task 3: Production-Grade KV Rate Limiting & Fail-Closed Turnstile

**Files:**
- Modify: `src/worker/types.ts`
- Create: `src/worker/lib/kvRateLimit.ts`
- Modify: `src/worker/handlers/publicSubmissionHandler.ts`
- Test: `src/worker/handlers/publicSubmissionHandler.test.ts`

- [ ] **Step 1: Add KV type and `checkRateLimitKV`**
  - Define `RATE_LIMIT_KV?: KVNamespace` in `WorkerEnv`.
  - Implement `checkRateLimitKV(ip, limit, windowSeconds, kv, isProd)` with sliding-window/fixed-counter TTL in KV.
  - Fail closed on KV errors (return `{ allowed: false, isError: true }`).
- [ ] **Step 2: Update `publicSubmissionHandler.ts`**
  - Use `checkRateLimitKV`. If KV returns error in production, respond with 503.
  - If `env.TURNSTILE_SECRET_KEY` is missing in production (`NODE_ENV === 'production'`), reject with 503 (fail closed).
- [ ] **Step 3: Write tests in `publicSubmissionHandler.test.ts`**
  - Test KV rate limiting and expiration.
  - Test KV failure handling (returns 503).
  - Test production Turnstile missing key (returns 503).
- [ ] **Step 4: Run tests**
  - Verify all tests pass.

---

### Task 4: Hardened GDPR Cascade Deletion (Firebase Storage + Resilient Deletion)

**Files:**
- Create: `src/worker/lib/firebaseStorage.ts`
- Modify: `src/worker/handlers/accountDeletionHandler.ts`
- Test: `src/worker/handlers/accountDeletionHandler.test.ts`

- [ ] **Step 1: Create `firebaseStorage.ts`**
  - Implement `deleteUserStorageObjects(uid, env)` using service account OAuth token to list and delete user-owned blobs.
- [ ] **Step 2: Harden `accountDeletionHandler.ts`**
  - Wrap collection deletions in resilient `Promise.allSettled`.
  - Invoke `deleteUserStorageObjects(uid, env)`.
  - Cancel Stripe customer and subscriptions prior to Firebase Auth deletion.
  - Delete Firebase Auth user last.
- [ ] **Step 3: Update `accountDeletionHandler.test.ts`**
  - Mock `deleteUserStorageObjects` and assert it is called with `uid`.
  - Verify resilient cascade handles partial failures gracefully while logging errors.
- [ ] **Step 4: Run tests**
  - Verify all tests pass.

---

### Task 5: Free-Tier Server Enforcement Completeness

**Files:**
- Modify: `src/worker/handlers/publicSubmissionHandler.ts`
- Modify: `src/types/index.ts`
- Modify: `src/context/AuthContext.tsx`

- [ ] **Step 1: Verify and solidify limits**
  - Free tier: max 15 testimonials, max 1 project, max 1 widget.
  - Worker public submit enforces 15 reviews max.
  - AuthContext enforces 1 project max for free plan.
  - AuthContext enforces email verified before creating projects.
- [ ] **Step 2: Run full test suite**
  - Run all 79+ test suites.

---

### Task 6: Production Build, Deployment & Verification Walkthrough

**Files:**
- Modify: `task.md`
- Create: `walkthrough.md`

- [ ] **Step 1: Run full Vitest suite (`npm test`)**
- [ ] **Step 2: Run production build (`cmd /c npm run build`)**
- [ ] **Step 3: Commit and push to GitHub**
- [ ] **Step 4: Deploy to Cloudflare Worker (`cmd /c npx wrangler deploy`)**
- [ ] **Step 5: Test live health and verify endpoints**
- [ ] **Step 6: Update `walkthrough.md` with verification results**
