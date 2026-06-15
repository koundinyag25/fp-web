import { Navigation } from "lucide-react";
import { Link } from "react-router-dom";

/** The FleetPanda wordmark — icon + name, linking to the landing / persona
 *  picker. One source of truth so the admin shell and driver app render
 *  identical branding (and both get "click logo → home"). */
export const Brand = () => (
  <Link
    to="/"
    aria-label="FleetPanda — home"
    className="flex items-center gap-2 transition-opacity hover:opacity-80"
  >
    <Navigation size={18} strokeWidth={1.75} className="text-primary" />
    <span className="font-mono text-code-md font-bold uppercase tracking-wider text-on-surface">
      FleetPanda
    </span>
  </Link>
);
