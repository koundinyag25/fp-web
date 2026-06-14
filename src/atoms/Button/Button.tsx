import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-primary-on border border-primary hover:opacity-90",
  secondary: "bg-transparent text-primary border border-primary/60 hover:border-primary",
  ghost: "bg-transparent text-on-surface-variant border border-transparent hover:bg-surface-hover",
  danger: "bg-transparent text-critical border border-critical/50 hover:border-critical",
};

export const Button = ({ variant = "secondary", className = "", ...rest }: ButtonProps) => {
  return (
    <button
      className={`rounded px-3 py-1.5 text-body-md transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
