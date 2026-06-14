export const ORDER_STATUSES = [
  "pending",
  "assigned",
  "in_transit",
  "completed",
  "failed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DELIVERY_STATUSES = ["pending", "in_transit", "completed", "failed"] as const;

export const PRODUCT_UNITS = ["litre", "gallon", "kg", "lbs", "unit"] as const;

export const VEHICLE_TYPES = ["tanker", "van", "truck"] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];
