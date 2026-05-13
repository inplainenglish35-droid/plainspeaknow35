import { useRef, useState } from "react";
import type { ChangeEvent } from "react";

interface InputMethodsProps {
  inputText: string;
  setInputText: (value: string) => void;
  onFileSelected?: (file: File) => void;
}

export function InputMethods({
  inputText,
  setInputText,
  onFileSelected,
}: InputMethodsProps) {
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handlePasteClick = async () => {
    setError("");

    try {
      const text = await navigator.clipboard.readText();

      if (!text.trim()) {
        setError("Clipboard is empty.");
        return;
      }

      setInputText(text);
    } catch {
      textareaRef.current?.focus();
      setError("Paste directly into the text box below.");
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    const name = file.name.toLowerCase();

    const supported =
      name.endsWith(".txt") ||
      name.endsWith(".pdf") ||
      name.endsWith(".docx") ||
      name.endsWith(".csv") ||
      name.endsWith(".xlsx");

    if (!supported) {
      setError(
        "Unsupported file type. Upload PDF, TXT, DOCX, CSV, or XLSX. Photos and screenshots are not supported."
      );
      e.target.value = "";
      return;
    }

    if (file.type === "text/plain" || name.endsWith(".txt")) {
      const reader = new FileReader();

      reader.onload = () => {
        const text = String(reader.result || "");
        setInputText(text);
      };

      reader.onerror = () => {
        setError("Could not read that file.");
      };

      reader.readAsText(file);
      e.target.value = "";
      return;
    }

    if (onFileSelected) {
      onFileSelected(file);
    } else {
      setError("Document upload is not wired yet.");
    }

    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handlePasteClick}
          className="rounded-md border border-slate-300 px-3 py-2 transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
        >
          Paste text
        </button>

        <label className="cursor-pointer rounded-md border border-slate-300 px-3 py-2 transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">
          Upload document
          <input
            type="file"
            accept=".pdf,.txt,.docx,.csv,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <textarea
        ref={textareaRef}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste or type your confusing text here..."
        className="min-h-48 w-full rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Supports PDF, TXT, DOCX, CSV, and XLSX. Photos and screenshots are not supported.
      </p>
    </div>
  );
}







