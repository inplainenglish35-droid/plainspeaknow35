import React from "react";
import { Sparkles, ChevronDown, Check } from "lucide-react";
import { cn } from "../../lib/utils";

export type SimplicityMode = "clear" | "short" | "detailed";

interface SimplicitySelectorProps {
  selectedMode: SimplicityMode;
  onModeChange: (mode: SimplicityMode) => void;
  disabled?: boolean;
}

const OPTIONS: {
  label: string;
  value: SimplicityMode;
  description: string;
}[] = [
  {
    label: "Clear",
    value: "clear",
    description: "Balanced clarity and completeness."
  },
  {
    label: "Shorter",
    value: "short",
    description: "More concise version."
  },
  {
    label: "Detailed",
    value: "detailed",
    description: "Keeps more explanation."
  }
];

export const SimplicitySelector: React.FC<SimplicitySelectorProps> = ({
  selectedMode,
  onModeChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = OPTIONS.find(o => o.value === selectedMode);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Clarity Style
        </span>
      </div>

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
          "hover:border-slate-400 dark:hover:border-slate-500 transition",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {selected?.label}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {selected?.description}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {OPTIONS.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onModeChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-3 flex items-start gap-3 transition",
                "hover:bg-slate-50 dark:hover:bg-gray-700",
                selectedMode === option.value && "bg-slate-50 dark:bg-gray-700"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                  {selectedMode === option.value && (
                    <Check className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

