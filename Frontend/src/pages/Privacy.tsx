export default function Privacy() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-6 py-16">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold">Privacy Policy</h1>
          <p className="text-slate-600 text-sm">
            Last updated: February 2026
          </p>
        </header>

        {/* PlainSpeak Version */}
        <section
          aria-labelledby="plainspeak-privacy"
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
        >
          <h2 id="plainspeak-privacy" className="text-xl font-semibold">
            PlainSpeak version (human-friendly)
          </h2>

          <p>
            We collect only what we need to run the app: your account info,
            usage counts, and the text you submit.
          </p>

          <p>
            Your text is processed to generate results. We do not sell it.
            We do not use it to advertise to you.
          </p>

          <p>
            We track usage limits to keep costs fair and predictable.
          </p>

          <p>
            You can delete your account at any time.
          </p>
        </section>

        {/* Legal Version */}
        <section
          aria-labelledby="legal-privacy"
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700"
        >
          <h2 id="legal-privacy" className="text-xl font-semibold text-slate-900">
            Legal version
          </h2>

          <p>
            PlainSpeak Now collects account identifiers, authentication data,
            usage metrics, and user-submitted content solely for service
            operation and security.
          </p>

          <p>
            User-submitted content may be transmitted to third-party AI
            providers strictly for processing purposes.
          </p>

          <p>
            Data is retained only as long as necessary for operational,
            legal, or security requirements.
          </p>

          <p>
            Reasonable administrative and technical safeguards are used to
            protect user data.
          </p>
        </section>
      </div>
    </main>
  );
}


