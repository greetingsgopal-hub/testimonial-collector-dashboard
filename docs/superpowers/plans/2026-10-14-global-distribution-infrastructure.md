# PandaPraise Global Distribution Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete, production-ready, global-scale distribution infrastructure for PandaPraise (`pandapraise.com`) to power product-led growth (PLG), programmatic SEO, viral loops, partner/affiliate distribution, third-party platform integrations, and internationalization.

**Architecture:** Hybrid edge-first distribution architecture pairing the high-performance Cloudflare Worker edge runtime (`pandapraise.com`) for sub-30ms widget delivery (`/embed.js`), edge API handlers, and multi-tenant persistence with dynamic programmatic SEO pre-rendering, rich schema injection, and a robust affiliate/partner engine.

**Tech Stack:**
- **Frontend / Core App:** React 18/19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router v7
- **Edge API & Distribution Runtime:** Cloudflare Workers (TypeScript Edge runtime), Cloudflare D1 / Cloudflare R2 / Google Cloud Firestore & Firebase Auth
- **Payments & Affiliates:** Stripe Checkout, Customer Portal & Stripe Connect (Custom / Express accounts for payouts)
- **Email & Notifications:** Resend / Loops API integration + Webhook dispatchers for Slack & Discord
- **Analytics & Tracking:** PostHog, Cloudflare Web Analytics, UTM/Referral attribution engine
- **SEO & Static Distribution:** Programmatic pre-rendering engine, MDX blog, dynamic XML sitemaps, robots.txt, dynamic OG image generation, JSON-LD Schema (SoftwareApplication, AggregateRating, FAQPage)
- **Embeds:** Sub-15KB Vanilla JavaScript widget (`/embed.js`) with isolated Shadow DOM + `@pandapraise/react` wrapper + CMS plugins (Shopify Liquid, WordPress Shortcode, Webflow, Framer)

**Spec:** PandaPraise Master Prompt (Distribution Systems 1–6) & Business Readiness Audit.

---

## 1. Current State Assessment

### 1.1 Existing Codebase Findings (`testimonial-collector-dashboard`)
We performed an automated discovery and health check on the workspace:
- **Test Suite Status:** **59 test files, 407 tests passing** (Vitest 5.0.2 in `testimonial-collector-dashboard`).
- **Core Engine:** Fully functional testimonial collector, inbox/moderation pipeline, multi-tenant workspace/project structure, QR standee generator, and social import handlers (Facebook Pages, Instagram Mentions, Google Places/Business, LinkedIn).
- **Edge API & Worker Runtime:** Cloudflare Worker in `src/worker/` handles OAuth, Stripe checkout/webhooks, email invite webhooks, drip campaigns, universal review imports, and `/embed.js` script delivery.
- **Database & Storage:** Hybrid Cloudflare D1/R2 and Google Firestore/Storage with secure tenant boundaries (`isOwner(resource.data.ownerId)`).

### 1.2 Gap Analysis vs. Master Distribution Prompt

