import { X } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "@/atoms/IconButton";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

// Responsive: bottom sheet on mobile, centered glass panel on desktop.
export const Modal = ({ open, title, onClose, children, footer }: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="pg-glass relative z-10 flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t border border-border-hairline p-6 md:h-auto md:max-w-md md:rounded">
        <header className="mb-6 flex items-center justify-between">
          <h2 className="text-headline-md text-on-surface">{title}</h2>
          <IconButton icon={X} label="Close" onClick={onClose} />
        </header>
        <div className="flex-1">{children}</div>
        {footer && (
          <footer className="mt-6 flex flex-col justify-end gap-3 md:flex-row">{footer}</footer>
        )}
      </div>
    </div>
  );
};
