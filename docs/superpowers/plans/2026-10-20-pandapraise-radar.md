# PandaPraise 2.0: Radar & Lead Poacher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform PandaPraise into PandaPraise 2.0: a $0/month multi-source praise auto-harvester (Reddit + Hacker News + Google News RSS) and competitor review spy/lead poacher with an edge scanner, a public hosted deal-closer vault (`/p/:slug`), and an interactive dashboard command center.

**Architecture:** A Cloudflare Worker edge endpoint (`POST /api/scan`) fetches public feeds across Reddit JSON, Hacker News Algolia API, and Google News RSS in parallel without third-party API costs. The worker batches mentions and classifies them into `PRAISE`, `POACHABLE_LEAD`, `FIRE_ALERT`, and `NOISE` using Gemini 2.5 Flash, backed by an in-memory keyword heuristic classifier fallback. The frontend displays an interactive Dual Scanner hero on the homepage (`LandingPage.tsx`), a dashboard command center (`RadarView.tsx`), and a public deal-closer proof vault (`HostedProofVaultPage.tsx` at `/p/:slug`) featuring a top CTA bar and sticky viral acquisition footer.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Lucide React, Cloudflare Workers, Supabase PostgreSQL, Vitest.

**Spec:** `docs/superpowers/specs/2026-10-20-pandapraise-radar-design.md`

## Global Constraints

- **Infrastructure Cost:** Strictly $0/month. No paid scraping APIs. Only public JSON/RSS endpoints.
- **Fail-Safe Uptime:** If `GEMINI_API_KEY` is absent or rates out, the in-memory heuristic classifier must categorize signals immediately so `/api/scan` never fails or times out.
- **TypeScript & React Rules:** `noUnusedLocals: true` strictly enforced. Zero unused imports or variables.
- **Public Hosted Vault (`/p/:slug`):** Must include a prominent top Deal-Closer CTA button (*"Chat on WhatsApp / Hire Us / Claim Offer"*) and a sticky bottom viral loop badge (*"🐼 Verified & Auto-Harvested by PandaPraise — Hunt your own praise & poach competitor leads free →"*).
- **Homepage Cleanse:** Replace outdated manual embed code messaging with the automated social proof and competitor lead poaching narrative.

## Review Focus

1. **Google News RSS Malformed XML or Empty Feeds:** RSS feeds with non-standard tags or CDATA strings must not throw exceptions; the regex parser must safely return empty lists or sanitized text.
2. **Reddit / Hacker News Rate Limiting or Offline:** If Reddit or HN returns 429/500, `Promise.allSettled` must allow other sources to proceed rather than failing the entire scan request.
3. **Empty / Garbage Keyword Inputs:** If a user scans empty strings or whitespace, the endpoint must return a clean 400 response with helpful validation errors.
4. **Deal-Closer Slug Resolution on `/p/:slug`:** If a brand slug is requested that has no stored mentions or doesn't exist yet, `/p/:slug` must render a beautiful fallback state with instant "Claim This Vault / Start Tracking" CTA instead of a blank white screen or 404 crash.
5. **Mobile Responsiveness of Dual Scanner & Deal-Closer Bar:** The dual brand/competitor inputs and the top deal-closer bar must collapse gracefully without horizontal scrolling or clipped CTAs on 360px mobile viewports.

---

### Task 1: Supabase Database Migration (`public.projects` & `public.mentions`)

**Files:**
- Create: `supabase/migrations/20261020_pandapraise_radar_schema.sql`

**Interfaces:**
- Produces: SQL schema for `projects` (storing brand, slug, competitors array, and deal-closer CTA config) and `mentions` (storing crawled signals with `category`, `urgency_score`, `clean_quote`, `ai_poach_reply`, and `is_published_to_wall`).

- [ ] **Step 1: Write SQL migration file**
  Create `supabase/migrations/20261020_pandapraise_radar_schema.sql` defining:
  - `public.projects` (`id`, `user_id`, `brand_name`, `brand_slug`, `competitors`, `alert_email`, `cta_label`, `cta_url`, `created_at`).
  - `public.mentions` (`id`, `project_id`, `external_id`, `source`, `target_keyword`, `is_competitor`, `author`, `raw_text`, `source_url`, `category`, `urgency_score`, `clean_quote`, `ai_poach_reply`, `is_published_to_wall`, `created_at`).
  - Unique index on `mentions(external_id)` for idempotent scraper runs.
  - Indexes on `mentions(project_id, is_published_to_wall)` and `mentions(category)`.
  - Row Level Security (RLS) policies allowing public read on published mentions.

