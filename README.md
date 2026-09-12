# ReviewVault 🌟

An ultra-modern, clean, single-page React and Tailwind CSS application functioning as a **Testimonial Collector and Moderation Dashboard**, inspired by the open-source architecture of [reviews-kits](https://github.com/reviews-kits-team/reviews-kits).

Stripped of monorepo bloat and complex microservices, ReviewVault is 100% turnkey: it works out-of-the-box in the browser, plugs into Supabase / PostgreSQL or any REST backend with minimal configuration, and deploys directly to Netlify.

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
  - Ready-to-copy snippets for **React**, **HTML / iFrame**, or **REST API**.

- 🔌 **Pluggable Database Layer**:
  - **LocalStorage Adapter**: Default fallback, works offline and immediately in-browser with seed data.
  - **Supabase Adapter**: Connects directly to Supabase PostgreSQL using PostgREST.
  - **REST API Adapter**: For any custom backend (Node, Express, Hono, FastAPI, etc.).
  - Includes [`schema.sql`](./schema.sql) with table schemas, indexes, and Row Level Security (RLS) policies.

- 🚀 **Netlify Deployment Ready**:
  - Preconfigured [`netlify.toml`](./netlify.toml) and [`public/_redirects`](./public/_redirects) for single-page application routing and high-performance caching.

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

## 🗄️ Database Setup (Supabase / PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and execute the contents of [`schema.sql`](./schema.sql).
3. Copy your project credentials into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Reload the app. ReviewVault will automatically detect the credentials and switch to your live database!

---

## 🌐 Deploy to Netlify

### Option A: Git Push (Continuous Deployment)
1. Push this repository to GitHub or GitLab.
2. Log in to [Netlify](https://app.netlify.com) and click **Add new site > Import an existing project**.
3. Set build command: `npm run build` and publish directory: `dist`.
4. Add your environment variables under **Site configuration > Environment variables**.

### Option B: Netlify Drop
1. Run `npm run build`.
2. Drag and drop the generated `dist` folder directly onto [app.netlify.com/drop](https://app.netlify.com/drop).

---

## 📜 License
MIT License
