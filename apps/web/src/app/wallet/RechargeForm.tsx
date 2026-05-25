"use client";
import { useState } from "react";

declare global { interface Window { Cashfree?: any } }

export default function RechargeForm({ presets }: { presets: number[] }) {
  const [amount, setAmount] = useState(500);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function recharge() {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/wallet/recharge", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");

      // Load Cashfree JS SDK
      if (!window.Cashfree) {
        await new Promise<void>((res, rej) => {
          const s = document.createElement("script");
          s.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
          s.onload = () => res(); s.onerror = () => rej(new Error("SDK load failed"));
          document.head.appendChild(s);
        });
      }
      const cf = window.Cashfree({ mode: data.env === "PROD" ? "production" : "sandbox" });
      await cf.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p} onClick={() => setAmount(p)}
            className={`px-4 py-2 rounded-full border ${
              amount === p ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white" : "border-white/10 text-white/80"
            }`}
          >₹ {p}</button>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          type="number" value={amount} min={50} step={50}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="flex-1 rounded-xl bg-black/30 border border-white/10 text-white px-4 py-3"
        />
        <button onClick={recharge} disabled={busy || amount < 50} className="btn-primary">
          {busy ? "Processing…" : `Recharge ₹${amount}`}
        </button>
      </div>
      {err && <div className="mt-3 text-red-300 text-sm">{err}</div>}
      <div className="mt-3 text-white/40 text-xs">
        Secure payments via Cashfree. UPI · Cards · Netbanking · Wallets.
      </div>
    </div>
  );
}
