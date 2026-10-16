# Panda Praise Competitor Parity & Platform Hardening Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Panda Praise from an unrefined, disjointed prototype into a polished, high-converting social proof platform capable of competing head-to-head with market leaders Senja.io and Testimonial.to.

**Architecture:** 
Consolidate the cluttered dual-navigation into a streamlined, high-density 6-tab dashboard; merge fragmented Studio and Integrate views into a unified multi-widget builder; replace browser `localStorage` integration mocks with persistent server-side tokens and automated review synchronizers; remove amateur landing page memes in favor of live interactive social proof widgets; and implement self-service GDPR account deletion, password management, and Stripe checkout.

**Tech Stack:**
- Frontend: React 18, TypeScript, Tailwind CSS, Lucide React, Vite, React Router v7
- Backend: Cloudflare Workers (TypeScript Edge Worker runtime)
- Database & Auth: Google Cloud Firebase (Auth, Firestore v2, Cloud Storage)
- Payments: Stripe API (Checkout Sessions & Customer Billing Portal)

**Spec:** Comprehensive audit findings covering public funnel credibility, dashboard information architecture, widget ergonomics, social sharing, and regulatory compliance.

## Global Constraints
- Strictly preserve Firestore tenant boundary isolation (`ownerId == request.auth.uid`).
- No external dependency additions unless strictly necessary; use existing Tailwind utility tokens and Lucide icons.
- All integration credentials and connection states must be persisted in Cloud Firestore, never browser `localStorage`.
- Zero broken/deceptive user funnels (no dead links, no fake quiz bypasses).

## Review Focus
1. Laptop viewport clipping: Ensure the consolidated sidebar fits within 720px viewport height without vertical scrollbars hiding the user profile or logout actions.
2. Data migration safety: Ensure existing user testimonials and forms retain backwards compatibility when migrating from singleton widget state to multi-widget collections.
3. Offline/Incognito persistence: Verify that connecting social or external sources persists across incognito sessions and alternate devices.
4. Clean session termination: Ensure signing out purges all active auth tokens and gracefully routes to `/login` without protected route redirection flashes.
5. International currency detection: Ensure users outside India default to USD pricing ($19/$49), while domestic traffic receives localized INR options.

---

### Task 1: Information Architecture & Space Management Overhaul

**Files:**
- Modify: `src/components/dashboard/DashboardSidebar.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/pages/DashboardPage.tsx`
- Test: `src/test/navigation.test.tsx`

**Interfaces:**
- Consumes: `useAuth()` hook (`user`, `workspace`, `project`, `signOut`)
- Produces: `DashboardTab = 'inbox' | 'forms' | 'import' | 'widgets' | 'social-cards' | 'settings'`

- [ ] **Step 1: Write navigation regression test**
Verify that active tabs correspond only to valid, functional views and that the sidebar renders exactly 6 top-level navigation items.

- [ ] **Step 2: Consolidate the Sidebar Navigation (`DashboardSidebar.tsx`)**
  - Eliminate the 5 nested sections (`Get Proof`, `Manage Proof`, `Use Proof`, `Understand`, `Utility`).
  - Collapse into 6 streamlined items:
    1. **Inbox / Proof** (Approved, pending, and feedback)
    2. **Collection Forms** (Form creator, public link, QR standee generator)
    3. **Import** (CSV, Google Place ID, manual entry)
    4. **Widgets & Wall of Love** (Combined builder and embed codes)
    5. **Social Card Studio** (Image quote generator for LinkedIn/Instagram)
    6. **Settings** (General, team, billing, branding, API, security)
  - Move user avatar, workspace selector, and visible **Log Out** button directly into the sidebar header and footer.

- [ ] **Step 3: Remove Duplicate Top Navbar Overhead (`Navbar.tsx` & `DashboardPage.tsx`)**
  - Eliminate the redundant top header inside the dashboard to reclaim 64px of vertical height.
  - Dedicate full viewport width and height to the active workspace canvas.

- [ ] **Step 4: Verify viewport height and responsive layout**
Verify on 1536×730 and 1366×768 viewports that zero elements in the sidebar are clipped or hidden below the fold.

---

### Task 2: Landing Page & Public Credibility Overhaul

