# fp-web

React + TypeScript + Vite frontend for the fleet tracking platform.
Server state via TanStack React Query; map via Leaflet; live updates via SSE.

## Run locally

```bash
cp .env.example .env     # VITE_API_BASE=/api (default)
npm install
npm run dev              # http://localhost:5173 — /api is proxied to localhost:8080
```

Start the backend (`../fp-server`) first so the API and SSE stream are available.

Build (what App Platform runs): `npm run build` → `dist/`.

## Structure

```
src/
├─ main.tsx              providers: React Query + Router
├─ App.tsx               routes: / (personas), /admin, /driver/:driverId
├─ lib/                  api (axios) + SSE url, queryClient
├─ components/FleetMap   live map: /fleet/active snapshot + SSE pings
└─ pages/                Home, admin/AdminDashboard, driver/DriverHome
```

`DriverHome` already drives the core loop end-to-end (start shift → send GPS /
auto-drive → complete/fail → end shift). The admin master-data, order,
allocation, inventory and movement screens build out from here.

## Notes

- Persona is route-based, no auth (FRD §8.6).
- In production the app is served same-origin as the API behind App Platform
  ingress, so `VITE_API_BASE=/api`.
