# Account & Billing Management Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the PandaPraise Account & Billing Management view and global sidebar navigation into a conversion-first SaaS billing architecture with accurate free tier quotas, actionable payment methods, tax ID management, conditional invoice display, and polished brand typography.

**Architecture:** 
- Update `DashboardSidebar.tsx` and `DashboardPage.tsx` with unified `PandaPraise` branding, `Billing & Plans`, `Widgets & Embeds`, and truncated workspace labels.
- Completely overhaul `AccountBillingView.tsx` with a centralized billing state model, 4 actionable KPI cards with quota progress bars, a two-tier comparison card (Included vs. Pro unlock), an editable Tax/Billing details card, and a conditionally rendered Invoices card with an empty state and demo toggle.
- Update test suites (`DashboardSidebar.test.tsx`, `AccountBillingView.test.tsx`) to lock in the new contracts.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide icons, Vitest.

---

## Global Constraints
- Brand name: `PandaPraise` (one word, bold, tight tracking).
- Navigation labels: `Billing & Plans` (replacing `Accounts & Billing mgmt`), `Widgets & Embeds` (replacing `Post on Internet`).
- Visual aesthetic: Soft slate background (`#f4f7fb` or `#f8fafc`), white rounded-2xl cards, border `border-slate-200/80`, purple `#7C3AED` accent.
- Responsive: Zero horizontal scroll and zero clipped containers on 1366x768 and 1440x900 viewports.
- Invoices: Never show `$0.00 Paid` sequential invoices on the Free Plan; display empty state with `[Demo: Preview Paid Invoices]` toggle.

---

## Review Focus
1. Free Plan vs. Pro Plan state transitions — toggling demo paid mode updates KPI cards and switches invoice section between empty state and populated receipts.
2. Bottom profile chip truncation — long workspace names like `GREETINGSGOPAL's Workspace` must truncate with `max-w-[160px]` and show full name via `title` attribute.
3. Billing & Tax inline editing — editing company name, billing email, or GSTIN/VAT updates the UI and persists in state.
4. Invoice footer note visibility — card layout with `h-auto overflow-visible p-6` ensures the notice banner is never cut off.
5. Mobile & tablet viewports — grid columns collapse gracefully (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).

---

### Task 1: Global Navigation & Sidebar Cleanup

**Files:**
- Modify: `src/components/dashboard/DashboardSidebar.tsx`
- Modify: `src/pages/DashboardPage.tsx`
- Test: `src/components/dashboard/__tests__/DashboardSidebar.test.tsx`

**Interfaces:**
- Updates sidebar logo to `PandaPraise`.
- Updates navigation item `Post on Internet` -> `Widgets & Embeds`.
- Updates navigation item `Accounts & Billing mgmt` -> `Billing & Plans`.
- Updates breadcrumb labels in `TAB_LABEL_MAP`:
  - `widgets`: `Widgets & Embeds · On Website`
  - `social`: `Widgets & Embeds · On Social Media`
  - `integrate`: `Billing & Plans`
  - `settings`: `Billing & Plans`
- Updates workspace subtext in footer chip to `truncate max-w-[160px]` with `title={activeWorkspaceName}`.

- [ ] **Step 1: Update DashboardSidebar.test.tsx to assert new labels and branding**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Modify DashboardSidebar.tsx and DashboardPage.tsx**
- [ ] **Step 4: Run tests to verify pass**
- [ ] **Step 5: Commit changes**

---

### Task 2: Account & Billing Management UI & State Refactor

**Files:**
- Modify: `src/components/dashboard/views/AccountBillingView.tsx`
- Test: `src/components/dashboard/views/__tests__/AccountBillingView.test.tsx`

**Interfaces:**
- Centralized billing state:
  ```typescript
  interface BillingState {
    planTier: 'free' | 'pro';
    status: string;
    videoQuota: { used: number; limit: number };
    textQuota: { used: number; limit: number };
    card: { brand: string; last4: string; expMonth: string; expYear: string } | null;
    billingDetails: {
      companyName: string;
      billingEmail: string;
      taxId: string;
    };
    invoices: Array<{ id: string; date: string; amount: string; status: string; pdfUrl?: string }>;
  }
  ```
- Top Header:
  - Title: `Account & Billing Management`
  - Badge: `Free Plan • Active` (or `Pro Plan • Active`)
  - Subtitle: `Manage your PandaPraise workspace subscription tier, usage quotas, payment methods, and tax invoices.`
  - CTA: `Upgrade to Pro ⚡`
- 4 Top KPI Cards:
  1. `CURRENT PLAN`: `Free Plan`, `$0 / month • Free Forever`
  2. `VIDEO & AUDIO PROOFS`: `1 / 2 Used`, 50% purple/amber progress bar, `1 video proof remaining on Free Plan`
  3. `TEXT TESTIMONIALS`: `8 / 10 Used`, 80% amber progress bar, `Upgrade for unlimited text & video proofs`
  4. `PAYMENT METHOD`: `No Card on File`, `+ Add Payment Method` button, `Secured by Stripe (PCI-DSS L1)`
- Two-Column Main Content:
  - Left Card:
    - Included in Your Free Plan (`Free Forever` pill, 4 green checklist items)
    - Unlock with PandaPraise Pro (`$29 / mo` box, 7 lock items, `Upgrade to Pro — $29/mo →` CTA)
  - Right Column Stack:
    - Card 1: Billing & Tax Details (Legal Name, Billing Email, Tax ID GSTIN/VAT, Edit modal/form)
    - Card 2: Invoices & Receipts (Conditional empty state with illustration + `[Demo: Preview Paid Invoices]` toggle; unclipped footer notice)

- [ ] **Step 1: Update AccountBillingView.test.tsx to assert new components and states**
- [ ] **Step 2: Run tests to verify failure**
- [ ] **Step 3: Implement new AccountBillingView.tsx**
- [ ] **Step 4: Run tests to verify pass**
- [ ] **Step 5: Commit changes**

---

### Task 3: End-to-End Build, Verification, & Cloudflare Deployment

**Files:**
- Run full test suite & production build.
- Push commit to GitHub `origin main`.
- Deploy to Cloudflare using `npx wrangler deploy`.
- Verify live site on `pandapraise.com`.

- [ ] **Step 1: Run vitest across the entire project**
- [ ] **Step 2: Run `npm run build` to verify bundling**
- [ ] **Step 3: Push changes to GitHub repository**
- [ ] **Step 4: Deploy to Cloudflare with `npx wrangler deploy`**
- [ ] **Step 5: Verify live application on pandapraise.com**
