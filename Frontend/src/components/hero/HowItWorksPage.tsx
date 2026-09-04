import {
  ArrowRight,
  Clock3,
  FileQuestion,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import HeroBackground from "./HeroBackground";

type HowItWorksPageProps = {
  onStart?: () => void;
};

export function HowItWorksPage({ onStart }: HowItWorksPageProps) {
  const handleStart = () => {
  // Track when a visitor leaves the Confidence Bridge
  // and chooses to try Plainspeak Now.
  if (typeof window !== "undefined") {
    const fbq = (window as any).fbq;

    if (typeof fbq === "function") {
      fbq("trackCustom", "ConfidenceBridgeCTA");
    }
  }

  if (onStart) {
    onStart();
    return;
  }

  window.location.href = "/";
};

  return (
    <HeroBackground>
      <main className="min-h-screen">
        {/* =========================================================
            HERO
        ========================================================== */}
        <section className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#4F7C6B]">
              Plainspeak Now™
            </p>

            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Confusing paperwork?
              <span className="block text-[#4F7C6B]">
                Get to the point.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Plainspeak Now™ turns complicated documents into clearer
              language, shows you what matters, highlights important deadlines,
              and helps you understand what you may need to do next.
            </p>

            <div className="mx-auto mt-7 max-w-3xl rounded-3xl border border-[#4F7C6B]/20 bg-white/90 px-5 py-6 shadow-[0_18px_55px_-35px_rgba(15,23,42,0.30)] backdrop-blur sm:px-8">
              <p className="text-lg font-semibold text-slate-700 sm:text-xl">
                Try your first document{" "}
                <span className="text-[#4F7C6B]">FREE.</span>
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                No subscription. Ever.
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-600 sm:text-base">
                Pay only when you need it
                <span className="mx-2 text-[#4F7C6B]">•</span>
                Keys never expire
              </p>

              <button
                type="button"
                onClick={handleStart}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4F7C6B] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-[#4F7C6B]/15 transition hover:bg-[#426b5c] focus:outline-none focus:ring-4 focus:ring-[#4F7C6B]/20 sm:w-auto sm:min-w-[320px]"
              >
                Try My First Document Free
                <ArrowRight size={19} aria-hidden="true" />
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-slate-600">
                <ShieldCheck
                  size={18}
                  className="shrink-0 text-[#4F7C6B]"
                  aria-hidden="true"
                />
                <span>
                  Document deleted from our server after processing
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            TWO REASONS
        ========================================================== */}
        <section className="border-y border-slate-200/70 bg-white/65 py-14 backdrop-blur-sm sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#4F7C6B]">
                Two very good reasons
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Sometimes you need clarity.
                <span className="block text-[#4F7C6B]">
                  Sometimes you just need the point.
                </span>
              </h2>
            </div>

            <div className="mt-9 grid gap-6 md:grid-cols-2">
              {/* Understanding */}
              <article className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.25)] sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF7F3] text-[#4F7C6B]">
                  <FileQuestion size={24} aria-hidden="true" />
                </div>

                <p className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-[#4F7C6B]">
                  I don't understand this.
                </p>

                <h3 className="mt-3 text-2xl font-bold leading-8 text-slate-900">
                  Sometimes the hardest part of paperwork is needing someone
                  else to explain it.
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  Get a clearer explanation so you can understand what you're
                  looking at and decide what to do next.
                </p>
              </article>

              {/* Time */}
              <article className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.25)] sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF7F3] text-[#4F7C6B]">
                  <Clock3 size={24} aria-hidden="true" />
                </div>

                <p className="mt-5 text-sm font-bold uppercase tracking-[0.14em] text-[#4F7C6B]">
                  I don't have time for this.
                </p>

                <h3 className="mt-3 text-2xl font-bold leading-8 text-slate-900">
                  You could read all 23 pages. Or you could just find out what
                  matters.
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  Get the important information, deadlines, and action items
                  without digging through every paragraph first.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* =========================================================
            BEFORE / AFTER
        ========================================================== */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#4F7C6B]">
                Get to what matters
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Important information can hide inside ordinary paperwork.
              </h2>
            </div>

            <div className="mt-9 grid gap-6 lg:grid-cols-2">
              {/* Before */}
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  The document says
                </p>

                <blockquote className="mt-5 border-l-4 border-slate-300 pl-5 text-base leading-8 text-slate-700">
                  “Please notify our office in writing no later than September
                  15, 2026 whether you intend to renew your lease. If we do not
                  receive your response by September 15, we cannot guarantee
                  that your residence will remain available for renewal.”
                </blockquote>
              </div>

              {/* After */}
              <div className="rounded-3xl border border-[#4F7C6B]/20 bg-[#EEF7F3] p-7 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-[#4F7C6B]">
                  Here's what matters
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-1 shrink-0 text-[#4F7C6B]"
                      aria-hidden="true"
                    />
                    <p className="leading-7 text-slate-700">
                      <strong>Deadline:</strong> Respond by September 15, 2026.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-1 shrink-0 text-[#4F7C6B]"
                      aria-hidden="true"
                    />
                    <p className="leading-7 text-slate-700">
                      <strong>What to do:</strong> Tell the property manager in
                      writing whether you plan to renew your lease.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2
                      size={20}
                      className="mt-1 shrink-0 text-[#4F7C6B]"
                      aria-hidden="true"
                    />
                    <p className="leading-7 text-slate-700">
                      <strong>Important:</strong> If you miss the deadline, they
                      say they cannot guarantee that you'll still be able to
                      renew.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================== */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#4F7C6B]/15 bg-white/90 px-6 py-11 text-center shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] sm:px-10 sm:py-12">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#4F7C6B]">
              Start with one document
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              You don't have to read every word
              <span className="block text-[#4F7C6B]">
                to understand what matters.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Upload a document, paste the text, or take a photo. Your first
              document is free.
            </p>

            <button
              type="button"
              onClick={handleStart}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4F7C6B] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-[#4F7C6B]/15 transition hover:bg-[#426b5c] focus:outline-none focus:ring-4 focus:ring-[#4F7C6B]/20 sm:w-auto sm:min-w-[320px]"
            >
              Try My First Document Free
              <ArrowRight size={19} aria-hidden="true" />
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-[#4F7C6B]">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>
                Document deleted from our server after processing
              </span>
            </div>

            <p className="mx-auto mt-5 max-w-3xl text-xs leading-5 text-slate-500 sm:text-sm">
              Plainspeak Now™ explains complicated information in clearer
              language, but it does not provide legal or medical advice.
              Important decisions should be checked against the original
              document and an appropriate professional when necessary.
            </p>
          </div>
        </section>
      </main>
    </HeroBackground>
  );
}

export default HowItWorksPage;
