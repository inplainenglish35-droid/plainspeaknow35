import { cn } from "../../lib/utils";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

export function Toast({
  title,
  description,
  variant = "default",
}: ToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-lg shadow-lg p-4 mb-3 border",
        variant === "success" && "bg-green-50 border-green-300",
        variant === "destructive" && "bg-red-50 border-red-300",
        variant === "default" && "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      )}
    >
      {title && (
        <h3 className="text-sm font-semibold mb-1 dark:text-white">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
      )}
    </div>
  );
}

export function ToastContainer({
  toasts,
}: {
  toasts: ToastProps[];
}) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
}
