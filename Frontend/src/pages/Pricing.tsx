import { useState } from "react";
import { Header } from "../components/plainspeak/Header";
import { Link } from "react-router-dom";
import { Leaf, Layers, Shield } from "lucide-react";

/*
If AuthContext is unavailable in this environment,
provide a temporary fallback so the page can compile.
*/
const useAuth = (): {
  user: { getIdToken: (force?: boolean) => Promise<string> } | null;
} => {
  return { user: null };
};

const API_URL = "http://localhost:3001";

export default function Pricing() {
  const { user } = useAuth();

  const [language, setLanguage] = useState<"en" | "es">("en");

  const handlePurchase = async (packSize: "6" | "15" | "30") => {
    if (!user) {
      alert("Please sign in to purchase Keys.");
      return;
    }

    try {
      const token = await user.getIdToken(true);

      const res = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packSize }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 bg-[linear-gradient(135deg,rgba(226,241,255,0.4),rgba(228,243,236,0.4),rgba(230,232,255,0.4),rgba(221,242,242,0.4))]">
      <Header language={language} setLanguage={setLanguage} />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-10 space-y-14">

          {/* Intro */}
          <section className="text-center space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              Simple, Transparent Pricing
            </h1>

            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              No subscriptions. No surprise renewals. Keys never expire.
            </p>
          </section>

          {/* Mode Explanation */}
          <section className="max-w-3xl mx-auto space-y-4 text-sm text-slate-700">
            <h2 className="text-lg font-semibold text-center">
              What Each Mode Does
            </h2>

            <div className="space-y-4 bg-white border border-teal-100 rounded-xl p-6">
              <p>
                <strong>Understand — 1 Key</strong><br />
                Rewrites the document in clear, calm language and highlights what matters.
              </p>

              <p>
                <strong>Organize — 2 Keys</strong><br />
                Clarifies the document and adds a simple timeline with next steps.
              </p>

              <p>
                <strong>Respond — 3 Keys</strong><br />
                Clarifies the document and drafts a structured reply you can edit and send.
              </p>

              <p className="text-xs text-slate-500 pt-2">
                You always see the Key cost before processing.
              </p>
            </div>
          </section>

          {/* Key Packs */}
          <section className="grid gap-6 md:grid-cols-3">

            {/* 6 Keys */}
            <div className="rounded-xl border border-teal-100 p-6 bg-white space-y-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Leaf className="h-4 w-4 text-slate-400" />
                6 Keys
              </h3>
              <p className="text-2xl font-semibold">$18</p>
              <p className="text-sm text-slate-600">
                Flexible access for occasional documents.
              </p>

              <button
                onClick={() => handlePurchase("6")}
                className="w-full py-2 rounded-xl bg-[#4f7c6b] text-white hover:opacity-90 transition"
              >
                Buy 6 Keys
              </button>
            </div>

            {/* 15 Keys */}
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 shadow-sm space-y-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Layers className="h-4 w-4 text-slate-400" />
                15 Keys
              </h3>
              <p className="text-2xl font-semibold">$42</p>
              <p className="text-sm text-slate-700">
                Balanced option for regular clarity needs.
              </p>

              <button
                onClick={() => handlePurchase("15")}
                className="w-full py-2 rounded-xl bg-[#4f7c6b] text-white hover:opacity-90 transition"
              >
                Buy 15 Keys
              </button>
            </div>

            {/* 30 Keys */}
            <div className="rounded-xl border border-teal-100 p-6 bg-white space-y-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Shield className="h-4 w-4 text-slate-400" />
                30 Keys
              </h3>
              <p className="text-2xl font-semibold">$78</p>
              <p className="text-sm text-slate-600">
                For ongoing, high-volume document support.
              </p>

              <button
                onClick={() => handlePurchase("30")}
                className="w-full py-2 rounded-xl bg-[#4f7c6b] text-white hover:opacity-90 transition"
              >
                Buy 30 Keys
              </button>
            </div>

          </section>

          {/* Back Link */}
          <section className="text-center pt-4">
            <Link
              to="/"
              className="text-sm font-medium text-teal-600 underline hover:text-teal-700"
            >
              ← Back to Plainspeak Now
            </Link>
          </section>

        </div>
      </main>
    </div>
  );
}


