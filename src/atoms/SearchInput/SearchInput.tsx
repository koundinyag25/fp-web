import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  widthClass?: string;
}

export const SearchInput = ({ widthClass = "w-56", className = "", ...rest }: SearchInputProps) => (
  <div className={`relative ${widthClass}`}>
    <Search
      size={14}
      strokeWidth={1.75}
      className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-outline"
    />
    <input
      type="text"
      className={`h-8 w-full rounded border border-border-hairline bg-surface-recessed pl-8 pr-3 font-mono text-code-sm text-on-surface placeholder-outline focus:border-primary focus:outline-none ${className}`}
      {...rest}
    />
  </div>
);
