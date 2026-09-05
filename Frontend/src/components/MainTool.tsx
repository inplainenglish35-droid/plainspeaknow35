import { useEffect, useRef, useState } from "react";
import { AudioPlayer } from "./plainspeak/AudioPlayer";
import { useAuth } from "./plainspeak/contexts/AuthContext";
import { auth } from "../lib/firebase";
import HeroV2 from "./hero/HeroV2";
import { useOutletContext } from "react-router-dom";
import type { Language } from "./plainspeak/types/language";
import { translations } from "../i18n";
import ReviewCard from "./hero/ReviewCard";
import {
  Check,
  Copy,
  FileCheck2,
  Gift,
  ShieldCheck,
  BookOpen,
  MessageSquareText,
  CircleAlert,
  Clock3,
  Info,
  Volume2,
  Languages,
  House,
  FileSignature,
  HeartPulse,
  Shield,
  GraduationCap,
  Landmark,
  BriefcaseBusiness,
  Mail,
  Play,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function MainTool() {
  const {
  user,
  setKeyBalance,
  feedbackAccepted,
  feedbackDeclines,
} = useAuth();

const { language, requestSignup } = useOutletContext<{
  language: Language;
  requestSignup: () => void;
}>();
const t = translations[language];
  const MAX_AUDIO_GENERATIONS = 3;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const resultRef = useRef<HTMLElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  const [inputText, setInputText] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioGenerationCount, setAudioGenerationCount] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

useEffect(() => {
  if (!errorMessage) return;

  const timer = window.setTimeout(() => {
    errorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, 100);

  return () => window.clearTimeout(timer);
}, [errorMessage]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function getAuthToken() {
    const currentUser = auth.currentUser || user;

    if (!currentUser) {
      throw new Error(t.errorSignIn);
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

const handleClearForm = () => {
  setInputText("");
  setSelectedFileName("");
  setErrorMessage(null);

  clearPreviousResult();

  setShowFeedbackBanner(false);
  setShowFeedbackModal(false);
  setFeedbackText("");

  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }

  if (photoInputRef.current) {
    photoInputRef.current.value = "";
  }
};

  const handlePasteText = async () => {
    try {
      const pasted = await navigator.clipboard.readText();

      if (!pasted.trim()) {
        setErrorMessage(t.errorClipboardEmpty);
        return;
      }

      setInputText(pasted);
      setSelectedFileName("");
      setErrorMessage(null);
      clearPreviousResult();
    } catch {
      const pasted = window.prompt(t.promptPasteText);

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
        t.errorUnsupportedFile
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
t.errorFileRead
        );
      }

      const extractedText = data?.text || "";

      if (!extractedText.trim()) {
        throw new Error(t.errorNoReadableText);
      }

      setInputText(extractedText);
      setSelectedFileName(file.name);
    } catch (err: any) {
      console.error("File extraction error:", err);
      setSelectedFileName("");
      setErrorMessage(err.message || t.errorCouldNotReadFile);
    } finally {
      setExtracting(false);
      event.target.value = "";
    }
  };

  const handlePhotoSelected = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setErrorMessage(t.errorUnsupportedFile);
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
          t.errorFileRead
      );
    }

    const extractedText = data?.text || "";

    if (!extractedText.trim()) {
      throw new Error(t.errorNoReadableText);
    }

    setInputText(extractedText);
    setSelectedFileName(file.name);
  } catch (err: any) {
    console.error("Photo extraction error:", err);
    setSelectedFileName("");
    setErrorMessage(
      err.message || t.errorCouldNotReadFile
    );
  } finally {
    setExtracting(false);
    event.target.value = "";
  }
};
const handleSimplify = async () => {
  const trimmedInput = inputText.trim();

  if (!trimmedInput) {
    setErrorMessage(t.errorNoInput);
    return;
  }

  if (!user) {
    requestSignup();
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
  t.errorProcessFailed
  );
}

  const result = data?.output || data?.result || "";

setOutputText(result);

