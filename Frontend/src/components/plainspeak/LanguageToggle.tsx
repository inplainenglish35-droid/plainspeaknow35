import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { cn } from '../../lib/utils';
type Language = "en" | "es";

interface LanguageToggleProps {
  currentLanguage: Language;
  targetLanguage: Language;
  onToggle: () => void;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  targetLanguage,
  onToggle,
  className,
}) => {
  const languageLabels: Record<Language, { short: string; full: string; flag: string }> = {
  en: { short: "EN", full: "English", flag: "us" },
  es: { short: "ES", full: "Español", flag: "es" },
};

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {/* Source language */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
          'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
          'shadow-sm'
        )}
      >
        <span className="text-lg" role="img" aria-label={languageLabels[currentLanguage].full}>
          {languageLabels[currentLanguage].flag}
        </span>
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {languageLabels[currentLanguage].full}
        </span>
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={cn(
          'p-3 rounded-full transition-all',
          'bg-gradient-to-r from-teal-500 to-blue-500 text-white',
          'hover:from-teal-600 hover:to-blue-600',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
          'shadow-md hover:shadow-lg',
          'active:scale-95'
        )}
        aria-label={`Switch translation direction from ${languageLabels[currentLanguage].full} to ${languageLabels[targetLanguage].full}`}
      >
        <ArrowLeftRight className="w-5 h-5" />
      </button>

      {/* Target language */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
          'bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700',
          'shadow-sm'
        )}
      >
        <span className="text-lg" role="img" aria-label={languageLabels[targetLanguage].full}>
          {languageLabels[targetLanguage].flag}
        </span>
        <span className="font-medium text-teal-700 dark:text-teal-300">
          {languageLabels[targetLanguage].full}
        </span>
      </div>
    </div>
  );
};
