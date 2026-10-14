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
