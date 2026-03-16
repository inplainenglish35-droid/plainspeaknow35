import { useState, useEffect } from "react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "./contexts/AuthContext";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

import {
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  language: "en" | "es";
  setLanguage: (lang: "en" | "es") => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
}) => {
  const { user } = useAuth();

  const [isDark, setIsDark] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);

    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    setUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-sm border-b border-teal-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* LEFT SIDE */}
            <div className="flex items-center gap-8">

              {/* Logo */}
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Plainspeak Logo"
                  className="h-10 w-auto"
                />
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                  Beta
                </span>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-6 text-sm">
                <a
                  href="mailto:inplainenglish35@gmail.com?subject=Plainspeak Beta Feedback"
                  className="text-slate-600 hover:text-slate-900 transition"
                >
                  Send Feedback
                </a>

                <Link
                  to="/faq"
                  className="text-slate-600 hover:text-slate-900 transition"
                >
                  FAQ
                </Link>

                <Link
                  to="/pricing"
                  className="text-slate-600 hover:text-slate-900 transition"
                >
                  Pricing
                </Link>
              </nav>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">

              {/* Language Toggle */}
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-1 rounded ${
                    language === "en"
                      ? "bg-teal-100 text-teal-800"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  EN
                </button>

                <button
                  onClick={() => setLanguage("es")}
                  className={`px-2 py-1 rounded ${
                    language === "es"
                      ? "bg-teal-100 text-teal-800"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  ES
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className="p-2 rounded-lg hover:bg-teal-50 transition"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-slate-600" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {/* Auth */}
              {!user ? (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4f7c6b] text-white hover:bg-[#3e6557] transition"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#4f7c6b] text-white hover:bg-[#3e6557] transition"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium truncate max-w-[140px]">
                      {user.displayName || user.email}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-lg border border-teal-100 bg-white shadow-lg">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-teal-50"
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
};
      
