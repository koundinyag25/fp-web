# Frontend build patterns (set by Flow 1)

Standards every flow follows when turning a Stitch screen into code. Companion to
[COMPONENTS.md](COMPONENTS.md) (registry), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (Forge tokens), and
`fp-web/STRUCTURE.md` (atomic layout). Per-screen phases live in [prompts/FLOWS.md](prompts/FLOWS.md).

## Porting a Stitch screen → code

1. **Map tokens, don't copy them.** Stitch emits Material-Design token names + literal hexes; map
   them to our Forge Tailwind tokens (`surface-container`, `on-surface-variant`, `primary`, `warning`,
   etc.). Never paste Stitch's `tailwind.config` — ours is the source of truth.
2. **Icons:** Stitch uses Material Symbols; we use **lucide-react**. Map by meaning
   (`local_shipping → Truck`, `notifications → Bell`, `swap_horiz → ArrowLeftRight`). Size 16–20,
   `strokeWidth={1.75}` for the thin Forge look.
3. **Build bottom-up** (atoms → molecules → organisms), then assemble the page, then wire data.

## Component conventions

- Folder-per-component + `index.ts` barrel; import via `@/atoms/Button`.
- **Arrow functions only**, typed props (named `interface`), no `React.FC`.
- Tone/variant classes are **static maps**, never built dynamically (Tailwind JIT must see the full
  class string) — see `atoms/StatusPill`, `atoms/Button`.
- Status colors: `pending/assigned → warning`, `in_transit → info`, `completed/active → success`,
  `failed → critical`. Use `StatusPill` rather than re-deriving.
- Icon-only buttons require an `aria-label` (`IconButton`'s `label` prop).

## Data layering

```
utils/http (axios)  →  lib/services/<entity>  →  hooks/<module>/use<Module>  →  page view-model hook  →  component
```

- A component **never** calls `axios`/`fetch`; it consumes a hook.
- **react-query keys:** `[entity]` or `[entity, params]` — e.g. `["drivers"]`, `["movements", params]`,
  `["today", driverId]`. Mutations `invalidateQueries` the affected key.
- Mutating hooks expose named mutations (`{ start, end }`) and invalidate on success.

## Page view-model hook (co-located)

Each page is a folder `pages/<area>/<Name>/{<Name>.tsx, use<Name>Page.ts, index.ts}`. The page hook
composes the reusable data hooks and shapes/derives view data; it owns **page-local UI state**
(filters, selection, modal open) via `useState`/`useReducer`. No zustand. Example:
`pages/admin/Dashboard/useDashboardPage.ts` composes `useOrderCounts + useFleetActive + useMovements +
useInventory` and derives the metric values. The component stays presentational.

## Lists: pagination, search, filters

- **List endpoints are cursor-paginated.** The shared `crudRouter` list returns
  `{ items, nextCursor }` — `?limit` (default 20, max 100), `?cursor=<lastId>` (sorts `_id` desc,
  newest first). `?q=` searches the entity's `searchFields`; declared `filterFields` become
  exact-match query filters.
- **Lists use `useInfiniteList`** (wraps `useInfiniteQuery`, flattens pages → `items`) and render
  inside `ResourceList`, which auto-loads the next page via `useInfiniteScroll` (IntersectionObserver
  sentinel). Per-entity list hooks (`useLocations`, `useDriverList`, …) are thin wrappers passing the
  service + `limit`/`cursor`.
- **Search is debounced** (`useDebounce`, 300ms): the input updates instantly, but only the debounced
  value feeds the query params/`queryKey`. Build params imperatively (`const p: Record<string,string>
  = {}; if (...) p.q = ...`) to satisfy TS narrowing.
- **Filters use the reusable `FilterBuilder` modal** — a "Filters" button (with active count) opens a
  modal of `field | operator | value` rows you add/remove, applied on "Apply". Operators: select
  fields → `is any of` / `is not` (multiselect, search box past ~7 options); date fields → `after` /
  `before` / `between`. `createdAt` / `updatedAt` are offered on every entity automatically (all
  models use Mongoose `timestamps`), so any list can filter by date with zero config.
- **Plug-and-play wiring:** backend — add select fields to `crudRouter`'s `filterable: ["x"]`
  allowlist (honors `?filters=<JSON [{field,op,values}]>` → `$in`/`$nin` for select, `$lt`/`$gt`/
  `$gte+$lte` for date; timestamps always allowed). Frontend — pass a `filterFields` schema
  (`{ key, label, type: "select"|"date", options? }`) + `filters`/`onFiltersChange` to `ResourceList`
  (empty `filterFields` still gives date-only filtering, e.g. Drivers). The page hook holds
  `filters: ListFilter[]` and serializes it: `if (filters.length) p.filters = JSON.stringify(filters)`.
  High-cardinality reference fields just supply loaded `options`; new operators extend the `OPS` map
  + the backend switch.
- A flat (non-infinite) list for small pickers is fine — read `.items` from page 1 with a high
  `limit` (see Home's `useDrivers`).

## Layout & routing

- Admin screens render inside `organisms/AdminShell` via React Router `<Outlet/>`
  (`<Route path="/admin" element={<AdminShell/>}>`). `NavItem` (NavLink) handles active styling
  (left 2px teal accent + `surface-hover`). Unbuilt sections fall back to `pages/admin/ComingSoon`.
- The shell is **responsive**: 280px sidebar ≥`lg`, a slide-in drawer below it (hamburger in TopBar).

## States (always handle)

Loading (skeleton/spinner), empty (`EmptyState`), error — for every data-bound surface (NFR-2).

## Verify (Phase 4, every screen)

`npm run typecheck` + `npm run build` pass · `fe-code-structure` audit = 0 cycles / 0 layer violations
/ no axios in components · responsive check at mobile + desktop widths · run the screen and eyeball it.
