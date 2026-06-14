import type { InventoryBand } from "@/types";

/** Cell tone per low-stock band (FR-IN-2): low = red, warning = amber, ok =
 *  normal. Background tint + text so a flagged cell reads at a glance. */
export const INVENTORY_BAND_CLASS: Record<InventoryBand, string> = {
  low: "bg-critical/15 text-critical font-semibold",
  warn: "bg-warning/15 text-warning",
  ok: "text-on-surface",
};
