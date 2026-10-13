# PandaPraise Global Distribution Infrastructure: Task List

## Phase 0: Discovery & Architecture Validation (Current)
- [x] Inspect existing workspace, repositories, and test suite health (407 Vitest tests passing)
- [x] Perform gap analysis between existing codebase (`testimonial-collector-dashboard`) and master prompt distribution requirements
- [x] Draft comprehensive `implementation_plan.md` covering architecture, P0/P1/P2 priorities, and risk register
- [x] Draft comprehensive `task.md` checklist with phased deliverables
- [ ] Obtain explicit user feedback and approval before writing production code

---

## Phase 1: Core PLG Foundation & Viral Embed Widget
- [x] **1.1 Free Plan Limits & Upgrade Funnel**
  - [x] Enforce 15-testimonial cap on free tier in storage routers & UI
  - [x] Implement elegant "Limit Reached" upgrade banners and modals linking to Stripe Checkout
  - [x] Add upgrade trigger on video collection and white-labeling requests
- [x] **1.2 Frictionless < 2-Minute Onboarding**
  - [x] Streamline 3-step onboarding flow: Space Name → Form Questions → Instant Collector Link + QR Standee
  - [x] Auto-seed a high-converting sample testimonial so users immediately see a populated widget
  - [x] Instant 1-click test review submission to experience the end-to-end loop in < 120 seconds
- [x] **1.3 Viral "Powered by PandaPraise" Embed Widget**
  - [x] Refactor `/embed.js` to render inside Shadow DOM (guarantee zero host CSS interference on Shopify/WordPress/Webflow)
  - [x] Add viral watermark pill with encoded tracking link: `pandapraise.com?ref={workspace_slug}`
  - [x] Add custom badge toggle locked to Pro/Business plans
  - [x] Build 5 high-converting widget layouts: Wall of Love, Marquee, Carousel, Floating Toast, Rating Badge
- [x] **1.4 In-App Referral Engine ("Give 1 Month / Get 1 Month")**
  - [x] Generate unique referral link per workspace (`/r/:code`)
  - [x] Track referral visits and signups with 60-day attribution cookie
  - [x] Referral management dashboard tab showing invite status and accumulated free months
  - [x] Unit & integration tests for referral tracking and credit application

---

## Phase 2: Programmatic SEO Engine & Content Infrastructure
- [ ] **2.1 Programmatic Competitor Comparison Engine (`/alternatives/:competitor`)**
  - [ ] Define comparison dataset: Senja, Testimonial.to, Trustpilot, Boast, Endorsal, VocalVideo, ShoutOut, WallOfLove
  - [ ] Build high-converting comparison page layout (Feature matrix, pricing teardown, migration guide, customer reviews)
  - [ ] Inject dynamic `SoftwareApplication` and `FAQPage` JSON-LD schema
  - [ ] Cloudflare Worker edge SSR pre-rendering for Googlebot / search crawler indexing
- [ ] **2.2 Programmatic Use-Case Landing Pages (`/best-:useCase-testimonial-tools`)**
  - [ ] Define use-case templates: Shopify e-commerce, B2B SaaS, Agencies, Course creators, Freelancers, Local businesses
  - [ ] Pre-render industry-specific value propositions, recommended widget layouts, and conversion case studies
- [ ] **2.3 Technical SEO Foundation**
  - [ ] Dynamic `/sitemap.xml` endpoint listing all static and programmatic routes with lastmod timestamps
  - [ ] Dynamic `/robots.txt` with sitemap directives and crawler rules
  - [ ] Edge dynamic OpenGraph card generator (`/api/og`) rendering custom social preview cards
  - [ ] Verification tests for XML sitemap validity and JSON-LD schema compliance

---

## Phase 3: Integrations Marketplace & Affiliate Program
- [ ] **3.1 Third-Party CMS Embed Integrations**
  - [ ] **Shopify:** Native App Embed script tag & Liquid snippet copy helper
  - [ ] **WordPress:** Standalone WordPress plugin package (`pandapraise-wp-plugin.zip`) with shortcode `[pandapraise widget="id"]`
  - [ ] **Webflow / Framer / Notion:** Step-by-step interactive embed installation guides with custom iframe/script generators
- [ ] **3.2 Real-Time Alert Webhooks (Slack & Discord)**
  - [ ] Slack incoming webhook integration: Send formatted testimonial card with stars, reviewer name, and 1-click approve button
  - [ ] Discord webhook integration: Send rich embed with reviewer avatar and quote
  - [ ] Settings tab to configure webhook URLs and test dispatch with 1 click
- [ ] **3.3 Zapier / Make.com Automation Engine**
  - [ ] REST Hook triggers: `testimonial.created`, `testimonial.approved`
  - [ ] Inbound webhook trigger for CRM integrations (HubSpot, Stripe, WooCommerce)
- [ ] **3.4 Self-Serve Affiliate & Partner Program**
  - [ ] Affiliate registration portal (`/affiliates`)
  - [ ] Unique tracking link generation with real-time click and conversion attribution
  - [ ] Affiliate dashboard displaying clicks, referrals, active MRR, and unpaid earnings (30% recurring)
  - [ ] Stripe Connect onboarding link for automated payouts
  - [ ] Agency partner tier with multi-client workspace discounts and co-branding options
- [ ] **3.5 Public REST API & Developer Keys**
  - [ ] API Key management in workspace settings (`pp_live_...`)
  - [ ] Public endpoints: `GET /api/v1/testimonials`, `POST /api/v1/testimonials`, `GET /api/v1/widgets`
  - [ ] Interactive OpenAPI / Swagger documentation page

---

## Phase 4: Global Readiness, Virality & Analytics Polish
- [ ] **4.1 Internationalization (i18n)**
  - [ ] Multi-language support for 6 key languages: English (EN), Spanish (ES), Portuguese (PT), German (DE), French (FR), Hindi (HI)
  - [ ] Language toggle for public review collection forms, widgets, and key marketing funnels
- [ ] **4.2 Multi-Currency & Purchasing Power Parity (PPP) Engine**
  - [ ] Cloudflare edge Geo-IP country header detection (`request.cf.country`)
  - [ ] PPP discount rates: USD ($19/$49), INR (₹999/₹2,499), EUR (€18/€45), BRL (R$59/R$149)
  - [ ] Seamless integration into Stripe Checkout sessions with local payment rails (UPI, iDEAL, Boleto, SEPA)
- [ ] **4.3 Public Wall of Love & 1-Click Viral Sharing**
  - [ ] Showcase directory at `/wall` displaying real client reviews
  - [ ] 1-Click "Share to LinkedIn", "Share to X", and "Share to Product Hunt" with pre-composed viral copy and generated preview card
  - [ ] 1-Click customer case study generator transforming 5-star reviews into publishable markdown/HTML
- [ ] **4.4 Growth & Conversion Analytics Dashboard**
  - [ ] Visual funnel dashboard: Views → Submissions → Approvals → Widget Impressions → Referral Clicks
  - [ ] PostHog & Cloudflare Web Analytics event dispatchers for core conversion events
- [ ] **4.5 GDPR & CCPA Compliance Hardening**
  - [ ] Explicit consent checkboxes for marketing use and video rights during collection
  - [ ] Self-service account deletion (GDPR Article 17) cascade in settings
  - [ ] Cookie consent preferences banner

---

## Phase 5: Verification & Walkthrough
- [ ] Run full automated test suite (`npm test`) and ensure 100% pass rate
- [ ] Run end-to-end browser verification of onboarding, widget embed, programmatic pages, and affiliate flows
- [ ] Generate comprehensive `walkthrough.md` with verification proofs
