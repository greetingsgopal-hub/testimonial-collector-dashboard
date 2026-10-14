# PandaPraise: Priority 0 Hardening Tasks (Global Standard)

## 1. Email Verification Enforcement in Rules & Guards
- [ ] **1.1 Firestore Security Rules Gate**
  - [ ] Require `request.auth.token.email_verified == true` for `workspaces`, `projects`, `collection_forms`, and `widgets`.
  - [ ] Add static analysis tests in `src/worker/firestore.rules.test.ts`.
- [ ] **1.2 Auth & Onboarding Verification State**
  - [ ] Confirm `sendEmailVerification` on `signUp`, persistent banner, and project creation gates unverified users.

## 2. Close Direct Public Firestore Write Path
- [ ] **2.1 Remove Direct Anonymous Write in Rules**
  - [ ] Remove anonymous `allow create` rule on `/reviews/{reviewId}` in `firestore.rules`.
  - [ ] Retain owner-authenticated create for manual/CSV entries.
- [ ] **2.2 Route All Public Submissions through Worker**
  - [ ] In `PublicCollectorPage.tsx`, remove anonymous direct fallback to `storage.createReview`.
  - [ ] Submissions strictly write via `POST /api/testimonials/submit` using the service account.

## 3. Production-Grade KV Rate Limiting & Fail-Closed Turnstile
- [ ] **3.1 Cloudflare KV Rate Limiter**
  - [ ] Define `RATE_LIMIT_KV` binding in `WorkerEnv`.
  - [ ] Implement `checkRateLimitKV(ip, limit, windowSeconds, kv, isProd)` with fail-closed semantics on KV failure (503).
- [ ] **3.2 Production Turnstile Enforcement**
  - [ ] Reject public submissions if `TURNSTILE_SECRET_KEY` is missing in production (`NODE_ENV === 'production'`) with 503.
- [ ] **3.3 Rate Limiting & Turnstile Unit Tests**
  - [ ] Write tests covering KV rate limits, KV error fail-closed, and production Turnstile absence.

## 4. Hardened GDPR Account Deletion (Storage Purge & Resilient Cascade)
- [ ] **4.1 Firebase Storage Media Purge**
  - [ ] Create `src/worker/lib/firebaseStorage.ts` with `deleteUserStorageObjects(uid, env)` using service account OAuth token.
- [ ] **4.2 Resilient Cascade Deletion**
  - [ ] In `accountDeletionHandler.ts`, execute collection deletes with `Promise.allSettled`.
  - [ ] Ensure Stripe customer and subscriptions are cancelled/deleted before Firebase Auth user is deleted.
- [ ] **4.3 Account Deletion Unit Tests**
  - [ ] Update `accountDeletionHandler.test.ts` to assert storage deletion and resilient cascade handling.

## 5. Free-Tier Server Enforcement Completeness
- [ ] **5.1 Server-Side Ceilings**
  - [ ] Max 15 testimonials (Worker public submit checks workspace plan).
  - [ ] Max 1 space/project (AuthContext and Firestore rules).
  - [ ] Max 1 widget (types, rules, and UI).

## 6. Verification, Build, Push & Cloudflare Deployment
- [ ] Run full Vitest suite (`npm test`).
- [ ] Run production build (`cmd /c npm run build`).
- [ ] Commit and push to GitHub.
- [ ] Deploy to Cloudflare Worker (`cmd /c npx wrangler deploy`).
- [ ] Test live health endpoint and produce `walkthrough.md`.
