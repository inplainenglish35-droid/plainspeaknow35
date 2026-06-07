import { useOutletContext } from "react-router-dom";
import type { Language } from "../components/plainspeak/types/language";
import { translations } from "../i18n";


export default function FAQ() {

  const { language } = useOutletContext<{
    language: Language;
  }>();

  const t = translations[language];



  return (
    <div className="min-h-screen text-slate-900 bg-[linear-gradient(135deg,rgba(226,241,255,0.4),rgba(228,243,236,0.4),rgba(230,232,255,0.4),rgba(221,242,242,0.4))]">
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-10 space-y-10">

          {/* HEADER */}

<div className="text-center space-y-4">
  <h1 className="text-3xl font-semibold tracking-tight">
    {t.faqTitle}
  </h1>

  <p className="text-slate-600">
    {t.faqSubtitle}
  </p>
</div>

{/* FAQ CONTENT */}

<section className="space-y-8 text-sm leading-relaxed text-slate-700">

  <div>
    <h2 className="font-semibold text-base mb-2">
      {t.faqQ1}
    </h2>
    <p>
      {t.faqA1}
    </p>
    <p className="mt-2">
      {t.faqA1b}
    </p>
  </div>

  <div>
    <h2 className="font-semibold text-base mb-2">
      {t.faqQ2}
    </h2>
    <p>
      {t.faqA2}
    </p>
  </div>

  <div>
    <h2 className="font-semibold text-base mb-2">
      {t.faqQ3}
    </h2>

    <p>
      {t.faqA3}
    </p>

    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
      <li><strong>{t.faqA3Bullet1}</strong></li>
      <li>{t.faqA3Bullet2}</li>
      <li>{t.faqA3Bullet3}</li>
    </ul>

    <p className="mt-2">
      {t.faqA3b}
    </p>
  </div>

  <div>
    <h2 className="font-semibold text-base mb-2">
      {t.faqQ4}
    </h2>
    <p>
      {t.faqA4}
    </p>
  </div>

  <div>
    <h2 className="font-semibold text-base mb-2">
      {t.faqQ5}
    </h2>
    <p>
      {t.faqA5}
    </p>
  </div>

  <div>
    <h2 className="font-semibold text-base mb-2">
      {t.faqQ6}
    </h2>
    <p>
      {t.faqA6}
    </p>
  </div>

  <div>
    <h2 className="font-semibold text-base mb-2">
      {t.faqQ7}
    </h2>
    <p>
      {t.faqA7}
    </p>
  </div>

  <div>
    <h2 className="font-semibold text-base mb-2">
      {t.faqQ8}
    </h2>
    <p>
      {t.faqA8}
    </p>
  </div>

  <div>
    <h2 className="font-semibold text-base mb-2">
      {t.faqQ9}
    </h2>
    <p>
      {t.faqA9}
    </p>
  </div>

</section>

{/* FOOTER */}

<div className="text-center text-xs text-slate-400 pt-6">
  {t.faqLastUpdated}
</div>
        </div>
      </main>
    </div>
  );
}

