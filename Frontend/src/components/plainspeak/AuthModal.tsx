import React, { useState } from "react";
import type { FormEvent } from "react";

type Mode = "login" | "signup";

export default function AuthModal() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // TEMP test logic
      console.log("Submitting:", { email, password, mode });

      // simulate delay
      await new Promise((r) => setTimeout(r, 800));

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Form */}
      <form
        onSubmit={(e) => {
  e.preventDefault();
  handleSubmit();
}}
        className="space-y-3"
      >
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
        />

        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full rounded-md border border-slate-300 px-3 py-2"
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
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          {loading
            ? "Working…"
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </button>
      </form>
    </div>
  );
}


