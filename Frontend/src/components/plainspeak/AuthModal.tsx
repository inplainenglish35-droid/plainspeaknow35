"use client";

import { useState } from "react";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  getFirestore,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth } from "../../lib/firebase";
import type { Language } from "./types/language";
import { translations } from "../../i18n";
const isValidPassword = (password: string) => {
  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};
const db = getFirestore();
const API_URL = import.meta.env.VITE_API_URL ?? "";
type Mode = "login" | "signup";

type Props = {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModal({
  language,
  isOpen,
  onClose,
}: Props) {
  const t = translations[language];

  const [mode, setMode] =
    useState<Mode>("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [info, setInfo] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        setInfo(t.authSignedInSuccess);
        onClose();
        return;
      }

      if (!isValidPassword(password)) {
        setError(t.authPasswordRequirements);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: user.displayName || "",
        keyBalance: 1,
        role: "user",
        feedbackAccepted: false,
        feedbackDeclines: 0,
        createdAt: serverTimestamp(),
      });

      try {
        await fetch(`${API_URL}/api/send-welcome-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });
      } catch (error) {
        console.error("Welcome email failed:", error);
      }

      setInfo(t.authAccountCreated);
      onClose();
    } catch (err: any) {
      console.error("FULL SIGNUP ERROR:", err);
      console.error("ERROR CODE:", err?.code);
      console.error("ERROR MESSAGE:", err?.message);

      if (err.code === "auth/user-not-found") {
        setError(t.authNoAccount);
      } else if (err.code === "auth/wrong-password") {
        setError(t.authIncorrectPassword);
      } else if (err.code === "auth/email-already-in-use") {
        setError(t.authEmailInUse);
      } else if (err.code === "auth/weak-password") {
        setError(t.authWeakPassword);
      } else {
        setError(t.authGenericError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-[#FFFFFF] shadow-[0_24px_70px_-30px_rgba(15,23,42,0.30)] p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === "login"
  ? t.authSignIn
  : t.authCreateAccount}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <input
            id="email"
            name="email"
            type="email"
            placeholder={t.authEmail}
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="email"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4F7C6B] focus:outline-none focus:ring-2 focus:ring-[#4F7C6B]/20"
          />

          <input
            id="password"
            name="password"
            type="password"
            placeholder={t.authPassword}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="current-password"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#4F7C6B] focus:outline-none focus:ring-2 focus:ring-[#4F7C6B]/20"
          />
          {mode === "signup" && (
  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
    <p>{t.authPasswordMustContain}</p>
    <p>• {t.authPasswordSixCharacters}</p>
    <p>• {t.authPasswordUppercase}</p>
    <p>• {t.authPasswordLowercase}</p>
    <p>• {t.authPasswordNumber}</p>
    <p>• {t.authPasswordSpecial}</p>
  </div>
)}
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {info && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading
  ? t.authWorking
  : mode === "login"
  ? t.authSignIn
  : t.authCreateAccount}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-sm text-center text-slate-500">
          {mode === "login" ? (
  <>
    {t.authNoAccountPrompt}{" "}
    <button
      onClick={() =>
        setMode("signup")
      }
      className="text-[#4F7C6B] font-semibold underline underline-offset-2"
    >
      {t.authCreateOne}
    </button>
  </>
) : (
  <>
    {t.authAlreadyAccount}{" "}
    <button
      onClick={() =>
        setMode("login")
      }
      className="text-[#4F7C6B] font-semibold underline underline-offset-2"
    >
      {t.authSignIn}
    </button>
  </>
)}
        </div>
      </div>
    </div>
  );
}