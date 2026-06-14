import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = ({ invalid, className = "", ...rest }: InputProps) => (
  <input
    className={`min-h-[44px] w-full rounded border bg-surface-recessed px-3 py-2 text-body-md placeholder-on-surface-variant/40 focus:outline-none ${
      invalid
        ? "border-critical text-critical focus:border-critical"
        : "border-border-hairline text-on-surface focus:border-primary"
    } ${className}`}
    {...rest}
  />
);
