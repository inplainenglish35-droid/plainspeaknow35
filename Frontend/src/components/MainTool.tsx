import { useState } from "react";
import { InputMethods } from "./plainspeak/InputMethods";
import { AudioPlayer } from "./plainspeak/AudioPlayer";
import { useAuth } from "./plainspeak/contexts/AuthContext";

export default function MainTool() {
  const auth = useAuth?.();
  const user = auth?.user ?? null;

  const API_URL = import.meta.env.VITE_API_URL ?? "";
  const language = "en";
  const MAX_AUDIO_GENERATIONS = 3;

  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioGenerationCount, setAudioGenerationCount] = useState(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ================================
  // COPY FUNCTIONS
  // ================================
  const handleCopy = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyEmail = async () => {
    if (!outputText) return;

    const emailFormatted = `Subject: Clarified Document Summary

${outputText}

---
Generated with PlainSpeak Now`;

    await navigator.clipboard.writeText(emailFormatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ================================
  // SECTION PARSER (SAFE)
  // ================================
  function splitSections(text: string) {
    try {
      return {
        type: text.match(/DOCUMENT TYPE:\s*(.*)/i)?.[1]?.trim() || "",
        summary:
          text.match(/DOCUMENT SUMMARY:\s*([\s\S]*?)KEY POINTS:/i)?.[1]?.trim() ||
          "",
        points:
          text.match(/KEY POINTS:\s*([\s\S]*?)WHAT MATTERS MOST:/i)?.[1]?.trim() ||
          "",
        actions:
          text.match(/WHAT MATTERS MOST:\s*([\s\S]*)/i)?.[1]?.trim() || "",
      };
    } catch {
      return { type: "", summary: "", points: "", actions: "" };
    }
  }

  const sections = splitSections(outputText);

  // ================================
  // SIMPLIFY
  // ================================
  const handleSimplify = async () => {
    if (!inputText) return setErrorMessage("Please enter text.");
    if (!user) return setErrorMessage("You must be signed in.");
    if (!API_URL) return setErrorMessage("API not configured.");

    try {
      setLoading(true);
      setErrorMessage(null);

      const token = await user.getIdToken();

      const res = await fetch(`${API_URL}/api/simplify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: inputText,
          language,
          mode: "understand",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed");

      setOutputText(data.output);
      setAudioUrl(null);
      setAudioGenerationCount(0);

    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to process document.");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // AUDIO
  // ================================
  const handleGenerateAudio = async () => {
    if (!outputText) return;
    if (!user) return setErrorMessage("You must be signed in.");
    if (!API_URL) return setErrorMessage("API not configured.");
    if (audioGenerationCount >= MAX_AUDIO_GENERATIONS)
      return setErrorMessage("Audio limit reached.");

    try {
      setIsGeneratingAudio(true);
      setErrorMessage(null);

      const token = await user.getIdToken();

      const res = await fetch(`${API_URL}/api/generate-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: outputText }),
      });

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setAudioGenerationCount((prev) => prev + 1);

    } catch {
      setErrorMessage("Audio generation failed.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // ================================
  // STYLES
  // ================================
  const card =
    "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm space-y-4";

  const textarea =
    "w-full min-h-[140px] resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  // ================================
  // UI
  // ================================
  return (
    <div className="space-y-8">

      {/* INPUT */}
      <div className={card}>
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium">Your document</h2>

          <button
            onClick={handleSimplify}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {loading ? "Processing…" : "Help me understand"}
          </button>
        </div>

        <InputMethods
          onFileSelected={async (file) => {
            try {
              if (file.type === "text/plain") {
                const text = await file.text();
                setInputText(text);
              } else {
                setInputText("File uploaded. Processing coming soon.");
              }
            } catch {
              setErrorMessage("Upload failed.");
            }
          }}
          onPaste={() => {}}
        />

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your document here..."
          className={textarea}
        />
      </div>

      {/* OUTPUT */}
      <div className={card}>
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium">Simplified result</h2>

          {outputText && (
            <div className="flex gap-2">
              <button onClick={handleCopy} className="text-xs px-2 py-1 bg-slate-200 rounded">
                {copied ? "Copied" : "Copy"}
              </button>

              <button onClick={handleCopyEmail} className="text-xs px-2 py-1 bg-slate-200 rounded">
                Email
              </button>

              <button
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio}
                className="text-xs px-2 py-1 bg-slate-200 rounded"
              >
                {isGeneratingAudio ? "Generating…" : "Listen"}
              </button>
            </div>
          )}
        </div>

        {/* Confidence */}
        {outputText && (
          <div className="text-xs text-green-600">
            ● Full breakdown included
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-sm animate-pulse">
            Simplifying your document…
          </div>
        )}

        {/* Structured Output */}
        {!loading && outputText && (
          <div className="space-y-4 text-sm whitespace-pre-wrap">

            {sections.type && <div><strong>Type:</strong> {sections.type}</div>}
            {sections.summary && <div><strong>Summary:</strong> {sections.summary}</div>}
            {sections.points && <div><strong>Key Points:</strong> {sections.points}</div>}
            {sections.actions && <div><strong>What matters:</strong> {sections.actions}</div>}

          </div>
        )}

        {/* Fallback */}
        {!loading && outputText && !sections.summary && (
          <div className="text-sm whitespace-pre-wrap">{outputText}</div>
        )}

        {audioUrl && <AudioPlayer {...({ src: audioUrl } as any)} />}
      </div>

      {/* ERROR */}
      {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
    </div>
  );
}