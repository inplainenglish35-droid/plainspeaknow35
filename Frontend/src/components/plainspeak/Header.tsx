import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";

import { useAuth } from "./contexts/AuthContext";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

import {
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

/* =========================
   TYPES
========================= */

type Language = "en" | "es" | "vi" | "tl";

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
  const { user } = useAuth();

  const [isDark, setIsDark] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  /* =========================
     DARK MODE SYSTEM
  ========================= */

  // Init (saved or system)
  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved === "dark") {
      setIsDark(true);
    } else if (saved === "light") {
      setIsDark(false);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

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
      <header className="sticky top-0 z-50 bg-white/40 dark:bg-slate-900/80 backdrop-blur-sm border-b border-teal-100 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* LEFT */}
            <div className="flex items-center gap-6 sm:gap-8">

              <Link to="/" className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Plainspeak Logo"
                  className="h-30 sm:h-32 w-auto"
                />
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                  Beta
                </span>
              </Link>

              <nav className="hidden sm:flex items-center gap-6 text-sm">
                <a
                  href="mailto:inplainenglish35@gmail.com?subject=Plainspeak Beta Feedback"
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Send Feedback
                </a>

                <Link
                  to="/faq"
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  FAQ
                </Link>

                <Link
                  to="/pricing"
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                >
                  Pricing
                </Link>
              </nav>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* LANGUAGE */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="vi">VI</option>
                <option value="tl">TL</option>
              </select>

              {/* DARK MODE */}
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-slate-700 transition"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-slate-300" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {/* AUTH */}
              {!user ? (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#4f7c6b] text-white hover:bg-[#3e6557] transition text-sm"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#4f7c6b] text-white hover:bg-[#3e6557] transition"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline text-sm truncate max-w-[140px]">
                      {user.displayName || user.email}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-lg border border-teal-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-teal-50 dark:hover:bg-slate-700"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {authModalOpen && (
  <AuthModal onClose={() => setAuthModalOpen(false)} />
)}
    </>
  );
};
      
