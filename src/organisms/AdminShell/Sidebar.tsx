import { Brand } from "@/atoms/Brand";
import { NavItem } from "@/atoms/NavItem";
import { ADMIN_NAV } from "./nav";

export const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => (
  <div className="flex h-full w-sidebar flex-col border-r border-border-hairline bg-surface-container">
    <div className="flex h-14 items-center border-b border-border-hairline px-panel">
      <Brand />
    </div>
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2 py-3">
      {ADMIN_NAV.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <span className="px-3 py-1 font-mono text-label-caps uppercase text-outline">
            {section.title}
          </span>
          {section.items.map((item) => (
            <NavItem key={item.to} {...item} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
    <div className="flex items-center justify-center gap-2 border-t border-border-hairline p-panel">
      <span className="font-mono text-label-caps uppercase text-outline">
        <span className="text-success">●</span> API connected
      </span>
    </div>
  </div>
);
