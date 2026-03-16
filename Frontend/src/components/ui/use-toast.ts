import { useState, useCallback } from "react";
import type { ToastProps } from "./toast";

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(
    (toast: Omit<ToastProps, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const newToast: ToastProps = { id, ...toast };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  return { toast, toasts };
}
