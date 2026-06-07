import { useOutletContext } from "react-router-dom";
import { translations } from "../i18n";
import type { Language } from "../components/plainspeak/types/language";

export default function Privacy() {
const { language } = useOutletContext<{
language: Language;
}>();

const t = translations[language];

return ( <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-16"> <div className="max-w-3xl mx-auto space-y-10">

```
    <header className="space-y-3">
      <h1 className="text-3xl font-semibold">
        {t.privacyTitle}
      </h1>

      <p className="text-slate-600 text-sm">
        {t.privacyLastUpdated}
      </p>
    </header>

    {/* PlainSpeak Version */}
    <section
      aria-labelledby="plainspeak-privacy"
      className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
    >
      <h2
        id="plainspeak-privacy"
        className="text-xl font-semibold"
      >
        {t.privacyPlainTitle}
      </h2>

      <p>
        {t.privacyPlainP1}
      </p>

      <p>
        {t.privacyPlainP2}
      </p>

      <p>
        {t.privacyPlainP3}
      </p>

      <p>
        {t.privacyPlainP4}
      </p>
    </section>

    {/* Legal Version */}
    <section
      aria-labelledby="legal-privacy"
      className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700"
    >
      <h2
        id="legal-privacy"
        className="text-xl font-semibold text-slate-900"
      >
        {t.privacyLegalTitle}
      </h2>

      <p>
        {t.privacyLegalP1}
      </p>

      <p>
        {t.privacyLegalP2}
      </p>

      <p>
        {t.privacyLegalP3}
      </p>

      <p>
        {t.privacyLegalP4}
      </p>
    </section>

  </div>
</main>


);
}



