import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Brand } from "@/atoms/Brand";

/** Driver-app page wrapper: a centered column with a header (brand + a link back
 *  to the persona picker). `max` widens the column for the trips grid. */
export const Shell = ({
  children,
  max = "max-w-md",
}: {
  children: ReactNode;
  max?: string;
}) => (
  <div className={`mx-auto flex min-h-screen w-full ${max} flex-col px-4 pb-10`}>
    <header className="flex h-14 shrink-0 items-center justify-between">
      <Brand />
      <Link to="/" className="text-body-sm text-on-surface-variant hover:text-on-surface">
        ← personas
      </Link>
    </header>
    {children}
  </div>
);
