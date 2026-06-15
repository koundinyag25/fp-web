# Components

How the `fp-web` UI is built: **atomic design** on top of a strict **import-direction rule**. Every
component lives in its own folder with a barrel (`index.ts`) and a colocated test. This file is the
registry; the layering rules + the cycle/direction checker live in
[`fp-web/STRUCTURE.md`](../fp-web/STRUCTURE.md), the visual language in
[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), and the recurring screen recipe in [PATTERNS.md](PATTERNS.md).

## Layering

Four UI tiers sit on three data tiers. Imports only ever point **downward** — `scripts/import_graph.mjs`
enforces it (0 cycles, 0 violations):

```
pages → organisms → molecules → atoms          (UI: compose downward)
components → hooks → lib/services → utils/http  (data: never the other way)
```

- **atoms** — leaf primitives; React + design tokens only, no app imports.
- **molecules** — compositions of atoms.
- **organisms** — complex composites + layout shells; may consume hooks.
- **pages** — route screens; compose organisms/molecules/atoms + page hooks.
- **Components never fetch.** Data flows `utils/http → lib/services/<entity> → hooks/<module> → components`.
  Only services touch the HTTP client.

## Atoms (14) — leaf primitives

| Component | Responsibility |
|---|---|
| `Button` | variants (primary / secondary / danger), disabled |
| `IconButton` | icon-only button with required `aria-label`, optional unread dot |
| `Input` / `Textarea` | text/number controls with `invalid` state |
| `Select` | native `<select>` wrapper |
| `SearchInput` | search field (debounced upstream) |
| `Badge` | small tone label (e.g. driver trip status) |
| `Chip` | rounded tag (vehicle type, product unit) |
| `StatusPill` | status → tone pill for order/delivery/shift statuses |
| `Card` | surface container |
| `Avatar` | driver initials chip |
| `Spinner` | inline loading indicator with label |
| `NavItem` | sidebar nav link with active state (used by `AdminShell`) |
| `Brand` | FleetPanda wordmark (icon + name) — shared by admin shell & driver app |

## Molecules (19) — compositions of atoms

| Component | Responsibility |
|---|---|
| `FormField` | label + control slot + inline error/hint; wires `htmlFor`/`aria-invalid` |
| `PageHeader` | screen title + action slot |
| `MetricCard` | KPI card: label, value, icon, hint, optional drill-in link |
| `EmptyState` | icon + message + optional action |
| `Combobox` | searchable async single-select with infinite load (driver picker) |
| `MultiSelect` | multi-value select (filter value sets) |
| `Popover` | floating panel anchored to a trigger (powers the dropdowns above) |
| `DateRangeFilter` | from/to date range (orders) |
| `StatusFilterBar` | order-status chips bound to `/orders/counts` |
| `FilterRow` / `FilterValueEditor` | one field/op/value row + its type-aware value input (FilterBuilder) |
| `Toast` | a single transient notification |
| `LiveIndicator` | SSE connection state + "last ping" age |
| `ActiveFleetList` | roster of active vehicles beside the fleet map (selectable) |
| `TripCard` | driver delivery card: status, "current" / "locked" state |
| `VehicleCard` | hero allocated-vehicle card (driver landing) |
| `DriverMetrics` | driver completed/failed counts (last 3 months) |
| `InventoryEditor` | editable per-product stock rows (location form) |
| `WeekNavigator` | ‹ prev · week · next › for the allocation calendar |

## Organisms (11) — composites & shells

| Component | Responsibility |
|---|---|
| `AdminShell` | responsive admin layout: sidebar → drawer, grouped nav, top bar, `<Outlet/>` |
| `Table` | generic data table — columns/renderers, loading, empty slot, infinite scroll |
| `ResourceList` | generic master-data list = `SearchInput` + filters + `Table` + `EmptyState` + create |
| `Modal` | dialog shell (bottom-sheet on mobile, centered glass on desktop) |
| `ConfirmDialog` | yes/no confirm (delete) |
| `FilterBuilder` | structured filter UI (rows of field/op/values) → backend query |
| `AllocationCalendar` | week grid of vehicle ↔ driver allocations; surfaces the 409 double-book |
| `FleetMap` | live fleet map — Leaflet + SSE + rAF marker tween + roster (in-transit only) |
| `TripMap` | single-vehicle driver trip map — route polyline + destination + live marker |
| `FailReasonModal` | capture a delivery failure reason (FR-DL-2) |
| `Toaster` | portal that renders the toast queue from `useToast` |

## Pages (13) — route screens

Each page is a folder co-locating the component, its **view-model hook**, its table/filter **config**,
and any **form modal**:

```
pages/admin/<Name>/
  <Name>.tsx          # declarative: composes organisms, wires the hook
  use<Name>Page.ts    # page state (URL params, modal open/editing) + data hooks
  <entity>.config.tsx # get<Entity>Columns(actions) + <ENTITY>_FILTER_FIELDS
  <Name>FormModal.tsx # create/edit form
  index.ts
```

- **Admin:** `Dashboard`, `Locations`, `Products`, `Drivers`, `Vehicles`, `Orders`, `Allocations`,
  `FleetMap`, `Inventory`, `ComingSoon` (route fallback).
- **Driver:** `DriverHome` (shift + trips), `TripDetail` (live map + complete/fail).
- **Root:** `Home` (persona picker).

## Reuse patterns (where the leverage is)

- **One CRUD recipe, four entities.** Locations / Products / Drivers / Vehicles are the *same*
  composition — `ResourceList` + `<Entity>FormModal` + an `<entity>.config.tsx` — differing only in
  columns, filter fields, and form. New master-data screens are ~a config + a form.
- **Every list is `Table`; every dialog is `Modal`/`ConfirmDialog`; every field is `FormField`.**
- **Live-map stack is shared.** `FleetMap` and `TripMap` both consume `useFleetStream` (SSE) +
  `useFleetAnimation` (a single `requestAnimationFrame` loop that glides markers toward their latest
  ping) — pings cost **zero React renders**, so it scales to hundreds of vehicles.
- **Filtering is composable:** `FilterBuilder` → `FilterRow` → `FilterValueEditor` (+ `MultiSelect`/
  `Popover`) emits a structured query the API honors.
- **Toasts:** `useToast` (context) → `Toaster` (portal) → `Toast` (item).

## Conventions

- Folder-per-component + `index.ts` barrel; import via the barrel (`@/atoms/Button`, never deep paths).
- Colocated `<Component>.test.tsx` (Vitest + React Testing Library).
- PascalCase components; `use<Name>` hooks; lowercase utils.
- Styling = Tailwind + Forge design tokens (no inline hex — see [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)).

## Screens → key components

| Screen | Composes |
|---|---|
| Master data (Locations/Products/Drivers/Vehicles) | `AdminShell` · `ResourceList` (`Table`) · `<Entity>FormModal` (`Modal` + `FormField`) · `ConfirmDialog` |
| Orders | `StatusFilterBar` · `DateRangeFilter` · `Table` · `OrderFormModal` · inline `AssignDriverControl` |
| Allocations | `AllocationCalendar` · `WeekNavigator` · allocation form (409 flow) |
| Live fleet map | `FleetMap` (`ActiveFleetList` + `LiveIndicator`) |
| Inventory | `Table` with low/warn/ok bands |
| Dashboard | `MetricCard` ×4 · movements table · orders-by-status |
| Driver home | `Brand` · `VehicleCard` · `DriverMetrics` · `TripCard` list |
| Driver trip | `TripMap` · complete / `FailReasonModal` |
