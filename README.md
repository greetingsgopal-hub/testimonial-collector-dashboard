# Panda Praise 🐼

An ultra-modern, clean, single-page React and Tailwind CSS application functioning as a **Testimonial Collector and Moderation Dashboard**, inspired by the open-source architecture of [reviews-kits](https://github.com/reviews-kits-team/reviews-kits).

Stripped of monorepo bloat and complex microservices, Panda Praise is 100% turnkey: it works out-of-the-box in the browser, plugs into Firebase (Auth + Cloud Firestore) or any REST backend with minimal configuration, and deploys as a unified React frontend and serverless API on Cloudflare Workers.

---

## ✨ Features

- 📝 **Public Testimonial Collector**:
  - Text and Video testimonial modes (Loom, YouTube, MP4).
  - Interactive 5-star rating system with hover reactions.
  - **Live Card Preview**: Real-time rendering as the user types.
  - Submitter metadata: full name, email, role, company, avatar upload/preset chooser, and topic tags.
  - Marketing permission checkbox and celebration with canvas confetti upon submission.

- 📊 **Moderation Dashboard**:
  - Real-time KPIs: Total Reviews, Average Rating, Pending Moderation Queue, and Approval Rate.
  - Interactive 5-star distribution breakdown bar.
  - Dual viewing modes: **Cards Grid** and dense **Table View**.
  - One-click moderation controls: **Approve**, **Reject**, **Feature (Pin)**, **Archive**, and **Delete**.
  - Fast search by reviewer name, company, or testimonial content.
  - Filtering by status, rating, tags, and date/rating sorting.
  - Data export to **CSV** and **JSON**.

- 🎨 **Embeddable Social Proof Studio**:
  - **Wall of Love**: Masonry / responsive grid layout.
  - **Carousel Slider**: Interactive testimonial carousel.
  - **Single Spotlight Card**: Highlight top customer reviews.
  - **Trust Badge**: Compact social proof pill.
  - Ready-to-copy **HTML iframe** and **React/JSX iframe** embeds. Both point to the live Panda Praise widget and preserve the selected layout/theme/settings.

- 🔌 **Pluggable Database Layer**:
  - **LocalStorage Adapter**: Development/demo fallback only; production data uses Firebase when configured.
  - **Firebase Adapter**: Connects to Cloud Firestore & Firebase Authentication with multi-tenant Security Rules.
  - **REST API Adapter**: For any custom backend (Node, Express, Hono, FastAPI, etc.).
  - Includes [`firestore.rules`](./firestore.rules) and [`storage.rules`](./storage.rules) for zero-trust multi-tenant security and customer email privacy.

- ☁️ **Cloudflare Production Deployment**:
  - Frontend deploys as Vite static assets through Cloudflare Workers.
  - SPA fallback is configured in [`wrangler.jsonc`](./wrangler.jsonc).
  - Social OAuth/publishing remains on Netlify Functions as a separate server-side integration.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🗄️ Backend Setup (Firebase)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** (Email/Password), **Cloud Firestore**, and **Storage**.
3. Deploy [`firestore.rules`](./firestore.rules) and [`storage.rules`](./storage.rules).
4. For production abuse protection, register Firebase App Check with reCAPTCHA Enterprise, set `VITE_FIREBASE_APPCHECK_SITE_KEY`, verify App Check metrics, then enable enforcement for Firestore. The client integration is optional until the site key is configured.
5. Configure the remaining Firebase web credentials:

   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```
6. Reload the app. Panda Praise will automatically connect to Firebase!

---

## ☁️ Deploy to Cloudflare Workers

Panda Praise is built on a unified, high-performance Cloudflare Workers architecture:
- **Frontend SPA**: React 18, Vite, and Tailwind CSS compiled to static assets (`dist/`), served with client-side SPA routing (`single-page-application`).
- **Serverless API**: Co-located Cloudflare Worker (`src/worker/index.ts`) handling all `/api/*` endpoints (social OAuth, LinkedIn/Google/Meta review syncing, Razorpay/Stripe webhooks, KV rate-limiting, and GDPR account deletion).

### Deployment Steps:
1. Connect the GitHub repository or deploy directly via Wrangler CLI:
   ```bash
   npm run build
   npx wrangler deploy
   ```
2. `wrangler.jsonc` routes traffic from both:
   - **Custom Domain**: `https://pandapraise.com/*`
   - **Workers.dev Preview**: Enabled via `"workers_dev": true`
3. Configure environment secrets via Cloudflare Dashboard or Wrangler secrets (never commit raw keys in source control):
   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put RAZORPAY_KEY_ID
   npx wrangler secret put RAZORPAY_KEY_SECRET
   npx wrangler secret put FIREBASE_API_KEY
   ```

---

## 📜 License
MIT License
