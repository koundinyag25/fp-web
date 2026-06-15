# Fleet Tracking Platform — Feature Requirements Document (FRD)

> Source: _Assignment Frontend_Fleet Panda.pdf_. This FRD is the contract for everything that
> follows (data model → API → UX). Phase 1 of the build.

## 1. Context & Goal

Build the web interface for a **fleet tracking platform** with two modules over one shared data
layer:

- **Admin Dashboard** — manages master data, orders, vehicle allocation, inventory, and watches a
  **live fleet map**.
- **Driver Interface** — runs a shift, manages deliveries, and emits **simulated GPS updates** that
  the admin map reflects in near-real-time.

The headline feature is the **live tracking loop**: a driver "sends a GPS update" → the admin's
fleet map shows the vehicle move. Everything else is supporting CRUD + workflow.

### Important framing note from the brief

The assignment explicitly states: _"We're evaluating your frontend skills, not your ability to build
backends. Pick the fastest approach that lets you focus on UI/UX."_ We are deliberately building a
**real Express + MongoDB/Mongoose backend** anyway — it gives us a clean, realistic API contract and
lets React Query shine (caching, optimistic updates, polling). We keep the backend **thin and
boring** so effort stays on UX. This is a conscious trade-off, documented in `DECISIONS.md`.

## 2. Tech Stack (locked)

| Layer        | Choice                          | Notes                                                                                             |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------------------- |
| Backend      | Node + Express                  | No auth (per brief: "we wouldn't want to worry about authentication")                             |
| DB           | MongoDB Atlas                   | Cloud connection                                                                                  |
| ODM          | Mongoose                        | Schemas + validation                                                                              |
| Frontend     | React + TypeScript              | Component-based                                                                                   |
| Server state | TanStack React Query            | Caching, polling (`refetchInterval`), optimistic updates                                          |
| Map          | Leaflet.js                      | Free, no token needed                                                                             |
| Real-time    | **SSE push** (server → clients) | Server broadcasts GPS pings live; clients tween markers. 30s poll kept only as reconnect fallback |

## 3. Personas

- **Admin / Dispatcher** — desktop-first. Sets up master data, creates & assigns orders, allocates
  vehicles, monitors the fleet, watches inventory.
- **Driver** — mobile-first. Sees today's shift, starts it, drives (simulated), completes/fails
  deliveries, ends shift, reviews history.

> No login. Persona is selected via a simple role switcher / route prefix (`/admin`, `/driver/:driverId`).

## 4. Domain Entities (preview — finalized in Phase 2)

`Location` (hub **or** terminal, distinguished by `type`), `Product`, `Driver`, `Vehicle`, `Order`,
`Allocation` (vehicle↔driver↔date), `Shift`, `Delivery`, `LocationPing` (GPS history),
`InventoryMovement` (append-only product-movement ledger).

## 5. Functional Requirements

IDs are stable references for tests and the task list. Each has acceptance criteria (AC).

### 5.1 Admin — Master Data Management

- **FR-MD-1 — CRUD for all master entities.** Create/edit/delete Hubs, Terminals, Products,
  Drivers, Vehicles via forms.
  - AC: Each entity has a list view + create/edit form; delete asks for confirmation.
- **FR-MD-2 — List search & filter.** Each list supports text search and relevant filters
  (e.g. vehicle by type, location by hub/terminal).
  - AC: Typing filters the list client-side or via query param; empty state shown when no matches.
- **FR-MD-3 — Validation & error handling.** Required fields, format checks (license, registration,
  phone, coordinates), server validation surfaced inline.
  - AC: Submitting invalid form shows field-level errors; server 4xx maps to inline/toast errors.

### 5.2 Admin — Order Management

- **FR-OM-1 — Create order.** Select destination (terminal), product, quantity, delivery date.
  - AC: Order created with `status = "pending"` (unassigned).
- **FR-OM-2 — Assign order to driver.** Assign/reassign an order to a driver.
  - AC: `assignedDriverId` set, `status → "assigned"`.
- **FR-OM-3 — Order list with status filter.** View all orders; filter by status
  (`pending|assigned|in_transit|completed|failed`).
  - AC: Filter chips/select narrow the list; counts per status visible.

### 5.3 Admin — Vehicle Allocation

- **FR-VA-1 — Allocate vehicle to driver for a date.** Pick vehicle + driver + date.
  - AC: Allocation persisted; appears on calendar.
- **FR-VA-2 — Calendar view of allocations.** See which vehicle is allocated to whom, by date.
  - AC: Calendar/day view lists allocations; can navigate dates.
- **FR-VA-3 — Prevent double-booking (error case).** A vehicle cannot be allocated twice on the
  same date.
  - AC: Attempting a conflicting allocation returns a clear **error** (409) and the UI shows it.
    _(This is an explicitly evaluated error-handling flow.)_

