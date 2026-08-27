import { Sparkles } from "lucide-react";
import { translations } from "../../i18n";
import type { Language } from "../plainspeak/types/language";
import HeroBackground from "./HeroBackground";
import TrustBar from "./TrustBar";
import UploadCard from "./UploadCard";

type HeroV2Props = {
  language: Language;
  documentText?: string;
  fileName?: string | null;
  isProcessing?: boolean;

  onDocumentTextChange?: (value: string) => void;
  onUploadClick?: () => void;
  onPhotoClick?: () => void;
  onPasteClick?: () => void;
  onUnderstandClick?: () => void;
 onClearClick?: () => void; 
};

export function HeroV2({
  language,
  documentText,
  fileName,
  isProcessing,
  onDocumentTextChange,
  onUploadClick,
  onPhotoClick,
  onPasteClick,
  onUnderstandClick,
  onClearClick,
}: HeroV2Props) {
  const t = translations[language];

  return (
    <HeroBackground>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        {/* Hero copy */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#4F7C6B]/15 bg-white/85 px-4 py-2 text-sm font-medium text-[#4F7C6B] shadow-sm backdrop-blur">
            <Sparkles size={16} aria-hidden="true" />

            <span>{t.heroEyebrow}</span>
          </div>

          {/* Main headline */}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {t.hero}
          </h1>

          {/* Supporting copy */}
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            {t.description}
          </p>

          {/* Trust bar */}
          <div className="mt-7">
            <TrustBar language={language} />
          </div>
        </div>

        {/* Upload workspace */}
        <div className="mx-auto mt-10 max-w-5xl">
          <UploadCard
            language={language}
            documentText={documentText}
            fileName={fileName}
            isProcessing={isProcessing}
            onDocumentTextChange={onDocumentTextChange}
            onUploadClick={onUploadClick}
            onPhotoClick={onPhotoClick}
            onPasteClick={onPasteClick}
            onClearClick={onClearClick}
            onUnderstandClick={onUnderstandClick}
          />
        </div>
      </div>
    </HeroBackground>
  );
}

export default HeroV2;