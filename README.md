# fp-web
fp-web(https://fleetpanda-nowk5.ondigitalocean.app/) is a mini fleet tracking frontend built for demonstration and testing purposes. it implements the core features of a fleet tracking platform in a simple and modular way.

## Run locally

```bash
cp .env.example .env     # VITE_API_BASE=/api (default)
npm install
npm run dev              # http://localhost:5173 — /api is proxied to localhost:8080
```

Start the backend (`../fp-server`) first so the API and SSE stream are available.

Build (what App Platform runs): `npm run build` → `dist/`.

## Tests

```bash
npm test                 # Vitest (jsdom + React Testing Library)
npm run test:watch       # watch mode
npm run test:coverage    # coverage report → coverage/ (text + HTML + lcov)
```

## Structure

Atomic layering with downward-only imports — see [STRUCTURE.md](STRUCTURE.md)
for the full manifest.

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

The admin console (dashboard, master-data CRUD, orders, allocations, inventory,
movements, live fleet map) and the driver app are built; `DriverHome` drives the
core loop end-to-end (start shift → send GPS / auto-drive → complete/fail → end shift).

## Notes

- Persona is route-based, no auth (FRD §8.6).
- In production the app is served same-origin as the API behind App Platform
  ingress, so `VITE_API_BASE=/api`.
