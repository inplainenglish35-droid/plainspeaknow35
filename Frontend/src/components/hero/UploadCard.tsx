import { translations } from "../../i18n";
import type { Language } from "../plainspeak/types/language";
import {
  Camera,
  ClipboardPaste,
  FileText,
  LoaderCircle,
  ShieldCheck,
  Upload,
} from "lucide-react";

type UploadCardProps = {
  language: Language;
  documentText?: string;
  fileName?: string | null;
  isProcessing?: boolean;
  onDocumentTextChange?: (value: string) => void;
  onUploadClick?: () => void;
  onPhotoClick?: () => void;
  onPasteClick?: () => void;
  onClearClick?: () => void;
  onUnderstandClick?: () => void;
};

export function UploadCard({
  language,
  documentText = "",
  fileName = null,
  isProcessing = false,
  onDocumentTextChange,
  onUploadClick,
  onPhotoClick,
  onPasteClick,
  onClearClick,
  onUnderstandClick,
}: UploadCardProps) {
  const t = translations[language];

  const hasDocument = documentText.trim().length > 0 || Boolean(fileName);
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.30)] sm:p-6">
      {/* Heading */}
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {t.uploadCardTitle}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {t.uploadCardSubtitle}
        </p>
      </div>

      {/* Document controls */}
<div className="flex flex-wrap gap-3">
  <button
    type="button"
    onClick={onUploadClick}
    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4F7C6B]/40 hover:bg-[#F7FBF9] focus:outline-none focus:ring-2 focus:ring-[#4F7C6B]/30"
  >
    <Upload size={18} aria-hidden="true" />
    {t.uploadFile}
  </button>

  <button
    type="button"
    onClick={onPasteClick}
    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4F7C6B]/40 hover:bg-[#F7FBF9] focus:outline-none focus:ring-2 focus:ring-[#4F7C6B]/30"
  >
    <ClipboardPaste size={18} aria-hidden="true" />
    {t.pasteText}
  </button>

  <button
    type="button"
    onClick={onPhotoClick}
    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#4F7C6B]/40 hover:bg-[#F7FBF9] focus:outline-none focus:ring-2 focus:ring-[#4F7C6B]/30"
  >
    <Camera size={18} aria-hidden="true" />
  {t.photoUpload}
  </button>

  <button
    type="button"
    onClick={onClearClick}
    disabled={!hasDocument || isProcessing}
    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
  >
    {t.clearForm}
  </button>
</div>
      <p className="mt-3 text-xs text-slate-400">
        {t.supportedFilesShort}
      </p>

      {/* File loaded confirmation */}
      {fileName && (
        <div
          className="mt-4 flex items-center gap-3 rounded-xl border border-[#4F7C6B]/20 bg-[#F3F8F6] px-4 py-3"
          role="status"
        >
          <FileText
            size={19}
            className="shrink-0 text-[#4F7C6B]"
            aria-hidden="true"
          />

          <div className="min-w-0 text-sm text-[#365F51]">
            <span className="font-semibold">{t.fileLoaded}</span>{" "}
            <span className="break-all">{fileName}</span>
          </div>
        </div>
      )}

      {/* Main workspace */}
      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-stretch">
        <textarea
          value={documentText}
          onChange={(event) =>
            onDocumentTextChange?.(event.target.value)
          }
          placeholder={t.placeholder}
          aria-label={t.documentText}
          className="min-h-[170px] flex-1 resize-y rounded-2xl border border-slate-200 bg-[#FCFDFD] p-4 text-base leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#4F7C6B]/50 focus:ring-4 focus:ring-[#4F7C6B]/10"
        />

        {/* Main CTA */}
        <button
          type="button"
          onClick={onUnderstandClick}
          disabled={isProcessing || !hasDocument}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#4F7C6B] px-6 py-4 text-center text-base font-bold leading-tight text-white shadow-md transition hover:bg-[#426B5C] focus:outline-none focus:ring-4 focus:ring-[#4F7C6B]/25 disabled:cursor-not-allowed disabled:bg-[#8FAFA4] disabled:opacity-100 lg:w-56"
        >
          {isProcessing ? (
            <>
              <LoaderCircle
                size={20}
                className="animate-spin"
                aria-hidden="true"
              />
             {t.working}
            </>
          ) : (
            <span>{t.processButton}</span>
          )}
        </button>
      </div>

      {/* Good to Know */}
      <div className="mt-5 rounded-2xl border border-[#4F7C6B]/15 bg-[#F5FAF8] px-4 py-3 sm:px-5">
        <div className="flex gap-3">
          <ShieldCheck
            size={19}
            className="mt-0.5 shrink-0 text-[#4F7C6B]"
            aria-hidden="true"
          />

          <p className="text-sm leading-6 text-slate-600">
            <span className="font-semibold text-slate-800">
  {t.goodToKnow}
</span>{" "}
{t.goodToKnowText}
          </p>
        </div>
      </div>
    </div>
  );
}

export default UploadCard;