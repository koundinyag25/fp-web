import {
  ArrowLeftRight,
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

export interface NavSection {
  title: string;
  items: NavEntry[];
}

// Grouped by the FRD's admin functional areas (§5.1–5.5b) so the rail reads as
// sections rather than one flat list.
export const ADMIN_NAV: NavSection[] = [
  {
    title: "Overview",
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
      { to: "/admin/fleet", icon: Map, label: "Fleet Map" },
    ],
  },
  {
    title: "Master data",
    items: [
      { to: "/admin/locations", icon: MapPin, label: "Locations" },
      { to: "/admin/products", icon: Package, label: "Products" },
      { to: "/admin/drivers", icon: UserCheck, label: "Drivers" },
      { to: "/admin/vehicles", icon: Truck, label: "Vehicles" },
    ],
  },
  {
    title: "Operations",
    items: [
      { to: "/admin/orders", icon: Receipt, label: "Orders" },
      { to: "/admin/allocations", icon: ClipboardList, label: "Allocations" },
    ],
  },
  {
    title: "Inventory",
    items: [
      { to: "/admin/inventory", icon: Warehouse, label: "Inventory" },
      // { to: "/admin/movements", icon: ArrowLeftRight, label: "Movements" },
    ],
  },
];
