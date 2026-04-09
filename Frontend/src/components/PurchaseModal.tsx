import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "";

interface Props {
  onClose: () => void;
}

export default function PurchaseModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [hasUser, setHasUser] = useState<boolean | null>(null);

  // ================================
  // CHECK AUTH ON LOAD
  // ================================
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { getAuth } = await import("firebase/auth");
        const auth = getAuth();

        if (mounted) {
          setHasUser(!!auth.currentUser);
        }
      } catch {
        if (mounted) setHasUser(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const isDisabled = loading || !hasUser;

  // ================================
  // PURCHASE HANDLER
  // ================================
  const purchase = async (packSize: string) => {
    try {
      setLoading(true);

      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();

      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }

      const token = await auth.currentUser.getIdToken(true);

      const response = await fetch(
        `${API_URL}/api/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ packSize }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error:", data);
        throw new Error(data.message || "Checkout failed");
      }

      if (!data.url) {
        console.error("No checkout URL returned:", data);
        throw new Error("No checkout URL returned");
      }

      // ✅ CRITICAL: redirect to Stripe
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg">
        <h2 className="text-lg font-semibold text-center">
          You’re out of Keys
        </h2>

        <p className="text-sm text-slate-600 text-center">
          Purchase more Keys to continue.
        </p>

        {hasUser === false && (
          <p className="text-xs text-red-500 text-center">
            Please sign in to purchase Keys.
          </p>
        )}

        <div className="space-y-2">
          <button
            disabled={isDisabled}
            onClick={() => purchase("6")}
            className="w-full rounded-md bg-slate-900 text-white py-2 disabled:opacity-50"
          >
            6 Keys — $18
          </button>

          <button
            disabled={isDisabled}
            onClick={() => purchase("15")}
            className="w-full rounded-md bg-slate-800 text-white py-2 disabled:opacity-50"
          >
            15 Keys — $42
          </button>

          <button
            disabled={isDisabled}
            onClick={() => purchase("30")}
            className="w-full rounded-md bg-slate-700 text-white py-2 disabled:opacity-50"
          >
            30 Keys — $78
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-sm text-slate-500 w-full text-center pt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}