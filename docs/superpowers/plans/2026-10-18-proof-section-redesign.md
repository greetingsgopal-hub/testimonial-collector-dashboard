# Proof Section Redesign & Old Pipeline Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the cluttered Proof section with the dedicated, clean `ProofSection.tsx` component, remove the redundant `ReviewPipelineHero`, 4 KPI cards, sentiment dashboard, and legacy grid from underneath, and wire dynamic category counts and purple-bordered search bar.

**Architecture:**
- Create `src/components/dashboard/ProofSection.tsx` with dynamic category classifier (`classifyPraiseCategories`), single-refresh Firestore sync, live keyword search bar (`border-purple-300`), dynamic AI case study headline, and organized vertical testimonial list with screenshot attachments.
- Replace `activeTab === 'proof'` content in `src/pages/DashboardPage.tsx` with `<ProofSection workspaceId={...} workspaceName={...} />`.
- Clean up unused imports in `DashboardPage.tsx` (`ReviewPipelineHero`, `MetricsCards`, `SentimentDashboard`, `ReviewFilters`, `ReviewCard`, `ReviewTable`, etc. if only used in the replaced block).
- Ensure `src/components/layouts/AppLayout.tsx` uses `ProofSection` when `activeNav === 'proof'`.
- Verify with unit tests (`src/components/dashboard/__tests__/ProofSection.test.tsx`), full Vitest suite, TypeScript compilation (`npx tsc --noEmit`), and Cloudflare deployment.

---

### Task 1: Create `src/components/dashboard/ProofSection.tsx`

**Files:**
- Create: `src/components/dashboard/ProofSection.tsx`

- [ ] **Step 1: Write `src/components/dashboard/ProofSection.tsx`**
  Implement user-provided code with dynamic classification, search, single-refresh, and screenshot proof previews.
  Ensure clean imports without any unused variables or icons to satisfy `noUnusedLocals: true`.

- [ ] **Step 2: Check TypeScript compilation**
  Run: `cmd.exe /c "npx tsc --noEmit"`
  Expected: PASS.

---

### Task 2: Replace Proof Section in `DashboardPage.tsx` and `AppLayout.tsx`

**Files:**
- Modify: `src/pages/DashboardPage.tsx`
- Modify: `src/components/layouts/AppLayout.tsx`

- [ ] **Step 1: Update `DashboardPage.tsx`**
  Replace lines under `activeTab === 'proof'` with `<ProofSection workspaceId={...} workspaceName={...} />`.
  Remove unused components and imports (`ReviewPipelineHero`, `MetricsCards`, etc.).

- [ ] **Step 2: Update `AppLayout.tsx`**
  Use `<ProofSection workspaceId={workspaceId} workspaceName={workspaceId} />` for `activeNav === 'proof'`.

- [ ] **Step 3: Check TypeScript compilation**
  Run: `cmd.exe /c "npx tsc --noEmit"`
  Expected: PASS.

---

### Task 3: Unit Testing & Verification

**Files:**
- Create: `src/components/dashboard/__tests__/ProofSection.test.tsx`

- [ ] **Step 1: Write tests for `ProofSection`**
  Test header rendering, live category count calculation, search query filtering, and refresh button.

- [ ] **Step 2: Run test suite**
  Run: `cmd.exe /c "npx vitest run src/components/dashboard/__tests__/ProofSection.test.tsx"`
  Expected: PASS.

---

### Task 4: Production Build & Cloudflare Deployment

- [ ] **Step 1: Run full test suite & production build**
  Run: `cmd.exe /c "npx vitest run && npm run build"`
  Expected: PASS with 0 errors.

- [ ] **Step 2: Commit and push**
  Run: `git commit && git push origin main`

- [ ] **Step 3: Deploy to Cloudflare**
  Run: `cmd.exe /c "npx wrangler deploy"`
  Expected: Successfully deployed to `pandapraise.com/*`.
