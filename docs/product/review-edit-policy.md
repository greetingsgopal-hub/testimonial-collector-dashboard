# Review Edit Policy (Content Integrity)

PandaPraise's value proposition is that displayed testimonials are the
reviewer's own words. This document defines the complete owner-edit surface
and the guardrails that keep it honest.

## The rule

**Curation is allowed. Alteration is not — unless the business supplied the
words itself, and then it is disclosed.**

| Source | Owner can moderate (approve/reject/feature/delete) | Owner can edit content (name/role/company/title/rating/text) |
|---|---|---|
| `form` (public collector) | ✅ | ❌ verbatim |
| Imported platforms (`google`, `facebook`, `twitter`, `linkedin`, `g2`, `trustpilot`, `producthunt`, `capterra`, `yelp`, `shopify`, `appstore`, `playstore`, `reddit`, `api`, `chrome_extension`, `zapier`) | ✅ | ❌ verbatim (also required by source-platform terms, e.g. Google's) |
| `csv`, `manual`, `import` (owner-transcribed) | ✅ | ✅ with mandatory public disclosure |

## Why

- A business flipping a 2★ review into a 5★ one is deceptive advertising.
  In the US, the FTC Consumer Reviews and Testimonials Rule (in force since
  21 Oct 2024) prohibits disseminating reviews that misrepresent the
  reviewer's experience, with civil penalties per violation. The EU Omnibus
  Directive and India's Consumer Protection Act take the same position.
- Industry standard (Google, Trustpilot, Yelp, Amazon): businesses may
  *respond to* and *flag* reviews — never rewrite them. Only the reviewer can
  edit their own review.
- A tool that enables silent rewriting makes "Verified" meaningless — and the
  widget footer says "Verified with Panda Praise".

## How it is enforced

1. **Client logic** — `src/lib/contentIntegrity.ts`
   (`buildReviewEditUpdates`): the single choke point. Content edits on
   non-editable sources throw `ReviewEditNotAllowedError`; permitted edits are
   augmented with a one-time snapshot (`originalContent`, `originalRating`,
   `originalName`) and the disclosure flags (`editedByOwner`, `editedAt`).
2. **Storage adapters** — `firebaseAdapter.updateReview` and
   `localStorageAdapter.updateReview` apply the guard to every update.
3. **Firestore rules** (`firestore.rules`, `reviews` update) — server-side,
   cannot be bypassed by a modified client:
   - content fields locked unless `source ∈ {csv, manual, import}`;
   - any content edit must carry `editedByOwner == true` and a faithful
     first-edit snapshot (`originalContent == previous content`, etc.);
   - snapshots and `editedByOwner` are write-once (cannot be removed or
     rewritten later).
4. **UI** — `ReviewDetailModal` hides the Edit button on verbatim sources
   (shows a "Verbatim" lock instead), warns that edits are disclosed, and
   displays the preserved original on edited reviews.
5. **Public disclosure** — `editedByOwner` flows to `public_reviews`
   (`syncPublicReview`), to the embed API (`/api/embed/testimonials`), and is
   rendered as an "Edited by business" mark on widgets (`/embed.js`), the
   public widget page, and the Wall of Love.

## The ethical alternative for negative reviews

Businesses act on negative reviews through **response**, not rewrite:
reply publicly, resolve the issue, and ask the reviewer to update their own
review (the reviewer owns their words). A future "request updated review"
flow would formalize this.

## Tests

- `src/lib/contentIntegrity.test.ts` — guard unit tests.
- `src/lib/storage/firebaseAdapter.rules.test.ts` — pins the rules
  enforcement statically.
- `src/worker/handlers/embedScript.test.ts` — public disclosure rendering.
