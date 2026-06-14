import { createContext, useContext } from "react";

export type ToastTone = "success" | "error" | "info";

export interface ToastInput {
  message: string;
  tone?: ToastTone;
}

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

export interface ToastApi {
  show: (toast: ToastInput) => void;
}

// Default is a no-op so calling useToast() outside a provider (e.g. in tests) is
// safe; ToastProvider supplies the real implementation.
export const ToastContext = createContext<ToastApi>({ show: () => {} });

/** Fire transient success/error/info notifications. */
export const useToast = (): ToastApi => useContext(ToastContext);
