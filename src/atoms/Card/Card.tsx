import type { ReactNode } from "react";

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <div className={`rounded border border-border-hairline bg-surface-container p-panel ${className}`}>
      {children}
    </div>
  );
}
