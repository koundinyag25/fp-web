import { Navigation } from "lucide-react";

/** The FleetPanda wordmark — icon + name. One source of truth so the admin shell
 *  and the driver app render identical branding. */
export const Brand = () => (
  <div className="flex items-center gap-2">
    <Navigation size={18} strokeWidth={1.75} className="text-primary" />
    <span className="font-mono text-code-md font-bold uppercase tracking-wider text-on-surface">
      FleetPanda
    </span>
  </div>
);
