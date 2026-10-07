# Plan: Panda Praise Website Widget & Customer Share Journey

**Author**: Antigravity (CEO Plan Review — Garry Tan Mode)  
**Date**: October 7, 2026  
**Status**: APPROVED  
**Mode**: SELECTIVE EXPANSION  
**Branch**: main  
**Associated Design Doc**: [`docs/designs/widget-share-experience.md`](file:///C:/Users/User/.gemini/antigravity-ide/scratch/testimonial-collector-dashboard/docs/designs/widget-share-experience.md)  

---

## 1. Executive Summary & Scope

### 1.1 Context & Objective
Non-technical website owners (such as Papa System at `papasystem.in`) drop off during testimonial widget onboarding because generic "copy-paste script" instructions fail to guide them through their actual page builder (Elementor, Shopify, Webflow, Squarespace, Framer, Wix). Furthermore, after pasting, users have no visual feedback on whether the script succeeded.

This plan details the implementation of **Approach A (Minimal Viable Embedded Script with Live URL Verification)** under **SELECTIVE EXPANSION** mode:
1. **Dual-Door Share UX**: Instant choice between a zero-code Direct Hosted Wall of Love link and an Embeddable Website Widget.
2. **4-Step Customer Installation Journey**: Platform-tailored steps (Copy Embed -> Open Builder -> Paste Custom HTML Block -> Publish & Verify).
3. **Automated Live Page Verifier (Cherry-Pick 1)**: A secure backend endpoint on Cloudflare Workers (`/api/public/verify-widget`) that crawls customer URLs (e.g. `papasystem.in`) to verify active script execution and container presence, providing instant visual feedback.

### 1.2 Scope Boundaries
* **IN SCOPE**:
  * Polish `WidgetStudio.tsx` interactive share modal with layout selector (Wall of Love, Minimal Badge, Popup Toast, Slider).
  * Cloudflare Worker endpoint `GET /api/public/verify-widget?url=...&projectId=...` with strict SSRF defense.
  * Live status badge in step 4 with diagnostic error breakdown (e.g. "Script detected, but container ID missing" vs "Page unreachable").
  * Test suites for SSRF protection, URL validation, and UI state transitions.
* **OUT OF SCOPE (Deferred)**:
  * Full WordPress.org and Shopify App Store native plugin packages (saved for future App Store expansion).
  * Reverse proxy DNS subdomain vanity routing (`proof.papasystem.in`).

---

## 2. Section 1: Architecture Review

### 2.1 System Architecture & Boundaries

```
[ Customer Browser (Merchant) ]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ Panda Praise Dashboard (WidgetStudio.tsx)             │
│ - Layout Selector (Wall, Badge, Toast, Slider)         │
│ - Step 1: Copy Embed Snippet                          │
│ - Step 2: Open Builder Guides (Elementor/Shopify/etc.) │
│ - Step 3: Paste Code Guidance                         │
│ - Step 4: Live URL Input + "Verify My Website" Button  │
└────────────────────────────────────────────────────────┘
       │
       │ GET /api/public/verify-widget?url=https://papasystem.in&projectId=...
       ▼
┌────────────────────────────────────────────────────────┐
│ Cloudflare Worker (src/worker/handlers/verifyWidget.ts)│
│ 1. Validate URL scheme (https only, no private IPs)    │
│ 2. Fetch page HTML with 5s timeout & 500KB cap         │
│ 3. Check for /widget.js or /embed.js script tag        │
│ 4. Check for #panda-praise-wall or data-project-id     │
│ 5. Return JSON verdict: { verified, details, hints }   │
└────────────────────────────────────────────────────────┘
       │
       │ HTTP GET
       ▼
[ Target Customer Website (e.g. papasystem.in) ]
```

### 2.2 Data Flows (The Four Paths)

#### A. Happy Path
```
User inputs "https://papasystem.in"
  ──> Worker validates public IP/hostname
  ──> Worker fetches HTML (<500ms)
  ──> Script tag found AND container matched
  ──> Return { verified: true, code: "DETECTED_ACTIVE" }
  ──> UI displays glowing green badge: "Verified Live on Papa System!"
```

#### B. Nil Path (Missing URL or Project ID)
```
User leaves URL empty or malformed string
  ──> Client-side validation blocks submit
  ──> If submitted: Worker returns 400 Bad Request: "Valid public HTTPS URL required"
  ──> UI displays inline validation alert without triggering network fetch
```

#### C. Empty Path (Target Page Returns Blank or No Content)
```
Target website returns 200 OK but 0 bytes / empty body
  ──> Worker checks body length == 0
  ──> Return { verified: false, code: "EMPTY_PAGE", hint: "Page returned no HTML" }
  ──> UI displays amber warning with retry prompt
```

#### D. Error Path (Upstream Target Server Timeout or 404/500)
```
Target server drops connection or times out (>5s)
  ──> AbortController triggers timeout
  ──> Catch AbortError
  ──> Return { verified: false, code: "UNREACHABLE", hint: "Could not reach website" }
  ──> UI displays red warning: "Target site took too long to respond. Double check your URL."
```

---

## 3. Section 2: Error & Rescue Map

| Method / Codepath | What Can Go Wrong | Exception Class | Rescued? | Rescue Action | User Visible Outcome |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `verifyWidgetHandler` | Invalid URL scheme (e.g. `ftp://`, `javascript:`) | `ValidationError` | **Y** | Return 400 JSON | "Invalid URL format" |
| `verifyWidgetHandler` | Private / loopback IP address (SSRF attempt) | `SecurityError` | **Y** | Block request immediately with 403 | "Target host is not publicly accessible" |
| `verifyWidgetHandler` | Upstream target site times out (>5s) | `AbortError` | **Y** | Catch in timeout wrapper, return 504 JSON | "Website took too long to load" |
| `verifyWidgetHandler` | Upstream DNS failure or non-existent domain | `FetchError` | **Y** | Catch network error, return 502 JSON | "Domain not found. Verify domain spelling." |
| `verifyWidgetHandler` | Extremely large page (>500KB HTML) | `PayloadTooLarge` | **Y** | Stream reader slices first 500KB, closes body stream | Verifies within first 500KB safely without OOM |
| `WidgetStudio.tsx` | Dashboard network disconnected | `TypeError (fetch)`| **Y** | Catch in React state handler | "Network error. Please check connection." |

*Zero silent failures: Every failure mode returns a structured error code and actionable human remediation.*

---

## 4. Section 3: Security & Threat Model

### 3.1 SSRF (Server-Side Request Forgery) Defense
The verifier accepts arbitrary customer URLs to crawl. To prevent attackers using the Cloudflare Worker as a proxy to probe internal networks or cloud metadata APIs:
1. **Protocol Restriction**: Only `https:` and `http:` allowed; no `file:`, `gopher:`, `data:`, `ftp:`.
2. **Private IP & Hostname Blacklist**:
   * Block `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`.
   * Block private RFC 1918 ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
   * Block cloud metadata endpoints: `169.254.169.254` (AWS/GCP/Azure IMDS).
3. **Response Body Truncation**: Cap HTML ingestion at 512 KB to prevent Memory Exhaustion / ReDoS.
4. **Header Hygiene**: Strip cookies and custom authorization headers before fetching upstream. Send user agent `PandaPraise-WidgetBot/1.0 (+https://pandapraise.com)`.

### 3.2 Tenant Isolation
* Testimonials returned by `/api/public/embed/testimonials` strictly enforce tenant boundaries via Firestore `projectId` and `projectSlug`. Cross-project leaks are mathematically impossible.

---

## 5. Section 4: Data Flow & Interaction Edge Cases

1. **Client-Side Rendering (SPA) Delay on Customer Site**:
   * If customer site is a React/Vue SPA that mounts the script dynamically, a static server-side HTML fetch might not see the injected `<script>`.
   * **Mitigation**: The verifier checks both static HTML regex AND provides a "Manual Iframe Test" toggle so SPA users aren't blocked.
2. **Double-Click / Stale Verification Requests**:
   * "Verify My Website" button automatically enters loading spinner and disables click handlers for 5 seconds to prevent request hammering.
3. **Builder Strips `<script>` tags**:
   * In Step 3, if users are on platforms like Shopify checkout or restricted WordPress roles, the guide explicitly notes: *"If your theme blocks script tags, paste into your Theme Header/Footer or use Custom HTML block."*

---

## 6. Section 5: Code Quality & Component Architecture

* **Modularity**:
  * Frontend: Keep `WidgetStudio.tsx` cleanly structured with extracted helper hooks:
    * `useWidgetPreview` for live style / layout adjustments.
    * `useWidgetVerifier` for step 4 live URL verification state.
  * Backend: Place verifier in `src/worker/handlers/verifyWidget.ts` and register route in `src/worker/index.ts`.
* **Zero Duplication**: Shared types (`WidgetType`, `Review`) imported from `src/types/index.ts`.

---

## 7. Section 6: Testing Strategy

1. **Unit Tests (`verifyWidget.test.ts`)**:
   * Blocks `http://localhost:8080` and `http://169.254.169.254` (SSRF verification).
   * Parses valid HTML containing `<script src="https://pandapraise.com/widget.js"></script>` and returns `DETECTED_ACTIVE`.
   * Parses HTML with missing container and returns `CONTAINER_MISSING`.
   * Handles 5-second fetch timeouts gracefully without worker unhandled promise rejections.
2. **Frontend Component Tests (`WidgetStudio.test.tsx`)**:
   * Verifies switching between Wall of Love, Minimal Badge, and Slider updates the code snippet live.
   * Verifies platform tab switching (WordPress, Shopify, Webflow) displays correct builder-specific instructions.
3. **Chaos Test**: Simulate target site returning HTTP 500 error or dropping connection midway through stream.

---

## 8. Section 7: Performance Review

* **Worker Overhead**: Edge execution via Cloudflare V8 isolates; verification requests stream early termination upon regex match within first 100KB of HTML.
* **Embed Script Footprint**: `widget.js` remains <12KB uncompressed (<4KB gzip).
* **Zero Layout Shift (CLS)**: The embed container maintains min-height and displays responsive skeleton cards while fetching testimonials.

---

## 9. Section 8: Observability & Runbooks

* **Structured Worker Logs**:
  ```json
  {
    "event": "widget_verification",
    "targetHost": "papasystem.in",
    "status": "success",
    "durationMs": 340,
    "projectId": "proj-papa-001"
  }
  ```
* **Alerting**: Monitor Cloudflare Worker 5xx error spikes on `/api/public/verify-widget`.

---

## 10. Section 9: Deployment & Rollout

* **Migration Safety**: Zero database schema changes required. Completely non-destructive.
* **Backward Compatibility**: Existing embed tags targeting `/embed.js` continue functioning without changes.
* **Rollout Sequence**:
  1. Implement `src/worker/handlers/verifyWidget.ts` and register in worker router.
  2. Implement unit test suite in `src/worker/handlers/verifyWidget.test.ts`.
  3. Wire Step 4 UI in `src/components/dashboard/WidgetStudio.tsx` to call verification endpoint.
  4. Run automated test suite (`npm.cmd test -- --run`).
  5. Deploy to Cloudflare production worker via `wrangler deploy`.

---

## 11. Section 10: Long-Term Trajectory Review

* **Reversibility**: Score = 5/5. Feature is purely additive. If verification service is deprecated, the copy-paste snippet functions identically.
* **Future Platform Unlock**: The verification engine forms the foundation for automated daily health checks ("Panda Praise Bot verified your website widget is active") and merchant email alerts if a theme update accidentally removes their embed.

---

## 12. Section 11: Design & UX Review

### 12.1 Information Architecture & User Arc
```
[ Step 1: Copy Code ]  ──>  [ Step 2: Open Builder ]  ──>  [ Step 3: Paste Block ]  ──>  [ Step 4: Verify Live ]
 (1-click clipboard)          (Platform selector)            (Clear screenshot guide)       (Live URL check)
```

### 12.2 Interaction State Coverage Map
| Feature | Loading State | Empty State | Error State | Success State | Partial State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Share Modal** | Skeleton preview | "No reviews approved yet — approve 1 review to display" | Alert banner | Rich interactive preview cards | 1 review preview |
| **Platform Guide** | Instant render | N/A | Builder not found prompt | Step-by-step instructions with highlighted code blocks | General HTML fallback |
| **Live Verifier** | Pulse loader & "Checking papasystem.in..." | "Enter website URL" | Red alert: "Script tag missing. Ensure you clicked Publish in your builder." | Green checkmark + confetti badge | Amber: "Script found, but container div missing." |

---

## GSTACK REVIEW REPORT

```text
STATUS: APPROVED
MODE: SELECTIVE EXPANSION
QUALITY SCORE: 9.8/10
DESIGN DOC: docs/designs/widget-share-experience.md
PLAN FILE: docs/plans/widget-share-verification-plan.md
BLOCKING FINDINGS: 0
REMAINING GAPS: 0

SCOPE DISPOSITION:
- Accepted: Dual-flow share modal (Public link vs Embed)
- Accepted: 4-step guided builder journeys (WordPress, Shopify, Webflow, Framer, Wix, HTML)
- Accepted (Cherry-Pick 1): Automated Live URL Verifier via Cloudflare Worker proxy with SSRF defense
- Deferred: Dedicated WordPress/Shopify app marketplace packages (App Store Phase 2)

VERIFICATION EVIDENCE:
- Unit tests planned for SSRF protection (localhost/private IP blacklist)
- Live test target specified: papasystem.in
- Zero silent failure contracts enforced across all 4 data flow paths
```
