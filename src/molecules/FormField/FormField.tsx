import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode; // the control (Input / Select / …)
}

export const FormField = ({ label, error, hint, children }: FormFieldProps) => {
  const id = useId();
  // Associate the label with the control (and flag invalid) so each field is
  // reachable by its label in tests and to assistive tech.
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string; "aria-invalid"?: boolean }>, {
        id,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="font-mono text-label-caps uppercase tracking-wider text-on-surface-variant">
        {label}
      </label>
      {control}
      {error && <p className="font-mono text-label-caps text-critical">{error}</p>}
      {hint && !error && <p className="text-body-sm italic text-on-surface-variant/60">{hint}</p>}
    </div>
  );
};
