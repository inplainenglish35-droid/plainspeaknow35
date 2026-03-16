import React, { useState } from "react";
import { X } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth } from "../../utils/firebase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = "login" | "signup";

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Send verification email
        await sendEmailVerification(userCredential.user);

        // Sign out until verified
        await signOut(auth);

        setInfo(
          "Verification email sent. Please check your inbox before signing in."
        );

        setMode("login");
      }
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="relative w-full max-w-md mx-4 rounded-lg bg-white border border-slate-200 shadow-md p-6"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-md p-1 text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4 text-center">
          <h2
            id="auth-title"
            className="text-lg font-semibold text-slate-900"
          >
            {mode === "login"
              ? "Sign in to PlainSpeak"
              : "Create an account"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Sign in is required to protect usage and costs.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          />

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {info && (
            <p className="text-sm text-slate-700">
              {info}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Working…"
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>

          <p className="pt-2 text-sm text-center text-slate-600">
            {mode === "login" ? (
              <>
                Don’t have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-slate-900 underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-slate-900 underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};



