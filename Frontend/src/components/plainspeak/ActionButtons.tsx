console.log("ActionButtons rendered");

import React from "react";
import { Sparkles, Languages, Loader2 } from "lucide-react";
import { useAuth } from "./contexts/AuthContext";

type Language = "en" | "es" | "vi" | "tl";
interface ActionButtonsProps {
  onSimplify: () => void;
  onTranslate: () => void;
  isLoading: boolean;
  disabled?: boolean;
  targetLanguage: Language;
}

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 " +
  "rounded-md bg-slate-900 px-4 py-2 " +
  "text-sm font-medium text-white " +
  "hover:bg-slate-800 " +
  "focus:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-slate-400 focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 " +
  "rounded-md border border-slate-300 px-4 py-2 " +
  "text-sm text-slate-900 " +
  "hover:bg-slate-50 " +
  "focus:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-slate-400 focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSimplify,
  onTranslate,
  isLoading,
  disabled,
  targetLanguage,
}) => {
  const { user } = useAuth();
  const canUseApp = Boolean(user);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Primary: Simplify */}
      <button
        type="button"
        onClick={onSimplify}
        disabled={!canUseApp || disabled || isLoading}
        aria-busy={isLoading}
        className={primaryButtonClass}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Working…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Simplify
          </>
        )}
      </button>

{/* Secondary: Translate */}
<button
  type="button"
  onClick={onTranslate}
  disabled={!canUseApp || disabled || isLoading}
  aria-busy={isLoading}
  className={secondaryButtonClass}
>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Working…
    </>
  ) : (
    <>
      <Languages className="h-4 w-4" />
      Translate to{" "}
      {targetLanguage === "es"
        ? "Spanish"
        : targetLanguage === "vi"
        ? "Vietnamese"
        : targetLanguage === "tl"
        ? "Tagalog"
        : "English"}
    </>
  )}
</button>
    </div>
  );
};

export default ActionButtons;
