# Phase 6 — Widget “Install Once, Update Automatically” Acceptance Test Report

**Target Commercial Promise:**  
> *“Install the ReviewVault widget once on a website. After that, when the owner approves new testimonials, they automatically appear in the existing widget without changing the embed code or contacting a developer.”*

**Status:** **PROVEN & VERIFIED ON LIVE PRODUCTION INFRASTRUCTURE**  
**Production URL:** [https://cheery-hummingbird-7ecc95.netlify.app](https://cheery-hummingbird-7ecc95.netlify.app)  
**Firebase Backend Project:** `testimonialcollectordashboard`  
**Test Client Environment:** `http://localhost:8088/test_client_website.html` (Simulated External Client Site: *Apex Innovations*)

---

## 1. Executive Commercial Verdict

> ### **“ReviewVault does not require the website owner to contact their developer every time a new testimonial is approved.”**

The live browser acceptance test against the Netlify production deployment and Firebase backend confirms this promise in full:
1. The client website installed the embed iframe code **exactly once**.
2. When Review #1 (*Elena Rostova*) was approved, it rendered immediately inside the client widget.
3. When Review #2 (*Marcus Vance*) was submitted and approved in the dashboard, it **automatically appeared alongside Review #1 in the client website widget without any developer intervention or modification to the embed snippet**.
4. When Review #3 (*Priya Sharma*) was submitted and approved, it **instantly joined the live grid**.
5. When spam submission (*Spammer Dave*) was submitted as `pending` and subsequent `rejected`, it **never appeared** on the client website.
6. Mobile viewport (`390 x 844`) rendered cleanly with zero horizontal scroll and strict PII privacy (all email addresses kept confidential).

---

## 2. Test Architecture & Static Embed Code

The simulated client website (*Apex Innovations Inc.*) was deployed with the following static iframe embed tag on line 96 of `test_client_website.html`. **This code was never touched or modified during any stage of testing:**

```html
<!-- ReviewVault Live Embed Iframe (Installed Once) -->
<iframe 
  id="reviewvault-widget-iframe"
  src="https://cheery-hummingbird-7ecc95.netlify.app/w/widget-live-test-apex" 
  width="100%" 
  height="480" 
  frameborder="0" 
  loading="lazy"
  style="border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: transparent;"
></iframe>
```

---

## 3. Step-by-Step Production Verification Evidence

### Test 1 — Owner Account & Workspace Provisioning
- **Test Owner Account:** `widgettest@reviewvault.io`
- **Owner UID:** `6jCHXsHAdeSF4x2KvpcGx4FVYOs1`
- **Collection Slug:** `widget-live-test-apex`
- **Widget ID:** `widget-live-test-apex`
- **Backend Isolation:** Verified multi-tenant Firestore security rules enforced (`ownerId == request.auth.uid`).

---

### Test 2 — Review #1 Initial Installation
- **Customer:** **Elena Rostova** (`Lead Architect • HexaCorp`, `elena.r@hexacorp.io`)
- **Rating:** ★★★★★ (5 Stars)
- **Quote:** *"ReviewVault made collecting feedback effortless. Our conversion rate increased by 25% within weeks."*
- **Action:** Submitted via live public collection form (`/c/widget-live-test-apex`) and approved in dashboard.
- **Client Website Result:** Review #1 rendered immediately in the client website widget.

---

### Test 3 — Review #2 “Update Without Touching Embed Code”
- **Customer:** **Marcus Vance** (`Head of Growth • ScaleFlow`, `marcus@scaleflow.tech`)
- **Rating:** ★★★★★ (5 Stars)
- **Quote:** *"The embed code literally never breaks. Approved reviews show up immediately on our landing page."*
- **Action:** Submitted via live form, approved in dashboard. **No changes made to client website HTML or iframe src.**
- **Client Website Result:** Review #2 automatically displayed alongside Elena Rostova. The live widget re-queried Firestore dynamically and rendered both testimonials in the grid.

---

### Test 4 — Review #3 & Multi-Review Auto-Sync
- **Customer:** **Priya Sharma** (`VP Engineering • CloudNova`, `priya@cloudnova.io`)
- **Rating:** ★★★★★ (5 Stars)
- **Quote:** *"Best zero-bloat social proof tool we have ever used. Setup took under 2 minutes."*
- **Action:** Submitted and approved in dashboard.
- **Client Website Result:** All 3 approved reviews rendered in real time within the unmodified client iframe.

---

### Test 5 — Negative Moderation Verification (Pending & Rejected)
- **Test Submitter:** **Spammer Dave** (`Crypto Bot • CryptoMoon`, `dave@spamcrypto.xyz`)
- **Status 1 (Pending):** Review submitted with 1-star rating and promotional spam content (*"Guaranteed 1000x returns! Click here..."*). Checked client website: **Spammer Dave did NOT appear.**
- **Status 2 (Rejected):** Review transitioned to `rejected` in moderation workflow. Checked client website: **Spammer Dave was completely excluded from public queries and widget display.**
- **Verification:** Only reviews with `status === 'approved'` are synced to public read views. Moderation safeguards function reliably.

---

### Test 6 — Mobile Viewport & Security/PII Audit
- **Viewport Dimension:** 390px × 844px (Mobile Standard)
- **Layout Integrity:** Responsive CSS card grid gracefully collapsed to single column; no horizontal scrollbar, clipping, or visual overlap.
- **Security & PII Audit:** Verified that submitter email addresses (`elena.r@hexacorp.io`, `marcus@scaleflow.tech`, `priya@cloudnova.io`, `dave@spamcrypto.xyz`) are **NEVER rendered in the DOM or returned in public widget endpoints**. Only sanitized public metadata (Name, Role, Company, Avatar, Rating, Text) is exposed.
