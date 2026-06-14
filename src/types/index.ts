// Shared domain types used across services, hooks, and components.

export interface Driver {
  _id: string;
  name: string;
  phone?: string;
  license?: string;
}

export interface Vehicle {
  _id: string;
  reg: string;
  type: string;
  capacity?: number;
}

export interface LocationRef {
  _id: string;
  name: string;
  type?: string;
  lat?: number;
  lng?: number;
}

export interface ProductRef {
  _id: string;
  name: string;
  unit?: string;
}

export interface ActiveVehicle {
  shiftId: string;
  driver: Pick<Driver, "_id" | "name"> | null;
  vehicle: Pick<Vehicle, "_id" | "reg" | "type"> | null;
  position: { lat: number; lng: number; ts: string } | null;
  deliveryStatus: string | null;
  currentDelivery?: {
    _id: string;
    orderId?: { destinationId?: LocationRef; productId?: ProductRef } | null;
  } | null;
}

/** A delivery's route/driven path + endpoints (FR-MV-2 / FR-DM-3). `ts` is null
 *  for planned road geometry, set for actual ping trails. */
export interface FleetRoute {
  deliveryId: string;
  from: LocationRef | null;
  to: LocationRef | null;
  path: { lat: number; lng: number; ts: string | null }[];
}

export interface PingEvent {
  vehicleId: string;
  driverId: string;
  lat: number;
  lng: number;
  ts: string;
  deliveryId?: string | null;
}

export interface DeliveryOrder {
  quantity: number;
  destinationId?: LocationRef;
  sourceHubId?: LocationRef;
  productId?: ProductRef;
  startTime?: string | null;
}

/** Driver landing metrics (last ~3 months). */
export interface DriverStats {
  sinceDays: number;
  completed: number;
  failed: number;
  total: number;
}

export interface Delivery {
  _id: string;
  sequence: number;
  status: string;
  orderId: DeliveryOrder | null;
}

export interface Allocation {
  _id: string;
  vehicleId: { _id?: string; reg: string; type: string; capacity?: number };
  driverId?: { _id?: string; name: string };
  date?: string;
}

/** Fleet size + allocations in the visible window (FR-VA-2 summary). */
export interface AllocationSummary {
  fleet: number;
  allocated: number;
}

export interface TodayResponse {
  date: string;
  canStart: boolean;
  allocation: Allocation | null;
  // Resolved on-shift vehicle: the allocation's vehicle, or (for a shift open
  // from a previous day with no allocation today) the active shift's vehicle.
  vehicle: { _id?: string; reg: string; type: string; capacity?: number } | null;
  activeShift: { _id: string; status: string; vehicleId: string } | null;
  deliveries: Delivery[];
  orders: { _id: string }[];
}

export interface Order {
  _id: string;
  productId?: ProductRef;
  quantity: number;
  sourceHubId?: LocationRef;
  destinationId?: LocationRef;
  deliveryDate: string;
  startTime?: string | null;
  assignedDriverId?: { _id: string; name: string } | null;
  status: string;
}

export type OrderCounts = Record<string, number>;

/** Cursor-paginated list envelope returned by the CRUD list endpoints. */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/** A single active condition from the FilterBuilder. */
export type FilterOp = "in" | "nin" | "before" | "after" | "between";
export interface ListFilter {
  field: string;
  op: FilterOp;
  values: string[];
}

/** Describes a filterable field for the FilterBuilder. */
export interface FilterFieldDef {
  key: string;
  label: string;
  type: "select" | "date";
  options?: { value: string; label: string }[]; // required for type "select"
}

export interface Movement {
  _id: string;
  productId?: ProductRef;
  fromLocationId?: LocationRef;
  toLocationId?: LocationRef;
  quantity: number;
  completedAt: string;
}

export interface Location {
  _id: string;
  type: "hub" | "terminal";
  name: string;
  lat: number;
  lng: number;
  inventory?: Record<string, number>;
}

export interface Product {
  _id: string;
  name: string;
  unit: string;
}

export type InventoryBand = "low" | "warn" | "ok";

export interface InventoryCell {
  productId: string;
  productName: string;
  unit?: string;
  qty: number;
  band: InventoryBand;
}

export interface InventoryRow {
  locationId: string;
  locationName: string;
  type: string;
  products: InventoryCell[];
}

export interface InventoryResponse {
  thresholds: { low: number; warn: number };
  rows: InventoryRow[];
}
