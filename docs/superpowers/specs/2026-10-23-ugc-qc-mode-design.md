# UGC QC Mode (Slice 1 of "One Product, 3 Modes") — Design Spec

**Date:** 2026-10-23 · **Branch:** `feat/ugc-qc-mode` (from `main` @ `766d149`) · **Status:** Awaiting review

## 1. Goal
PandaPraise becomes one backend sold in three packagings (`ugc_qc`, `shopify_video`, `agency_proof`).
**This slice ships `ugc_qc` end to end:** the mode config, a 3-question QC form driven by the workspace's mode, and a QC Kanban board with **persisted, owner-authorised** status changes.
`shopify_video` and `agency_proof` are typed in config only. They have no UI, embeds or landing pages yet.

**Success criteria**
1. A workspace with `mode: 'ugc_qc'` shows the QC labels/questions on its public form. Workspaces with no `mode` behave exactly as they do today.
2. In `ugc_qc` workspaces, new submissions arrive as `submitted` and **do not appear in public embeds/walls** until moved to `approved` or `published`.
3. Only the workspace owner can move an asset between columns. Other tenants and anonymous users get 403/401.
4. The existing suite (740 tests) and `npm run build` stay green, and new behaviour is covered by tests.

## 2. Current-state findings that shape the design
| Finding | Where | Consequence |
|---|---|---|
| The form already has 3 questions, and the `ugc_qc` wording **already matches** the defaults | `UnifiedReviewFeedbackSystem.tsx` `DEFAULT_REVIEW_CONFIG` | Only labels and the mode wiring are new |
| Ratings are stored as **0–4 indices** (the average is computed as `r + 1`) | same file, L1165–1167 | A display helper converts to 1–5. The stored format stays as is (no migration). |
| The legacy 4-row form and its tests still exist | `ReviewFeedbackFormSystem.tsx` | Untouched. The new types accept variable-length arrays. |
| All submissions are hard-coded to `status: 'approved'` | `testimonialSyncEngine.ts` L207, form L1186 | Becomes mode-aware: `submitted` for `ugc_qc`, unchanged otherwise |
| The reader maps every status except `rejected` to Approved | `testimonialSyncEngine.ts` L288–308 | Must change to **allow-list** `approved`/`published` (and missing status, for legacy docs) |
| `testimonials` create is effectively public with any status, and ownerless docs can be updated by **any** authenticated user | `firestore.rules` L52–58, L242–259 | Status changes **must not** rely on client writes. See §4. |
| Workspace billing fields are already locked against client writes | `firestore.rules` L38–48 | `mode` is owner-editable (a product setting). **No `pricingTier` field** is added; the plan stays server-controlled. |

## 3. Components
| Unit | File | Purpose |
|---|---|---|
| Types | `src/types/ugc.ts` (new) | `PivotMode`, `UGCStatus`, `UGCAsset` (additive; `matrixRatings: (number \| null)[]`) |
| Mode config | `src/config/pivot.config.ts` (new) | Typed `Record<PivotMode, PivotConfig>` holding labels, en/hi questions and emoji title. `getPivotConfig(mode?)` falls back to `ugc_qc`. |
| Status logic | `src/lib/ugcStatus.ts` (new, pure) | `isPubliclyVisible(status)`, `normaliseStatus(raw)`, `allowedTransitions`, `toDisplayScore(index0to4)` |
| Form wiring | `UnifiedReviewFeedbackSystem.tsx` (edit) | Read `workspace.mode`, then apply the mode's questions and labels. Pass `mode` and `matrixLabels` into the submission. |
| Submission | `testimonialSyncEngine.ts` (edit) | Add `mode` and `matrixLabels`. Initial status comes from the mode. The reader uses the allow-list. |
| Status API | `src/worker/handlers/ugcStatus.ts` (new) + route `POST /api/ugc/status` | Verify the Firebase token, load the testimonial and its workspace through the service account, require `workspace.ownerId === uid`, validate the transition, then write `status` + `statusUpdatedAt` + `statusUpdatedBy`. Rate limit: 60/min per user (KV). |
| Kanban | `src/components/dashboard/UGCKanbanBoard.tsx` (new) | Your board with fixes: complete Tailwind classes, `alt` text, accessible buttons, a 1–5 display, a responsive grid, and an optimistic move that **rolls back** on API error. "Generate Ad Caption + Whitelist" is **left out** (no backend; whitelisting is an external rights action). |
| Dashboard entry | existing dashboard nav (edit) | A "UGC QC" tab that appears only when `workspace.mode === 'ugc_qc'` |

## 4. Security
- Status changes go **only through the Worker endpoint** (service-account write after an ownership check). The client UI never writes `status` directly.
- **Firestore rules hardening** (in the repo, **not deployed** without your approval):
  - Delete the duplicate subcollection `create: if true` block, or restrict it.
  - Public create may set `status` only to `submitted` or `approved` (`approved` is kept so non-UGC workspaces work as today).
  - Client updates to `status` on ownerless docs are blocked.
  - Covered by new cases in `firestore.rules.test.ts`.
- Known residual risk (pre-existing, out of scope): public submitters can still self-label `approved` in non-UGC workspaces, and `videoDataUrl` is stored inline in Firestore, which runs into the 1 MB document limit.

## 5. Testing (TDD)
- `ugcStatus.test.ts`: the visibility allow-list, legacy docs without status stay visible, transitions, the 0–4 → 1–5 display.
- `pivot.config.test.ts`: every mode has 3 labels and 3 en/hi questions, and the fallback works.
- `ugcStatus` handler: 405, 401 (no or invalid token), 403 (other tenant's asset), 400 (bad status or transition), 404, 200 (persists + audit fields), provider/Firestore failure → 502 with no internals leaked.
- Sync engine: a `ugc_qc` submission is stored as `submitted`, other workspaces still get `approved`, and the reader hides `submitted`/`needs_rework`.
- Kanban render test: columns and counts, a move calls the API, a failure rolls back.
- Then the full `npx vitest run` and `npm run build`.

## 6. Out of scope (later slices)
The Shopify shoppable carousel (needs a real `/api/ugc` public endpoint and `widget.js` support), the agency proof wall, the `/ugc` `/shopify` `/agency` landing pages, ad-caption generation, creator whitelisting, and moving video storage to R2/Storage.
