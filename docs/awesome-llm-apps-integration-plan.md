# Awesome LLM Apps → PandaPraise Integration Plan

**Date:** 2026-10-22
**Branch:** `feat/internal-prospect-research` (created from `main` @ `766d149`, local only — not pushed)
**Status:** Audit complete → proceeding with a single, isolated internal MVP (see §6).

---

## 1. Repository audit (Phase 1)

### 1.1 Working copy
| Item | Finding |
|---|---|
| Local clone used | `scratch/testimonial-collector-dashboard` — `main` matches `origin/main` (`766d149`, verified with `git ls-remote`) |
| Second clone | `scratch/panda-praise-growth-os` points at the same remote but is **stale** (`8ee21eb`, ancestor of `766d149`). Not used. |
| Working tree | Clean before work started |
| Baseline tests | `npx vitest run` → **117 files, 740 tests, all passed** (67 s) |
| Baseline build | `npm run build` (`tsc && vite build`) → **passed** (one pre-existing >600 kB chunk warning for `firebase-core`) |

### 1.2 Architecture
- **Frontend:** React 18 + TypeScript + Vite + Tailwind, `react-router-dom` v7. (`CLAUDE.md` says React 19; `package.json` actually pins React 18.)
- **Edge/API:** a single Cloudflare Worker (`src/worker/index.ts`), configured in `wrangler.jsonc`. It serves the SPA from `ASSETS` and handles `/api/*` with a hand-written router.
- **Data:** Firebase Auth and Firestore, reached over REST from the Worker (`lib/firebaseAuth.ts`, `lib/firestoreAdmin.ts`). The Supabase schema and migrations exist, but the Worker's main paths use Firestore.
- **KV:** `RATE_LIMIT_KV`. It is used by `lib/rateLimit.ts` (fixed window; falls back to memory when KV is unbound; fails closed when KV errors) and for admin caches.
- **Cron:** `*/30 * * * *` → `executeAutomatedBackgroundSync`.
- **Legacy:** a `functions/` directory (Pages Functions / Firebase Functions remnants) and a `.netlify/` folder. The Worker is the live path (route `pandapraise.com/*`).
- **CI:** `.github/workflows/ci.yml` (npm ci → test → build) and `deploy.yml` (build check only). **No deploy runs automatically from CI.** Deploys are manual (`wrangler deploy`). `wrangler` is not a devDependency.

### 1.3 Authentication and authorization
- Browser: Firebase Auth (`AuthContext`). Admin UI routes use `SuperadminGuard`, which checks the email allowlist (`VITE_SUPERADMIN_EMAILS` plus a hard-coded default).
- Worker: `verifyFirebaseToken()` calls Identity Toolkit `accounts:lookup` with the bearer ID token. `isAuthorizedAdmin()` in `handlers/admin.ts` checks the `ADMIN_EMAILS` allowlist with Gmail canonicalisation and a deny-list.
- **Gap noted (pre-existing, not changed):** `verifyFirebaseToken` does not return `emailVerified`, so the admin endpoints authorise on the email claim alone. The new endpoint will additionally require `emailVerified === true`. To support that, the helper gets one **additive** optional field.

### 1.4 Environment variables (names only — no values were printed)
- Already present server-side and relevant here: `GEMINI_API_KEY`, `ADMIN_EMAILS`, `FIREBASE_API_KEY`, `RATE_LIMIT_KV` (binding).
- The local `.env` holds only `VITE_FIREBASE_*` and `VITE_FUNCTIONS_API_URL` (public client config). `.env` is gitignored and not tracked.
- **Pre-existing observation:** `ci.yml` and `deploy.yml` contain a literal `rzp_live_…` Razorpay **key ID** fallback. Key IDs are publishable, not secret, but live identifiers belong in CI secrets. Not changed here.

### 1.5 Existing closest analogue: `handlers/radarHandler.ts` (`POST /api/scan`)
It already scrapes HN Algolia, Google News RSS and Reddit, then classifies the results with Gemini 2.5 Flash.
**Pre-existing risks (documented, not modified, to avoid behaviour changes):**
1. **Unauthenticated, no rate limit.** Any caller can trigger 6 outbound fetches and a Gemini call. This is unbounded API spend.
2. The Gemini key is sent as a **URL query parameter** (`?key=`), which can leak into logs and traces.
3. Retrieved third-party text is inserted **straight into the prompt** with no injection framing.
4. Model output is trusted without schema validation beyond the category enum.

