import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = ({ invalid, className = "", children, ...rest }: SelectProps) => (
  <select
    className={`min-h-[44px] w-full rounded border bg-surface-recessed px-3 py-2 text-body-md text-on-surface focus:outline-none ${
      invalid ? "border-critical focus:border-critical" : "border-border-hairline focus:border-primary"
    } ${className}`}
    {...rest}
  >
    {children}
  </select>
);
