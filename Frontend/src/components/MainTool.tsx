import { useEffect, useRef, useState } from "react";
import { AudioPlayer } from "./plainspeak/AudioPlayer";
import { useAuth } from "./plainspeak/contexts/AuthContext";
import { auth } from "../lib/firebase";

const API_URL = import.meta.env.VITE_API_URL ?? "";

console.log("VITE_API_URL:", API_URL);
export default function MainTool() {
  const { user } = useAuth();

  const language = "en";
  const MAX_AUDIO_GENERATIONS = 3;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [inputText, setInputText] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioGenerationCount, setAudioGenerationCount] = useState(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function getAuthToken() {
    const currentUser = auth.currentUser || user;

    if (!currentUser) {
      throw new Error("Please sign in before using Plainspeak.");
    }

    return await currentUser.getIdToken(true);
  }

  async function getJsonAuthHeaders() {
    const token = await getAuthToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async function getFormAuthHeaders() {
    const token = await getAuthToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  const clearPreviousResult = () => {
    setOutputText("");
    setCopied(false);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    setAudioGenerationCount(0);
  };

  const handlePasteText = async () => {
    try {
      const pasted = await navigator.clipboard.readText();

      if (!pasted.trim()) {
        setErrorMessage("Clipboard is empty.");
        return;
      }

      setInputText(pasted);
      setSelectedFileName("");
      setErrorMessage(null);
      clearPreviousResult();
    } catch {
      const pasted = window.prompt("Paste your text here:");

      if (pasted?.trim()) {
        setInputText(pasted);
        setSelectedFileName("");
        setErrorMessage(null);
        clearPreviousResult();
      }
    }
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();

    const allowed =
      name.endsWith(".pdf") ||
      name.endsWith(".txt") ||
      name.endsWith(".docx") ||
      name.endsWith(".csv") ||
      name.endsWith(".xlsx");

    if (!allowed) {
      setSelectedFileName("");
      setErrorMessage(
        "Please upload PDF, TXT, DOCX, CSV, or XLSX. Photos and screenshots are not supported."
      );
      event.target.value = "";
      return;
    }

    try {
      setExtracting(true);
      setErrorMessage(null);
      setSelectedFileName("");
      clearPreviousResult();

      const headers = await getFormAuthHeaders();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/extract-text`, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Plainspeak could not read this file."
        );
      }

      const extractedText = data?.text || "";

      if (!extractedText.trim()) {
        throw new Error("No readable text was found in this file.");
      }

      setInputText(extractedText);
      setSelectedFileName(file.name);
    } catch (err: any) {
      console.error("File extraction error:", err);
      setSelectedFileName("");
      setErrorMessage(err.message || "Could not read this file.");
    } finally {
      setExtracting(false);
      event.target.value = "";
    }
  };

  const handleSimplify = async () => {
    const trimmedInput = inputText.trim();

    if (!trimmedInput) {
      setErrorMessage("Please enter, paste, or upload text first.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      clearPreviousResult();

      const headers = await getJsonAuthHeaders();

      const res = await fetch(`${API_URL}/api/simplify`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: trimmedInput,
          language,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Plainspeak could not process this document."
        );
      }

      setOutputText(data?.output || data?.result || "");
    } catch (err: any) {
      console.error("Simplify error:", err);
      setErrorMessage(err.message || "Failed to process document.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!outputText) return;

    if (audioGenerationCount >= MAX_AUDIO_GENERATIONS) {
      setErrorMessage("Audio limit reached for this result.");
      return;
    }

    try {
      setIsGeneratingAudio(true);
      setErrorMessage(null);

      const headers = await getJsonAuthHeaders();

      const res = await fetch(`${API_URL}/api/generate-audio`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: outputText }),
      });

      if (!res.ok) {
        throw new Error("Audio generation failed.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioUrl) URL.revokeObjectURL(audioUrl);

      setAudioUrl(url);
      setAudioGenerationCount((prev) => prev + 1);
    } catch (err: any) {
      console.error("Audio error:", err);
      setErrorMessage(err.message || "Audio generation failed.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;

    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage("Could not copy the result.");
    }
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 text-slate-900 dark:text-white">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900/70">
        <h1 className="mb-2 text-2xl font-bold text-slate-950 dark:text-white">
          Turn confusing text into clear words
        </h1>

        <p className="mb-5 text-sm text-slate-600 dark:text-slate-300">
          Upload a text-based document, paste text, or type directly.
          Plainspeak will turn it into clear, plain-English help.
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePasteText}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Paste text
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={extracting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {extracting ? "Reading document..." : "Upload document"}
          </button>

          <input
            ref={fileInputRef}
            id="documentFile"
            name="documentFile"
            type="file"
            accept=".pdf,.txt,.docx,.csv,.xlsx"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>

        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Supports PDF, TXT, DOCX, CSV, and XLSX. Photos and screenshots are not supported.
        </p>

        {selectedFileName && (
          <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-100">
            File loaded: {selectedFileName}
          </p>
        )}

        <label
          htmlFor="documentText"
          className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Document text
        </label>

        <textarea
          id="documentText"
          name="documentText"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setSelectedFileName("");
            setErrorMessage(null);
            clearPreviousResult();
          }}
          placeholder="Paste, type, or upload a text-based document..."
          className="min-h-48 w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-100">
          Plainspeak helps explain confusing documents in clearer language. It
          does not provide legal, medical, financial, or professional advice.
          For decisions about your rights, health, benefits, or obligations,
          please contact a qualified professional.
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleSimplify}
            disabled={loading || extracting || !inputText.trim()}
            className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Reading your text..."
              : extracting
                ? "Extracting text..."
                : "Help me understand"}
          </button>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400/60 dark:bg-red-950/40 dark:text-red-100">
          {errorMessage}
        </div>
      )}

      {outputText && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              Plainspeak result
            </h2>

            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {copied ? "Copied!" : "Copy result"}
            </button>
          </div>

          <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-slate-800 dark:bg-slate-950/60 dark:text-slate-100">
            {outputText}
          </div>

          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-100">
            Reminder: this plain-language result is for understanding only. It
            is not legal, medical, financial, or professional advice.
          </p>

          <div className="mt-4">
            <AudioPlayer
              audioUrl={audioUrl}
              text={outputText}
              isGenerating={isGeneratingAudio}
              onGenerate={handleGenerateAudio}
            />
          </div>
        </section>
      )}
    </main>
  );
}
