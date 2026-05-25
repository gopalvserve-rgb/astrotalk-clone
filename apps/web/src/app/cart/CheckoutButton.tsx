"use client";
import { useState } from "react";

export default function CheckoutButton() {
  const [method, setMethod] = useState<"wallet" | "cashfree">("wallet");
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ method }) });
    const data = await r.json();
    if (data.paymentSessionId) {
      // Cashfree flow
      if (!(window as any).Cashfree) {
        await new Promise<void>((res) => { const s = document.createElement("script"); s.src = "https://sdk.cashfree.com/js/v3/cashfree.js"; s.onload = () => res(); document.head.appendChild(s); });
      }
      const cf = (window as any).Cashfree({ mode: data.env === "PROD" ? "production" : "sandbox" });
      await cf.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
    } else if (data.ok) {
      window.location.href = `/orders/${data.orderId}`;
    } else {
      alert(data.error || "Failed");
    }
    setBusy(false);
  }
  return (
    <div className="flex gap-2 items-center">
      <select value={method} onChange={e => setMethod(e.target.value as any)} className="rounded-lg bg-black/30 border border-white/10 text-white px-3 py-2">
        <option value="wallet">Pay with Wallet</option>
        <option value="cashfree">Cashfree (Card/UPI)</option>
      </select>
      <button onClick={go} disabled={busy} className="btn-primary">{busy?"Processing…":"Checkout"}</button>
    </div>
  );
}
