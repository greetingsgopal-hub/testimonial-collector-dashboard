# Panda Praise — Monitoring Runbook (Free Tier)

Zero-cost observability using Cloudflare and Firebase built-ins. No paid
services (Sentry, LogTail, etc.) are wired. Revisit paid tooling when paying
customers make downtime cost real.

## 1. Liveness probe

`GET https://pandapraise.com/api/health`

Returns `{"status":"ok","service":"pandapraise-api","timestamp":"..."}`.
Deliberately cheap — no Firestore or Stripe calls, no secrets. Use it with
any free uptime checker (UptimeRobot, BetterStack free tier, or a GitHub
Action on a cron) to get alerted when the Worker is down.

## 2. Cloudflare Workers analytics (always on)

Dashboard: Cloudflare → Workers & Pages → `testimonial-collector-dashboard2`
→ Metrics/Observability tab.

What to check weekly:
- **Requests + error rate**: spikes in 5xx responses. The SPA fallback never
  5xxs, so any 5xx is an API route failing.
- **CPU time**: p95 approaching 50ms indicates a slow handler (usually a
  Firestore REST call doing too much).
- **Subrequests per request**: anything above ~40 means a handler is
  looping Firestore calls (e.g. a sync fanning out per review).

## 3. Live log tailing (debugging incidents)

    npx wrangler tail testimonial-collector-dashboard2 --format pretty

Shows live request logs with status codes, console.error output from
handlers (all Stripe/OAuth/webhook failures log with a `[HandlerName]`
prefix), and exceptions. Filter during incidents:

    npx wrangler tail testimonial-collector-dashboard2 --filter "StripeWebhook"

Note: `wrangler tail` is read-only — it does not deploy anything.

## 4. Firestore usage + rules monitoring

Firebase Console → Firestore → Usage tab:
- Reads/writes/delete counts — a sudden read spike can mean a rules
  misconfiguration letting a query fan out, or a crawler hammering a public
  endpoint.
- Firebase Console → App Check (when enabled): monitor-mode rejection
  logs before flipping to enforcement.

## 5. Client-side errors

GA4 (`VITE_GA_MEASUREMENT_ID`, currently unconfigured) would collect
page-level events only. For real client error capture, the free options are:
- Reproduce from user reports + browser console (current state)
- Sentry free tier (5k errors/mo) — recommended when payments activate

## 6. What alerts exist today (honest state)

- Uptime alerts: NONE until you connect a free uptime checker to
  /api/health (5-minute setup, recommended before launch).
- Error alerts: NONE. Errors are visible only via `wrangler tail` or the
  Cloudflare metrics graph.
- The Stripe webhook fails closed and logs; a silently broken webhook would
  surface as customers reporting "I paid but still see Free plan" — check
  `wrangler tail --filter StripeWebhook` first when that happens.

## 7. Incident quick-triage

1. `curl https://pandapraise.com/api/health` — Worker alive?
2. Cloudflare metrics — 5xx spike or CPU spike?
3. `npx wrangler tail` while reproducing — which handler, which error?
4. Firestore usage tab — read/write spike (rules or loop)?
5. If Stripe-related: webhook secret + event delivery in Stripe Dashboard
   → Webhooks tab.