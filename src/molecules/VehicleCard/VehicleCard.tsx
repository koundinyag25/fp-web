import { Truck } from "lucide-react";
import { Chip } from "@/atoms/Chip";

interface VehicleCardProps {
  reg: string;
  type: string;
  capacity?: number;
}

/** Driver landing hero — celebrates the vehicle assigned for the day (FR-SV-1). */
export const VehicleCard = ({ reg, type, capacity }: VehicleCardProps) => (
  <div className="rounded-lg border border-primary/40 bg-gradient-to-br from-primary/15 to-surface-container p-5">
    <div className="flex items-center gap-2 text-on-surface-variant">
      <Truck size={16} strokeWidth={1.75} />
      <span className="font-mono text-label-caps uppercase tracking-wider">Your vehicle today</span>
    </div>
    <p className="mt-3 text-body-sm text-on-surface-variant">You've been assigned</p>
    <p className="font-mono text-display-lg text-on-surface">{reg}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      <Chip tone="primary">{type}</Chip>
      {capacity != null && <Chip>{capacity} unit cap</Chip>}
    </div>
  </div>
);
