# Stage 5: Automated Review Request Drip Campaigns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated review request drip campaign engine (Email & WhatsApp), including Firestore/LocalStorage data schemas, HMAC-authenticated webhook ingestion, scheduled cron dispatcher with template variable interpolation, click/conversion tracking, and an Apple-aesthetic interactive UI (`CampaignsHub.tsx`) with real-time preview and analytics.

---

## File Structure

- **Types & Storage**:
  - `src/types/index.ts`: Add `Campaign`, `CampaignTemplate`, `CampaignChannel`, `CampaignStatus`, `CampaignTrigger`, `CampaignLog`, `CampaignLogStatus`.
  - `src/lib/storage/index.ts`: Add campaign and campaign log CRUD methods to `StorageAdapter` interface and `storageRouter`.
  - `src/lib/storage/localStorageAdapter.ts`: Implement campaign methods for local testing and offline capability.
  - `src/lib/storage/firebaseAdapter.ts`: Implement Firestore methods (`campaigns` and `campaign_logs` collections).
  - `src/lib/storage/__tests__/campaignStorage.test.ts`: Unit tests verifying CRUD operations, status toggling, and log filtering.

- **Backend Webhook & Dispatcher**:
  - `src/worker/lib/hmac.ts`: HMAC-SHA256 signature generator and verification utility for webhooks.
  - `src/worker/handlers/campaignTriggerWebhook.ts`: Secure webhook endpoint `/api/webhook/campaign-trigger` that validates HMAC, deduplicates requests, and queues scheduled invites.
  - `src/worker/lib/campaignDispatcher.ts`: Engine that queries scheduled logs, performs dynamic variable interpolation (`{{customer_name}}`, `{{product_name}}`, `{{invite_url}}`), and invokes email/WhatsApp dispatchers.
  - `src/worker/handlers/campaignDispatchHandler.ts`: HTTP endpoint `/api/campaigns/dispatch` and hook for Cloudflare Worker `scheduled` event.
  - `src/worker/handlers/campaignTrackHandler.ts`: Link redirection and conversion tracking endpoint `/api/campaigns/track-click`.
  - `src/worker/handlers/__tests__/campaignTriggerWebhook.test.ts`: Unit tests for webhook HMAC verification, deduplication, and payload ingestion.
  - `src/worker/handlers/__tests__/campaignDispatcher.test.ts`: Unit tests for variable replacement and dispatch logic.

- **Frontend UI & Integration**:
  - `src/components/dashboard/CampaignsHub.tsx`: Main campaign hub with analytics cards, campaign cards, create/edit modal with dynamic live preview (Email and WhatsApp mockups), dynamic variable chips, and webhook documentation drawer.
  - `src/components/dashboard/DashboardSidebar.tsx`: Add "Automations" / "Campaigns" tab.
  - `src/components/dashboard/DashboardPage.tsx`: Render `CampaignsHub` under `activeTab === 'campaigns'`.
  - `src/components/dashboard/__tests__/CampaignsHub.test.tsx`: UI component tests for creating campaigns, toggling status, variable preview, and switching channels.

---

## Tasks

### Task 1: Data Types & Storage Layer
- [ ] Add `Campaign` and `CampaignLog` interfaces and types to `src/types/index.ts`.
- [ ] Extend `StorageAdapter` in `src/lib/storage/index.ts` with `getCampaigns`, `getCampaign`, `saveCampaign`, `deleteCampaign`, `getCampaignLogs`, `createCampaignLog`, `updateCampaignLog`.
- [ ] Implement methods in `src/lib/storage/localStorageAdapter.ts`.
- [ ] Implement methods in `src/lib/storage/firebaseAdapter.ts`.
- [ ] Write unit test `src/lib/storage/__tests__/campaignStorage.test.ts` and verify with `npx vitest run src/lib/storage/__tests__/campaignStorage.test.ts`.

### Task 2: Backend HMAC Verification & Inbound Webhook Handler
- [ ] Create `src/worker/lib/hmac.ts` for cryptographic HMAC-SHA256 verification in Web Crypto API.
- [ ] Create `src/worker/handlers/campaignTriggerWebhook.ts` supporting `X-PandaPraise-Signature` verification, deduplication, and `CampaignLog` creation with calculated `scheduledFor`.
- [ ] Wire webhook route into `src/worker/index.ts`.
- [ ] Write test `src/worker/handlers/__tests__/campaignTriggerWebhook.test.ts` and run with `npx vitest run src/worker/handlers/__tests__/campaignTriggerWebhook.test.ts`.

### Task 3: Dispatcher Engine & Tracking Handlers
- [ ] Create `src/worker/lib/campaignDispatcher.ts` with variable template parsing and channel-specific dispatching.
- [ ] Create `src/worker/handlers/campaignDispatchHandler.ts` and connect to `executeAutomatedBackgroundSync` / `src/worker/index.ts`.
- [ ] Create `src/worker/handlers/campaignTrackHandler.ts` to log link clicks and redirect cleanly to collection form.
- [ ] Write test `src/worker/handlers/__tests__/campaignDispatcher.test.ts` and run with `npx vitest run src/worker/handlers/__tests__/campaignDispatcher.test.ts`.

### Task 4: Campaign Management UI (`CampaignsHub.tsx`)
- [ ] Build `src/components/dashboard/CampaignsHub.tsx` with:
  - KPI Metrics (Active Campaigns, Total Sent, Click Rate, Conversion Rate).
  - Campaign List with active/pause toggle, channel badges, and delay badges.
  - Interactive Create/Edit Modal with Email/WhatsApp channel selector, delay day slider/selector, variable insert chips, and Sticky Live Mockup Preview.
  - Webhook integration guide & HMAC secret modal.
- [ ] Update `DashboardSidebar.tsx` to include `campaigns` navigation item.
- [ ] Update `DashboardPage.tsx` to route `campaigns` tab to `CampaignsHub`.
- [ ] Write test `src/components/dashboard/__tests__/CampaignsHub.test.tsx` and run with `npx vitest run src/components/dashboard/__tests__/CampaignsHub.test.tsx`.

### Task 5: Full Verification, Git Commit, and Cloudflare Deployment
- [ ] Run full test suite: `npx vitest run`.
- [ ] Run type-checking: `npx.cmd tsc --noEmit`.
- [ ] Run production build: `npm.cmd run build`.
- [ ] Commit and push to GitHub `main`.
- [ ] Deploy live to Cloudflare Workers via `npx.cmd wrangler deploy`.
