import React from "react";
import {
  Copy,
  Download,
  Check,
  BookOpen,
  FileText,
  BarChart3,
  Share2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import type { TextStats } from "./types";
import { useAuth } from "./contexts/AuthContext";

interface ResultsDisplayProps {
  originalText: string;
  simplifiedText: string;
  stats: TextStats | null;
  className?: string;
  onShare?: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  originalText,
  simplifiedText,
  stats,
  className,
  onShare,
}) => {
  const { user } = useAuth();

  const [copiedOriginal, setCopiedOriginal] = React.useState(false);
  const [copiedSimplified, setCopiedSimplified] = React.useState(false);

  const copyToClipboard = async (
    text: string,
    type: "original" | "simplified"
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "original") {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedSimplified(true);
        setTimeout(() => setCopiedSimplified(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 🔒 HARD GATE: not signed in
  if (!user) {
    return (
      <div
        className={cn(
          "mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400",
          className
        )}
      >
        Sign in to view simplified results.
      </div>
    );
  }

  // No results yet
  if (!simplifiedText) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats bar */}
      {stats && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-teal-200 dark:border-teal-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                Text Stats
              </h3>
            </div>
            {onShare && (
              <button
                onClick={onShare}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-teal-600 hover:to-blue-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {stats.wordCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Words</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.sentenceCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sentences
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.avgWordsPerSentence}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Words/Sentence
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison view */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Original text */}
        {originalText && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Original
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(originalText, "original")
                }
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                {copiedOriginal ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {originalText}
              </p>
            </div>
          </div>
        )}

        {/* Simplified text */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-teal-200 dark:border-teal-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-teal-50 dark:bg-teal-900/30 border-b border-teal-200 dark:border-teal-700">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-teal-700 dark:text-teal-300">
                Simplified
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  copyToClipboard(simplifiedText, "simplified")
                }
                className="p-1.5 hover:bg-teal-100 dark:hover:bg-teal-800 rounded transition-colors"
              >
                {copiedSimplified ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
              </button>
              <button
                onClick={() =>
                  downloadText(
                    simplifiedText,
                    "simplified-text.txt"
                  )
                }
                className="p-1.5 hover:bg-teal-100 dark:hover:bg-teal-800 rounded transition-colors"
              >
                <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </button>
            </div>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            <p className="text-base text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">
              {simplifiedText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

