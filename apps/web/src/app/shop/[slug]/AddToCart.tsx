"use client";
import { useState } from "react";

export default function AddToCart({ productId }: { productId: string }) {
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  async function add() {
    setBusy(true);
    await fetch("/api/cart", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, qty }) });
    setBusy(false); window.location.href = "/cart";
  }
  return (
    <div className="mt-6 flex gap-2 items-center">
      <input type="number" min={1} value={qty} onChange={e => setQty(Number(e.target.value))}
        className="w-20 rounded-lg bg-black/30 border border-white/10 text-white px-3 py-2" />
      <button onClick={add} disabled={busy} className="btn-primary">{busy?"Adding…":"Add to Cart"}</button>
    </div>
  );
}
