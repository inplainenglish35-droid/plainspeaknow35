import { useState, useEffect } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function PuppyAssistant({ visible, onClose }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Trigger entry animation when it becomes visible
  useEffect(() => {
    if (visible) {
      setAnimateIn(true);
    }
  }, [visible]);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-end gap-3">

      {/* Speech bubble */}
      <div
        className={`
          bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 max-w-xs
          transition-all duration-300
          ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
      >
        <p className="mb-2 leading-snug">
          Want help getting started?
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-teal-600 text-white text-xs hover:bg-teal-700"
          >
            Yes
          </button>

          <button
            onClick={() => {
              setDismissed(true);
              onClose();
            }}
            className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs hover:bg-slate-200"
          >
            Not now
          </button>
        </div>
      </div>

      {/* Puppy avatar */}
      <div
        className={`
          w-20 h-20 rounded-full overflow-hidden shadow-md border border-slate-200 bg-white
          flex items-center justify-center
          transition-transform duration-300
          ${animateIn ? "translate-y-0" : "translate-y-2"}
        `}
      >
        {/* Breathing animation wrapper */}
        <div className="animate-[puppy-breathe_4s_ease-in-out_infinite]">

          {/* Slight tilt when appearing */}
          <div className={animateIn ? "animate-[puppy-tilt_0.6s_ease-in-out]" : ""}>

            <img
              src="/puppy.png"
              alt="Plainspeak Assistant"
              className="w-full h-full object-cover"
            />

          </div>
        </div>
      </div>
    </div>
  );
}