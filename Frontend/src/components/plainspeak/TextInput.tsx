import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 " +
  "px-4 py-3 text-slate-900 placeholder-slate-400 " +
  "text-base leading-relaxed " +
  "focus:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-slate-400 focus-visible:ring-offset-2 " +
  "disabled:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed";

export function TextInput({
  value,
  onChange,
  placeholder = "Paste or type your text here…",
  maxLength = 10000,
  disabled = false,
  className,
}: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea safely
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
  }, [value]);

  const handleClear = () => {
    onChange("");
    textareaRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full", className)}>
      <textarea
        id="text-input"
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        rows={4}
        className={cn(inputClass, "min-h-[96px] resize-y")}
        aria-disabled={disabled}
      />

      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear text"
          className="
            absolute right-2 top-2
            rounded-md p-1
            text-slate-400
            hover:text-slate-700
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-slate-400
          "
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}