| System Area | Master Prompt Requirement | Current Codebase State | Gap / Needed Work |
| :--- | :--- | :--- | :--- |
| **1. PLG Foundation** | Free tier, 2-min onboarding, "Powered by PandaPraise" viral badge, in-app referrals | Free tier & limits exist in `planLimits.ts`; onboarding exists | Badge needs viral UTM referral attribution & 1-click upgrade; referral engine ("Give 1 mo / Get 1 mo") needs full automated credit ledger |
| **2. SEO & Content Engine** | Programmatic SEO (`/alternatives/*`, `/best-*`), MDX blog, dynamic sitemaps, OpenGraph, Schema | Client-side SPA routing; partial JSON-LD in `richSnippetSchema.ts` | Crawler-indexable programmatic routes, dynamic XML sitemap generation, OpenGraph edge cards, MDX blog foundation |
| **3. Integrations Marketplace** | Shopify, WordPress plugin, Webflow, Framer, Notion, Zapier/Make triggers, Slack/Discord alerts, Public API | Social imports and raw embed script exist | Native Shopify Liquid guide & app embed code, WordPress plugin package, Zapier REST hook triggers, Slack/Discord notification webhooks, Public API keys (`/api/v1/*`) |
| **4. Affiliate & Partner Program** | Self-serve affiliate dashboard, referral links, Stripe Connect payouts, agency partner portal | Not implemented | Affiliate registration, cookie/referral tracking, commission ledger (30% recurring), payout management, agency co-branded portal |
| **5. Viral & Social Proof Loops** | 1-click share to LinkedIn/X/PH, public Wall of Love (`/wall`), auto-generated case studies | `/love/:slug` exists; Social Card studio exists | One-click viral social share intent buttons with pre-generated preview cards; public `/wall` showcase; automated case study generator |
| **6. Global Readiness** | i18n (EN, ES, PT, DE, FR, HI), PPP multi-currency pricing, local Stripe methods, GDPR/CCPA | Collector has basic i18n; pricing has partial INR/USD toggle | Full application & widget i18n (6 languages); automatic Purchasing Power Parity (PPP) geo-IP detection; GDPR self-service deletion workflow |

---

## 2. Architecture Decisions

### Decision 1: Runtime & Codebase Strategy (Preserve & Extend vs. Next.js Migration)
- **Option A (Extend Cloudflare Worker + React Vite Stack - Recommended)**:
  - **Rationale:** The repository already possesses **407 passing tests**, hardened Cloudflare Worker edge routes, complete Stripe billing, and an ultra-fast build cycle. Migrating 40+ handlers and 25+ views from scratch to Next.js 15 App Router would discard verified production code and introduce unnecessary regression risk.
  - **Edge Programmatic SEO:** Implement edge-rendered programmatic SEO routes (`/alternatives/:slug`, `/best-:useCase-testimonial-tools`, `/sitemap.xml`, `/robots.txt`) directly in the Cloudflare Worker with SSR/Edge HTML streaming for search crawlers while keeping the client-side SPA fast for interactive users.
- **Option B (Next.js 15 Dual-App / Monorepo)**:
  - If the user explicitly insists on Next.js 15, we can wrap the marketing & programmatic SEO engine in Next.js 15 while retaining the edge widget API and dashboard.
  - *Recommendation:* Proceed with **Option A** to maximize velocity, preserve 407 existing tests, and achieve sub-30ms global edge response times.

### Decision 2: Embed Widget Architecture
- The widget runtime at `/embed.js` must remain ultra-lightweight (**< 15KB gzipped**) with **zero external dependencies**.
- Use **Shadow DOM** (`element.attachShadow({ mode: 'open' })`) to prevent parent host styles (Shopify, WordPress, Webflow) from breaking widget layouts, and prevent widget CSS from leaking into client websites.
- Provide multiple layout configurations: Wall of Love, Animated Marquee, Carousel, Floating Toast, and Compact Badge.
- Every free tier widget embeds an authentic, stylized **"Powered by PandaPraise"** badge with an encoded referral affiliate parameter (`?ref=embed&utm_source=user_widget&utm_medium=badge`).

### Decision 3: Affiliate & Commission Architecture
- Tracking via first-party cookie (`pp_ref`, 60-day attribution window) and edge middleware.
- Data model in Cloudflare D1 / Firestore: `affiliates`, `referral_clicks`, `referral_conversions`, `payouts`.
- Automated webhook listener on Stripe `invoice.payment_succeeded` computes 30% commission, logs to affiliate ledger, and schedules payout via Stripe Connect.

### Decision 4: Programmatic SEO Architecture
- High-intent target matrices:
  1. Competitor Alternatives: Senja, Testimonial.to, Trustpilot, Boast, Endorsal, VocalVideo, ShoutOut, WallOfLove.
  2. Use-Case Tools: Shopify stores, SaaS founders, marketing agencies, course creators, real estate, freelancers, medical practices.
