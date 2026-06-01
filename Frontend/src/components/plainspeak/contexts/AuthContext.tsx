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
}

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext<AuthContextValue | null>(null);

/* =========================
   PROVIDER
========================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyBalance, setKeyBalance] =
  useState<number | null>(null);
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







