import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../../../lib/firebase";

/* =========================
   TYPES
========================= */

interface AuthContextValue {
  user: User | null;
  loading: boolean;

  keyBalance: number | null;
  setKeyBalance: React.Dispatch<
    React.SetStateAction<number | null>
  >;

  refreshKeyBalance: () => Promise<void>;

  feedbackAccepted: boolean;
  setFeedbackAccepted: React.Dispatch<
    React.SetStateAction<boolean>
  >;

  feedbackDeclines: number;
  setFeedbackDeclines: React.Dispatch<
    React.SetStateAction<number>
  >;
}



const AuthContext = createContext<AuthContextValue | null>(null);

/* =========================
   PROVIDER
========================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [keyBalance, setKeyBalance] =
    useState<number | null>(null);

  const [feedbackAccepted, setFeedbackAccepted] =
    useState(false);

  const [feedbackDeclines, setFeedbackDeclines] =
    useState(0);
  const refreshKeyBalance = async () => {
  if (!user) {
    setKeyBalance(null);
    return;
  }

  try {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = await user.getIdToken();

    const res = await fetch(`${API_URL}/api/key-balance`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch key balance");
    }

    const data = await res.json();

    setKeyBalance(data.keyBalance ?? 0);
    setFeedbackAccepted(data.feedbackAccepted ?? false);
    setFeedbackDeclines(data.feedbackDeclines ?? 0);
  } catch (error) {
    console.error("Key balance refresh failed:", error);
  }
};
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
  value={{
    user,
    loading,

    keyBalance,
    setKeyBalance,
    refreshKeyBalance,

    feedbackAccepted,
    setFeedbackAccepted,

    feedbackDeclines,
    setFeedbackDeclines,
  }}
>
      {children}
    </AuthContext.Provider>
  );
}

/* =========================
   HOOK
========================= */

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}







