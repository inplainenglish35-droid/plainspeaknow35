import { useOutletContext } from "react-router-dom";
import { translations } from "../i18n";
import type { Language } from "../components/plainspeak/types/language";

export default function Terms() {
  const { language } = useOutletContext<{
    language: Language;
  }>();

  const t = translations[language];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-10">

        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">
            {t.termsTitle}
          </h1>

          <p className="text-slate-600 text-sm">
            {t.termsLastUpdated}
          </p>
        </header>

        {/* Human-Friendly Version */}
        <section
          aria-labelledby="plainspeak-terms"
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <h2
            id="plainspeak-terms"
            className="text-xl font-semibold"
          >
            {t.termsPlainTitle}
          </h2>

          <p>{t.termsPlainP1}</p>
          <p>{t.termsPlainP2}</p>
          <p>{t.termsPlainP3}</p>
          <p>{t.termsPlainP4}</p>
          <p>{t.termsPlainP5}</p>
        </section>

        {/* Detailed Terms */}
        <section
          aria-labelledby="legal-terms"
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-8 text-sm text-slate-700"
        >
          <h2
            id="legal-terms"
            className="text-xl font-semibold text-slate-900"
          >
            {t.termsLegalTitle}
          </h2>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsServiceTitle}
            </h3>
            <p>{t.termsServiceP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsAdviceTitle}
            </h3>
            <p>{t.termsAdviceP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsAccuracyTitle}
            </h3>
            <p>{t.termsAccuracyP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsKeysTitle}
            </h3>
            <p>{t.termsKeysP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsPaymentsTitle}
            </h3>
            <p>{t.termsPaymentsP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsContentTitle}
            </h3>
            <p>{t.termsContentP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsAcceptableTitle}
            </h3>
            <p>{t.termsAcceptableP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsAvailabilityTitle}
            </h3>
            <p>{t.termsAvailabilityP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsIPTitle}
            </h3>
            <p>{t.termsIPP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsTerminationTitle}
            </h3>
            <p>{t.termsTerminationP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsLiabilityTitle}
            </h3>
            <p>{t.termsLiabilityP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsChangesTitle}
            </h3>
            <p>{t.termsChangesP1}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-base text-slate-900">
              {t.termsContactTitle}
            </h3>
            <p>{t.termsContactP1}</p>
          </div>
        </section>

      </div>
    </main>
  );
}