- Edge worker intercepts crawler requests (`User-Agent: Googlebot|bingbot|...` or clean path `/alternatives/*`) and serves pre-rendered HTML with full Schema.org `SoftwareApplication`, `AggregateRating`, and `FAQPage` JSON-LD.

---

## 3. Prioritized Feature Breakdown (P0 / P1 / P2)

### 3.1 Priority 0 (P0) — Immediate PLG Foundation & Core Distribution
- **P0.1: Free Tier Enforcement & Viral Badge Loop**
  - Enforce free tier limits (up to 15 testimonials, 1 space, 1 widget).
  - Premium upgrade triggers when limits are reached with frictionless checkout.
  - Embeddable widgets automatically render the sleek "Powered by PandaPraise" pill with affiliate tracking.
- **P0.2: Frictionless Onboarding (< 2 Minutes to First Testimonial)**
  - Streamlined 3-step setup: Name space → Pick testimonial questions → Receive instant shareable link + QR code standee.
  - Sample testimonial auto-seeded on account creation so users immediately see a populated widget.
- **P0.3: Multi-Currency & Purchasing Power Parity (PPP) Engine**
  - Edge Geo-IP detection (`request.cf.country` on Cloudflare / header detection).
  - Localized currencies: USD ($19/$49/$99), INR (₹999/₹2,499), EUR (€18/€45), BRL (R$59/R$149), GBP (£15/£39).
  - Stripe Checkout sessions automatically pass currency and localized payment methods.
- **P0.4: Programmatic SEO Engine**
  - 10+ competitor alternative comparison pages (`/alternatives/:competitor`).
  - 10+ use-case landing pages (`/best-:useCase-testimonial-tools`).
  - Dynamic edge `/sitemap.xml` and `/robots.txt`.
  - Rich JSON-LD schemas embedded directly for Google rich snippet qualification.
- **P0.5: Lightweight Embed Runtime & Widget Distribution**
  - Shadow DOM isolated `/embed.js` (< 15KB).
  - Ready-to-copy code snippets for HTML, React/Next.js, Shopify, WordPress, Webflow, Framer, and Notion.

### 3.2 Priority 1 (P1) — Virality, Integrations & Partner Growth
- **P1.1: In-App Referral Engine ("Give 1 Month Free / Get 1 Month Free")**
  - Unique referral link for every user: `pandapraise.com/r/:username`.
  - Referral stats dashboard (invites sent, signups, earned credit).
  - Automated subscription extension applied when referee converts.
- **P1.2: Viral Social Proof Engine & Public Wall of Love**
  - Public Wall of Love showcase page (`pandapraise.com/wall` & `pandapraise.com/love/:slug`).
  - One-click share to LinkedIn, X (Twitter), and Product Hunt with dynamic OG image preview.
  - Automated social card export in PNG/SVG formats.
- **P1.3: Slack & Discord Real-Time Alerts**
  - Webhook dispatch when a new testimonial is submitted or approved.
  - Rich payload with reviewer name, rating, testimonial quote, and 1-click approval link.
- **P1.4: Self-Serve Affiliate & Partner Portal**
  - Affiliate signup, custom slug generation, and conversion analytics dashboard.
  - Tiered commission model (30% recurring for standard affiliates; agency co-branded portal).
  - Stripe Connect payout integration.
- **P1.5: Internationalization (i18n)**
  - Multi-language support for 6 key markets: English (EN), Spanish (ES), Portuguese (PT), German (DE), French (FR), Hindi (HI).
  - Language switcher across public collector, embeddable widgets, and marketing pages.

### 3.3 Priority 2 (P2) — Scale, Extensibility & Enterprise Readiness
- **P2.1: Public REST API & Webhooks**
  - API Key generation with scope management (`read:testimonials`, `write:testimonials`).
  - Endpoints: `GET /api/v1/testimonials`, `POST /api/v1/testimonials`, `GET /api/v1/widgets`.
  - OpenAPI 3.0 documentation page.
