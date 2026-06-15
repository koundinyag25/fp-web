# State Management

Two kinds of state, kept strictly apart:

| Kind | Owner | What |
|---|---|---|
| **Server state** | **TanStack React Query** | everything that comes from the API — the source of truth |
| **Client state** | URL path params · page-local `useState` · one `ToastContext` | UI-only, ephemeral |

There is **no global client store** (no Redux / Zustand) — see [Why no store](#why-no-redux--zustand).
The data layering this sits on is in [`fp-web/STRUCTURE.md`](../fp-web/STRUCTURE.md).

---

## Server state — React Query

### Data flow
```
utils/http (axios)  →  lib/services/<entity>  →  hooks/<module> (useQuery/useMutation)  →  components
```
Components **never** fetch; they call a hook. Only `lib/services` touch the HTTP client. The
`QueryClient` is provided once in `main.tsx`.

### Query-key convention
Keys are **hierarchical** — `[entity, sub?, params?]` — so a mutation can invalidate a broad prefix and
cascade to every dependent query.

| Domain | Representative keys |
|---|---|
| Orders | `["orders", params]` (list) · `["orders","counts", params]` |
| Driver day | `["today", driverId]` |
| Fleet | `["fleet","active", params]` · `["fleet","route", deliveryId]` |
| Drivers | `["drivers", params]` · `["drivers","picker"]` · `["driver","stats", driverId]` |
| Locations / Products | `["locations", params]` · `["locations","options", type]` · `["products","options"]` |
| Allocations | `["allocations","range", params]` · `["allocations","summary", params]` |
| Inventory / Movements | `["inventory", params]` · `["movements", params]` |

### Defaults (`lib/queryClient.ts`)
```ts
refetchOnWindowFocus: false   // don't re-fetch every query on tab focus (the #1 over-fetch source)
staleTime: 5_000              // data is "fresh" for 5s — remounts within 5s serve cache, no refetch
retry: 1                      // a failed query costs ≤2 calls, not the default 4
```

### Mutations & invalidation
Each mutation invalidates the **broad entity key**, which cascades to that entity's lists, option
pickers, and counts:

| Mutation(s) | Invalidates |
|---|---|
| order create / update / assign | `["orders"]` (+ `["orders","counts"]`) |
| shift start/end · delivery complete/fail · GPS start | `["today", driverId]` |
| location / product / driver / vehicle / allocation CRUD | `["locations"]` / `["products"]` / … |

### Real-time (the live loop)
Live vehicle positions are **pushed over SSE**, not polled: `useFleetStream` opens an `EventSource` to
`/fleet/stream`; each ping lands in a **ref** and a single `requestAnimationFrame` loop glides the
markers — **zero React renders per ping**, so it scales to the whole active fleet. React Query is *not*
in this hot path. The `useFleetActive` 30 s poll only **reconciles the roster** (vehicles entering/
leaving the active set), not positions.

### Keeping API calls in check
This is deliberate — the controls that stop us from flooding the backend:

1. **Window-focus refetch is OFF.** React Query's default re-fetches *every* active query each time the
   tab regains focus; that's the most common accidental call storm. Disabled globally.
2. **Polling is sparse, intentional, and pauses when unmounted.** `refetchInterval` only fires while a
   component using the hook is mounted — leave the screen and it stops (no background polling). The
   entire polling budget:

   | Hook | Interval | Purpose | Active when |
   |---|---|---|---|
   | `useShiftToday` | 20 s | catch dispatch's external trip changes (own actions invalidate instantly; SSE drives position) — driver screens also have a **manual refresh** icon | a driver page is open |
   | `useOrderCounts` | 15 s | order status-chip counts | dashboard or orders page open |
   | `useFleetActive` | 30 s | reconcile the SSE roster | fleet map (or dashboard) open |

   Since the app is single-persona per route, at most ~one screen's worth of polling runs at a time.
3. **Dedup by key.** Components needing the same data share one request + cache — e.g. the dashboard
   "active vehicles" metric and the fleet map both read `["fleet","active",{in_transit}]`: one fetch,
   one poll, shared.
4. **`staleTime: 5s`** absorbs rapid navigation — bouncing between pages within 5 s serves cache.
5. **SSE instead of polling** for the one high-frequency stream (positions) — the thing that *would* be
   a flood if polled.

**Optional tightening** (documented, not yet applied): reference/option lists (`locations` /
`products` / `drivers` options) rarely change, so a longer `staleTime` (minutes) would cut refetches on
navigation.

---

## Client state

| State | Lives in | Why |
|---|---|---|
| Persona + selection — `/admin`, `/driver/:driverId`, `/driver/:driverId/trip/:deliveryId` | **URL path params** (`useParams`) | shareable, back-button-friendly, survives refresh |
| Search text · filters · date range · modal open/editing · selected map vehicle | **page-local `useState`** inside each co-located `use<Name>Page` | ephemeral UI state that needn't outlive the page |
| Transient success / error / info notifications | **`ToastContext`** (`useToast().show()` → `Toaster`) | the one cross-cutting concern; default no-op so it's safe in tests |

### Why no Redux / Zustand
- Server state *is* most of the state, and React Query owns it (cache, dedup, invalidation, background
  refresh) better than a hand-rolled store would.
- What's left is either **page-local** (`useState`) or a **single tiny context** (toasts) — a global
  store would add ceremony with no payoff.
- If genuinely cross-page *client* state appears later (e.g. a filter set shared across screens), revisit
  then. It hasn't.
