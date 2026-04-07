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
              Simple answers about how Plainspeak works.
            </p>
          </div>

          <section className="space-y-8 text-sm leading-relaxed text-slate-700">

        <div>
      <h2 className="font-semibold text-base mb-2">
    Why not just use ChatGPT?
  </h2>
  <p>
    You can—and many people do. But Plainspeak is designed specifically for understanding real-world documents like IEPs, letters, and official paperwork.
  </p>
  <p className="mt-2">
    With ChatGPT, you have to decide what to ask, how to phrase it, and how to interpret the response. Plainspeak handles that for you automatically.
  </p>
  <p className="mt-2">
    It consistently rewrites documents in clear, calm language, can organize key points, and can draft responses—all in one step, without needing prompts.
  </p>
  <p className="mt-2">
    Plainspeak also keeps things focused on clarity. It helps you understand what a document says, but it does not provide legal or medical advice.
  </p>
</div>
            {/* WHAT DOES IT DO */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                What does Plainspeak do?
              </h2>
              <p>
                Plainspeak turns complex writing into clear, plain language.
                Paste text, upload a document, or take a photo, and you’ll get an easier-to-understand version in seconds.
              </p>
            </div>

            {/* KEYS */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                What are Keys?
              </h2>
              <p>
                Keys are how you use Plainspeak. Each time you process a document,
                a small number of Keys are used based on what you need.
              </p>

              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
                <li><strong>Understand</strong> uses 1 Key</li>
                <li><strong>Organize</strong> uses 2 Keys</li>
                <li><strong>Respond</strong> uses 3 Keys</li>
              </ul>

              <p className="mt-2">
                You only use Keys when you process a document. Keys never expire.
              </p>
            </div>

            {/* DO KEYS EXPIRE */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                Do Keys expire?
              </h2>
              <p>
                No. Your Keys stay in your account until you use them.
                No subscriptions, no resets, and no expiration dates.
              </p>
            </div>

            {/* RUN OUT */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                What happens if I run out of Keys?
              </h2>
              <p>
                You’ll be asked if you want to purchase more.
                There are no automatic renewals or surprise charges.
              </p>
            </div>

            {/* PRIVACY */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                Is my document stored or shared?
              </h2>
              <p>
                Your text is processed securely. We do not sell or share your data.
                Documents are not stored for marketing or resale.
              </p>
            </div>

            {/* ACCESS */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                Who can see my document?
              </h2>
              <p>
                Only you. Your content is tied to your account and not visible to others.
              </p>
            </div>

            {/* ADVICE (IMPORTANT) */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                Is this legal, medical, or financial advice?
              </h2>
              <p>
                No. Plainspeak explains documents in plain language to help you understand them.
                It does not provide legal, medical, or financial advice and does not replace a professional.
              </p>
            </div>

            {/* REFUNDS */}
            <div>
              <h2 className="font-semibold text-base mb-2">
                Can I get a refund?
              </h2>
              <p>
                If something didn’t work as expected, reach out to us.
                We aim to be fair and will review each situation individually.
              </p>
            </div>

          </section>

          <div className="text-center text-xs text-slate-400 pt-6">
            Last updated: April 2026
          </div>

        </div>
      </main>
    </div>
  );
}