import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function PurchaseModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const purchase = async (packSize: string) => {
    try {
      setLoading(true);

      const token = await (await import("firebase/auth"))
        .getAuth()
        .currentUser?.getIdToken();

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packSize }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-lg">
        <h2 className="text-lg font-semibold text-center">
          You’re out of Keys
        </h2>

        <p className="text-sm text-slate-600 text-center">
          Purchase more Keys to continue.
        </p>

        <div className="space-y-2">
          <button
            disabled={loading}
            onClick={() => purchase("6")}
            className="w-full rounded-md bg-slate-900 text-white py-2"
          >
            6 Keys — $18
          </button>

          <button
            disabled={loading}
            onClick={() => purchase("15")}
            className="w-full rounded-md bg-slate-800 text-white py-2"
          >
            15 Keys — $42
          </button>

          <button
            disabled={loading}
            onClick={() => purchase("30")}
            className="w-full rounded-md bg-slate-700 text-white py-2"
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