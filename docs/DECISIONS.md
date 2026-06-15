# Decisions Log

ADR-style record of architecture & process decisions for the fleet tracking platform.
Data-model decisions are also summarized in [01-FRD.md](01-FRD.md) §8.

---

## ADR-001 — Real-time = SSE push with in-process pub/sub

**Status:** accepted (FRD §5.4, §6, §8.5)

**Decision.** Live tracking uses **Server-Sent Events** (`GET /api/fleet/stream`). The server fans GPS
pings out to subscribers via an in-process Node `EventEmitter` — no message broker. A server-side
auto-drive timer (`setInterval`, ~2s) emits deterministic steps; clients tween markers with
`requestAnimationFrame` for smooth motion. A 30s reconcile poll + manual refresh are reconnect
fallbacks only.

**Consequence (load-bearing).** The pub/sub bus and the drive timer live in **one process's memory**.
The backend therefore **cannot be horizontally scaled** without first moving pub/sub to Redis/Ably.
This directly constrains deployment (see ADR-002).

---

## ADR-002 — Deploy on DigitalOcean App Platform (single app, two components)

**Status:** accepted

**Context.** Stack is Express (stateful: SSE + EventEmitter + drive timer) + Vite/React SPA +
MongoDB Atlas. Vercel was considered and **rejected for the backend**: serverless functions are
stateless and short-lived, which breaks the in-process pub/sub, the persistent SSE connection, and
the background `setInterval`. (Vercel would be fine for the frontend alone, but splitting adds no
value here.)

**Decision.** One App Platform app with two components, same origin (no CORS):

| Component | Source | Type | Ingress |
|---|---|---|---|
| `api` | `fp-server` | Service (long-running Node process) | `/api/*` (preserve prefix) |
| `web` | `fp-web` | Static Site (Vite build on CDN) | `/*`, SPA fallback to `index.html` |

MongoDB Atlas stays external via a `MONGODB_URI` secret. **The App Platform spec and all env values
live in `fp-infra/` (gitignored, never committed)** — see ADR-004.

**Production constraints (must hold):**

1. **`instance_count: 1`** — non-negotiable given ADR-001. Scaling past 1 silently breaks SSE
   delivery (a ping on instance A can't reach a client on instance B). Revisit only after Redis pub/sub.
2. **SSE heartbeat** — write `: ping\n\n` every ~15s and set `X-Accel-Buffering: no` so App
   Platform's edge proxy doesn't drop idle streams.
3. **Atlas Network Access = `0.0.0.0/0`** — App Platform basic tier has no static egress IP; access
   is gated by SCRAM credentials in `MONGODB_URI`. (Use Dedicated Egress if a fixed IP is ever needed.)
4. **`/health` route** returning 200 — App Platform rolls back deploys without a passing health check.

**Cost.** ~$5/mo (`basic-xxs` service; static sites free; Atlas M0 free tier).

---

## ADR-003 — Sanity testing on the deployed DO server

**Status:** accepted

**Decision.** Manual sanity / smoke testing of the end-to-end flows (the four acceptance flows in
FRD §11 — admin setup, driver shift, real-time map update, double-booking error) will be performed
**against the live DigitalOcean deployment**, not a local environment.

**Why.** The headline feature is the SSE live-tracking loop, whose behavior depends on the production
edge proxy (connection buffering, idle timeouts, heartbeat handling) and the App Platform ingress
routing. Testing on DO exercises the real path the evaluator will use and surfaces proxy/streaming
issues that a local run would hide.

**Note.** This is sanity/E2E verification only — unit and component tests (FRD §NFR-7) still run
locally/CI as usual.

---

## ADR-004 — Deploy specs & env live in an uncommitted `fp-infra/`

**Status:** accepted

**Decision.** All App Platform specs and environment values live in a dedicated **`fp-infra/`
folder that is gitignored at the repo root** (never committed). It holds:

- `app.yaml` — full target (`api` service + `web` static site, same origin via ingress).
- `app.api-only.yaml` — backend-only spec for smoke-testing before `fp-web` exists.
- `deploy.sh` — `doctl` create/update from a chosen spec.
- `.env` (local only) — `DO_API_TOKEN` + `APP_ID` for the CLI.

**Why.** Keeps secrets (Atlas URI, DO token) and environment config out of version control while
keeping infra-as-code in one obvious place.

**Two deploy paths:**
1. **Local** — `cd fp-infra && ./deploy.sh [spec]` pushes spec/env changes via `doctl`.
2. **Push to `main`** — `deploy_on_push: true` in the spec makes DO auto-rebuild on code pushes
   (the app definition already lives on DO after the first `deploy.sh` create). Spec/env changes
   still require a local `./deploy.sh`.
