# Priority 2: Global SaaS Hardening & Scale – Task Checklist

## P2.1 — Conversion & Monetization Reliability
- [x] Audit Stripe checkout parameters and ensure `founding`, `annual`, `monthly`, and `pro` price IDs resolve correctly to environment variables without fallback mismatch.
- [x] Handle `past_due` and `unpaid` subscription statuses in the dashboard with alert banner and direct billing portal link.
- [x] Add post-checkout redirect detection (`/dashboard?checkout=success` and `checkout=canceled`) showing status banners and portal links.
- [x] Fix `stripeWebhook.ts` customer matching (`workspace.data.subscriptionStatus` vs `workspace.subscriptionStatus`) to ensure past_due -> active restoration works reliably.
- [x] Validate unit tests in `src/worker/handlers/stripeCheckout.test.ts` and `src/worker/handlers/stripeWebhook.test.ts` (26/26 tests passing).

## P2.2 — Public Collection Funnel Quality
- [x] Add spam heuristic checks to `publicSubmissionHandler.ts`: reject empty/repeated character strings (e.g., "aaaaaaa..."), detect obvious disposable email patterns, and trim inputs.
- [x] Improve mobile validation and error feedback in `PublicCollectorPage.tsx` (smooth scroll to field errors, clear status messages).
- [x] Verify moderation queue in dashboard receives reviews and status defaults to `pending` (or auto-approved if rules match).
- [x] Add unit tests for anti-spam filters in `publicSubmissionHandler.test.ts` (12/12 tests passing).

## P2.3 — Embed / Widget Production Hardening
- [x] Audit `embedTestimonials.ts` to ensure privacy: only `approved` reviews in `public_reviews` are returned, emails/IPs are never exposed.
- [x] Add graceful empty-state handling in `embedScript.ts` and `embedTestimonials.ts` when 0 reviews exist.
- [x] Add embed telemetry event logging (`embed_view`, `embed_load_error`) in Cloudflare Worker logs for observability.
- [x] Update `embedScript.test.ts` and `embedTestimonials.test.ts` (23/23 tests passing).

## P2.4 — Onboarding & Activation (PLG)
- [x] Optimize first-session activation checklist in `WelcomeView.tsx`: (1) create space, (2) customize form, (3) copy public link/QR, (4) approve first review, (5) copy embed snippet.
- [x] Add verification banner prompt on locked features if user's email is unverified (`email_verified !== true`).
- [x] Ensure both Google OAuth and Email/Password signups land in a fully initialized workspace state with a default space and collection form.

## P2.5 — SEO & Marketing Site Integrity
- [x] Remove hardcoded fake ratings/review counts (`4.9`, `128`) from `seoHandler.ts` and programmatic SEO pages; replace with honest software metadata schema.
- [x] Audit `sitemap.xml` and `robots.txt` in `seoHandler.ts` for valid URLs and canonical paths.
- [x] Verify Open Graph, Twitter Cards, and canonical tags on landing, pricing, wall-of-love, and alternatives routes.
- [x] Update `seoHandler.test.ts` to verify accurate schemas (5/5 tests passing).

## P2.6 — Observability, Reliability, Ops
- [x] Implement structured JSON logging helper `logWorkerEvent(category, action, details)` for checkout, webhooks, public submissions, account deletions, and rate limits.
- [x] Enhance `/api/health` in `src/worker/index.ts` to check critical bindings (`RATE_LIMIT_KV`, `FIREBASE_PROJECT_ID`, `STRIPE_SECRET_KEY` presence) without exposing secret values.
- [x] Update `.env.example` with comprehensive documentation of all production variables and secrets.
- [x] Add unit tests in `health.test.ts` verifying binding health checks (2/2 tests passing).

## P2.7 — Referral / Affiliate Correctness
- [x] Remove hardcoded fake stats (`clicks: 218`, `conversions: 14`, etc.) from `referralHandler.ts` and `affiliateHandler.ts`.
- [x] Return clean honest baseline stats (0 clicks, 0 conversions, $0 revenue) for fresh partners.
- [x] Add self-referral prevention (cannot refer own account/email).
- [x] Update `referralHandler.test.ts` and `affiliateHandler.test.ts` (8/8 tests passing).

## P2.8 — Data Integrity & Compliance Polish
- [x] Verify account deletion endpoint still functions with storage purge and all P2 additions (7/7 tests passing).
- [x] Confirm CSV/JSON export in dashboard includes only reviews and data belonging to the authenticated workspace owner.
- [x] Verify zero secrets exposed in `VITE_*` environment or client bundle chunks.
- [x] Run full test suite (`vitest run`), execute production build (`npm run build`), deploy to Cloudflare Worker, and document manual verification steps in `walkthrough.md`.
