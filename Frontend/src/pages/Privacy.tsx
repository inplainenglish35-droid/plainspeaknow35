import { useOutletContext } from "react-router-dom";
import { translations } from "../i18n";
import type { Language } from "../components/plainspeak/types/language";

export default function Privacy() {
  const { language } = useOutletContext<{
    language: Language;
  }>();

  const t = translations[language];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">
            {t.privacyTitle}
          </h1>

          <p className="text-sm text-slate-600">
            {t.privacyLastUpdated}
          </p>
        </header>

        {/* Human-friendly version */}
        <section
          aria-labelledby="plainspeak-privacy"
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
        >
          <h2
            id="plainspeak-privacy"
            className="text-xl font-semibold"
          >
            {t.privacyPlainTitle}
          </h2>

          <p>{t.privacyPlainP1}</p>
          <p>{t.privacyPlainP2}</p>
          <p>{t.privacyPlainP3}</p>
          <p>{t.privacyPlainP4}</p>
          <p>{t.privacyPlainP5}</p>
        </section>

        {/* Detailed policy */}
        <section
          aria-labelledby="privacy-details"
          className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-700"
        >
          <h2
            id="privacy-details"
            className="text-xl font-semibold text-slate-900"
          >
            {t.privacyLegalTitle}
          </h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacyInfoTitle}
            </h3>
            <p>{t.privacyInfoP1}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacyDocumentsTitle}
            </h3>
            <p>{t.privacyDocumentsP1}</p>
            <p>{t.privacyDocumentsP2}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacyProvidersTitle}
            </h3>
            <p>{t.privacyProvidersP1}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacyAccountTitle}
            </h3>
            <p>{t.privacyAccountP1}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacyFeedbackTitle}
            </h3>
            <p>{t.privacyFeedbackP1}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacyPaymentsTitle}
            </h3>
            <p>{t.privacyPaymentsP1}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacyRetentionTitle}
            </h3>
            <p>{t.privacyRetentionP1}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacySecurityTitle}
            </h3>
            <p>{t.privacySecurityP1}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacyChoicesTitle}
            </h3>
            <p>{t.privacyChoicesP1}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacyChangesTitle}
            </h3>
            <p>{t.privacyChangesP1}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-900">
              {t.privacyContactTitle}
            </h3>
            <p>{t.privacyContactP1}</p>
          </div>
        </section>
      </div>
    </main>
  );
}



