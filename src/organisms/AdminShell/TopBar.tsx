import { Bell, Menu } from "lucide-react";
import { Avatar } from "@/atoms/Avatar";
import { IconButton } from "@/atoms/IconButton";
import { SearchInput } from "@/atoms/SearchInput";

interface TopBarProps {
  breadcrumb: string;
  onOpenMenu: () => void;
}

export const TopBar = ({ breadcrumb, onOpenMenu }: TopBarProps) => (
  <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border-hairline bg-surface-container px-panel">
    <div className="flex items-center gap-4">
      <IconButton icon={Menu} label="Open menu" onClick={onOpenMenu} className="lg:hidden" />
      <span className="font-mono text-code-sm uppercase tracking-wider text-on-surface-variant">
        {breadcrumb}
      </span>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden sm:block">
        <SearchInput placeholder="Search ID…" />
      </div>
      <IconButton icon={Bell} label="Notifications" dot />
      <Avatar />
    </div>
  </header>
);