- **P2.2: Zapier & Make.com Public App Schemas**
  - REST Hook triggers for `new_testimonial_approved`, `new_review_submitted`.
  - Action trigger for `create_testimonial_invite`.
- **P2.3: Automated Case Study Generator**
  - 1-click transformation of high-impact 5-star testimonials into formatted markdown/HTML customer story summaries.
- **P2.4: MDX Content Blog Engine**
  - Markdown-driven high-authority growth blog articles covering conversion rate optimization (CRO) and social proof strategies.
- **P2.5: Video Testimonials R2 Direct Pipeline**
  - Pre-signed URL video upload direct to Cloudflare R2 / S3 for bandwidth-free video capture.

---

## 4. Global Constraints

1. **Test Suite Integrity:** Must keep all 407 existing Vitest tests passing; all new features must have unit/integration tests.
2. **Tenant Boundary Isolation:** Enforce `ownerId == request.auth.uid` across all database and storage operations.
3. **Widget Performance:** Widget bundle `/embed.js` must not exceed 15KB compressed, must load asynchronously, and must execute in under 50ms without blocking host DOM.
4. **Zero Layout Collisions:** All embed layouts must use Shadow DOM or strict isolated BEM classes to guarantee zero styling leaks into host sites (Shopify, WordPress, Webflow).
5. **Security & Anti-Abuse:** Rate-limit public review submission endpoints and affiliate link tracking; sanitize all input strings (XSS prevention); fail closed on missing credentials.

---

## 5. Review Focus & Risk Register

| # | Risk / Failure Mode | Likelihood | Impact | Mitigation Strategy |
| :- | :--- | :--- | :--- | :--- |
| **R1** | **Client-side SEO invisibility:** Search crawlers don't render programmatic comparison pages if served as empty SPA HTML shell. | High | High | Edge pre-rendering in Cloudflare Worker: serve fully populated HTML with pre-baked JSON-LD schemas and meta tags for crawlers, while hydrating for browsers. |
| **R2** | **Host website CSS bleed:** User's website styles override testimonial widget font colors, margins, or button styles. | High | High | Use open Shadow DOM inside `/embed.js` wrapper. All styles encapsulated within `<template>` or shadow root. |
| **R3** | **Affiliate self-referral / attribution fraud:** Users clicking their own link to earn discount on upgraded plans. | Med | Med | Filter self-referrals by matching workspace owner ID, user email, and client IP fingerprint; 60-day attribution cookie with last-touch model. |
| **R4** | **Spam attacks on public testimonial forms:** Malicious bots submitting thousands of junk reviews. | Med | High | Edge rate-limiting (Cloudflare Worker IP sliding window: max 5 submissions/min per IP), honeypot form fields, and content integrity scoring. |
| **R5** | **Multi-currency checkout currency mismatches:** User sees INR on page but Stripe opens in USD or vice-versa. | Low | Med | Currency state passed deterministically to Stripe Checkout session creation endpoint; validated server-side against supported PPP matrix. |

---

## 6. Execution Phases & Approval Gates

- **Phase 0:** Discovery, architecture validation, and plan approval (Current Step).
- **Phase 1:** Core PLG Foundation, 2-Minute Onboarding, Free Tier Limits & Viral Embed Widget with Shadow DOM.
- **Phase 2:** Programmatic SEO Engine (`/alternatives/*`, `/best-*`), Technical SEO (Sitemaps, OG Images, JSON-LD), and Content Engine.
- **Phase 3:** Integrations Marketplace (Shopify, WordPress, Webflow, Slack, Discord, Zapier) & Full Affiliate/Partner Program.
- **Phase 4:** Internationalization (6 languages), Multi-Currency PPP Engine, Public Wall of Love, and Growth Analytics Dashboards.

---

*Awaiting user approval before proceeding to Phase 1 implementation.*