### 5.4 Admin — Live Fleet Map (CORE)

- **FR-LM-1 — Show all active vehicles with locations.** Markers for vehicles currently on shift.
  - AC: Each on-shift vehicle renders at its latest ping coordinates.
- **FR-LM-2 — Driver info tooltip.** Marker tooltip/popup shows driver name, vehicle reg, current
  delivery, status.
- **FR-LM-3 — Filter by driver / vehicle / delivery status.**
  - AC: Filters narrow visible markers.
- **FR-LM-4 — Live updates via SSE + smooth marker animation.** Map subscribes to a server SSE
  stream; each GPS ping animates the relevant marker from its previous to new position (no snap).
  - AC: A driver GPS update appears on the admin map within ~1s, as a **smooth glide** (interpolated
    via `requestAnimationFrame`/Leaflet slide), not a teleport. Manual refresh + 30s reconcile poll
    exist only as a reconnect/fallback safety net.

### 5.5 Admin — Inventory Dashboard

- **FR-IN-1 — Inventory table.** All hubs/terminals with per-product inventory.
- **FR-IN-2 — Low-stock color coding.** Cells below a threshold are visually flagged.
  - AC: Threshold configurable (constant ok); low = red, warning = amber, ok = normal.
- **FR-IN-3 — Search & filter.** By location and/or product.

### 5.5b Admin — Product Movement Tracking

Backed by the append-only `InventoryMovement` ledger (one record per completed delivery). Product is
a **fungible commodity** — we track quantity flow between locations, not serialized batches. A
multi-hop journey (A→B→C) is reconstructed as a chain of legs sharing a location, ordered by time.

- **FR-MV-1 — Movement ledger persisted.** Every completed delivery appends an `InventoryMovement`
  (`productId, fromLocationId, toLocationId, quantity, orderId, deliveryId, vehicleId, completedAt,
pathPingIds[]`).
  - AC: Completing a delivery creates exactly one movement record; failed deliveries create none.
- **FR-MV-2 — Trip route on map (PRIORITY viz).** For a delivery/movement, draw the polyline of the
  actual GPS path the vehicle drove (from `pathPingIds` / `LocationPing` history), source → dest.
  - AC: Selecting a delivery (live or historical) renders its traveled route on the map with
    source/destination markers.
- **FR-MV-3 — (Deferred) Network flow & ledger timeline.** Schema supports a future Sankey/flow
  graph and per-location in/out timeline; **not built in v1**, but the ledger data makes them
  additive with no migration.

### 5.6 Driver — Shift View

- **FR-SV-1 — Today's shift card.** Shows allocated vehicle + assigned orders for today.
  - AC: If no allocation today, card shows empty/blocked state.
- **FR-SV-2 — Start Shift (disabled if no allocation).**
  - AC: Button disabled with reason when no allocation; enabling creates a `Shift` (status `active`).
- **FR-SV-3 — Assigned deliveries list.** Destination + product + quantity per delivery.

### 5.7 Driver — Live Map

- **FR-DM-1 — Driver current location (simulated).** Shows the driver's marker.
- **FR-DM-2 — Destination markers.** All active delivery destinations plotted.
- **FR-DM-3 — Route line (optional).** Polyline from current position → active destination /
  through ping history.
- **FR-DM-4 — GPS streaming (simulated tracking, smooth).** Driver triggers position advancement
  along a deterministic path toward the active destination; each advance records a `LocationPing`
  **and is broadcast over SSE**. Supports a manual "Send GPS Update" (single step) and a
  "Start Driving" auto-stream (steps emitted on a steady cadence, e.g. every ~2s) so movement reads
  as continuous.
  - AC: Driver position advances toward the destination (never random jitter); each step is pushed
    live and rendered as a smooth glide on both driver and admin maps. **This is the core
    live-tracking loop and the primary evaluation target.**

### 5.8 Driver — Delivery Management

