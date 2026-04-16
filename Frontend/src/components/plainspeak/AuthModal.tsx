"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../../lib/firebase"; // adjust path if needed
type Mode = "login" | "signup";

type Props = {
  onClose?: () => void;
};

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  setLoading(true);
  setError(null);
  setInfo(null);

  try {
    if (mode === "login") {
      await signInWithEmailAndPassword(auth, email, password);
      setInfo("Signed in successfully");
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
      setInfo("Account created successfully");
    }
  } catch (err: any) {
    console.error(err);

    // Cleaner error messages
    if (err.code === "auth/user-not-found") {
      setError("No account found with this email.");
    } else if (err.code === "auth/wrong-password") {
      setError("Incorrect password.");
    } else if (err.code === "auth/email-already-in-use") {
      setError("Email already in use.");
    } else if (err.code === "auth/weak-password") {
      setError("Password should be at least 6 characters.");
    } else {
      setError("Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      
      {/* Modal Card */}
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 shadow-lg p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {mode === "login" ? "Sign in" : "Create account"}
          </h2>

          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {info && (
            <p className="text-sm text-slate-600 dark:text-slate-300">{info}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 text-white py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
          >
            {loading
              ? "Working…"
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="text-sm text-center text-slate-500">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-slate-900 dark:text-white font-medium"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-slate-900 dark:text-white font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