**Files:**
- Modify: `src/pages/LandingPage.tsx`
- Modify: `src/pages/PricingPage.tsx`
- Modify: `src/index.css`
- Test: `src/test/landing.test.tsx`

**Interfaces:**
- Consumes: Geo-IP or locale detection helper
- Produces: Normalized currency state (`currency: 'USD' | 'INR'`)

- [ ] **Step 1: Write test for currency switching and banner routing**
Verify announcement bar routes to a genuine interactive modal or action, and currency switches seamlessly.

- [ ] **Step 2: Clean Up Visual Credibility (`LandingPage.tsx`)**
  - Remove the "This is fine" dog fire meme and the Leonardo DiCaprio Gatsby meme.
  - Replace them with high-fidelity, interactive social proof component cards (Before vs. After conversion metrics).
  - Purge competitor-named CSS classes (e.g., replace `.senja-btn-primary` with `.pp-btn-primary`).
  - Replace mock customer quotes ("We migrated from Senja...") with independent, credible customer proof.

- [ ] **Step 3: Fix the Announcement Bar Bait-and-Switch**
  - Remove the fake "Free Quiz" link that redirects to `/signup`.
  - Replace it with a functional interactive 3-step modal ("Calculate your conversion boost from social proof") or an honest value hook (*"Download the 2026 Social Proof Playbook"*).

- [ ] **Step 4: Globalize Pricing (`PricingPage.tsx`)**
  - Implement a currency toggle: **USD ($19 / $49 / $99)** vs. **INR (₹1,499 / ₹3,999)**.
  - Default visitors from outside India to USD.
  - Clarify the value proposition: Align the "Anti-Subscription / Lifetime" messaging with the actual plan structure.

---

### Task 3: Unified Widget Hub & Multi-Widget Management

**Files:**
- Create: `src/components/dashboard/widgets/WidgetManager.tsx`
- Modify: `src/components/dashboard/WidgetStudio.tsx`
- Remove / Refactor: `src/components/dashboard/views/IntegrateView.tsx`
- Test: `src/test/widgets.test.tsx`

**Interfaces:**
- Consumes: `storage.getWidgets(projectId)`, `storage.saveWidget(widgetData)`
- Produces: `WidgetInstance` interface with unique `widgetId`, layout type, themes, and embed snippet

- [ ] **Step 1: Write tests for multi-widget CRUD**
Verify that a user can create "Widget 1: Homepage Carousel" and "Widget 2: Checkout Badge" without overwriting each other.

- [ ] **Step 2: Build the Multi-Widget Management View (`WidgetManager.tsx`)**
  - Display a grid of created widgets with type tags (Wall of Love, Marquee, Floating Toast, Rating Badge).
  - Include quick actions: "Copy Code", "Edit", "Preview", "Delete".
  - Add a primary CTA: `+ New Widget`.

- [ ] **Step 3: Integrate Customization and Code Generation into One Screen (`WidgetStudio.tsx`)**
  - Left pane (40% width): Customizer controls (theme, rating filter, layout, source filter, font, radius).
  - Center pane (60% width): Live real-time interactive preview.
  - Top right: Instant 1-click embed code generator with platform tabs (HTML / Script, React, Webflow, Shopify, WordPress, Framer).

- [ ] **Step 4: Run end-to-end embed verification**
Verify that the generated `<script src="https://pandapraise.com/embed.js" data-widget-id="..."></script>` correctly renders the specific configuration.

---

### Task 4: Real Review Importers & Persistent Social Sync

**Files:**
- Modify: `src/pages/ImportPage.tsx`
- Modify: `src/components/dashboard/views/ConnectSourceModal.tsx`
- Modify: `src/worker/handlers/googlePlaceImport.ts`
- Modify: `src/lib/storage.ts`
- Test: `src/test/importers.test.tsx`

**Interfaces:**
- Consumes: Google Places API / serverless crawler
- Produces: Verified review records saved into `projects/{id}/reviews`

- [ ] **Step 1: Write test for CSV parsing and Google Place import**
Verify that uploaded CSVs and Google Place IDs parse correctly into structured Firestore review records.

