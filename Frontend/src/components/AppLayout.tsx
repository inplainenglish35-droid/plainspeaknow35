import { Header } from "./plainspeak/Header";
import { Footer } from "./plainspeak/Footer";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "next-themes";
import type { Language } from "./plainspeak/types/language";

export default function AppLayout() {
  const [language, setLanguage] = useState<Language>("en");

  // keeps component reactive to theme changes (no destructure needed)
  useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors">
      
      {/* Header */}
      <Header language={language} setLanguage={setLanguage} />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}