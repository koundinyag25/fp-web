import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, actions }: PageHeaderProps) => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-headline-md text-on-surface">{title}</h1>
      {actions}
    </div>
  );
}
