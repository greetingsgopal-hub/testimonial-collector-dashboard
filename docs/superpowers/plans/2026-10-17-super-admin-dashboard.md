# PandaPraise Super Admin Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure, production-grade Super Admin Dashboard (`/admin`) for PandaPraise with real-time customer monitoring, server-verified metrics, workspace suspension/reactivation, system health indicators, and immutable audit logs.

**Architecture:** 
- Edge API in Cloudflare Worker (`src/worker/handlers/admin.ts`) verifies caller's Firebase ID token and matches email against canonical superadmin allowlist (`isAuthorizedAdmin`).
- Backend queries live Firestore collections (`workspaces`, `payments`, `public_reviews`, `admin_audit_logs`) via Google Service Account REST API.
- Front-end React dashboard (`src/pages/AdminPage.tsx`) guarded by `SuperadminGuard` fetches real operational data across 5 dedicated tabs: Overview, Customers, Usage, Health, and Activity Log.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Firebase Auth & Firestore REST, Cloudflare Workers, Vitest.

---

## Global Constraints
- Every admin endpoint MUST verify caller identity via `verifyFirebaseToken` and authorize via `isAuthorizedAdmin`.
- Access is DENIED by default. Ordinary users MUST receive HTTP 403 from all admin endpoints.
- No metrics may be fabricated or simulated. If data is absent, display "Unavailable" or 0.
- Customer passwords or secret tokens must never be exposed or returned in API responses.
- Destruction or suspension operations require explicit confirmation in the UI and server-side audit logging to `admin_audit_logs`.

---

## Review Focus
1. **Unauthorized Caller Gate:** A regular authenticated user calling `/api/admin/*` receives HTTP 403 Forbidden with `{ error: "Access denied. Superadmin authorization required." }`.
2. **Missing Token Gate:** An unauthenticated request to `/api/admin/*` receives HTTP 401 Unauthorized.
3. **Real Revenue Calculation:** Revenue aggregates actual `payments` records with `status === 'Paid'`; no fake orders or estimates.
4. **Suspension Enforcement:** Suspending a workspace sets `status: 'suspended'` in Firestore and records an audit log; suspended workspaces cannot execute protected actions.
5. **Reactivation Path:** Reactivating a workspace sets `status: 'active'` and restores normal tenant permissions.

---

### Task 1: Backend Admin API Endpoints (`src/worker/handlers/admin.ts` & `src/worker/index.ts`)

**Files:**
- Modify: `src/worker/handlers/admin.ts`
- Modify: `src/worker/index.ts`
- Test: `src/worker/handlers/admin.test.ts`

**Interfaces:**
- Produces:
  - `handleAdminGetOverview(request: Request, env: WorkerEnv): Promise<Response>`
  - `handleAdminGetUsers(request: Request, env: WorkerEnv): Promise<Response>`
  - `handleAdminGetUsage(request: Request, env: WorkerEnv): Promise<Response>`
  - `handleAdminGetHealth(request: Request, env: WorkerEnv): Promise<Response>`
  - `handleAdminGetEvents(request: Request, env: WorkerEnv): Promise<Response>`
  - `handleAdminSuspendUser(request: Request, env: WorkerEnv, workspaceId: string): Promise<Response>`
  - `handleAdminReactivateUser(request: Request, env: WorkerEnv, workspaceId: string): Promise<Response>`

- [x] **Step 1: Write failing tests in `src/worker/handlers/admin.test.ts`**
  - Add test: `GET /api/admin/overview returns real workspace and payment metrics for authorized admin`
  - Add test: `GET /api/admin/overview returns 403 for regular user`
  - Add test: `POST /api/admin/workspaces/:id/suspend updates status to suspended and logs to admin_audit_logs`
  - Add test: `POST /api/admin/workspaces/:id/reactivate updates status to active`

- [x] **Step 2: Run test to verify failure**
  - Command: `cmd.exe /c "npx vitest run src/worker/handlers/admin.test.ts"`
  - Expected: FAIL with missing handler functions.

