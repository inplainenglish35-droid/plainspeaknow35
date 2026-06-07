import { useOutletContext } from "react-router-dom";
import { translations } from "../i18n";
import type { Language } from "../components/plainspeak/types/language";

export default function Terms() {
const { language } = useOutletContext<{
language: Language;
}>();

const t = translations[language];

return ( <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-16"> <div className="max-w-3xl mx-auto space-y-10">

```
    <header className="space-y-3">
      <h1 className="text-3xl font-semibold">
        {t.termsTitle}
      </h1>

      <p className="text-slate-600 text-sm">
        {t.termsLastUpdated}
      </p>
    </header>

    {/* PlainSpeak Version */}
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

      <p>
        {t.termsPlainP1}
      </p>

      <p>
        {t.termsPlainP2}
      </p>

      <p>
        {t.termsPlainP3}
      </p>

      <p>
        {t.termsPlainP4}
      </p>
    </section>

    {/* Legal Version */}
    <section
      aria-labelledby="legal-terms"
      className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700"
    >
      <h2
        id="legal-terms"
        className="text-xl font-semibold text-slate-900"
      >
        {t.termsLegalTitle}
      </h2>

      <p>
        {t.termsLegalP1}
      </p>

      <p>
        {t.termsLegalP2}
      </p>

      <p>
        {t.termsLegalP3}
      </p>

      <p>
        {t.termsLegalP4}
      </p>
    </section>

  </div>
</main>


);
}


