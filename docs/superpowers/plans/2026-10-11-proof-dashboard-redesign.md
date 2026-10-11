# Proof Dashboard Redesign (Luminous Proof) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Luminous Proof" dashboard redesign from `stitch_pandapraise_proof_dashboard_redesign.zip` for PandaPraise, delivering high-density review pipeline moderation, tactile card actions, horizontal metric strip, mobile floating bulk bar, and polished Plus Jakarta Sans / Inter typography.

**Architecture:** Update PandaPraise's proof moderation view by refining `ReviewPipelineHero`, `MetricsCards`, `ReviewFilters`, and `ReviewCard`, integrating sticky mobile bulk moderation in `DashboardPage`, and registering theme tokens in `tailwind.config.js` and `index.html`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide icons / SVG, Vitest.

**Spec:** `C:\Users\User\.gemini\antigravity-ide\brain\a498a205-4ebd-4002-8418-744a1e609674\scratch\stitch_redesign\DESIGN.md` and `code.html`.

## Global Constraints
- Do not break existing data contracts or Firebase / SQLite / Cloudflare Worker APIs.
- Preserve all existing review statuses (`approved`, `pending`, `rejected`, `archived`) and filter capabilities.
- Support both responsive desktop layout and mobile stacked layout.
- Maintain dark mode and high-contrast accessibility tokens.

## Review Focus
1. Reviews with missing avatars fall back cleanly to initials without broken image tags.
2. Bulk selection state synchronizes between individual item checkboxes, top header banner, and mobile floating bar.
3. Filtering by tab (Pending, Approved, Rejected, Archived) correctly updates count badges and empty states.
4. Social Card export button invokes `onOpenSocialCard` with the selected review.
5. All 57+ existing test suites must continue passing 100%.

---

### Task 1: Typography & Design System Tokens

**Files:**
- Modify: `index.html:26-30`
- Modify: `tailwind.config.js:8-55`
- Modify: `src/index.css:1-50`

- [ ] **Step 1: Add Plus Jakarta Sans font import in `index.html`**
- [ ] **Step 2: Add Luminous Proof color and typography tokens in `tailwind.config.js`**
- [ ] **Step 3: Verify build passes with font & token updates (`cmd /c "npm run build"`)**

---

### Task 2: Review Pipeline Hero & Micro AI Sentiment Ribbon

**Files:**
- Create: `src/components/dashboard/ReviewPipelineHero.tsx`
- Modify: `src/pages/DashboardPage.tsx:569-645`

**Interfaces:**
- Consumes: `stats: ReviewStats`, `pendingCount: number`, `reviews: Review[]`, `onBatchSelectAll: () => void`, `onOpenSentiment: () => void`, `onInviteCustomer: () => void`, `onOpenSocialCard: () => void`, `onConfigure: () => void`
- Produces: `ReviewPipelineHero` React component

- [ ] **Step 1: Create `src/components/dashboard/ReviewPipelineHero.tsx` implementing the hero card with pulsing amber status pill, Senja sync tag, Batch button, and AI sentiment inspect ribbon**
- [ ] **Step 2: Integrate `ReviewPipelineHero` in `src/pages/DashboardPage.tsx` replacing previous header blocks**
- [ ] **Step 3: Run quick TypeScript build check**

---

### Task 3: Horizontal Scrollable Metric Strip

**Files:**
- Modify: `src/components/dashboard/MetricsCards.tsx`

**Interfaces:**
- Consumes: `stats: ReviewStats`, `onFilterByStatus`, `onFilterByRating`
- Produces: High-density 4-card metric strip (`Total Proof`, `Avg Rating`, `Pending Queue`, `Direct Intake`)

- [ ] **Step 1: Update `MetricsCards.tsx` with high-density card layouts, star rating visual (`4.0 ★★★★☆`), median wait time, and horizontal scroll capability**
- [ ] **Step 2: Verify responsive behavior on small and large screens**

---

### Task 4: Segmented Capsule Navigation, Search Bar & Quick Filters

**Files:**
- Modify: `src/components/dashboard/ReviewFilters.tsx`

**Interfaces:**
- Consumes: `filters: ReviewFilters`, `setFilters`, `stats: ReviewStats`, `availableTags: string[]`, `viewMode`, `setViewMode`
- Produces: Modern capsule tabs (`All`, `Pending`, `Approved`, `Rejected`, `Archived`), search input with tune icon, and filter pill dropdowns

- [ ] **Step 1: Redesign status tabs as rounded capsule buttons with status-specific count pills**
- [ ] **Step 2: Add full-width search input and quick filter dropdowns for Rating, Tags, and Ingest Source**
- [ ] **Step 3: Preserve grid / table view switching and export actions**

---

### Task 5: Testimonial & Review Card Redesign

**Files:**
- Modify: `src/components/dashboard/ReviewCard.tsx`

**Interfaces:**
- Consumes: `review: Review`, `isSelected`, `onToggleSelect`, `onUpdateStatus`, `onToggleFeatured`, `onDelete`, `onOpenDetails`, `onOpenSocialCard`
- Produces: Polished Luminous Proof testimonial card matching `screen.png`

- [ ] **Step 1: Modernize top meta row with selection checkbox, pill status, date, favorite star, and options**
- [ ] **Step 2: Update 5-star rating display with numeric score and prominent headline pull-quote**
- [ ] **Step 3: Modernize tag pills, customer attribution with verified badge, and quick `[Social Card]` button**
- [ ] **Step 4: Update moderation action toolbar with 4 tactile buttons (`Approve`, `Reject`, `Archive`, `Delete`)**

---

### Task 6: Bulk Moderation Toolbar, Floating Mobile Bar & Empty State Delight

**Files:**
- Modify: `src/pages/DashboardPage.tsx:720-790`

**Interfaces:**
- Consumes: `selectedReviewIds`, `filteredReviews`, `handleSelectAll`, `handleBulkApprove`, `handleBulkReject`, `handleBulkDelete`
- Produces: In-page bulk moderation banner and sticky floating mobile action bar with counter and quick buttons; Queue Clears Fast empty state

- [ ] **Step 1: Add bulk moderation banner with select all checkbox and instant approve/reject/delete icons**
- [ ] **Step 2: Add bottom sticky floating bulk bar for mobile (`[N] Selected | Approve All | Reject | Dismiss`)**
- [ ] **Step 3: Add "Queue Clears Fast!" empty state card when queue is cleared**

---

### Task 7: Comprehensive Unit Tests & Full Suite Verification

**Files:**
- Create: `src/components/dashboard/__tests__/ProofDashboardRedesign.test.tsx`

- [ ] **Step 1: Write unit tests covering ReviewPipelineHero, MetricsCards, ReviewFilters, ReviewCard, and bulk actions**
- [ ] **Step 2: Run new tests with `cmd /c "npm test -- ProofDashboardRedesign"`**
- [ ] **Step 3: Run full test suite with `cmd /c "npm test -- --run"` (all 58 test files)**
- [ ] **Step 4: Run production build check with `cmd /c "npm run build"`**

---

### Task 8: Git Commit, Push & Deployment

- [ ] **Step 1: Stage all changes with `git add -A`**
- [ ] **Step 2: Commit with descriptive message `feat(dashboard): implement luminous proof moderation queue redesign from stitch`**
- [ ] **Step 3: Push to `main` with `git push origin main`**
- [ ] **Step 4: Verify GitHub Actions CI and Cloudflare deployment health**
