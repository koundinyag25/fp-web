import {
  ClipboardList,
  LayoutDashboard,
  Map,
  MapPin,
  Package,
  Receipt,
  Truck,
  UserCheck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export interface NavEntry {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

export const ADMIN_NAV: NavEntry[] = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/locations", icon: MapPin, label: "Locations" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/drivers", icon: UserCheck, label: "Drivers" },
  { to: "/admin/vehicles", icon: Truck, label: "Vehicles" },
  { to: "/admin/orders", icon: Receipt, label: "Orders" },
  { to: "/admin/allocations", icon: ClipboardList, label: "Allocations" },
  { to: "/admin/fleet", icon: Map, label: "Fleet Map" },
  { to: "/admin/inventory", icon: Warehouse, label: "Inventory" },
];
