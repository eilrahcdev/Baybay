import { useState } from "react";

export default function Newsletter({ onSubscribe }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setBusy(true);
      await onSubscribe(email.trim());
      setEmail("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl bg-baybay-cocoa text-white p-8 sm:p-10 shadow-soft">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-white/80">Newsletter</p>
          <h3 className="mt-2 text-3xl font-semibold">Get artisan stories and new products</h3>
          <p className="mt-3 text-white/85">
            Receive updates on local crafts, featured makers, and new delicacies—straight to your inbox.
          </p>
        </div>

        <form onSubmit={submit} className="flex w-full md:max-w-md gap-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="flex-1 rounded-full px-4 py-3 text-baybay-ink outline-none"
          />
          <button
            disabled={busy}
            className="rounded-full bg-white text-baybay-ink px-5 py-3 text-sm font-semibold shadow-soft disabled:opacity-70"
          >
            {busy ? "Saving..." : "Subscribe"}
          </button>
        </form>
      </div>
    </div>
  );
}
