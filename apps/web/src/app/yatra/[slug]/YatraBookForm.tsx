"use client";
import { useState } from "react";

export default function YatraBookForm({ yatraId, price, available }: { yatraId: string; price: number; available: number }) {
  const [travellers, setTravellers] = useState(1);
  const [busy, setBusy] = useState(false);
  async function book() {
    setBusy(true);
    const r = await fetch("/api/yatra/book", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ yatraId, travellers }) });
    const d = await r.json();
    if (d.ok) window.location.href = "/dashboard"; else alert(d.error);
    setBusy(false);
  }
  return (
    <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6">
      <label className="text-sm text-white/60">Number of travellers (max {available})</label>
      <input type="number" min={1} max={available} value={travellers} onChange={e => setTravellers(Number(e.target.value))}
        className="input mt-1 w-32" />
      <div className="text-white mt-3">Total: ₹ {(price * travellers).toFixed(2)}</div>
      <button onClick={book} disabled={busy || travellers < 1} className="btn-primary mt-4">{busy?"Booking…":"Confirm Booking"}</button>
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.5rem .75rem;border-radius:.5rem}`}</style>
    </div>
  );
}