- [ ] **Step 2: Verify SQL syntax**
  Check that the migration conforms to PostgreSQL standard syntax without syntax errors.

- [ ] **Step 3: Commit**
  `git add supabase/migrations/20261020_pandapraise_radar_schema.sql && git commit -m "feat(db): add schema migration for radar projects and mentions"`

---

### Task 2: Cloudflare Worker Multi-Source Scraper & Fallback Classifier

**Files:**
- Create: `src/worker/handlers/radarHandler.ts`
- Create: `src/worker/handlers/radarHandler.test.ts`
- Modify: `src/worker/index.ts:370-380`

**Interfaces:**
- Produces: `handleRadarScan(request: Request, env: WorkerEnv): Promise<Response>`
- Types: `ScrapedMention`, `RadarScanRequest`, `RadarScanResponse`, `MentionCategory` (`'PRAISE' | 'POACHABLE_LEAD' | 'FIRE_ALERT' | 'NOISE'`).

- [ ] **Step 1: Write failing unit tests for scraper parser and heuristic classifier**
  Create `src/worker/handlers/radarHandler.test.ts` testing:
  - Reddit JSON search item parser.
  - Hacker News Algolia hit parser.
  - Google News RSS XML parser (extracting title, link, pubDate).
  - Heuristic classifier (negative words on competitor -> `POACHABLE_LEAD`, positive words on brand -> `PRAISE`, negative words on brand -> `FIRE_ALERT`).
  - `handleRadarScan` returning JSON with classified mentions.

- [ ] **Step 2: Run test to verify it fails**
  Run: `cmd.exe /c "npx vitest run src/worker/handlers/radarHandler.test.ts"`
  Expected: FAIL (cannot find module `radarHandler.ts`).

- [ ] **Step 3: Implement `radarHandler.ts`**
  Implement:
  - `fetchRedditMentions(keyword: string)`: fetches Reddit JSON with custom User-Agent.
  - `fetchHackerNewsMentions(keyword: string)`: fetches HN Algolia search API.
  - `fetchGoogleNewsMentions(keyword: string)`: fetches Google News RSS and parses items via regex.
  - `classifyMentionsWithGemini(mentions, brand, competitor, apiKey)`: calls Gemini 2.5 Flash with structured response schema.
  - `classifyMentionsHeuristic(mentions, brand, competitor)`: deterministic keyword-based classifier that executes if Gemini API key is missing or call fails.
  - `handleRadarScan(request, env)`: handles POST body `{ brand: string, competitor?: string }`, scrapes parallel feeds via `Promise.allSettled`, classifies all items, and returns `{ brand, competitor, mentions, summary }`.

- [ ] **Step 4: Mount `radarHandler` in `src/worker/index.ts`**
  Add route cases:
  ```typescript
  case 'radar/scan':
  case 'radar-scan':
  case 'scan':
    return await handleRadarScan(request, env);
  ```

- [ ] **Step 5: Run tests to verify they pass**
  Run: `cmd.exe /c "npx vitest run src/worker/handlers/radarHandler.test.ts"`
  Expected: PASS all tests.

- [ ] **Step 6: Commit**
  `git add src/worker/handlers/radarHandler.ts src/worker/handlers/radarHandler.test.ts src/worker/index.ts && git commit -m "feat(worker): implement zero-cost multi-source radar scraper and classifier"`

---

### Task 3: Public Hosted Deal-Closer Proof Vault (`/p/:slug`)

**Files:**
- Create: `src/pages/HostedProofVaultPage.tsx`
- Create: `src/pages/__tests__/HostedProofVaultPage.test.tsx`
- Modify: `src/App.tsx:9-35, 100-110`

**Interfaces:**
- Consumes: route param `:slug` (`/p/:slug`), Supabase or local seed/mock mentions.
- Produces: Standalone high-converting public deal-closer page with top CTA bar, verified proof grid, and sticky viral footer.

