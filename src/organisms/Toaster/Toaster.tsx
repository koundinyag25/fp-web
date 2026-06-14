import { useCallback, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ToastContext, type ToastInput, type ToastItem } from "@/hooks/useToast";
import { Toast } from "@/molecules/Toast";

const AUTO_DISMISS_MS = 4000;

/** Holds the toast queue, exposes `show` via context, and renders the stack in
 *  a portal (bottom-right). Auto-dismisses each toast after a few seconds. */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (input: ToastInput) => {
      const id = (idRef.current += 1);
      setToasts((ts) => [...ts, { id, message: input.message, tone: input.tone ?? "info" }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
          {toasts.map((t) => (
            <Toast key={t.id} tone={t.tone} message={t.message} onClose={() => dismiss(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
