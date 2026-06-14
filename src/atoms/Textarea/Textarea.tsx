import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = ({ invalid, className = "", ...rest }: TextareaProps) => (
  <textarea
    className={`min-h-[88px] w-full rounded border bg-surface-recessed px-3 py-2 text-body-md placeholder-on-surface-variant/40 focus:outline-none ${
      invalid
        ? "border-critical text-critical focus:border-critical"
        : "border-border-hairline text-on-surface focus:border-primary"
    } ${className}`}
    {...rest}
  />
);
