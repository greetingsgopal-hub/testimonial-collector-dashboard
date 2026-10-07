# Panda Praise (Testimonial Collector & Dashboard)

## Project Overview
Panda Praise is a multi-tenant social proof platform enabling founders and businesses to collect, manage, and embed authentic testimonials, reviews, and video proof on their websites with zero monthly hostage fees.

## Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend / Edge**: Cloudflare Workers (`pandapraise.com`), Cloudflare KV / D1 / Firebase Firestore
- **Testing**: Vitest (`npm test -- --run`)
- **Deployment**: Cloudflare Worker via `wrangler deploy`

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. Route only to skills in the session's available-skills list; answer directly for quick questions or small scoped edits.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
