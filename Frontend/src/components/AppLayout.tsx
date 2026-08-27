import { Header } from "./plainspeak/Header";
import { Footer } from "./plainspeak/Footer";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Language } from "./plainspeak/types/language";

export default function AppLayout() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  const isRTL = language === "ar";

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <div
  dir={isRTL ? "rtl" : "ltr"}
  className="flex min-h-screen flex-col bg-white text-slate-900"
>
      {/* Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet context={{ language }} />
      </main>

      {/* Footer */}
      <Footer language={language} />
    </div>
  );
}