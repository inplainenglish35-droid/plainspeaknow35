export default function Terms() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">Terms of Service</h1>
          <p className="text-slate-600 text-sm">
            Last updated: February 2026
          </p>
        </header>

        {/* PlainSpeak Version */}
        <section
          aria-labelledby="plainspeak-terms"
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <h2 id="plainspeak-terms" className="text-xl font-semibold">
            PlainSpeak version (human-friendly)
          </h2>

          <p>
            PlainSpeak helps turn complicated text into clearer language.
            It does not give legal, medical, or professional advice.
          </p>

          <p>
            You are responsible for how you use the results. Always rely on
            the original document if something matters legally or medically.
          </p>

          <p>
            Your account has usage limits based on your plan. If you reach
            your limit, you may need to wait or upgrade.
          </p>

          <p>
            Abuse, automated scraping, or attempts to bypass limits are not
            allowed.
          </p>
        </section>

        {/* Legal Version */}
        <section
          aria-labelledby="legal-terms"
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700"
        >
          <h2 id="legal-terms" className="text-xl font-semibold text-slate-900">
            Legal version
          </h2>

          <p>
            PlainSpeak Now provides an AI-powered text transformation service.
            The service does not provide legal, medical, or professional advice.
            All outputs are informational only.
          </p>

          <p>
            Users remain solely responsible for verifying the accuracy,
            appropriateness, and applicability of any output.
          </p>

          <p>
            Usage limits are enforced per account and per billing period.
            Attempts to circumvent limits may result in suspension or
            termination.
          </p>

          <p>
            PlainSpeak Now is provided “as is” without warranties of any kind.
            To the maximum extent permitted by law, liability is disclaimed.
          </p>
        </section>
      </div>
    </main>
  );
}


