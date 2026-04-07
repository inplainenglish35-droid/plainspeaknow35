import React from "react";
import { ArrowDown, Sparkles, Languages, Volume2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface HeroSectionProps {
  onScrollToInput?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToInput }) => {
  return (
    <section
      aria-labelledby="hero-heading"
      className="
        bg-gradient-to-br
        from-slate-900
        via-slate-800
        to-slate-700
        border-b border-slate-200
      "
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">

        {/* Badge */}
        <div
          className="
            inline-flex items-center gap-2
            rounded-full border border-white/20
            bg-white/5
            px-3 py-1.5
            text-sm text-slate-200
            mb-8
          "
        >
          <Sparkles className="h-4 w-4" />
          Clear words. Less stress.
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="
            text-3xl sm:text-5xl lg:text-6xl
            font-semibold
            tracking-tight
            text-white
            mb-6
          "
        >
          Understand your documents.
          <br />
          <span className="text-slate-300">Without the overwhelm.</span>
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
          Plainspeak rewrites complex letters, forms, and paperwork into clear, everyday language.
          You can also translate or listen—whatever helps you understand faster.
        </p>

        {/* Feature list */}
        <ul className="flex flex-wrap justify-center gap-6 mb-12 text-slate-300">
          <li className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4" />
            Plain language
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Languages className="h-4 w-4" />
            English ↔ Spanish
          </li>
          <li className="flex items-center gap-2 text-sm">
            <Volume2 className="h-4 w-4" />
            Listen instead of read
          </li>
        </ul>

        {/* CTA */}
        {onScrollToInput && (
          <>
            <button
              onClick={onScrollToInput}
              aria-describedby="hero-cta-desc"
              className={cn(
                "inline-flex items-center gap-2",
                "rounded-md bg-white px-6 py-3",
                "text-sm font-semibold text-slate-900",
                "hover:bg-slate-100",
                "focus:outline-none focus-visible:ring-2",
                "focus-visible:ring-white focus-visible:ring-offset-2",
                "focus-visible:ring-offset-slate-800"
              )}
            >
              Help me understand
              <ArrowDown className="h-4 w-4" />
            </button>

            {/* Screen-reader description */}
            <p id="hero-cta-desc" className="sr-only">
              Scrolls to the text input area
            </p>
          </>
        )}

        {/* 🔐 Subtle trust line */}
        <p className="text-xs text-slate-400 mt-6 max-w-md mx-auto">
          Plainspeak helps you understand documents clearly. It does not provide legal or medical advice.
        </p>

      </div>
    </section>
  );
};




