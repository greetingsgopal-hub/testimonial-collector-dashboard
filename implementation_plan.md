# Priority 2: Global SaaS Hardening & Scale – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring PandaPraise to global-standard operational maturity across monetization reliability, public collection funnels, embed performance, onboarding activation, SEO integrity, observability/ops, and honest referral/affiliate mechanics.

**Architecture:** Extend the existing Cloudflare Worker API router (`src/worker/`) and React 18 + Vite frontend (`src/`). Cloudflare KV (`RATE_LIMIT_KV`) provides durable state across isolates; Google Cloud Firestore REST API with service account auth serves as the zero-trust data layer; Cloudflare Worker edge streaming serves fast, secure embeds; and structured logging + `/api/health` diagnostics provide live observability without leaking secrets.

**Tech Stack:** TypeScript, React 18, Vite, Cloudflare Workers & KV, Stripe API & Webhooks, Firebase Auth & Firestore, Vitest, TailwindCSS.

**Spec:** User Master Prompt: "Priority 2 – Global SaaS Hardening & Scale (PandaPraise)"

---

## Global Constraints
- Do not rework Priority 0 security rules, KV rate limiting, Turnstile verification, or GDPR account deletion.
- Zero secrets in client-side bundles (`VITE_*`).
- Zero fabricated metrics, fake ratings, or mock social proof in schemas or partner portals.
- All public form submissions must route strictly through `POST /api/testimonials/submit`.
- 100% test pass rate across all suites; clean production build (`npm run build`).

---

## Review Focus
1. **Stripe Webhook Object Shape:** `workspace.data.subscriptionStatus` vs `workspace.subscriptionStatus` in Firestore documents — must handle both gracefully.
2. **Spam Filtering Accuracy:** Content repetition heuristics and disposable email filters must reject junk without blocking legitimate international or brief reviews.
3. **Embed Data Privacy:** Zero leakage of author email, IP, or private owner fields in embed endpoints.
4. **Partner/Affiliate Realism:** Removing hardcoded fake counters must return clean initial states (zeros) for new accounts rather than mock data.
5. **Observability Safety:** Health probe `/api/health` and structured logger must never output secret keys, credentials, or PII.

---

## Workstream Breakdown & Tasks

### Task 1: P2.1 — Conversion & Monetization Reliability
**Files:**
- Modify: `src/worker/handlers/stripeWebhook.ts`
- Modify: `src/worker/handlers/stripeCheckout.ts`
- Modify: `src/pages/PricingPage.tsx`
- Modify: `src/components/dashboard/WorkspaceSettings.tsx`
- Test: `src/worker/handlers/stripeWebhook.test.ts`
- Test: `src/worker/handlers/stripeCheckout.test.ts`

**Steps:**
- [ ] Fix customer query unwrapping in `stripeWebhook.ts` so `invoice.payment_succeeded` and `invoice.payment_failed` update status accurately whether document is returned as `{ id, ...data }` or `{ id, data }`.
- [ ] Verify `founding`, `annual`, `monthly`, and `pro` price resolution in `stripeCheckout.ts` map to configured environment variables or aliases.
- [ ] In `PricingPage.tsx` and `WorkspaceSettings.tsx`, add post-checkout detection for `?checkout=success` and `?checkout=cancelled` with clear UX toasts.
- [ ] In `DashboardPage.tsx` / `WorkspaceSettings.tsx`, add alert banner for `subscriptionStatus === 'past_due'` with a direct button to `openBillingPortal()`.
- [ ] Run `vitest run src/worker/handlers/stripeCheckout.test.ts src/worker/handlers/stripeWebhook.test.ts`.
- [ ] Commit: `feat(p2-billing): harden stripe checkout, webhook status sync, and past-due handling`.

---

### Task 2: P2.2 — Public Collection Funnel Quality & Spam Checks
**Files:**
- Modify: `src/worker/handlers/publicSubmissionHandler.ts`
- Modify: `src/pages/PublicCollectorPage.tsx`
- Test: `src/worker/handlers/publicSubmissionHandler.test.ts`

**Steps:**
- [ ] Add basic anti-spam content validation in `publicSubmissionHandler.ts`:
  - Reject submissions where text is repeated identical characters/words (e.g. `aaaaa...` or `test test test...`).
  - Add disposable email domain soft-check (flag review as `flagged_spam: true` or reject obvious throwaway domains like `mailinator.com`, `tempmail.com`, `10minutemail.com`).
- [ ] In `PublicCollectorPage.tsx`, polish mobile responsiveness:
  - Add scroll-to-error on validation failure.
  - Improve touch tap targets and review celebration/success animation.
- [ ] Write unit tests in `publicSubmissionHandler.test.ts` covering spam detection.
- [ ] Run `vitest run src/worker/handlers/publicSubmissionHandler.test.ts`.
- [ ] Commit: `feat(p2-collector): add anti-spam validation and polish mobile collector funnel`.

---

### Task 3: P2.3 — Embed & Widget Production Hardening
**Files:**
- Modify: `src/worker/handlers/embedTestimonials.ts`
- Modify: `src/worker/handlers/embedScript.ts`
- Test: `src/worker/handlers/embedTestimonials.test.ts`
- Test: `src/worker/handlers/embedScript.test.ts`

