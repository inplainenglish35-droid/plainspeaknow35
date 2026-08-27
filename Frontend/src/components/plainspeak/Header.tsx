import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { signOut as firebaseSignOut } from "firebase/auth";

import AuthModal from "./AuthModal";
import { useAuth } from "./contexts/AuthContext";
import { auth } from "../../lib/firebase";
import logo from "../../assets/logo.png";
import { translations } from "../../i18n";
import type { Language } from "./types/language";


interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

/* =========================
   COMPONENT
========================= */

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
}) => {
  const {
    user,
    keyBalance,
    setKeyBalance,
    setFeedbackAccepted,
    setFeedbackDeclines,
  } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const t = translations[language];

  /* =========================
     KEY BALANCE
  ========================= */

  useEffect(() => {
    const fetchKeyBalance = async () => {
      try {
        if (!user) {
          setKeyBalance(null);
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL;
        const token = await user.getIdToken();

        const res = await fetch(
          `${API_URL}/api/key-balance`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch key balance");
        }

        const data = await res.json();

        setKeyBalance(data.keyBalance ?? 0);
        setFeedbackAccepted(
          data.feedbackAccepted ?? false
        );
        setFeedbackDeclines(
          data.feedbackDeclines ?? 0
        );
      } catch (error) {
        console.error(
          "Key balance fetch failed:",
          error
        );
      }
    };

    fetchKeyBalance();
  }, [
    user,
    setKeyBalance,
    setFeedbackAccepted,
    setFeedbackDeclines,
  ]);

  /* =========================
     AUTH
  ========================= */

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    setUserMenuOpen(false);
  };

  /* =========================
     UI
  ========================= */

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* LEFT */}
            <div className="flex min-w-0 items-center gap-6 lg:gap-10">
              {/* LOGO */}
              <Link
                to="/"
                className="flex shrink-0 items-center gap-2"
                aria-label={t.headerHomeLabel}
              >
                <img
                  src={logo}
                  alt={t.headerLogoAlt}
                  className="h-14 w-auto object-contain sm:h-16"
                />

                
              </Link>

              {/* DESKTOP NAVIGATION */}
              <nav className="hidden items-center gap-6 md:flex">
                <a
                  href="mailto:inplainenglish35@gmail.com?subject=Plainspeak Beta Feedback"
                  className="text-sm font-medium text-slate-600 transition hover:text-[#4F7C6B]"
                >
                  {t.sendFeedback}
                </a>

                <Link
                  to="/faq"
                  className="text-sm font-medium text-slate-600 transition hover:text-[#4F7C6B]"
                >
                  {t.faq}
                </Link>

                <Link
                  to="/pricing"
                  className="text-sm font-medium text-slate-600 transition hover:text-[#4F7C6B]"
                >
                  {t.pricing}
                </Link>
              </nav>
            </div>

            {/* RIGHT */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* LANGUAGE */}
              <select
                value={language}
                onChange={(e) =>
                  setLanguage(
                    e.target.value as Language
                  )
                }
                aria-label={t.headerLanguageLabel}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-[#4F7C6B]/40 focus:border-[#4F7C6B] focus:ring-2 focus:ring-[#4F7C6B]/20"
              >
               <option value="en">EN</option>
<option value="es">ES</option>
<option value="vi">VI</option>
<option value="tl">TL</option>
<option value="fr">FR</option>
<option value="zh">中文</option>
<option value="ko">한국어</option>
<option value="ar">العربية</option>
<option value="pt">PT</option>
<option value="ru">RU</option>
<option value="ht">Kreyòl</option>
<option value="hi">हिन्दी</option>
              </select>

              {/* AUTH */}
              {!user ? (
                <button
                  type="button"
                  onClick={() =>
                    setAuthModalOpen(true)
                  }
                  className="flex items-center gap-2 rounded-xl bg-[#4F7C6B] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#426B5C] focus:outline-none focus:ring-4 focus:ring-[#4F7C6B]/20"
                >
                  <User
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  <span className="hidden sm:inline">
                    {t.signIn}
                  </span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setUserMenuOpen((v) => !v)
                    }
                    aria-expanded={userMenuOpen}
                    className="flex items-center gap-2 rounded-xl bg-[#4F7C6B] px-3.5 py-2.5 text-white shadow-sm transition hover:bg-[#426B5C] focus:outline-none focus:ring-4 focus:ring-[#4F7C6B]/20"
                  >
                    <User
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    <span className="hidden max-w-[150px] truncate text-sm font-medium sm:inline">
                      {user.displayName ||
                        user.email}
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        userMenuOpen
                          ? "rotate-180"
                          : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* USER MENU */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                      {/* USER INFO */}
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-xs text-slate-500">
                         {t.headerSignedInAs}
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-slate-800">
                          {user.email}
                        </p>
                      </div>

                      {/* KEY BALANCE */}
                      <div className="border-b border-slate-100 bg-[#F7FBF9] px-4 py-3">
                        <p className="text-xs text-slate-500">
                          {t.keyBalance}
                        </p>

                        <p className="mt-1 text-lg font-semibold text-[#4F7C6B]">
                          {keyBalance ?? "—"} {t.headerKeys}
                        </p>
                      </div>

                      {/* SIGN OUT */}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <LogOut
                          className="h-4 w-4"
                          aria-hidden="true"
                        />

                        {t.signOut}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        <div className="border-t border-slate-100 md:hidden">
          <nav className="flex items-center justify-center gap-6 px-4 py-2.5">
            <a
              href="mailto:inplainenglish35@gmail.com?subject=Plainspeak Beta Feedback"
              className="text-xs font-medium text-slate-600 transition hover:text-[#4F7C6B] sm:text-sm"
            >
              {t.sendFeedback}
            </a>

            <Link
              to="/faq"
              className="text-xs font-medium text-slate-600 transition hover:text-[#4F7C6B] sm:text-sm"
            >
              {t.faq}
            </Link>

            <Link
              to="/pricing"
              className="text-xs font-medium text-slate-600 transition hover:text-[#4F7C6B] sm:text-sm"
            >
              {t.pricing}
            </Link>
          </nav>
        </div>
      </header>

      {authModalOpen && (
        <AuthModal
  isOpen={authModalOpen}
  onClose={() =>
    setAuthModalOpen(false)
  }
  language={language}
/>
      )}
    </>
  );
};
      
