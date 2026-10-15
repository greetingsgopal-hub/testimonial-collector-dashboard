# Super-Admin Control Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `src/pages/AdminPage.tsx` with a modern 4-tab Super-Admin Control Center (Overview, Workspaces Directory, Razorpay Ledger, Infrastructure Health) powered natively by PandaPraise's Firebase/Firestore REST & Cloudflare Worker APIs.

**Architecture:** Replace the legacy single-list layout in `AdminPage.tsx` with a tabbed dashboard matching the dark SaaS design system (`#0F172A`). Wire all data fetches to `/api/admin/workspaces` and `/api/admin/workspaces/:id/plan`, measuring real database response latency and displaying real-time workspace entitlements and Razorpay payment history.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React icons, Vitest, Firebase Auth, Cloudflare Workers.

---

## Global Constraints
- Do NOT install or import `@supabase/supabase-js`; all data must flow through PandaPraise's existing Firebase Auth and Cloudflare Worker endpoints.
- Ensure all existing unit tests in `src/pages/__tests__/AdminPage.test.tsx` pass without regressions.
- Retain `SuperadminGuard` route protection and `isSuperadmin` authorization.
- Provide clean fallback handling and loading states for workspaces, payments, and infrastructure telemetry.

---

## Task 1: Update AdminPage with 4-Tab Control Center Architecture

**Files:**
- Modify: `src/pages/AdminPage.tsx`
- Test: `src/pages/__tests__/AdminPage.test.tsx`

**Interfaces:**
- Consumes: `/api/admin/workspaces`, `/api/admin/workspaces/:id/plan`, `useAuth()`
- Produces: Enhanced `AdminPage` with 4 tabs (`overview`, `workspaces`, `payments`, `health`), plan toggling, search filtering, and latency measurement.

- [ ] **Step 1: Write updated tests in `src/pages/__tests__/AdminPage.test.tsx`**
  Cover the 4 tab switches, KPI metrics calculation, search filtering, and plan upgrade/downgrade actions.
- [ ] **Step 2: Run test to see current failure or coverage gap**
  Run: `npx vitest run src/pages/__tests__/AdminPage.test.tsx`
- [ ] **Step 3: Implement 4-tab Control Center in `src/pages/AdminPage.tsx`**
  - Dark theme container (`bg-[#0F172A] text-slate-100`)
  - Header with SECURED ADMIN ROOT, live latency counter, Return to Dashboard, and Sync Database button
  - Tab 1: System Overview (Total Workspaces, Pro Subscribers, Database Latency, Webhook Status)
  - Tab 2: Workspaces Directory (Search, Plan badges, Proofs count, Created Date, Plan toggle/override button)
  - Tab 3: Razorpay Transactions (Payment ledger with live formatted currency ₹ and timestamps)
  - Tab 4: Infrastructure & Webhooks (Firestore & Cloudflare Worker status, Razorpay webhook endpoint)
- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run src/pages/__tests__/AdminPage.test.tsx`
  Expected: PASS
- [ ] **Step 5: Run full app build & typecheck**
  Run: `npm run build`
  Expected: 0 errors
- [ ] **Step 6: Commit**
  Run: `git commit -m "feat(admin): implement 4-tab Super-Admin Control Center powered by Cloudflare Worker & Firestore"`