---

## 2. Licence check
`awesome-llm-apps` root `LICENSE`: **Apache License 2.0** (full text downloaded and read). None of the three candidate folders has its own licence file, so the root licence applies.
Obligations if code is copied: keep the licence and NOTICE, and mark modified files.
**Decision:** no source code is copied. The PandaPraise implementation is a clean-room TypeScript reimplementation of the *pattern* (plan → retrieve → synthesise with citations). An attribution note goes in the report anyway.

---

## 3. Candidate evaluation (Phase 2)

### A. AI Sales Intelligence Agent Team (`agent.py`, `tools.py`, `requirements.txt`)
| Aspect | Finding |
|---|---|
| Stack | Python, `google-adk` + `google-genai`; run through `adk web` (a local dev UI) |
| Entry point | `root_agent` → `SequentialAgent` with 7 sub-agents: research → features → positioning → SWOT → objections → HTML battle card → image infographic |
| Models | `gemini-3-flash-preview`, `gemini-3-pro-preview`, `gemini-3-pro-image-preview` (preview models; pricing and availability can change) |
| Tools | `google_search` grounding on 3 stages (**billed per grounded prompt**, ≈ $35 / 1k after the free quota for 2.x models — estimate), model-generated HTML, image generation |
| Cost profile | About 7 or more model calls per card, 2 of them Pro and 1 image generation, plus up to 3 grounded searches. **Expensive and slow per run.** |
| Security | Writes files to `outputs/`. **Renders model-generated HTML with embedded JS** — unsafe to show inside our app. No citation enforcement; "cite sources where possible" is advisory only. |
| Fit | ❌ Cannot run on Workers (Python + ADK runtime). ✅ The **prompt structure** is reusable: competitor profile, pricing, sentiment, strengths/weaknesses, objection handling. |
| Reusable | The research dimensions and objection-handling structure (as ideas). |
| Rewrite needed | Everything else. Drop the HTML/JS generation, image infographic, and 7-call chain. Collapse to one bounded synthesis call over evidence we retrieve and control. |

### B. OpenAI Research Agent (`research_agent.py`)
| Aspect | Finding |
|---|---|
| Stack | Python, `openai-agents`, **Streamlit** UI, `python-dotenv` |
| Flow | Triage agent (plan: topic, queries, focus areas) → research agent (`WebSearchTool`) → editor agent (structured `ResearchReport{title, outline, report, sources[]}`) |
| Models | `gpt-4o-mini` ×3, plus the OpenAI hosted web-search tool (billed per call — estimate ≈ $25–30 / 1k calls; verify current pricing) |
| Requires | A **new provider** (`OPENAI_API_KEY`) that PandaPraise does not use today |
| Security | `sources` is a free-text list the model returns; nothing checks it against retrieved pages. Facts are kept in Streamlit session state. Error text is shown to the user verbatim. |
| Fit | ❌ Streamlit cannot be embedded in the production SPA. ✅ The **plan → retrieve → structured report with sources** shape maps cleanly to a Worker handler. |
| Reusable | The structured output idea (summary + sources) and the "save fact with source" concept. |
| Rewrite needed | The provider (use the existing Gemini integration), retrieval (our own bounded fetchers), and source validation (enforce in code). |

### C. Always-on HN Briefing Agent (`scout.py`, `agent.py`, `scheduler_api.py`, `delivery.py`)
| Aspect | Finding |
|---|---|
| Stack | Python, `google-adk`, FastAPI and uvicorn; designed for Cloud Scheduler → Pub/Sub push |
| Logic | Deterministic: scrape the HN front page, keyword score, render a text/HTML brief. **The LLM is optional.** Defaults to **sample data**. |
| Delivery | Gmail OAuth refresh token or a webhook — **an external action** |
| Fit | ⚠️ We already have a Worker cron (`*/30`) and an HN Algolia fetcher in `radarHandler.ts`. The scoring idea ports trivially. But scheduled delivery is an external action, which this phase explicitly forbids. |
| Decision | **Deferred.** Documented as a future growth workflow (§7). Not implemented. |

