# Fleet Tracking Platform — Backend Data Model & Core Flow

> Companion to [01-FRD.md](01-FRD.md). Reconstructed from FRD §4 (entities), §6 (live-tracking +
> inventory simulation), and §8 (key decisions). **Implemented in `fp-server/`** — the ten Mongoose
> models in `fp-server/src/models/` follow this schema. Diagrams below render on GitHub (Mermaid). The
> hand-drawn SVG versions live in [diagrams/](diagrams/).

## 1. Entity-Relationship (data model)

Ten Mongoose collections grouped by role:

- **Master data** — `Location` (hub *or* terminal), `Product`, `Driver`, `Vehicle`
- **Operations** — `Allocation`, `Order`
- **Shift / delivery** — `Shift`, `Delivery`
- **Tracking / ledger** — `LocationPing` (GPS history), `InventoryMovement` (append-only ledger)

```mermaid
erDiagram
    LOCATION {
        ObjectId _id
        string type "hub | terminal"
        string name
        float lat
        float lng
        object inventory "productId -> qty"
    }
    PRODUCT {
        ObjectId _id
        string name
        string unit
    }
    DRIVER {
        ObjectId _id
        string name
        string phone
        string license
    }
    VEHICLE {
        ObjectId _id
        string reg
        string type
        number capacity
    }
    ALLOCATION {
        ObjectId _id
        ObjectId vehicleId FK
        ObjectId driverId FK
        date date "unique(vehicle,date)"
    }
    ORDER {
        ObjectId _id
        ObjectId sourceHubId FK
        ObjectId destinationId FK
        ObjectId productId FK
        number quantity
        date deliveryDate
        ObjectId assignedDriverId FK
        string status "pending|assigned|in_transit|completed|failed"
    }
    SHIFT {
        ObjectId _id
        ObjectId driverId FK
        ObjectId allocationId FK
        string status "active|completed"
        date startedAt
        date endedAt
    }
    DELIVERY {
        ObjectId _id
        ObjectId orderId FK "1:1"
        ObjectId shiftId FK
        string status
        string failureReason
    }
    LOCATIONPING {
        ObjectId _id
        ObjectId vehicleId FK
        ObjectId driverId FK
        ObjectId deliveryId FK
        float lat
        float lng
        date ts
    }
    INVENTORYMOVEMENT {
        ObjectId _id
        ObjectId productId FK
        ObjectId fromLocationId FK
        ObjectId toLocationId FK
        ObjectId orderId FK
        ObjectId deliveryId FK
        ObjectId vehicleId FK
        number quantity
        array pathPingIds "ordered LocationPing ids"
        date completedAt
    }

    VEHICLE      ||--o{ ALLOCATION : "allocated as"
    DRIVER       ||--o{ ALLOCATION : "allocated to"
    LOCATION     ||--o{ ORDER : "source / destination"
    PRODUCT      ||--o{ ORDER : "of product"
    DRIVER       ||--o{ ORDER : "assigned"
    DRIVER       ||--o{ SHIFT : "runs"
    ALLOCATION   ||--|| SHIFT : "started from"
    ORDER        ||--|| DELIVERY : "fulfilled by"
    SHIFT        ||--o{ DELIVERY : "contains"
    DELIVERY     ||--o{ LOCATIONPING : "GPS path"
    VEHICLE      ||--o{ LOCATIONPING : "emits"
    DELIVERY     ||--|| INVENTORYMOVEMENT : "appends on complete"
    ORDER        ||--|| INVENTORYMOVEMENT : "recorded by"
    PRODUCT      ||--o{ INVENTORYMOVEMENT : "moves"
    LOCATION     ||--o{ INVENTORYMOVEMENT : "from / to"
```

**Key relationships & decisions** (FRD §8):

- `Allocation` binds `Vehicle` + `Driver` + `date`, with a **unique constraint on (vehicle, date)** —
  the mechanism behind the double-booking 409 (FR-VA-3).
- `Order` carries the added `sourceHubId` (decision §8.2) alongside `destinationId`, so completion can
  move inventory hub → terminal.
- `Delivery` is **1:1 with `Order`** (v1) and belongs to a `Shift`.
- `LocationPing` is the raw GPS history — one row per simulated step.
- `InventoryMovement` is the **append-only ledger** written once per completed delivery; it stores
  `pathPingIds[]` so any past trip's route (FR-MV-2) is reconstructable. Cached `Location.inventory`
  balances stay derivable from this ledger.

## 2. Core flow — live-tracking + delivery completion (sequence)

The headline loop (FRD §6): a driver's simulated GPS step is persisted, broadcast over an in-process
SSE bus, and glided onto the admin map within ~1s.

```mermaid
sequenceDiagram
    participant D as Driver UI
    participant API as API (Express)
    participant DB as MongoDB
    participant BUS as SSE bus
    participant ADM as Admin map

    D->>API: POST /shifts (start)
    API->>DB: create Shift(active), seed ping from source hub
    ADM->>BUS: GET /fleet/stream (subscribe)
    D->>API: POST /drivers/:id/drive/start

    loop every ~2s until arrival
        API->>API: compute next step toward destination (STEP fraction)
        API->>DB: append LocationPing
        API->>BUS: broadcast {vehicleId, lat, lng, deliveryId, ts}
        BUS->>ADM: SSE event → tween marker (rAF glide, no snap)
        BUS->>D: SSE event → own marker glides
    end

    D->>API: POST /deliveries/:id/complete
    API->>DB: txn — source.inv -= qty, dest.inv += qty,<br/>append InventoryMovement, Delivery & Order = completed
    API-->>D: 200 (React Query optimistic update)
    D->>API: POST /shifts/:id/end
    API->>DB: Shift.status = completed, endedAt set
```

**Notes:**

1. **GPS is deterministic** — each step advances a fixed fraction `STEP` of the remaining great-circle
   vector toward the destination, clamped on arrival. Never random jitter.
2. **Two trigger modes** — manual `POST /drivers/:id/gps` (one step) and auto-drive
   `POST /drivers/:id/drive/start` (server timer, ~2s cadence, `…/drive/stop` to halt).
3. **Real-time = SSE push** via an in-process `EventEmitter` pub/sub — no broker. Clients tween markers
   with `requestAnimationFrame` for continuous motion. The 30s reconcile poll + manual refresh exist
   only as a reconnect fallback.
4. **Completion is one transaction** — inventory move + immutable `InventoryMovement` append happen
   atomically; negative stock is blocked with an error. Failed deliveries write no movement.
