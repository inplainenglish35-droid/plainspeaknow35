import { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Layers, Shield } from "lucide-react";

import { Header } from "../components/plainspeak/Header";
import { useAuth } from "../components/plainspeak/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function Pricing() {
  const { user } = useAuth();
  const [language, setLanguage] = useState<"en" | "es" | "vi" | "tl">("en");
 const allowedLanguages = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "vi", label: "Vietnamese" },
  { code: "tl", label: "Tagalog" },
];
{allowedLanguages.map((lang) => (
  <option key={lang.code} value={lang.code}>
    {lang.label}
  </option>
))}

  const handlePurchase = async (packSize: "6" | "15" | "30") => {
    if (!user) {
      alert("Please sign in to continue.");
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

          {/* INTRO */}
          <section className="text-center space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              Simple, Transparent Pricing
            </h1>

            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              No subscriptions. No surprise renewals. Keys never expire.
            </p>
          </section>

          {/* HOW KEYS WORK */}
          <section className="max-w-3xl mx-auto space-y-4 text-sm text-slate-700">
            <h2 className="text-lg font-semibold text-center">
              How Keys Work
            </h2>

            <div className="space-y-3 bg-white border border-teal-100 rounded-xl p-6">
              <p>• Most documents use <strong>1 Key</strong></p>
              <p>• Longer documents (about 35+ pages) use <strong>2 Keys</strong></p>
              <p>• All modes are included — no extra cost</p>
              <p>• You’ll always see how many Keys are used before processing</p>

              <p className="text-xs text-slate-500 pt-2">
                Plainspeak is built to help you understand documents clearly—not to give legal or medical advice.
              </p>
            </div>
          </section>

          {/* KEY PACKS */}
          <section className="grid gap-6 md:grid-cols-3">

            {/* 6 KEYS */}
            <div className="rounded-xl border border-teal-100 p-6 bg-white space-y-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Leaf className="h-4 w-4 text-slate-400" />
                6 Keys
              </h3>

              <p className="text-2xl font-semibold">$18</p>

              <p className="text-sm text-slate-600">
                A simple way to try Plainspeak when you need it.
              </p>

              <button
                onClick={() => handlePurchase("6")}
                className="w-full py-2 rounded-xl bg-[#4f7c6b] text-white hover:opacity-90 transition"
              >
                Get 6 Keys
              </button>
            </div>

            {/* 15 KEYS */}
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 shadow-sm space-y-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Layers className="h-4 w-4 text-slate-400" />
                15 Keys
              </h3>

              <p className="text-2xl font-semibold">$42</p>

              <p className="text-sm text-slate-700">
                A balanced option for ongoing clarity and support.
              </p>

              <button
                onClick={() => handlePurchase("15")}
                className="w-full py-2 rounded-xl bg-[#4f7c6b] text-white hover:opacity-90 transition"
              >
                Get 15 Keys
              </button>
            </div>

            {/* 30 KEYS */}
            <div className="rounded-xl border border-teal-100 p-6 bg-white space-y-4 text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Shield className="h-4 w-4 text-slate-400" />
                30 Keys
              </h3>

              <p className="text-2xl font-semibold">$78</p>

              <p className="text-sm text-slate-600">
                For frequent use when you want consistent support.
              </p>

              <button
                onClick={() => handlePurchase("30")}
                className="w-full py-2 rounded-xl bg-[#4f7c6b] text-white hover:opacity-90 transition"
              >
                Get 30 Keys
              </button>
            </div>

          </section>

          {/* BACK */}
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


