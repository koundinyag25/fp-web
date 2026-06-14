import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string; // required for a11y on icon-only buttons
  dot?: boolean; // small unread/notification indicator
}

export const IconButton = ({ icon: Icon, label, dot = false, className = "", ...rest }: IconButtonProps) => (
  <button
    aria-label={label}
    className={`relative text-on-surface-variant transition-colors hover:text-on-surface ${className}`}
    {...rest}
  >
    <Icon size={20} strokeWidth={1.75} />
    {dot && <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-primary" />}
  </button>
);
