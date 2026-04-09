import { useState } from "react";

type Language = "en" | "es" | "vi" | "tl";

export default function FAQ() {
  const [language, setLanguage] = useState<Language>("en");

  function basicLanguageCheck(text: string, lang: Language) {
    if (lang === "es") return /[áéíóúñ¿¡]/i.test(text);
    if (lang === "vi") return /[ăâđêôơư]/i.test(text);
    if (lang === "tl") return /[áéíóúñ¿¡]/i.test(text);
    return true;
  }

  return (
    <div className="min-h-screen text-slate-900 bg-[linear-gradient(135deg,rgba(226,241,255,0.4),rgba(228,243,236,0.4),rgba(230,232,255,0.4),rgba(221,242,242,0.4))]">
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-10 space-y-10">

          {/* HEADER */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-slate-600">
              Simple answers about how Plainspeak works.
            </p>
          </div>

          {/* FAQ CONTENT */}
          <section className="space-y-8 text-sm leading-relaxed text-slate-700">

            <div>
              <h2 className="font-semibold text-base mb-2">
                Why not just use ChatGPT?
              </h2>
              <p>
                You can—and many people do. But Plainspeak is designed specifically
                for understanding real-world documents like IEPs, letters, and official paperwork.
              </p>
              <p className="mt-2">
                Plainspeak handles the process automatically and keeps everything focused on clarity.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">
                What does Plainspeak do?
              </h2>
              <p>
                Plainspeak turns complex writing into clear, plain language.
                Paste text, upload a document, or take a photo, and get an easier-to-understand version.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">
                What are Keys?
              </h2>
              <p>
                Keys are how you use Plainspeak. Each document uses a small number of Keys.
              </p>

              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                <li><strong>Most documents use just 1 Key</strong></li>
                <li>Longer documents may use 2 Keys</li>
                <li>Includes understanding, organizing, and response drafting</li>
              </ul>

              <p className="mt-2">
                Keys are only used when you process a document. They never expire.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">
                Do Keys expire?
              </h2>
              <p>
                No. Your Keys stay in your account until you use them.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">
                What happens if I run out of Keys?
              </h2>
              <p>
                You’ll be prompted to purchase more. No subscriptions or surprise charges.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">
                Is my document stored or shared?
              </h2>
              <p>
                Your content is processed securely and is not sold or shared.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">
                Who can see my document?
              </h2>
              <p>
                Only you. Your content is private to your account.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">
                Is this legal, medical, or financial advice?
              </h2>
              <p>
                No. Plainspeak helps explain documents but does not replace professional advice.
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-base mb-2">
                Can I get a refund?
              </h2>
              <p>
                If something didn’t work as expected, reach out. We review each situation fairly.
              </p>
            </div>

          </section>

          {/* FOOTER */}
          <div className="text-center text-xs text-slate-400 pt-6">
            Last updated: April 2026
          </div>

        </div>
      </main>
    </div>
  );
}