### Ranking
1. **A + B pattern, reimplemented** as an internal, admin-only *Prospect & Competitor Research Brief*: highest value, compatible once rewritten in TS.
2. C: deferred (needs outbound delivery and persistence decisions).

---

## 4. Compatibility risks and dependency conflicts
- **Python/Streamlit/ADK/FastAPI → Workers:** incompatible. **No Python runtime and no new npm dependencies are introduced.** The implementation uses `fetch`, `AbortController` and `URL`, all of which exist in Workers and Node 22.
- **Cloudflare limits (estimates — check your plan):** each request makes at most 1 auth lookup, 1 website fetch, 2 public-feed fetches, KV calls, and 1 model call (well under the subrequest limit). Waiting on the network does not count toward CPU time. HTML parsing is capped at 200 KB.
- **No schema changes, no Firestore writes, no migrations.** The MVP is stateless, so there is no tenant data to isolate. Tenant users are blocked at authorisation.

## 5. Security design
| Threat | Control |
|---|---|
| Key exposure | The model key stays in Worker env (`GEMINI_API_KEY`) and is sent in the `x-goog-api-key` **header** (never in the URL). It never appears in browser code. Provider error bodies are never relayed. |
| Unauthorised use | Firebase ID token + `isAuthorizedAdmin` allowlist + `emailVerified === true`. Tenant owners get 403. |
| Accidental spend | Feature flag `PROSPECT_RESEARCH_ENABLED="true"` is required (otherwise 503). Per-admin limit of 10/hour and a global limit of 50/day, both via KV (fail closed). Model output is capped by `maxOutputTokens` with thinking disabled. Prompt size is capped. |
| SSRF | Only `https:`, default port, no userinfo, no IP literals (v4/v6), no `localhost`/`.local`/`.internal`/single-label hosts. Redirects use `manual` and are re-validated (at most 2). 8 s timeout, 200 KB cap, `text/html` only. |
| Prompt injection | Retrieved text is stripped of tags and control characters, truncated, and passed as a JSON-encoded **untrusted data** block. The system instruction says to treat it as data. Output is schema-validated. Claims must cite known source IDs; uncited claims are dropped. URLs in model output are discarded. Sources are rendered only from the server's own list. |
| XSS | React text rendering only (no `dangerouslySetInnerHTML`). Links are `https:`-only with `rel="noopener noreferrer nofollow"`. |
| Fake confidence | No confidence scores. Three labelled tiers: **Retrieved evidence** (verbatim, extracted by code), **AI claims citing sources** (verify before use), **AI inferences**. |
| External actions | None. No email, no outreach, no posting. |

## 6. MVP scope (Phase 3)
**Internal "Prospect Research" tool**, superadmin only:
- `POST /api/admin/prospect-research` with `{ companyName, websiteUrl?, mode: "prospect" | "competitor" }`
- Worker: validate → authz → flag → rate limit → retrieve (website meta + HN Algolia + Google News RSS, reusing the existing radar fetch/parsers) → optional Gemini synthesis → sanitise → JSON.
- If `GEMINI_API_KEY` is absent or the provider fails, the endpoint returns **evidence-only** with `ai.status` explaining why (no fabricated content).
- UI: `/admin/prospect-research` page (dark admin styling), linked from the Admin console header. It has loading, error, empty and success states.
- Files are isolated under `src/worker/lib/prospectResearch/`, `src/worker/handlers/prospectResearch.ts`, and `src/features/prospectResearch/`. Shared files get small additive edits only: router case, one route, one link, one optional auth field, Env typing.

**Out of scope:** persistence, scheduling, outreach or email, Google Search grounding, OpenAI, HTML battle-card generation, image generation.

## 7. Future work (not in this phase)
- Briefing agent (C) on the existing cron, storing briefs in KV/Firestore and delivering to a Slack webhook **after explicit approval**.
- Optional grounded search (paid) behind a separate flag with its own budget cap.
- Harden `/api/scan` (auth/rate limit/header key) — separate, explicitly approved change.