**Steps:**
- [ ] In `embedTestimonials.ts`, ensure that if a space has 0 approved testimonials, it returns clean empty payload `{ totalCount: 0, testimonials: [] }` with `200 OK` (not error), and the script renders a graceful non-breaking placeholder or hides cleanly.
- [ ] Verify that `authorEmail`, `ownerId`, and internal moderation notes are strictly omitted from `embedTestimonials.ts` responses.
- [ ] Add structured log event `logWorkerEvent('embed', 'view', { projectId, count })` for usage observability.
- [ ] Run `vitest run src/worker/handlers/embedTestimonials.test.ts src/worker/handlers/embedScript.test.ts`.
- [ ] Commit: `feat(p2-embeds): harden embed empty state, zero-trust data isolation, and view telemetry`.

---

### Task 4: P2.4 — Onboarding & First-Session Activation (PLG)
**Files:**
- Modify: `src/components/dashboard/views/WelcomeView.tsx`
- Modify: `src/pages/OnboardingPage.tsx`
- Test: `src/components/dashboard/views/__tests__/WelcomeView.onboarding.test.tsx`

**Steps:**
- [ ] Refine the interactive 5-step activation path in `WelcomeView.tsx`:
  1. Space Created (checked by default on signup)
  2. Customize Collection Form
  3. Share Collection Link or QR Code
  4. Moderate/Approve First Testimonial
  5. Copy Embed Widget Code
- [ ] Ensure banner nudges user to verify email if `user.emailVerified === false`, explaining that verification unlocks publishing and multi-space creation.
- [ ] Run `vitest run src/components/dashboard/views/__tests__/WelcomeView.onboarding.test.tsx`.
- [ ] Commit: `feat(p2-onboarding): enhance first-session PLG activation checklist and verification cues`.

---

### Task 5: P2.5 — SEO & Marketing Site Integrity
**Files:**
- Modify: `src/worker/handlers/seoHandler.ts`
- Modify: `src/lib/seoData.ts`
- Test: `src/worker/handlers/seoHandler.test.ts`

**Steps:**
- [ ] Remove hardcoded fabricated ratings (`4.9`, `128`) from `renderCompetitorHtml` and JSON-LD schema in `seoHandler.ts`.
- [ ] Replace with honest `SoftwareApplication` schema without fabricated aggregate ratings.
- [ ] Ensure all canonical URLs, Open Graph tags, and Twitter cards use canonical `https://pandapraise.com` origin.
- [ ] Verify `sitemap.xml` and `robots.txt` output valid XML/text and contain only legitimate indexable routes.
- [ ] Run `vitest run src/worker/handlers/seoHandler.test.ts`.
- [ ] Commit: `fix(p2-seo): remove fabricated schema ratings and enforce honest metadata integrity`.

---

### Task 6: P2.6 — Observability, Reliability & Operations
**Files:**
- Create: `src/worker/lib/logger.ts`
- Modify: `src/worker/index.ts`
- Modify: `.env.example`
- Test: `src/worker/health.test.ts`

**Steps:**
- [ ] Create `src/worker/lib/logger.ts` with structured JSON logging (`logWorkerEvent(category, action, metadata)`).
- [ ] Enhance `/api/health` endpoint in `src/worker/index.ts` to check critical runtime bindings:
  - `kv: env.RATE_LIMIT_KV ? 'connected' : 'unconfigured'`
  - `firebase: env.FIREBASE_PROJECT_ID ? 'configured' : 'missing'`
  - `stripe: env.STRIPE_SECRET_KEY ? 'configured' : 'missing'`
  - Output without exposing secret keys or sensitive strings.
- [ ] Update `.env.example` with full documentation of all required and optional production environment variables and Cloudflare bindings.
- [ ] Run `vitest run src/worker/health.test.ts`.
- [ ] Commit: `feat(p2-ops): add structured worker logging, binding health check, and env documentation`.

---

### Task 7: P2.7 — Referral & Partner/Affiliate Correctness
**Files:**
- Modify: `src/worker/handlers/referralHandler.ts`
- Modify: `src/worker/handlers/affiliateHandler.ts`
- Test: `src/worker/handlers/referralHandler.test.ts`
- Test: `src/worker/handlers/affiliateHandler.test.ts`

**Steps:**
- [ ] Remove hardcoded fake stats (`clicks: 218`, `conversions: 14`, `$1386.00 revenue`) from `affiliateHandler.ts` and `referralHandler.ts`.
- [ ] Provide authentic initial states (`clicks: 0`, `conversions: 0`, `earnings: 0`) for newly registered partners and retrieve records via Firestore where available.
- [ ] Implement self-referral prevention (checking cookie/IP/email against owner).
- [ ] Run `vitest run src/worker/handlers/referralHandler.test.ts src/worker/handlers/affiliateHandler.test.ts`.
- [ ] Commit: `fix(p2-affiliates): remove fake stats and implement authentic partner tracking`.

---

### Task 8: P2.8 — Data Integrity, Full Verification & Deployment
**Files:**
- Modify: `walkthrough.md`
- Verify: Full repository test suite (`vitest run`)
- Build: `npm run build`
- Deploy: `npx wrangler deploy`

**Steps:**
- [ ] Run full test suite across all 79+ test files and verify 100% pass rate.
- [ ] Run production build (`cmd /c npm run build`).
- [ ] Deploy to Cloudflare Worker (`cmd /c npx wrangler deploy`).
- [ ] Update `walkthrough.md` with manual verification steps for all Priority 2 items.
- [ ] Commit and push to GitHub `origin/main`.
