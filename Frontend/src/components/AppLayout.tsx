import { useState } from "react";
import { useAuth } from "./plainspeak/contexts/AuthContext";

export default function AppLayout() {
  const { user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL ?? "";
  const MAX_AUDIO_GENERATIONS = 3;

  // ================================
  // STATE
  // ================================
  const [outputText, setOutputText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioGenerationCount, setAudioGenerationCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ================================
  // AUDIO GENERATION
  // ================================
  const handleGenerateAudio = async () => {
    if (!outputText || !user || !API_URL) return;

    if (audioGenerationCount >= MAX_AUDIO_GENERATIONS) {
      setErrorMessage("Audio limit reached for this document.");
      return;
    }

    try {
      setIsGeneratingAudio(true);

      const token = await user.getIdToken();

      const res = await fetch(`${API_URL}/api/generate-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: outputText,
        }),
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
  // UI
  // ================================
  return (
    <div>

      {/* OUTPUT */}
      <div className="whitespace-pre-wrap">
        {outputText || "Your simplified document will appear here."}
      </div>

      {/* AUDIO BUTTON */}
      {outputText && (
        <button
          onClick={handleGenerateAudio}
          disabled={isGeneratingAudio}
          className="mt-4 px-4 py-2 bg-slate-200 rounded-lg"
        >
          {isGeneratingAudio ? "Generating audio…" : "Listen"}
        </button>
      )}

      {/* AUDIO PLAYER */}
      {audioUrl && (
        <audio controls src={audioUrl} className="mt-4 w-full" />
      )}

      {/* ERROR */}
      {errorMessage && (
        <div className="text-red-500 mt-2 text-sm">
          {errorMessage}
        </div>
      )}

    </div>
  );
}