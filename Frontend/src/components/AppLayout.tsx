import { useState, useEffect, useCallback } from "react";
import { Header } from "./plainspeak/Header";
import { InputMethods } from "./plainspeak/InputMethods";
import { AudioPlayer } from "./plainspeak/AudioPlayer";
import { useAuth } from "./plainspeak/contexts/AuthContext";
import { translations } from "../i18n";

const API_URL = import.meta.env.VITE_API_URL ?? "";
const MAX_AUDIO_GENERATIONS = 3;

type Mode = "understand" | "organize" | "respond";

export default function AppLayout() {
  const { user } = useAuth();

  const [language, setLanguage] = useState<"en" | "es">("en");
  const [mode, setMode] = useState<Mode>("understand");

  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  const [summary, setSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [keyBalance, setKeyBalance] = useState<number | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioGenerationCount, setAudioGenerationCount] = useState(0);

  const getRequiredKeys = (mode: Mode) => {
    switch (mode) {
      case "understand":
        return 1;
      case "organize":
        return 2;
      case "respond":
        return 3;
    }
  };

  /* ================================
     FETCH KEY BALANCE
  ================================= */

  const fetchKeyBalance = useCallback(async () => {
    if (!user || !API_URL) return;

    try {
      const token = await user.getIdToken();

      const res = await fetch(`${API_URL}/api/key-balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setKeyBalance(data?.keyBalance ?? 0);
    } catch {
      console.error("Failed to fetch key balance");
    }
  }, [user]);

  useEffect(() => {
    fetchKeyBalance();
  }, [fetchKeyBalance]);

  /* ================================
     FILE UPLOAD
  ================================= */

  const handleFileUpload = async (file: File) => {
    if (!file || !user || !API_URL) return;

    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/extract-text`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error();

      const data = await response.json();

      setInputText(data?.text || "");
      setOutputText("");
      setSummary(null);
      setErrorMessage(null);
    } catch {
      setErrorMessage("File upload failed.");
    }
  };

  /* ================================
     PROCESS DOCUMENT
  ================================= */

  const handleProcess = async () => {
    if (isProcessing || !inputText.trim()) return;

    setErrorMessage(null);

    if (!user) {
      setErrorMessage("Please sign in to continue.");
      return;
    }

    const requiredKeys = getRequiredKeys(mode);

    if (keyBalance !== null && keyBalance < requiredKeys) {
      setErrorMessage("Not enough Keys.");
      return;
    }

    try {
      setIsProcessing(true);

      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/api/simplify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: inputText,
          mode,
          language,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Processing failed.");
      }

      const rawOutput = data?.output ?? "";

      const summaryMatch = rawOutput.match(
        /DOCUMENT SUMMARY[:\n]+([\s\S]*?)(\n\n|\n[A-Z])/i
      );

      if (summaryMatch) {
        setSummary(summaryMatch[1].trim());
      } else {
        setSummary(null);
      }

      const cleanedOutput = rawOutput.replace(
        /DOCUMENT SUMMARY[:\n]+([\s\S]*?)(\n\n|\n[A-Z])/i,
        ""
      );

      setOutputText(cleanedOutput.trim());

      await fetchKeyBalance();
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  /* ================================
     AUDIO
  ================================= */

  const handleGenerateAudio = async () => {
    if (!outputText.trim() || !user) return;
    if (audioGenerationCount >= MAX_AUDIO_GENERATIONS) return;

    try {
      setIsGeneratingAudio(true);

      const token = await user.getIdToken();

      const response = await fetch(`${API_URL}/api/generate-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: outputText }),
      });

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (audioUrl) URL.revokeObjectURL(audioUrl);

      setAudioUrl(url);
      setAudioGenerationCount((prev) => prev + 1);
    } catch {
      setErrorMessage("Audio generation failed.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  useEffect(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    setAudioGenerationCount(0);
  }, [outputText]);

  const handleCopySummary = async () => {
    if (!summary) return;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error("Failed to copy summary");
    }
  };

  /* ================================
     UI
  ================================= */

  return (
    <div className="min-h-screen text-slate-900 bg-slate-50">

      <Header language={language} setLanguage={setLanguage} />

      <main className="max-w-6xl mx-auto px-6 py-12">

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-8">

          {/* HERO */}

          <div className="text-center space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              {translations[language].hero}
            </h1>

            <p className="text-sm text-teal-700 font-medium">
              New accounts receive <strong>3 free Keys</strong> to try Plainspeak.
            </p>

            {keyBalance !== null && (
              <div className="text-xs text-slate-600">
                {keyBalance} Keys remaining
              </div>
            )}
          </div>

          {/* TRUST STRIP */}

          <div className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4">
            <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500">
              <span>🔒 Secure processing</span>
              <span>🧾 Works with IEPs & official documents</span>
              <span>🌐 English ↔ Spanish support</span>
              <span>⚡ No subscription. Keys never expire.</span>
            </div>
          </div>

          {/* INPUT TOOLS */}

          <InputMethods onFileSelected={handleFileUpload} />

          {/* CONTROLS */}

          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* Language */}
            <div className="flex items-center gap-2 text-sm">
              <label className="text-slate-600">🌐 Output language</label>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "en" | "es")}
                className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white shadow-sm hover:border-teal-400 focus:ring-2 focus:ring-teal-400"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            {/* Modes */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "understand", label: "Understand", keys: 1 },
                { id: "organize", label: "Organize", keys: 2 },
                { id: "respond", label: "Respond", keys: 3 },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setMode(option.id as Mode)}
                  className={`px-4 py-2 rounded-xl border text-sm
                  ${
                    mode === option.id
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-teal-50"
                  }`}
                >
                  {option.label} ({option.keys} Key{option.keys > 1 ? "s" : ""})
                </button>
              ))}
            </div>

            {/* Process */}
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="px-6 py-2 rounded-xl bg-teal-700 text-white font-semibold hover:bg-teal-800 disabled:opacity-50"
            >
              {isProcessing
                ? "Processing…"
                : translations[language].processButton}
            </button>
          </div>

          {errorMessage && (
            <div className="text-center text-sm text-red-600">
              {errorMessage}
            </div>
          )}

          {/* INPUT / OUTPUT */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste a document here..."
              className="h-96 w-full rounded-xl border border-slate-200 p-4 resize-none"
            />

            <div className="h-96 w-full rounded-xl border border-slate-200 p-4 space-y-4 overflow-y-auto">

              {summary && (
                <div className="bg-teal-50 border-l-4 border-teal-400 p-3 rounded space-y-2">

                  <div className="flex items-center justify-between">
                    <strong>PlainSpeak Summary</strong>

                    <button
                      onClick={handleCopySummary}
                      className="text-xs px-2 py-1 rounded bg-teal-600 text-white hover:bg-teal-700"
                    >
                      {copied ? "Copied ✓" : "Copy"}
                    </button>
                  </div>

                  <p className="text-sm">{summary}</p>
                </div>
              )}

              <div className="whitespace-pre-wrap">
                {outputText || "Your clarified version will appear here."}
              </div>

              {outputText && (
                <AudioPlayer
                  audioUrl={audioUrl}
                  text={outputText}
                  isGenerating={isGeneratingAudio}
                  onGenerate={handleGenerateAudio}
                />
              )}

            </div>

          </div>

        </div>
      </main>

      <footer className="mt-12 text-center text-xs text-slate-500">

        <div className="space-x-4">
          <a href="/terms" target="_blank" className="hover:underline">
            Terms of Service
          </a>

          <a href="/privacy" target="_blank" className="hover:underline">
            Privacy Policy
          </a>
        </div>

        <p className="mt-2 text-[11px] text-slate-400">
          Plainspeak simplifies documents but does not provide legal or medical advice.
        </p>

      </footer>

    </div>
  );
}