- [ ] **Step 2: Refactor the Import Platform Grid (`ImportPage.tsx`)**
  - Remove or hide the 10 non-functional "Coming Soon" tiles that pollute the interface.
  - Present active, high-reliability channels prominently:
    1. **CSV / Excel Bulk Importer** (with live drag-and-drop and column mapping preview)
    2. **Google Business Reviews** (Place ID search & direct sync)
    3. **Manual Entry** (Quick quote transcription)
  - Add a clean "Request an Integration" feedback link for unbuilt sources.

- [ ] **Step 3: Migrate Social Connection State to Firestore (`storage.ts` & Worker)**
  - Remove all occurrences of `localStorage.setItem('pandapraise_facebook_connected', ...)` and Instagram equivalents.
  - Store connection tokens securely in `workspaces/{workspaceId}/integrations` with tenant isolation.
  - Ensure multi-device synchronization: logging in from another device immediately reflects active connections.

---

### Task 5: Settings, Account Security & GDPR Compliance

**Files:**
- Modify: `src/components/dashboard/WorkspaceSettings.tsx`
- Modify: `src/context/AuthContext.tsx`
- Create: `src/pages/RefundPolicyPage.tsx`
- Create: `src/components/common/CookieConsentBanner.tsx`
- Test: `src/test/settings.test.tsx`

**Interfaces:**
- Consumes: Firebase Auth API (`updatePassword`, `deleteUser`)
- Produces: Self-service account erasure and password management

- [ ] **Step 1: Write tests for password update and account deletion safeguards**
Ensure deletion requires explicit confirmation and cascades across all tenant documents.

- [ ] **Step 2: Add Account Security Tab to Settings (`WorkspaceSettings.tsx`)**
  - Add "Change Password" field with current and new password validation.
  - Add "Active Sessions" indicator.

- [ ] **Step 3: Implement GDPR Article 17 Self-Service Account Erasure**
  - Add "Danger Zone" at the bottom of Workspace Settings.
  - Include "Delete Workspace & All Data" button with double confirmation modal (typing workspace name to confirm).
  - Cascade delete all Firestore reviews, projects, and media assets, then invoke `deleteUser(auth.currentUser)`.

- [ ] **Step 4: Implement Real Firestore Workspace Settings Persistence**
  - Replace the simulated `setTimeout(r, 600)` with an actual `updateDoc(doc(db, 'workspaces', wsId), { ... })` call with loading states and error rollbacks.

- [ ] **Step 5: Add Legal Instruments & Cookie Consent**
  - Create dedicated `/refund-policy` page with clear terms for cancellations and refunds.
  - Deploy a lightweight, non-intrusive `CookieConsentBanner` complying with GDPR/ePrivacy directives.

---

### Task 6: Global Monetization & Stripe Checkout Flow

**Files:**
- Modify: `src/worker/handlers/stripeCheckout.ts`
- Modify: `src/worker/handlers/stripeWebhook.ts`
- Modify: `src/components/dashboard/WorkspaceSettings.tsx`
- Modify: `src/pages/PricingPage.tsx`
- Test: `src/test/billing.test.tsx`

**Interfaces:**
- Consumes: Stripe API secret key & Webhook signing secret
- Produces: Stripe Checkout session URL and Customer Portal session URL

- [ ] **Step 1: Wire Up Stripe Checkout Sessions**
  - In `stripeCheckout.ts`, ensure `createCheckoutSession` receives `priceId` and `workspaceId` metadata.
  - Update pricing buttons to call `/api/stripe/checkout` rather than redirecting in loops to `/signup` or `/dashboard`.

- [ ] **Step 2: Secure Webhook Processing & Plan Upgrade**
  - Handle `checkout.session.completed` and `customer.subscription.updated` in `stripeWebhook.ts`.
  - Update `workspaces/{workspaceId}.plan` to `'starter'` or `'pro'` in Firestore using the Firebase Admin SDK.
  - Ensure the client cannot self-assign `{ plan: 'pro' }` directly via Firestore client rules.

- [ ] **Step 3: Add Customer Billing Portal in Settings**
  - In the "Billing & Plan" settings tab, replace dead upgrade links with a "Manage Subscription & Invoices" button that redirects to the Stripe Customer Portal.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-10-panda-praise-competitor-parity-roadmap.md`.
