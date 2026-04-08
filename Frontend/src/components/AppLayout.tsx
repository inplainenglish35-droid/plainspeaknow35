import { Header } from "./plainspeak/Header";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import type { Language } from "./plainspeak/types/language";

export default function AppLayout() {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <Header language={language} setLanguage={setLanguage} />

      <div className="max-w-4xl mx-auto space-y-6">
        <Outlet />
      </div>
    </div>
  );
}