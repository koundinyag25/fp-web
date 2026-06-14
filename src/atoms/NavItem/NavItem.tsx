import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  onNavigate?: () => void; // e.g. close the mobile drawer
}

export const NavItem = ({ to, icon: Icon, label, end, onNavigate }: NavItemProps) => (
  <NavLink
    to={to}
    end={end}
    onClick={onNavigate}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded border-l-2 px-3 py-2 text-body-md transition-colors ${
        isActive
          ? "border-primary bg-surface-hover text-on-surface"
          : "border-transparent text-on-surface-variant hover:bg-surface-hover"
      }`
    }
  >
    <Icon size={16} strokeWidth={1.75} />
    <span>{label}</span>
  </NavLink>
);
