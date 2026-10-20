# PandaPraise 2.0: Radar & Lead Poacher Design Spec

**Date:** 2026-10-20  
**Status:** Approved  
**Author:** Google DeepMind / Antigravity Agent & Product Lead  

---

## 1. Executive Summary & Vision

PandaPraise 2.0 shifts the product positioning from manual testimonial collection widgets into a high-leverage revenue engine:
1. **Part A: Zero-Form Praise Auto-Harvester:** Automatically monitors public social channels (Reddit, Hacker News, Google News / Review Index RSS) for authentic positive shoutouts and converts them into verified social proof cards and a hosted public proof vault without begging customers to fill forms.
2. **Part B: Competitor Review Spy & Lead Poacher:** Continuously monitors competitor mentions for complaints, churn indicators, pricing frustration, or migration queries, instantly generates high-converting, non-spammy founder reply scripts, and provides 1-click links to reply and close the deal.
3. **Hosted Deal-Closer Proof Vault (`/p/:slug`):** Replaces static embed widgets with standalone, high-converting deal-closer vaults equipped with a prominent top CTA bar (*"Chat on WhatsApp / Hire Us / Claim Offer"*) and a viral acquisition loop badge (*"⚡ Auto-Harvested by PandaPraise"*).

---

## 2. System Architecture

```mermaid
graph TD
    A[Visitor on Homepage or Dashboard] -->|Enter Brand + Competitor| B[Dual Scanner Component]
    B -->|POST /api/scan| C[Cloudflare Worker Scraper Engine]
    C -->|Parallel Public Scrape| D1[Reddit Public JSON]
    C -->|Parallel Public Scrape| D2[HackerNews Algolia API]
    C -->|Parallel Public Scrape| D3[Google News / Web RSS]
    D1 & D2 & D3 -->|Batch Posts Array| E[Gemini 2.5 Flash / Heuristic Fallback]
    E -->|Classified Signals| F[Response: PRAISE | POACHABLE_LEAD | FIRE_ALERT]
    F --> B
    F -->|Background Cron / Save| G[(Supabase PostgreSQL: projects & mentions)]
    G --> H[Hosted Deal-Closer Vault /p/:slug]
```

### Zero-Cost Stack
- **Edge Runtime:** Cloudflare Workers (Node.js compatibility, global sub-50ms latency, $0/mo free tier).
- **Database:** Supabase PostgreSQL (`public.projects`, `public.mentions`).
- **AI Engine:** Google Gemini 2.5 Flash (`generateContent` with JSON schema) with in-worker deterministic heuristic classifier fallback.
- **Scraper APIs:** 100% public feeds without paid third-party API keys (Reddit JSON search, Hacker News Algolia API, Google News RSS search).

---

## 3. Data Schema (`supabase/migrations/20261020_pandapraise_radar_schema.sql`)

### Tables
1. **`public.projects`**:
   - `id`: `uuid` (Primary Key, default `uuid_generate_v4()`)
   - `user_id`: `uuid` (Optional, links to auth user)
   - `brand_name`: `text` (Not Null)
   - `brand_slug`: `text` (Unique, Not Null)
   - `competitors`: `text[]` (Default `'{}'`)
   - `alert_email`: `text` (Optional)
   - `cta_label`: `text` (Default `'Chat on WhatsApp / Get Started'`)
   - `cta_url`: `text` (Default `'https://wa.me/'`)
   - `created_at`: `timestamptz` (Default `now()`)

2. **`public.mentions`**:
   - `id`: `uuid` (Primary Key, default `uuid_generate_v4()`)
   - `project_id`: `uuid` (References `public.projects(id)` on delete cascade)
   - `external_id`: `text` (Unique, Not Null - deduplication key across scraper runs)
   - `source`: `text` (Not Null, e.g. `'Reddit'`, `'HackerNews'`, `'GoogleNews'`, `'Web'`)
   - `target_keyword`: `text` (Not Null)
   - `is_competitor`: `boolean` (Default `false`)
   - `author`: `text` (Not Null)
   - `raw_text`: `text` (Not Null)
   - `source_url`: `text` (Not Null)
   - `category`: `text` (Not Null, enum: `'PRAISE'`, `'POACHABLE_LEAD'`, `'FIRE_ALERT'`, `'NOISE'`)
   - `urgency_score`: `integer` (Default `5`, 1 to 10)
   - `clean_quote`: `text` (Punchy 1–2 sentence quote for display)
   - `ai_poach_reply`: `text` (Founder reply script)
   - `is_published_to_wall`: `boolean` (Default `false`)
   - `created_at`: `timestamptz` (Default `now()`)

