import React, { useState, useEffect, useCallback } from 'react';
import { History, Trash2, X, Clock, Sparkles, Languages, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Language, TextStats } from './types';

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'simplify' | 'translate';
  inputText: string;
  outputText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  stats?: TextStats | null;
}

interface HistoryPanelProps {
  onRestoreItem: (item: HistoryItem) => void;
  currentInputText: string;
  currentOutputText: string;
  currentType: 'simplify' | 'translate' | null;
  sourceLanguage: Language;
  targetLanguage: Language;
  stats: TextStats | null;
  className?: string;
}

const HISTORY_KEY = 'plainspeak-history';
const MAX_HISTORY_ITEMS = 10;

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  onRestoreItem,
  currentInputText,
  currentOutputText,
  currentType,
  sourceLanguage,
  targetLanguage,
  stats,
  className,
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as HistoryItem[];
        setHistory(parsed);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  // Save to history when processing completes
  useEffect(() => {
    if (currentOutputText && currentType && currentInputText) {
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        type: currentType,
        inputText: currentInputText,
        outputText: currentOutputText,
        sourceLanguage,
        targetLanguage,
        stats,
      };

      setHistory(prev => {
        // Check if this exact input/output combo already exists
        const exists = prev.some(
          item => item.inputText === newItem.inputText && item.outputText === newItem.outputText
        );
        if (exists) return prev;

        const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to save history:', err);
        }
        return updated;
      });
    }
  }, [currentOutputText, currentType, currentInputText, sourceLanguage, targetLanguage, stats]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  }, []);

  const deleteItem = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update history:', err);
      }
      return updated;
    });
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all',
          'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800',
          'border border-gray-200 dark:border-gray-700',
          'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2'
        )}
        aria-expanded={isExpanded}
        aria-controls="history-panel"
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-500" />
          <span className="font-medium text-gray-700 dark:text-gray-200">
            Recent History
          </span>
          <span className="px-2 py-0.5 text-xs bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-full">
            {history.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* History list */}
      {isExpanded && (
        <div
          id="history-panel"
          className="mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Header with clear button */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Click to restore
            </span>
            <button
              onClick={clearHistory}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              aria-label="Clear all history"
            >
              <Trash2 className="w-3 h-3" />
              Clear All
            </button>
          </div>

          {/* History items */}
          <div className="max-h-80 overflow-y-auto">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onRestoreItem(item)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0',
                  'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                  'focus:outline-none focus:bg-teal-50 dark:focus:bg-teal-900/20'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Type badge and time */}
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === 'simplify' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-full">
                          <Sparkles className="w-3 h-3" />
                          Simplified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2">
                          <Languages className="w-3 h-3" />
                          {item.sourceLanguage === "en" ? "EN → ES" : "ES → EN"}
                        </span> 
                      )}
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatTime(item.timestamp)}
                      </span>
                    </div>

                    {/* Preview text */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {truncateText(item.inputText)}
                    </p>
                    {item.stats && (
                      <p className="text-xs text-gray-400 mt-1">
                        {item.stats.wordCount} words • {item.stats.sentenceCount} sentences
                      </p>
                    )}

                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => deleteItem(item.id, e)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    aria-label="Delete this item"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