- [x] **Step 3: Implement handlers in `src/worker/handlers/admin.ts`**
  - Implement `handleAdminGetOverview`: runs queries on `workspaces` and `payments` to compute accurate totals.
  - Implement `handleAdminGetUsers`: supports `?q=...` search and returns real customer metadata.
  - Implement `handleAdminGetUsage`: computes review statuses, collection forms, and widgets.
  - Implement `handleAdminGetHealth`: reports actual status of KV, Firestore, Razorpay, Stripe, and Worker runtime.
  - Implement `handleAdminGetEvents`: queries `admin_audit_logs` and `payments`.
  - Implement `handleAdminSuspendUser` and `handleAdminReactivateUser`: updates workspace `status` and saves audit event.

- [x] **Step 4: Wire routing in `src/worker/index.ts`**
  - Add route matches for `admin/overview`, `admin/users`, `admin/usage`, `admin/health`, `admin/events`, `admin/workspaces/:id/suspend`, `admin/workspaces/:id/reactivate`.

- [x] **Step 5: Run tests and verify they pass**
  - Command: `cmd.exe /c "npx vitest run src/worker/handlers/admin.test.ts"`
  - Expected: PASS (all tests green).

---

### Task 2: Server-Side Suspension Gating in Firestore Rules and Protected Handlers

**Files:**
- Modify: `firestore.rules`
- Modify: `src/worker/handlers/socialPublish.ts`
- Test: `src/worker/firestore.rules.test.ts`

**Interfaces:**
- Consumes: `workspace.status` from Firestore.
- Produces: 403 rejection if account is suspended.

- [x] **Step 1: Update `firestore.rules`**
  - Add condition to `workspaces` update: prevent suspended workspaces from mutating records.
  - Ensure `admin_audit_logs` can only be written by Cloudflare Worker service account (`allow read, write: if false;` for clients).

- [x] **Step 2: Verify `socialPublish.ts` check**
  - Query workspace status before publishing: reject with `403` if workspace is suspended.

- [x] **Step 3: Run security tests**
  - Command: `cmd.exe /c "npx vitest run src/worker/firestore.rules.test.ts"`
  - Expected: PASS.

---

### Task 3: Super Admin Dashboard React UI (`src/pages/AdminPage.tsx`)

**Files:**
- Modify: `src/pages/AdminPage.tsx`
- Test: `src/pages/__tests__/AdminPage.test.tsx`

**Interfaces:**
- Consumes: `/api/admin/overview`, `/api/admin/users`, `/api/admin/usage`, `/api/admin/health`, `/api/admin/events`.
- Produces: Production dashboard with 5 tabs, search/filter, confirmation dialog for suspend/reactivate, and zero simulated metrics.

- [x] **Step 1: Implement real data fetching in `AdminPage.tsx`**
  - Replace mock/simulated fallback generation with clean loading, empty, and error states.
  - Implement Tab A: **Business Overview** (Metric cards for Total Users, Workspaces, Free vs Paid, Revenue, 7d/30d signups).
  - Implement Tab B: **Customer Management** (Search input, customer table, plan override, and Suspend/Reactivate modal).
  - Implement Tab C: **Product Usage** (Testimonial counts by status, collection pages, and widgets).
  - Implement Tab D: **System Health** (Worker runtime, database connectivity, gateway bindings).
  - Implement Tab E: **Activity Log** (Audit trail table with date, admin, event, target, status).

- [x] **Step 2: Add navigation link in `DashboardPage.tsx`**
  - Show "Platform Admin" in navigation only when `isSuperadmin(user?.email)` is true.

- [x] **Step 3: Run build & tests**
  - Command: `cmd.exe /c "npm run build && npm test"`
  - Expected: PASS with 0 build errors and all tests passing.

---

### Task 4: Production Deployment & Verification

- [x] **Step 1: Commit and push changes to GitHub**
  - Push to `origin/main`.
- [x] **Step 2: Deploy to Cloudflare Workers**
  - Command: `cmd.exe /c "npx wrangler deploy"`
- [x] **Step 3: Live Verification**
  - Verify `/api/admin/overview` with unauthenticated request returns HTTP 401.
  - Verify `/admin` route loads cleanly for authorized superadmin.
