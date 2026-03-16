import { useState } from "react";
import { Header } from "../components/plainspeak/Header";

export default function FAQ() {
  const [language, setLanguage] = useState<"en" | "es">("en");
  return (
    <div className="min-h-screen text-slate-900 bg-[linear-gradient(135deg,rgba(226,241,255,0.4),rgba(228,243,236,0.4),rgba(230,232,255,0.4),rgba(221,242,242,0.4))]">
      <Header language={language} setLanguage={setLanguage} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-10 space-y-10">

          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-slate-600">
              Clear answers about how Plainspeak Now works.
            </p>
          </div>

          <section className="space-y-8 text-sm leading-relaxed text-slate-700">

            {/* WHAT DOES IT DO */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                What does Plainspeak Now do?
              </h2>
              <p>
                Plainspeak Now turns complex writing into clear, plain language.
                Paste text, upload a document, or take a photo, and receive an easier-to-understand version in seconds.
              </p>
            </div>

            {/* HOW DO KEYS WORK */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                What are Keys?
              </h2>
              <p>
                Keys are how you use Plainspeak Now. Each time you process a document,
                a small number of Keys are used depending on the mode you choose.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                <li><strong>Understand</strong> uses 1 Key</li>
                <li><strong>Organize</strong> +1 = 2 Keys</li>
                <li><strong>Respond</strong> +1 = 3 Keys</li>
              </ul>
              <p className="mt-2">
                You only pay for what you use. Keys do not expire.
              </p>
            </div>

            {/* DO KEYS EXPIRE */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                Do Keys expire?
              </h2>
              <p>
                No. Keys stay in your account until you use them.
                There are no monthly resets and no hidden expiration dates.
              </p>
            </div>

            {/* WHAT IF I RUN OUT */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                What happens if I run out of Keys?
              </h2>
              <p>
                You’ll be prompted to purchase more. There are no surprise charges
                and no automatic renewals.
              </p>
            </div>

            {/* IS MY DOCUMENT STORED */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                Is my document stored?
              </h2>
              <p>
                Your text is processed securely. We do not sell or share your data.
                Documents are not stored permanently for resale or marketing.
              </p>
            </div>

            {/* WHO CAN SEE IT */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                Who can see my document?
              </h2>
              <p>
                Only you. Access is tied to your authenticated account.
              </p>
            </div>

            {/* IS THIS LEGAL ADVICE */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                Is this legal, medical, or financial advice?
              </h2>
              <p>
                No. Plainspeak Now clarifies language to help you understand what a document says.
                It does not replace professional advice.
              </p>
            </div>

            {/* REFUNDS */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                Can I get a refund?
              </h2>
              <p>
                If something didn’t work correctly, contact us.
                We care about fairness and will review concerns individually.
              </p>
            </div>

          </section>

          <div className="text-center text-xs text-slate-400 pt-6">
            Last updated: March 2026
          </div>

        </div>
      </main>
    </div>
  );
}