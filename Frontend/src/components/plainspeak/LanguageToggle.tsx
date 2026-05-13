import React from "react";
import { cn } from "../../lib/utils";

type Language = "en" | "es" | "vi" | "tl";

interface LanguageToggleProps {
  currentLanguage: Language;
  onChange: (language: Language) => void;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onChange,
  className,
}) => {
  const languageLabels: Record<Language, string> = {
    en: "English",
    es: "Spanish",
    vi: "Vietnamese",
    tl: "Tagalog",
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Output language
      </label>

      <select
        value={currentLanguage}
        onChange={(e) => onChange(e.target.value as Language)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        {Object.entries(languageLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};
