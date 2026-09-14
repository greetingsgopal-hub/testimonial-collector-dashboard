# ReviewVault — One-Click Direct Social Publishing Setup & Configuration Guide

This document details the configuration required to enable genuine direct API social publishing for ReviewVault across LinkedIn, X (Twitter), Facebook, and Instagram.

---

## 1. Architecture Overview

ReviewVault implements a secure, serverless OAuth 2.0 & publishing architecture using **Netlify Functions**:

```
[Browser / Vite Frontend]
       │
       ▼ (Passes Firebase ID token)
[Netlify Functions Layer (/api/*)]
       │
       ├─► Validates user session & tenant ownership (Firebase Auth)
       ├─► Validates review status is "approved" (Moderation Gate)
       ├─► Stores encrypted tokens with AES-256-GCM in Firestore (social_connections)
       └─► Executes official platform API requests (Posts API, Images API)
```

**Zero Secret Leakage Guarantee:**
- No client secrets or platform tokens are ever exposed to the Vite bundle, browser storage, or public Firestore documents.
- State parameter in OAuth is cryptographically signed with HMAC-SHA256 and expires after 10 minutes to prevent CSRF and replay attacks.
- Direct publishing is strictly gated: only testimonials with `status === 'approved'` can be published.

---

## 2. Phase A: LinkedIn Developer Configuration

LinkedIn is the primary production integration for professional testimonials and B2B social proof.

### Step 1: Create a LinkedIn Developer Application
1. Go to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/).
2. Click **Create App**.
3. Enter your Application Name (e.g. `ReviewVault Social Proof`) and associate your LinkedIn Company Page.
4. Upload your company/product logo.

### Step 2: Configure Products & Permissions
1. In your app dashboard, go to the **Products** tab.
2. Request access to:
   - **Share on LinkedIn** (provides `w_member_social`)
   - **Sign In with LinkedIn using OpenID Connect** (provides `openid`, `profile`, `email`)
3. Under the **Auth** tab, verify that the following scopes are active:
   - `openid`
   - `profile`
   - `email`
   - `w_member_social`

### Step 3: Configure Authorized Redirect URLs
Under **Auth** → **OAuth 2.0 settings** → **Authorized redirect URLs for your app**:
- **Production URL:** `https://cheery-hummingbird-7ecc95.netlify.app/api/oauth-callback`
- **Local Development URL (optional):** `http://localhost:4173/api/oauth-callback`

### Step 4: Note Credentials
Copy:
- **Client ID**
- **Client Secret**

---

## 3. Environment Variables (Netlify Configuration)

Configure these environment variables in your **Netlify Site Settings** (`Site configuration` → `Environment variables`):

| Variable Name | Description | Example / Required Value |
|---|---|---|
| `LINKEDIN_CLIENT_ID` | LinkedIn Developer App Client ID | `78xxxxxxxxxxxx` |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn Developer App Client Secret | *(Keep confidential)* |
| `LINKEDIN_REDIRECT_URI` | OAuth callback URL | `https://cheery-hummingbird-7ecc95.netlify.app/api/oauth-callback` |
| `APP_ENCRYPTION_KEY` | 32-character random key for AES-256-GCM token encryption | *(Generate via `openssl rand -hex 16`)* |
| `FIREBASE_PROJECT_ID` | Firestore Project ID | `testimonialcollectordashboard` |
| `FIREBASE_API_KEY` | Firebase Web API Key for ID token verification | *(From project Firebase settings)* |

> [!CAUTION]
> Never prefix server-only variables with `VITE_`. Server secrets must never be embedded into client bundles.

---

## 4. Phase B: Secondary Platforms (Roadmap & Prerequisites)

### X (Twitter)
- **API Requirement:** X API v2 with OAuth 2.0 Authorization Code with PKCE.
- **Scope:** `tweet.read`, `tweet.write`, `users.read`.
- **Note:** Free tier is write-only with rate limits; elevated access requires a Twitter Developer project.
- **Environment Variables:** `X_CLIENT_ID`, `X_CLIENT_SECRET`.

### Facebook Pages
- **API Requirement:** Meta Graph API with Facebook Login.
- **Scope:** `pages_manage_posts`, `pages_read_engagement`.
- **Restriction:** Direct publishing is officially supported for **Facebook Pages** only (not personal profiles). Meta App Review and Business Verification are required before public users can connect.
- **Environment Variables:** `META_APP_ID`, `META_APP_SECRET`.

### Instagram Business / Creator
- **API Requirement:** Meta Instagram Graph API `content_publishing`.
- **Restriction:** Meta strictly limits programmatic publishing to **Instagram Professional (Business or Creator) accounts connected to a Facebook Page**. Personal profiles are not supported by Meta's API.
- **Environment Variables:** Handled through the same Meta App ID as Facebook.

---

## 5. Fallback Mechanics

When a platform account is not connected or third-party automated publishing is restricted (such as for personal Instagram profiles), ReviewVault automatically provides verified manual fallback options:
1. **Download Graphic (PNG):** High-DPI canvas export matching platform aspect ratios (1.91:1 landscape, 1:1 square, 9:16 story).
2. **Copy Caption:** 1-click clipboard copy of pre-formatted quote and hashtags.
3. **Web Intent / Device Share Sheet:** Opens official composer intent or native device sharing sheet.

---

## 6. Verification Checklist

- [x] Website widget pipeline operates untouched and auto-updates upon testimonial approval.
- [x] Social distribution functions as an independent parallel channel.
- [x] Direct 1-Click Publishing UI integrated into Social Proof Studio.
- [x] OAuth 2.0 state generation uses HMAC-SHA256 with 10-minute expiration.
- [x] Access tokens encrypted with AES-256-GCM before persistence in Firestore.
- [x] Only approved testimonials can be published (moderation gate enforced in frontend and serverless function).
- [x] Connected accounts management and publishing audit history accessible from dashboard.