- **FR-DL-1 — Mark Completed.** Success message; **decrements source inventory / increments
  destination inventory** (see §6) **and writes an immutable `InventoryMovement` ledger record.**
  - AC: Delivery `status → completed`; order status updates; cached inventory mutates; a movement
    record is appended (capturing from/to/qty/product + the delivery's GPS path); toast shown.
- **FR-DL-2 — Mark Failed (reason modal).** Modal captures a reason; no inventory change.
  - AC: Delivery `status → failed` with stored `failureReason`.
- **FR-DL-3 — End Shift.** Closes the active shift.
  - AC: `Shift.status → completed`, `endedAt` set; deliveries frozen.

### 5.9 Driver — Shift History

- **FR-SH-1 — Past shifts list.** Each past shift with deliveries completed (and failed) counts.

## 6. Live-Tracking & Inventory Simulation Design

**GPS simulation (server-side, deterministic path):** On a GPS advance, the server reads the
driver's active delivery destination and current position (last `LocationPing`, seeded from the
allocated vehicle's source hub on Start Shift). It advances the position by a fixed fraction `STEP`
of the remaining great-circle vector toward the destination, clamps on arrival, and appends a
`LocationPing`. The path is a straight, monotonic walk to the destination — **never random jitter**.
`STEP` is chosen so a leg takes a comfortable number of steps. Two trigger modes:

- **Manual** — `POST /drivers/:id/gps` advances one step.
- **Auto-drive** — `POST /drivers/:id/drive/start` runs a server-side timer emitting one step every
  ~2s until arrival (or `…/drive/stop`). This produces the continuous-motion feel.

**Real-time propagation (SSE):** Clients open `GET /fleet/stream` (admin: all active vehicles;
driver: own vehicle) as an `EventSource`. Each new `LocationPing` is broadcast as an SSE event
`{ vehicleId, driverId, lat, lng, deliveryId, ts }`. A small in-process pub/sub (EventEmitter) fans
pings out to subscribers; no message broker needed.

**Smooth rendering (client, the "Google Maps" feel):** Markers **do not snap**. On each SSE event
the client tweens the marker from its current rendered position to the new coordinate over the
inter-ping interval using `requestAnimationFrame` (or a Leaflet slide helper) with linear/eased
interpolation. Server cadence (steady pings) + client tweening = continuous smooth glide. A 30s
reconcile poll + manual refresh exist only to recover from a dropped SSE connection.

**Inventory on completion (event-sourced):** An order moves `quantity` of `product` from a **source
hub** to a **destination terminal**. The sample `Order` only has `destinationId`, so we **add
`sourceHubId` to Order** (decision §8). On `Mark Completed`, in one transaction:
`source.inventory[product] -= quantity`, `destination.inventory[product] += quantity`, **and append
an `InventoryMovement` record** (the immutable ledger; cached `inventory` balances stay derivable
from it). Guard against negative stock (block + error). The movement record carries `pathPingIds`,
so the trip route (FR-MV-2) is reconstructable for any past delivery.

## 7. Non-Functional Requirements

- **NFR-1 Responsive** — admin desktop-first, driver mobile-first; both usable on the other.
- **NFR-2 Async UX** — loading skeletons, error boundaries, empty states everywhere data is fetched.
- **NFR-3 Optimistic updates** — delivery complete/fail and order assign update UI immediately,
  rollback on error (React Query).
- **NFR-4 Validation** — client + server, errors surfaced clearly.
- **NFR-5 Consistent styling** — design tokens; dark mode is nice-to-have.
- **NFR-6 Accessibility** — ARIA labels, keyboard nav (nice-to-have but targeted).
- **NFR-7 Testing** — unit (utils: gps step, inventory math, validation), component (forms, map
  filters), integration (admin order→allocate flow, driver shift flow), mock API in tests. Coverage
  report produced.

## 8. Key Decisions (defaults — confirm in Phase 2)

1. **Hub & Terminal = one `Location` collection** with `type: "hub" | "terminal"`. Inventory lives
   on locations. Orders deliver to a `type="terminal"`.
2. **Order gains `sourceHubId`** so completion can move inventory hub→terminal.
3. **`Shift` is an explicit entity** (needed for Shift History) created on Start Shift, referencing
   driver + allocation + the day's deliveries.
4. **`Delivery` is its own entity** (vs. embedding in order) so a shift can own many and statuses are
   independent. An Order ↔ Delivery is 1:1 for v1.
5. **Real-time = SSE push** (server → clients) with **client-side marker tweening** for smooth,
   jitter-free, Google-Maps-style motion. This is the headline feature; 30s polling is kept only as
   a reconnect fallback. Server uses an in-process EventEmitter pub/sub — no broker.
6. **No auth** — role chosen via route (`/admin`, `/driver/:driverId`).
7. **Product movement = fungible flow ledger** (`InventoryMovement`), not serialized lots. Cached
   `Location.inventory` balances + immutable ledger. v1 visualization = **trip route on map** only;
   network-flow/Sankey + ledger timeline are deferred but schema-supported.

## 9. Out of Scope (v1)

Authentication/authorization, multi-tenant, real GPS/maps routing engine, push notifications,
offline mode, payments. SSE real-time is a stretch goal only.

## 10. Deliverables (from brief)

Code repo (clean structure, README, package.json) · `docs/COMPONENTS.md` ·
`docs/STATE_MANAGEMENT.md` · `docs/DECISIONS.md` · 2–3 min demo video or deployed URL · test
coverage report + run instructions.

## 11. Acceptance — Key User Flows (must pass end-to-end)

1. **Admin:** create hub → create product → create order → allocate vehicle → view on map.
2. **Driver:** start shift → view deliveries → send GPS updates → complete delivery → end shift.
3. **Real-time:** admin sees driver location update on map.
4. **Error:** allocate same vehicle twice on a date → clear error.