if (result) {
  setTimeout(() => {
    resultRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}

// Update displayed Key Balance immediately
  setKeyBalance(data?.remainingKeys ?? 0);

if (
  data?.remainingKeys === 0 &&
  !feedbackAccepted &&
  feedbackDeclines === 0
) {
  setShowFeedbackBanner(true);
}
    } catch (err: any) {
      console.error("Simplify error:", err);
     setErrorMessage(err.message || t.errorProcessFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!outputText) return;

    if (audioGenerationCount >= MAX_AUDIO_GENERATIONS) {
      setErrorMessage(t.errorAudioLimit);
      return;
    }

    try {
      setIsGeneratingAudio(true);
      setErrorMessage(null);

      const headers = await getJsonAuthHeaders();

      const res = await fetch(`${API_URL}/api/generate-audio`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    text: outputText,
    language,
  }),
});

      if (!res.ok) {
        throw new Error(t.errorAudioFailed);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (audioUrl) URL.revokeObjectURL(audioUrl);

      setAudioUrl(url);
      setAudioGenerationCount((prev) => prev + 1);
    } catch (err: any) {
      console.error("Audio error:", err);
      setErrorMessage(err.message || t.errorAudioFailed);
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
      setErrorMessage(t.errorCopyFailed);
    }
  };
const handleFeedbackSubmit = async () => {
  try {
    setSubmittingFeedback(true);

    const token = await auth.currentUser?.getIdToken();

    const response = await fetch(
  `${API_URL}/api/feedback-submit`,
  {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feedback: feedbackText,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || t.errorFeedbackFailed
      );
    }

    setShowFeedbackModal(false);
    setShowFeedbackBanner(false);
    setFeedbackText("");

    alert(
      t.feedbackSuccess
    );

    window.location.reload();
} catch (err: any) {
  console.error("FEEDBACK ERROR:", err);

  alert(
    err.message || t.errorFeedbackFailed
  );
} finally {
  setSubmittingFeedback(false);
}
};

