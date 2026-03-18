import { useEffect } from "react";
import type { ModeType } from "./modes";

type Props = {
  mode: ModeType;
  onClose: () => void;
};

export default function ModeInfoModal({ mode, onClose }: Props) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-title"
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
        <h2 id="mode-title" className="text-lg font-semibold mb-2">
          {mode.label}
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Uses {mode.keys} Key{mode.keys > 1 && "s"}
        </p>

        <div className="space-y-2 text-sm text-gray-700">
          {mode.description.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}