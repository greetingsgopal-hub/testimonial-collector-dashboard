# Stage 4: Automated Review Import Pipelines & CSV Bulk Uploading Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement client-side CSV parsing, column mapping, data validation adhering to Firestore security rules, Firestore batch-writing via `bulkCreateReviews`, and a modern multi-source import hub UI (`ImportReviewsHub.tsx`).

---

### Task 1: Lightweight CSV Parser & Validation Engine
- [ ] Create `src/lib/csvParser.ts` with:
  - RFC 4180 compliant parser (quoted fields, commas, escaped quotes, multiline cells).
  - Column auto-mapping for `name`, `role`, `company`, `rating`, `content`, `avatarUrl`, `source`, `email`.
  - Row validator enforcing `firestore.rules` constraints:
    * `content`: $10 \le \text{length} \le 2500$
    * `rating`: numeric $1 \le r \le 5$
    * `name`: $1 \le \text{length} \le 100$
    * `role`: $\le 120$ chars
    * `avatarUrl`: $\le 75000$ chars
    * `source`: $\le 20$ chars (defaults to `'csv'`)
    * `status`: `'approved'`
    * `consent`: `true`
    * `type`: `'text'`
  - Sample CSV generator helper.
- [ ] Create unit tests in `src/lib/__tests__/csvParser.test.ts`.
- [ ] Run vitest and verify all parser tests pass.

---

### Task 2: Storage Layer `bulkCreateReviews` Implementation
- [ ] Implement `bulkCreateReviews(reviews: ReviewInput[], projectId: string): Promise<Review[]>` in:
  - `src/lib/storage/firebaseAdapter.ts` using chunked `writeBatch(db)` (chunks of up to 450 items to stay safely below Firestore's 500 limit).
  - `src/lib/storage/localStorageAdapter.ts` with atomic local storage array commit.
- [ ] Add unit test in `src/lib/storage/__tests__/bulkCreateReviews.test.ts` to test batching, validation, and chunking.
- [ ] Run vitest and verify all storage tests pass.

---

### Task 3: CSV Bulk Importer Component (`CsvBulkImporter.tsx`)
- [ ] Create `src/components/dashboard/CsvBulkImporter.tsx`:
  - Drag-and-drop dropzone accepting `.csv` files.
  - Column mapper interface with dropdown selects and auto-matched detected headers.
  - Live preview table showing validated rows with green "Valid" or red "Fix Needed" status badges.
  - Execution button triggering `storage.bulkCreateReviews` with progress status.
- [ ] Create unit test `src/components/dashboard/__tests__/CsvBulkImporter.test.tsx`.
- [ ] Run vitest to ensure component tests pass.

---

### Task 4: Multi-Source Import Hub UI Shell (`ImportReviewsHub.tsx`)
- [ ] Create `src/components/dashboard/ImportReviewsHub.tsx`:
  - Tabbed interface / source grid:
    1. **CSV Spreadsheet** (embeds `CsvBulkImporter`).
    2. **Manual Entry Form** (immediate direct review entry with star rating and validation).
    3. **X (Twitter)** (import card with handle input & sync placeholder hooks).
    4. **Google Business Profile** (import card with Google Places / Google My Business pipeline hook).
- [ ] Connect `ImportReviewsHub` into `src/pages/DashboardPage.tsx` or `src/pages/ImportPage.tsx` navigation.
- [ ] Create unit test `src/components/dashboard/__tests__/ImportReviewsHub.test.tsx`.
- [ ] Run vitest and ensure all tests pass.

---

### Task 5: Full Verification & Cloudflare Deployment
- [ ] Run full test suite (`npx vitest run`).
- [ ] Run type check (`npx tsc --noEmit`).
- [ ] Run production build (`npm.cmd run build`).
- [ ] Commit all changes and push to GitHub `origin/main`.
- [ ] Deploy to Cloudflare using `npx.cmd wrangler deploy`.
