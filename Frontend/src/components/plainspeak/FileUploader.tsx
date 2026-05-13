import React, { useCallback, useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface FileUploaderProps {
  onTextExtracted: (text: string) => void;
  isProcessing: boolean;
  className?: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export const FileUploader: React.FC<FileUploaderProps> = ({
  onTextExtracted,
  isProcessing,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [localProcessing, setLocalProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processing = isProcessing || localProcessing;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setLocalProcessing(true);

      try {
        if (file.size > MAX_FILE_SIZE) {
          throw new Error("File size exceeds 25MB limit. Please use a smaller file.");
        }

        const name = file.name.toLowerCase();
        setUploadedFile(file.name);

        const supported =
          name.endsWith(".txt") ||
          name.endsWith(".pdf") ||
          name.endsWith(".docx") ||
          name.endsWith(".csv") ||
          name.endsWith(".xlsx");

        if (!supported) {
          throw new Error(
            "Unsupported file type. Please upload PDF, TXT, DOCX, CSV, or XLSX. Photos and screenshots are not supported."
          );
        }

        if (name.endsWith(".txt")) {
          const text = await file.text();
          onTextExtracted(text);
          return;
        }

        throw new Error(
          "This file type must be processed by the document upload API. If this message appears, the upload connection needs to be wired in the parent file."
        );
      } catch (err) {
        console.error("File processing error:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to process file. Please try again."
        );
        setUploadedFile(null);
      } finally {
        setLocalProcessing(false);
      }
    },
    [onTextExtracted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setUploadedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.docx,.csv,.xlsx"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload text-based document"
      />

      <div
        onClick={!processing ? handleClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Drop zone for document upload"
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
          isDragging
            ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800/50",
          processing && "pointer-events-none opacity-70"
        )}
      >
        {processing ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Processing document...
            </p>
          </div>
        ) : uploadedFile ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[200px]">
                {uploadedFile}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <Upload className="w-8 h-8 text-gray-400" />

            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Drop a document here or click to upload
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports PDF, TXT, DOCX, CSV, and XLSX. Photos and screenshots are not supported.
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
