import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";

interface InputMethodsProps {
  onFileSelected?: (file: File) => void; // ✅ now optional (prevents crash)
  onPaste?: () => void;
}

export function InputMethods({
  onFileSelected,
  onPaste,
}: InputMethodsProps) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  /* =========================
     CLEANUP (prevent memory leak)
  ========================= */
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  /* =========================
     FILE HANDLING
  ========================= */

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Image → preview first
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewFile(file);
      setPreviewUrl(url);
    } else {
      onFileSelected?.(file); // ✅ SAFE CALL
    }

    e.target.value = "";
  };

  const handleConfirm = () => {
    if (previewFile) {
      onFileSelected?.(previewFile); // ✅ SAFE CALL
      setPreviewFile(null);
      setPreviewUrl(null);
    }
  };

  const handleRetake = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  /* =========================
     UI
  ========================= */

  return (
    <div className="flex flex-col gap-3 text-sm">

      {/* Buttons */}
      <div className="flex gap-3 items-center">

        <button
          type="button"
          onClick={() => onPaste?.()}
          className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1 
          hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          Paste text
        </button>

        <label className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1 
        hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition">
          Upload file
          <input
            type="file"
            accept=".txt,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <label className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1 
        hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition">
          Take photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="flex flex-col gap-2 mt-3 border border-slate-200 dark:border-slate-700 
        p-3 rounded-md bg-slate-50 dark:bg-slate-800 transition">

          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-64 object-contain rounded-md border"
          />

          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="rounded-md bg-blue-600 text-white px-3 py-1 hover:bg-blue-700 transition"
            >
              Use this photo
            </button>

            <button
              onClick={handleRetake}
              className="rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1 
              hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Retake photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}