- [ ] **Step 1: Write failing tests for HostedProofVaultPage**
  Create `src/pages/__tests__/HostedProofVaultPage.test.tsx` testing:
  - Renders top Deal-Closer CTA Bar with customizable button text (e.g. *"Chat on WhatsApp / Get Started"*).
  - Renders verified social proof cards with authentic source pills (`Reddit`, `HackerNews`, `GoogleNews`).
  - Renders the sticky viral footer with link back to PandaPraise homepage (`/`).

- [ ] **Step 2: Run test to verify it fails**
  Run: `cmd.exe /c "npx vitest run src/pages/__tests__/HostedProofVaultPage.test.tsx"`
  Expected: FAIL (cannot find module `HostedProofVaultPage.tsx`).

- [ ] **Step 3: Implement `HostedProofVaultPage.tsx`**
  Implement:
  - Top Deal-Closer CTA Bar:
    - Rating pill: `5.0 ★★★★★ Verified Social Proof`
    - Brand title and headline
    - Prominent customizable CTA button: *"Chat on WhatsApp / Get Started / Hire Us →"*
    - Proof filter tabs: `All Verified Praise` / `Case Studies`
  - Responsive Grid of Verified Proof Cards:
    - Author avatar/initials, name, platform icon badge
    - Highlighted quote text with quote marks
    - Date and *"Original Post ↗"* link
  - Sticky Viral Loop Footer:
    - *"🐼 Verified & Auto-Harvested by PandaPraise — Hunt your own praise & poach competitor leads free →"* with button linking to `/signup`.

- [ ] **Step 4: Mount `/p/:slug` route in `src/App.tsx`**
  Add lazy import for `HostedProofVaultPage` and route `<Route path="/p/:slug" element={<HostedProofVaultPage />} />`.

- [ ] **Step 5: Run tests to verify they pass**
  Run: `cmd.exe /c "npx vitest run src/pages/__tests__/HostedProofVaultPage.test.tsx"`
  Expected: PASS all tests.

- [ ] **Step 6: Commit**
  `git add src/pages/HostedProofVaultPage.tsx src/pages/__tests__/HostedProofVaultPage.test.tsx src/App.tsx && git commit -m "feat(pages): add hosted deal-closer proof vault page at /p/:slug with viral loop footer"`

---

### Task 4: Homepage Dual Scanner & Live Signals Feed (`LandingPage.tsx`)

**Files:**
- Modify: `src/pages/LandingPage.tsx:248-350`
- Create: `src/pages/__tests__/LandingPageRadar.test.tsx`

**Interfaces:**
- Consumes: `/api/scan` endpoint (with automatic fallback to rich simulated signals if offline).
- Produces: Dual Scanner hero (`[ Your Brand ]` + `[ Competitor to Poach ]` -> `[ 🔍 Hunt Praise & Leads ]`), 4-tab live signal feed, 1-click poach reply copying, and social card preview modal.

- [ ] **Step 1: Write test for Dual Scanner on LandingPage**
  Create `src/pages/__tests__/LandingPageRadar.test.tsx` verifying:
  - Renders Dual Scanner inputs for Brand and Competitor.
  - Submitting triggers scan and renders classified signal cards across tabs.
  - Copying poach reply copies text to clipboard.
  - Obsolete website embed code hero copy is eliminated.

- [ ] **Step 2: Run test to verify it fails**
  Run: `cmd.exe /c "npx vitest run src/pages/__tests__/LandingPageRadar.test.tsx"`
  Expected: FAIL.

- [ ] **Step 3: Update `src/pages/LandingPage.tsx`**
  - Replace hero section with the Dual Scanner:
    - Input 1: Brand name (`e.g., PandaPraise, Supabase, YourAgency`)
    - Input 2: Competitor name (`e.g., Senja, Firebase, CompetitorX`)
    - Big CTA button: `🔍 Hunt Praise & Leads` with loading animation.
  - Live Signal Feed section below hero with 4 tabs:
    - `All Signals`, `🎯 Poachable Competitor Leads (Part B)`, `✨ Auto-Harvested Praise (Part A)`, `🚨 Fire Alerts`.
  - Signal cards rendering:
    - Source badge (`Reddit`, `HackerNews`, `GoogleNews`)
    - Clean quote, author, timestamp
    - AI Suggested Reply / Poach script container
    - 1-click **"📋 Copy Reply & Open Post"**
    - 1-click **"✨ Zero-Canva Social Card"**
  - Cleanse hero copy of old "one-line embed code / iframe snippet" messaging.

