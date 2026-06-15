# fp-web

Frontend for a **fleet tracking platform** — a desktop-first **admin console** and a
mobile-first **driver app** over one shared API, with a live fleet map driven by
server-sent GPS updates. Built with React + TypeScript; server state via TanStack
React Query, map via Leaflet, real-time via SSE.

**Live demo:** https://fleetpanda-nowk5.ondigitalocean.app/
(pick a persona on the landing page — `/admin` for the dispatcher console,
`/driver/:driverId` for a driver's shift). Backend: [`../fp-server`](https://github.com/koundinyag25/fp-server).

**Demo video (Loom):** https://www.loom.com/share/e32261d7c0664f8294ab386afb18b386

## Features

**Admin (`/admin`)**
- **Dashboard** — fleet/inventory metrics at a glance.
- **Master data** — CRUD + search/filter for Locations, Products, Drivers, Vehicles (FR-MD).
- **Orders** — create, assign to a driver, status filter + counts (FR-OM).
- **Allocations** — week calendar of vehicle↔driver↔date, with the double-booking **409** error flow (FR-VA).
- **Live Fleet Map** — every active vehicle as a marker, smooth SSE-driven motion, filter by driver/vehicle/status (FR-LM).
- **Inventory** — per-location/product balances with low-stock colour bands (FR-IN).

**Driver (`/driver/:driverId`)**
- **Shift** — today's allocation + assigned deliveries; start/end shift (FR-SV, FR-DL).
- **Simulated GPS** — "Send GPS update" (one step) and "Start driving" (auto-stream), broadcast live to the admin map (FR-DM).
- **Trip detail** — the traveled GPS route drawn on the map (FR-MV-2).

> Persona is chosen by route — no auth (FRD §8.6).

## Tech stack

React 18 · TypeScript · Vite · TanStack React Query · React Router 6 · Leaflet /
react-leaflet · axios · dayjs · Tailwind CSS · lucide-react · `react-window`
(list virtualization for large fleets).

## Run locally

Uses **Yarn** (a `yarn.lock` is committed). Start the backend
([`../fp-server`](https://github.com/koundinyag25/fp-server)) first so the API and SSE stream are live.

```bash
cp .env.example .env     # VITE_API_BASE=/api (default)
yarn install
yarn dev                 # http://localhost:5173 — /api is proxied to localhost:8080
```

Build (what App Platform runs): `yarn build` → `dist/` · preview with `yarn preview`.

## Tests & coverage

Vitest + React Testing Library (jsdom). Unit (utils, hooks), component (forms,
filters, map), and integration (page flows) tests — colocated per unit, ~330+ tests.

```bash
yarn test                # run once
yarn test:watch          # watch mode
yarn test:coverage       # coverage report → coverage/ (text + HTML + lcov)
yarn typecheck           # tsc --noEmit
```

## Project structure

Atomic layering with **downward-only imports** (`utils → services → hooks → atoms →
molecules → organisms → pages`). Full manifest in [STRUCTURE.md](STRUCTURE.md).

```
src/
├─ main.tsx                providers: React Query + Router
├─ App.tsx                 routes: / (personas), /admin/*, /driver/:driverId
├─ utils/                  http (axios) client, SSE url, date helpers
├─ lib/services/<entity>/  API modules (the only callers of utils/http)
├─ hooks/<module>/         React Query data hooks
├─ atoms/ molecules/ organisms/   atomic UI (organisms/FleetMap = live map)
└─ pages/                  admin/* + driver/* screens (co-located view-model hooks)
```

## Documentation

Project docs live in [`docs/`](docs/):

| Doc | What |
|---|---|
| [COMPONENTS.md](docs/COMPONENTS.md) | Component registry + screen plan |
| [STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md) | React Query / state strategy |
| [DECISIONS.md](docs/DECISIONS.md) | Architecture decision records |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Design tokens & theme |
| [PATTERNS.md](docs/PATTERNS.md) | Code & screen-porting conventions |