# Import Testimonials Hub & Sidebar Profile Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the production-ready 4-way Import Testimonials Hub (`ImportTestimonialsHub.tsx`), wire immediate shift into the Proof dashboard view, render screenshot proofs, and remove the duplicate user profile widget in `DashboardSidebar.tsx`.

**Architecture:**
- Create `src/components/dashboard/ImportTestimonialsHub.tsx` containing the 4 import pipelines: Social 1-click scraper with review-only filtering, Screenshots uploader with canvas compression & Gemini Vision OCR, 3-step CSV parsing/mapping, and Manual entry.
- Testimonial commits save to Firestore (`testimonials` collection) and trigger `onShiftToProof` + navigation events to immediately switch view to Proof.
- Deduplicate sidebar profile in `DashboardSidebar.tsx` by removing the redundant top widget and keeping the interactive `SidebarFooter` profile & workspace switcher.
- Integrate into `DashboardPage.tsx` and `AppLayout.tsx` with `screenshotUrl` rendering on Proof testimonial cards.

**Tech Stack:** React 19, TypeScript, Firebase Firestore & Auth, Lucide Icons, Tailwind CSS, Vitest.

**Spec:** User prompt requirements and provided production code.

---

### Task 1: Create `src/components/dashboard/ImportTestimonialsHub.tsx`

**Files:**
- Create: `src/components/dashboard/ImportTestimonialsHub.tsx`

**Interfaces:**
- Produces: `export default function ImportTestimonialsHub({ workspaceId, workspaceName, onShiftToProof }: ImportTestimonialsHubProps)`
- Types: `ImportedTestimonial`, `SocialPlatformAccount`, `ImportMode`

- [ ] **Step 1: Write `src/components/dashboard/ImportTestimonialsHub.tsx`**
  Implement the full component with 4-way import pipelines, ensuring strict TypeScript compliance without any unused imports (`noUnusedLocals: true`).

- [ ] **Step 2: Verify TypeScript compilation**
  Run: `cmd.exe /c "npx tsc --noEmit"`
  Expected: PASS with 0 errors in `ImportTestimonialsHub.tsx`.

---

### Task 2: Deduplicate Left Sidebar Profile in `DashboardSidebar.tsx`

**Files:**
- Modify: `src/components/dashboard/DashboardSidebar.tsx`

- [ ] **Step 1: Remove redundant top profile box**
  Remove lines 97–106 (the static user avatar and name header), keeping only the brand header at top and the rich interactive `SidebarFooter` at the bottom.

- [ ] **Step 2: Verify `DashboardSidebar.test.tsx`**
  Run: `cmd.exe /c "npx vitest run src/components/dashboard/__tests__/DashboardSidebar.test.tsx"`
  Expected: PASS.

---

### Task 3: Wire Immediate Shift into `DashboardPage.tsx` and `AppLayout.tsx`

**Files:**
- Modify: `src/pages/DashboardPage.tsx`
- Modify: `src/components/layouts/AppLayout.tsx`

- [ ] **Step 1: Wire into `DashboardPage.tsx`**
  Render `<ImportTestimonialsHub workspaceId={workspace?.id || project?.id} workspaceName={project?.name} onShiftToProof={...} />` when `activeTab === 'import'`. On callback, map items to `Review` type, prepend to `reviews`, update state, and set `activeTab('proof')`.

- [ ] **Step 2: Wire into `AppLayout.tsx`**
  Render `<ImportTestimonialsHub workspaceId={workspaceId} workspaceName={workspaceId} onShiftToProof={...} />` when `activeNav === 'import'`. On callback, map items to `Testimonial`, prepend to `testimonials`, and set `activeNav('proof')`. Also render `screenshotUrl` if present on testimonial cards.

- [ ] **Step 3: Verify TypeScript compilation**
  Run: `cmd.exe /c "npx tsc --noEmit"`
  Expected: PASS.

---

### Task 4: Unit Testing for `ImportTestimonialsHub`

**Files:**
- Create: `src/components/dashboard/__tests__/ImportTestimonialsHub.test.tsx`

- [ ] **Step 1: Write tests for `ImportTestimonialsHub`**
  Test tab switching (Social, Screenshots, CSV, Manual), manual review entry submission, and callback invocation to `onShiftToProof`.

- [ ] **Step 2: Run test suite**
  Run: `cmd.exe /c "npx vitest run src/components/dashboard/__tests__/ImportTestimonialsHub.test.tsx"`
  Expected: PASS.

---

### Task 5: Build, Commit, and Deploy to Cloudflare

- [ ] **Step 1: Run full test suite and production build**
  Run: `cmd.exe /c "npx vitest run && npm run build"`
  Expected: All tests pass, build succeeds with zero errors.

- [ ] **Step 2: Commit and push changes**
  Run: `git add . && git commit -m "feat: implement real ImportTestimonialsHub with screenshots OCR, social scraper, CSV pipeline, and deduplicated sidebar profile" && git push origin main`

- [ ] **Step 3: Deploy to Cloudflare Worker**
  Run: `cmd.exe /c "npx wrangler deploy"`
  Expected: Deployment succeeds to `pandapraise.com/*`.