- [ ] **Step 4: Run test to verify it passes**
  Run: `cmd.exe /c "npx vitest run src/pages/__tests__/LandingPageRadar.test.tsx"`
  Expected: PASS all tests.

- [ ] **Step 5: Commit**
  `git add src/pages/LandingPage.tsx src/pages/__tests__/LandingPageRadar.test.tsx && git commit -m "feat(landing): replace hero with dual scanner and live competitor lead feed"`

---

### Task 5: Dashboard Command Center (`RadarView.tsx` & Dashboard Navigation)

**Files:**
- Create: `src/components/dashboard/views/RadarView.tsx`
- Create: `src/components/dashboard/views/__tests__/RadarView.test.tsx`
- Modify: `src/components/dashboard/DashboardSidebar.tsx:16-35, 90-130`
- Modify: `src/pages/DashboardPage.tsx:430-560`

**Interfaces:**
- Consumes: `workspaceId`, `workspaceName`, `brandSlug`.
- Produces: Dedicated Dashboard command center for managing brand radar keywords, competitor watchlists, urgent lead poacher list, and 1-click publishing to `/p/:slug`.

- [ ] **Step 1: Write test for RadarView**
  Create `src/components/dashboard/views/__tests__/RadarView.test.tsx` verifying:
  - Renders brand and competitor keyword inputs.
  - Displays radar feed with categories (`PRAISE`, `POACHABLE_LEAD`, `FIRE_ALERT`).
  - Allows 1-click publishing of mentions to the public `/p/:slug` vault.
  - Allows copying AI poaching script for quick DM outreach.

- [ ] **Step 2: Run test to verify it fails**
  Run: `cmd.exe /c "npx vitest run src/components/dashboard/views/__tests__/RadarView.test.tsx"`
  Expected: FAIL (cannot find module `RadarView.tsx`).

- [ ] **Step 3: Implement `RadarView.tsx`**
  Implement:
  - Top header: Live Status indicator, tracked keywords, and *"View Public Vault ↗"* link to `/p/:slug`.
  - Configuration card: Add/remove competitor names to monitor.
  - Urgency metrics bar: Count of poachable leads (score > 7) and fire alerts.
  - Signals table & cards:
    - Target keyword, source, author, quote.
    - Urgency badge (1 to 10 scale).
    - Poach reply script with 1-click copy.
    - Toggle: *"Publish to /p/:slug Vault"*.

- [ ] **Step 4: Wire `radar` tab into `DashboardSidebar.tsx` and `DashboardPage.tsx`**
  - Add `'radar'` to `DashboardTab` type in `DashboardSidebar.tsx`.
  - Add "Radar & Spy" navigation item with Radar icon and "Live" pill in `DashboardSidebar.tsx`.
  - Render `<RadarView ... />` when `activeTab === 'radar'` in `DashboardPage.tsx`.

- [ ] **Step 5: Run test to verify it passes**
  Run: `cmd.exe /c "npx vitest run src/components/dashboard/views/__tests__/RadarView.test.tsx"`
  Expected: PASS all tests.

- [ ] **Step 6: Commit**
  `git add src/components/dashboard/views/RadarView.tsx src/components/dashboard/views/__tests__/RadarView.test.tsx src/components/dashboard/DashboardSidebar.tsx src/pages/DashboardPage.tsx && git commit -m "feat(dashboard): add radar and competitor lead poacher command center"`

---

### Task 6: End-to-End Verification, TypeScript Check & Live Deployment

**Files:**
- All modified and created files.

- [ ] **Step 1: Run full test suite across entire project**
  Run: `cmd.exe /c "npx vitest run"`
  Expected: All test suites pass with 0 failures.

- [ ] **Step 2: Run production build check**
  Run: `cmd.exe /c "npm run build"`
  Expected: Build succeeds with 0 TypeScript and bundling errors.

- [ ] **Step 3: Commit and push changes**
  `git push origin main`

- [ ] **Step 4: Deploy Cloudflare Worker**
  Run: `cmd.exe /c "npx wrangler deploy"`
  Expected: Cloudflare Worker successfully deployed with new `/api/scan` endpoint.