---

## 4. Cloudflare Worker Multi-Source Scraper (`POST /api/scan`)

### Free Data Sources (Zero Dependencies, Zero API Cost)
1. **Reddit Public JSON Feed:**
   - URL: `https://www.reddit.com/search.json?q="${keyword}"&sort=new&limit=8`
   - User-Agent: `Mozilla/5.0 (compatible; PandaPraiseBot/2.0)`
   - Extracts post title, selftext, author, permalink.
2. **Hacker News Algolia Search API:**
   - URL: `https://hn.algolia.com/api/v1/search_by_date?query="${keyword}"&tags=(story,comment)&hitsPerPage=8`
   - Extracts comment text, title, author, story ID.
3. **Google News RSS Search:**
   - URL: `https://news.google.com/rss/search?q="${keyword}"&hl=en-US&gl=US&ceid=US:en`
   - Uses lightweight XML regex extraction (`<item>`, `<title>`, `<link>`, `<pubDate>`) to extract indexed public web reviews and news without Node DOM dependencies.

### Classification & Fallback Engine
- Batches all mentions across brand and competitors into a single prompt for Gemini 2.5 Flash.
- If `GEMINI_API_KEY` is missing or the external API call fails, falls back immediately to an in-memory rule-based classifier evaluating negative triggers (`"expensive"`, `"broken"`, `"slow"`, `"hate"`, `"alternative"`, `"switch"`, `"migrating"`, `"bug"`, `"pricing"`) and positive triggers (`"love"`, `"awesome"`, `"great"`, `"fast"`, `"best"`, `"switched to"`, `"amazing"`, `"saved"`, `"recommend"`).
- Guarantees **100% uptime and zero errors**.

---

## 5. Frontend Interfaces

### 1. Homepage (`LandingPage.tsx`)
- Replaces static widget hero with the **Dual Scanner**:
  - `[ 1. Your Brand (Auto-Praise) ]` + `[ 2. Competitor (Poach Leads) ]` $\rightarrow$ `[ 🔍 Hunt Praise & Leads ]`.
- Live Signal Feed with 4 Action Tabs:
  - `All Live Signal`, `🎯 Poachable Competitor Leads (Part B)`, `✨ Auto-Harvested Praise (Part A)`, `🚨 Fire Alerts`.
- Mentions cards with:
  - Source badge (`Reddit`, `HackerNews`, `GoogleNews`)
  - Author and timestamp
  - Clean quote
  - AI Suggested Reply / Poach script container
  - 1-click **"📋 Copy Reply & Open Post"**
  - 1-click **"✨ Zero-Canva Social Card"** modal
- Cleanse: Strips all legacy copy referencing website embed code or iframe snippets.

### 2. Public Hosted Deal-Closer Vault (`/p/:slug`)
- Dynamic route `/p/:slug` (e.g. `pandapraise.com/p/supabase`).
- **Top Deal-Closer CTA Bar:**
  - Verified Trust Pill (`5.0 ★★★★★ Verified Social Proof`)
  - Customizable CTA: **"Chat on WhatsApp / Get Started / Hire Us →"**
  - Toggle: *All Verified Praise* vs *Case Studies*
- **Grid of Verified Proof Cards** with authentic source badges.
- **Sticky Viral Loop Footer:**
  - *"🐼 Verified & Auto-Harvested by PandaPraise — Hunt your own praise & poach competitor leads free →"* linking to `/`.

### 3. Dashboard Command Center (`RadarView.tsx`)
- Integrated under Dashboard tab `radar` (`Radar & Lead Poacher`).
- Controls brand keyword and competitor tracking list.
- Real-time lead poacher table with urgency indicators (1–10).
- Toggle switch: `Publish to Hosted Vault` to instantly sync mentions into `/p/:slug`.

---

## 6. Verification & Test Plan

1. **Unit Testing:**
   - Test scraper parser handles Reddit, Hacker News, and Google News RSS payloads.
   - Test classifier fallback classifies competitor complaints as `POACHABLE_LEAD` and brand compliments as `PRAISE`.
   - Test `POST /api/scan` endpoint responses.
   - Test `/p/:slug` route rendering, deal-closer CTA, and viral loop footer.
   - Test dashboard `RadarView` tab interactions and lead poaching reply copy.
2. **Build & Deployment:**
   - Pass Vitest test suite (`npx vitest run`).
   - Pass TypeScript and Vite compilation (`npm run build`).
   - Git commit and push to `origin/main`.
   - Deploy live to Cloudflare Workers (`npx wrangler deploy`).