return (
<main className="w-full text-slate-900">

{/* =======================================================
    HERO V2
======================================================= */}

<HeroV2
  language={language}
  documentText={inputText}
  fileName={selectedFileName || null}
  isProcessing={loading || extracting}
  onDocumentTextChange={(value) => {
    setInputText(value);
    setSelectedFileName("");
    setErrorMessage(null);
    clearPreviousResult();
  }}
  onPasteClick={handlePasteText}
  onUploadClick={() => fileInputRef.current?.click()}
  onPhotoClick={() => photoInputRef.current?.click()}
  onUnderstandClick={handleSimplify}
  onClearClick={handleClearForm}
/>

<input
  ref={fileInputRef}
  id="documentFile"
  name="documentFile"
  type="file"
  accept=".pdf,.txt,.docx,.csv,.xlsx"
  onChange={handleFileSelected}
  className="hidden"
/>
<input
  ref={photoInputRef}
  id="photoFile"
  name="photoFile"
  type="file"
  accept="image/*"
  capture="environment"
  onChange={handlePhotoSelected}
  className="hidden"
/>
<section className="mx-auto mt-6 max-w-4xl px-6">
  {errorMessage && (
    <div
      ref={errorRef}
      className="scroll-mt-28 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
      role="alert"
    >
      {errorMessage}
    </div>
  )}

  {outputText && (
  <section
    ref={resultRef}
    className="scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.30)]"
  >
    {/* Feedback banner */}
    {showFeedbackBanner && (
      <div className="border-b border-[#4F7C6B]/15 bg-[#F3F8F6] p-5 sm:p-6">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#4F7C6B] shadow-sm">
            <Gift size={19} aria-hidden="true" />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-slate-900">
  {t.feedbackBannerTitle}
</p>

<p className="mt-1 text-sm leading-6 text-slate-600">
  {t.feedbackBannerDescription}
</p>

<p className="mt-1 text-sm text-slate-500">
  {t.feedbackBannerExpiry}
</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(true)}
                className="rounded-xl bg-[#4F7C6B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#426B5C] focus:outline-none focus:ring-4 focus:ring-[#4F7C6B]/20"
              >
                {t.feedbackGive}
              </button>

              <button
                type="button"
                onClick={() => setShowFeedbackBanner(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
               {t.feedbackLater}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Result header */}
    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF7F3] text-[#4F7C6B]">
            <FileCheck2
              size={20}
              aria-hidden="true"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4F7C6B]">
              Plainspeak Now™
            </p>

            <h2 className="mt-0.5 text-xl font-bold text-slate-900">
              {t.resultTitle}
            </h2>
          </div>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4F7C6B]/30 hover:bg-[#F7FBF9] focus:outline-none focus:ring-4 focus:ring-[#4F7C6B]/10"
        >
          {copied ? (
            <>
              <Check
                size={17}
                className="text-[#4F7C6B]"
                aria-hidden="true"
              />
              {t.copied}
            </>
          ) : (
            <>
              <Copy
                size={17}
                aria-hidden="true"
              />
              {t.copyResult}
            </>
          )}
        </button>
      </div>
    </div>

    {/* Result content */}
    <div className="p-5 sm:p-6">
      <div className="rounded-2xl border border-slate-100 bg-[#FAFCFC] p-5 sm:p-6">
        <div className="whitespace-pre-wrap text-[15px] leading-7 text-slate-700 sm:text-base">
          {outputText}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-5 flex gap-3 rounded-2xl border border-[#4F7C6B]/15 bg-[#F5FAF8] px-4 py-3.5">
        <ShieldCheck
          size={18}
          className="mt-0.5 shrink-0 text-[#4F7C6B]"
          aria-hidden="true"
        />

        <p className="text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
  <span className="font-semibold text-slate-800">
    {t.resultReminderTitle}
  </span>{" "}
  {t.resultReminderText}
</p>
      </div>

      {/* Audio */}
      <div className="mt-5">
        <AudioPlayer
  language={language}
  audioUrl={audioUrl}
  text={outputText}
  isGenerating={isGeneratingAudio}
  onGenerate={handleGenerateAudio}
/>
      </div>
    </div>
  </section>
)}

    {showFeedbackModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4">
  {t.feedbackModalTitle}
</h2>

<p className="mb-4">
  {t.feedbackModalIntro}
</p>

<p className="mb-4">
  {t.feedbackModalThankYou}
</p>

<p className="mb-4">
  {t.feedbackModalExpiry}
</p>

          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full border rounded p-3 min-h-[120px]"
            placeholder={t.feedbackPlaceholder}
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="px-4 py-2 border rounded"
            >
              {t.feedbackNoThanks}
            </button>

            <button
              onClick={handleFeedbackSubmit}
              disabled={submittingFeedback}
              className="px-4 py-2 bg-[#4f7c6b] text-white rounded disabled:opacity-60"
            >
              {submittingFeedback
                ? t.feedbackSubmitting
                : t.feedbackSubmit}
            </button>
          </div>
        </div>
      </div>
    )}
  </section>

{/* =======================================================
    SOCIAL PROOF
======================================================= */}

<section className="bg-white py-14 sm:py-16">
  <div className="mx-auto max-w-6xl px-6">
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4F7C6B]">
  {t.socialEyebrow}
</p>

<h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
  {t.socialTitle}
</h2>

<p className="mt-3 text-base leading-7 text-slate-600">
  {t.socialDescription}
</p>
    </div>

<div className="mx-auto mt-8 max-w-xl">
  <ReviewCard
    quote={translations.en.review1Quote}
    name={translations.en.review1Name}
    description={translations.en.review1Description}
    ratingLabel={t.reviewRatingLabel}
  />
</div>
  </div>
</section>
   
  {/* =======================================================
    WHY I BUILT PLAINSPEAK NOW™
======================================================= */}

<section className="bg-[#F4F9F7] py-14 sm:py-16">
  <div className="mx-auto max-w-6xl px-6">

    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">

      {/* Family photo */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -bottom-4 -left-4 h-full w-full rounded-3xl bg-[#DDEDE7]"
        />

        <img
          src="/images/family.png"
          alt={t.whyAlt}
          className="relative aspect-[5/3] w-full rounded-3xl object-cover shadow-lg"
        />
      </div>

      {/* Story */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4F7C6B]">
  {t.whyEyebrow}
</p>

<h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
  {t.whyTitle}
</h2>

        <p className="mt-5 text-lg leading-8 text-slate-700">
  {t.whyParagraph1}
</p>

<p className="mt-4 text-lg leading-8 text-slate-700">
  {t.whyParagraph2}
</p>

        <p className="mt-4 text-lg font-semibold leading-8 text-[#3F6658]">
  {t.whyClosing}
</p>
      </div>

    </div>

  </div>
</section>
{/* =======================================================
    HOW IT WORKS VIDEO
======================================================= */}

<section className="bg-white py-14 sm:py-16">
  <div className="mx-auto max-w-6xl px-6">

    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4F7C6B]">
  {t.videoEyebrow}
</p>

<h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
  {t.videoTitle}
</h2>

<p className="mt-3 text-base leading-7 text-slate-600">
  {t.videoDescription}
</p>
    </div>

    {/* Video placeholder */}
    <div className="mx-auto mt-9 max-w-4xl">
      <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#EEF7F3] via-[#F7FBFC] to-[#EAF5F8] shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)]">

        {/* Decorative lines */}
        <svg
          aria-hidden="true"
          viewBox="0 0 900 500"
          className="absolute inset-0 h-full w-full opacity-40"
          preserveAspectRatio="none"
        >
          <path
            d="M-50 380 C170 180 270 520 500 280 S760 80 950 230"
            fill="none"
            stroke="#A7CCC0"
            strokeWidth="2"
          />

          <path
            d="M-50 420 C190 220 300 540 530 320 S780 120 950 270"
            fill="none"
            stroke="#B9D9E2"
            strokeWidth="2"
          />
        </svg>

        {/* Placeholder content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#4F7C6B] text-white shadow-lg">
            <Play
              size={32}
              fill="currentColor"
              className="ml-1"
              aria-hidden="true"
            />
          </div>

          <h3 className="mt-5 text-xl font-bold text-slate-900">
  {t.videoWalkthroughTitle}
</h3>

<p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
  {t.videoWalkthroughDescription}
</p>

<span className="mt-4 rounded-full border border-[#4F7C6B]/20 bg-white/80 px-4 py-2 text-xs font-semibold text-[#4F7C6B] shadow-sm">
  {t.videoComingSoon}
</span>

        </div>
      </div>
    </div>

  </div>
</section>
  {/* =======================================================
    EVERY DOCUMENT INCLUDES
======================================================= */}

<section className="bg-[#F7FBF9] py-14 sm:py-16">
  <div className="mx-auto max-w-6xl px-6">

    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4F7C6B]">
  {t.includesEyebrow}
</p>

<h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
  {t.includesTitle}
</h2>

<p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
  {t.includesDescription}
</p>
    </div>

    <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

      {/* Plain language */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF7F3] text-[#4F7C6B]">
          <BookOpen size={21} aria-hidden="true" />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
  {t.includesPlainTitle}
</h3>
<p className="mt-1 text-sm text-slate-500">
  {t.includesPlainDescription}
</p>
        </div>
      </div>

      {/* Professional response */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF7F3] text-[#4F7C6B]">
          <MessageSquareText size={21} aria-hidden="true" />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
  {t.includesResponseTitle}
</h3>
<p className="mt-1 text-sm text-slate-500">
  {t.includesResponseDescription}
</p>
        </div>
      </div>

      {/* Critical */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <CircleAlert size={21} aria-hidden="true" />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
  {t.includesCriticalTitle}
</h3>
<p className="mt-1 text-sm text-slate-500">
  {t.includesCriticalDescription}
</p>
        </div>
      </div>

      {/* Urgent */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Clock3 size={21} aria-hidden="true" />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
  {t.includesUrgentTitle}
</h3>
<p className="mt-1 text-sm text-slate-500">
  {t.includesUrgentDescription}
</p>
        </div>
      </div>

      {/* Important */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Info size={21} aria-hidden="true" />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
  {t.includesImportantTitle}
</h3>
<p className="mt-1 text-sm text-slate-500">
  {t.includesImportantDescription}
</p>
        </div>
      </div>

      {/* Audio */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF7F3] text-[#4F7C6B]">
          <Volume2 size={21} aria-hidden="true" />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">
  {t.includesAudioTitle}
</h3>
<p className="mt-1 text-sm text-slate-500">
  {t.includesAudioDescription}
</p>
        </div>
      </div>

      {/* Translation */}
<div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-3">
  <div className="flex items-center gap-4">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF5F8] text-[#467D8B]">
      <Languages size={21} aria-hidden="true" />
    </div>

    <div>
      <h3 className="font-semibold text-slate-900">
  {t.includesTranslationTitle}
</h3>

<p className="mt-1 text-sm text-slate-500">
  {t.includesTranslationDescription}
</p>
    </div>
  </div>
</div>

    </div>
  </div>
</section>

{/* =======================================================
    WHEN CAN PLAINSPEAK NOW™ HELP?
======================================================= */}

<section className="bg-white py-14 sm:py-16">
  <div className="mx-auto max-w-6xl px-6">

    {/* Heading */}
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#4F7C6B]">
        {t.paperworkEyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {t.paperworkTitle}
      </h2>

      <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
        {t.paperworkDescription}
      </p>
    </div>

    {/* Document types */}
    <div className="mx-auto mt-9 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">

      {/* Rental Agreements */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#F7FBF9] px-4 py-5 text-center">
        <House
          size={24}
          className="text-[#4F7C6B]"
          aria-hidden="true"
        />
        <span className="mt-2 text-sm font-semibold text-slate-800">
          {t.documentRental}
        </span>
      </div>

      {/* Contracts */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#F8FBFD] px-4 py-5 text-center">
        <FileSignature
          size={24}
          className="text-[#4F7C6B]"
          aria-hidden="true"
        />
        <span className="mt-2 text-sm font-semibold text-slate-800">
          {t.documentContracts}
        </span>
      </div>

      {/* Medical */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#F7FBF9] px-4 py-5 text-center">
        <HeartPulse
          size={24}
          className="text-[#4F7C6B]"
          aria-hidden="true"
        />
        <span className="mt-2 text-sm font-semibold text-slate-800">
          {t.documentMedical}
        </span>
      </div>

      {/* Insurance */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#F8FBFD] px-4 py-5 text-center">
        <Shield
          size={24}
          className="text-[#4F7C6B]"
          aria-hidden="true"
        />
        <span className="mt-2 text-sm font-semibold text-slate-800">
          {t.documentInsurance}
        </span>
      </div>

      {/* School */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#F8FBFD] px-4 py-5 text-center">
        <GraduationCap
          size={24}
          className="text-[#4F7C6B]"
          aria-hidden="true"
        />
        <span className="mt-2 text-sm font-semibold text-slate-800">
          {t.documentSchool}
        </span>
      </div>

      {/* Government */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#F7FBF9] px-4 py-5 text-center">
        <Landmark
          size={24}
          className="text-[#4F7C6B]"
          aria-hidden="true"
        />
        <span className="mt-2 text-sm font-semibold text-slate-800">
          {t.documentGovernment}
        </span>
      </div>

      {/* Employment */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#F8FBFD] px-4 py-5 text-center">
        <BriefcaseBusiness
          size={24}
          className="text-[#4F7C6B]"
          aria-hidden="true"
        />
        <span className="mt-2 text-sm font-semibold text-slate-800">
          {t.documentEmployment}
        </span>
      </div>

      {/* Important Letters */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-[#F7FBF9] px-4 py-5 text-center">
        <Mail
          size={24}
          className="text-[#4F7C6B]"
          aria-hidden="true"
        />
        <span className="mt-2 text-sm font-semibold text-slate-800">
          {t.documentLetters}
        </span>
      </div>

    </div>

    {/* Closing thought */}
    <p className="mx-auto mt-8 max-w-3xl text-center text-base font-medium leading-7 text-slate-700 sm:text-lg">
  {t.paperworkClosing}
</p>

  </div>
</section>

   
  </main>
  );
}


