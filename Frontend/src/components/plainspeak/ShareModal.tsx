import { useState } from "react";
import { X, Copy, Check, Loader2 } from "lucide-react";

import { cn } from "../../lib/utils";
import { useDocumentSharing } from "./hooks/useDocumentSharing";
import { useAuth } from "./contexts/AuthContext";
import type { TextStats } from "./types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  simplifiedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  stats: TextStats | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  originalText,
  simplifiedText,
  sourceLanguage,
  targetLanguage,
  stats
}) => {
  const { user } = useAuth();
  const { createShare, loading } = useDocumentSharing();

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    const result = await createShare(
      originalText,
      simplifiedText,
      sourceLanguage,
      targetLanguage,
      stats,
      {},
      user?.uid
    );

    if (result) {
      setShareUrl(result.shareUrl);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Document
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {!shareUrl ? (
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Share Link"
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <input
              value={shareUrl}
              readOnly
              className="w-full px-3 py-2 rounded border text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <button
              onClick={handleCopy}
              className={cn(
                "w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2",
                copied
                  ? "bg-green-500 text-white"
                  : "bg-teal-500 text-white hover:bg-teal-600"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

