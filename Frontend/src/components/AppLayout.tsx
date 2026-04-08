import { useState } from "react";
import { useAuth } from "./plainspeak/contexts/AuthContext";
import { Header } from "./plainspeak/Header";
import { InputMethods } from "./plainspeak/InputMethods";
import { AudioPlayer } from "./plainspeak/AudioPlayer";

// 🔐 Keep this aligned with your backend
type Language = "en" | "es";

export default function AppLayout() {
  const { user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL ?? "";
  const MAX_AUDIO_GENERATIONS = 3;

  // ================================
  // STATE
  // ================================
  const [language, setLanguage] = useState<Language>("en");

  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioGenerationCount, setAudioGenerationCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ================================
  // SIMPLIFY
  // ================================
  const handleSimplify = async () => {
    if (!inputText || !user || !API_URL) {
      setErrorMessage("Missing input or authentication.");
      return;
    }

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
          language, // ✅ IMPORTANT
          mode: "understand",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed");
      }

      setOutputText(data.output);
      setAudioUrl(null);
      setAudioGenerationCount(0);

    } catch {
      setErrorMessage("Failed to process document.");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // AUDIO
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
    <div className="min-h-screen bg-slate-50 p-4">

      {/* ✅ FIXED */}
      <Header
        language={language}
        setLanguage={setLanguage}
      />

      <div className="max-w-4xl mx-auto space-y-6">

        <InputMethods
          inputText={inputText}
          setInputText={setInputText}
        />

        <button
          onClick={handleSimplify}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-xl"
        >
          {loading ? "Processing…" : "Help me understand"}
        </button>

        {/* OUTPUT */}
        <div className="bg-white p-4 rounded-xl shadow whitespace-pre-wrap min-h-[120px]">
          {outputText || "Your simplified document will appear here."}
        </div>

        {/* AUDIO */}
        {outputText && (
          <button
            onClick={handleGenerateAudio}
            disabled={isGeneratingAudio}
            className="px-4 py-2 bg-slate-200 rounded-lg"
          >
            {isGeneratingAudio ? "Generating audio…" : "Listen"}
          </button>
        )}

        {audioUrl && (
          <AudioPlayer src={audioUrl} />
        )}

        {/* ERROR */}
        {errorMessage && (
          <div className="text-red-500 text-sm">
            {errorMessage}
          </div>
        )}

      </div>
    </div>
  );
}
}