import { Navigation } from "lucide-react";
import { NavItem } from "@/atoms/NavItem";
import { ADMIN_NAV } from "./nav";

export const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => (
  <div className="flex h-full w-sidebar flex-col border-r border-border-hairline bg-surface-container">
    <div className="flex h-14 items-center gap-2 border-b border-border-hairline px-panel">
      <Navigation size={18} strokeWidth={1.75} className="text-primary" />
      <span className="font-mono text-code-md font-bold uppercase tracking-wider text-on-surface">
        FleetPanda
      </span>
    </div>
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
      <span className="px-3 py-1 font-mono text-label-caps uppercase text-outline">Admin</span>
      {ADMIN_NAV.map((item) => (
        <NavItem key={item.to} {...item} onNavigate={onNavigate} />
      ))}
    </nav>
    <div className="flex items-center justify-center gap-2 border-t border-border-hairline p-panel">
      <span className="font-mono text-label-caps uppercase text-outline">
        <span className="text-success">●</span> API connected
      </span>
    </div>
  </div>
);
