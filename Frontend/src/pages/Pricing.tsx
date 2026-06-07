
import { Link, useOutletContext } from "react-router-dom";
import { Leaf } from "lucide-react";
import { translations } from "../i18n";
import { useAuth } from "../components/plainspeak/contexts/AuthContext";
import type { Language } from "../components/plainspeak/types/language";
const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function Pricing() {
  const { user } = useAuth();
  const { language } = useOutletContext<{
    language: Language;
  }>();
  const t = translations[language];
  const handlePurchase = async () => {
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
        body: JSON.stringify({
          packSize: "2",
        }),
      });

      const data = await res.json();

      if (!data.url) {
        console.error("No checkout URL returned", data);
        alert("Something went wrong. Please try again.");
        return;
      }

      window.location.href = data.url;

    } catch (err) {
      console.error("Purchase failed:", err);
      alert("Purchase failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen text-slate-900 bg-[linear-gradient(135deg,rgba(226,241,255,0.4),rgba(228,243,236,0.4),rgba(230,232,255,0.4),rgba(221,242,242,0.4))]">

      <main className="max-w-4xl mx-auto px-6 py-16">

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-10 space-y-14">

          {/* INTRO */}
          <section className="text-center space-y-4">

            <h1 className="text-3xl font-semibold tracking-tight">
              {t.pricingTitle}
            </h1>

            <p className="text-slate-600 text-sm max-w-2xl mx-auto">
              {t.pricingSubtitle}
            </p>

            <p className="text-xs text-slate-500">
              {t.pricingBuyWhatYouNeed}
            </p>

          </section>

          {/* HOW KEYS WORK */}
          <section className="max-w-3xl mx-auto space-y-4 text-sm text-slate-700">

            <h2 className="text-lg font-semibold text-center">
              {t.pricingHowKeysWork}
            </h2>

            <div className="space-y-3 bg-white border border-teal-100 rounded-xl p-6">

              <p>
                <strong>{t.pricingMostDocs}</strong>
              </p>

              <p>
                {t.pricingLongDocs}
              </p>

              <p>
                {t.pricingIncludes}
              </p>

              <p>
                {t.pricingSeeUsage}
              </p>

              <p className="text-xs text-slate-500 pt-2">
                {t.pricingDisclaimer}
              </p>

            </div>

          </section>

          {/* SINGLE PRICING CARD */}
          <section className="max-w-md mx-auto">

            <div className="rounded-2xl border border-teal-100 bg-white p-8 shadow-sm space-y-6 text-center">

              <div className="flex justify-center">
                <Leaf className="h-6 w-6 text-[#4f7c6b]" />
              </div>

              <div className="space-y-2">

                <h3 className="text-2xl font-semibold">
                  2 Keys
                </h3>

                <p className="text-4xl font-semibold">
                  $6
                </p>

              </div>

              <div className="space-y-2 text-sm text-slate-600">

                <p>
                  {t.pricingCardMostDocs}
                </p>

                <p>
                  {t.pricingCardLongDocs}
                </p>

                <p>
                  {t.pricingCardNeverExpire}
                </p>

              </div>

              <button
                onClick={handlePurchase}
                className="w-full py-3 rounded-xl bg-[#4f7c6b] text-white hover:opacity-90 transition"
              >
                {t.pricingBuy2Keys}
              </button>

              <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-500">

                <p>
                  {t.pricingFreeKey}
                </p>

                <p>
                  {t.pricingBonusKey}
                </p>

              </div>

            </div>

          </section>

          {/* BACK */}
          <section className="text-center pt-4">

            <Link
              to="/"
              className="text-sm font-medium text-teal-600 underline hover:text-teal-700"
            >
              {t.pricingBackHome}
            </Link>

          </section>

        </div>

      </main>

    </div>
  );
}
