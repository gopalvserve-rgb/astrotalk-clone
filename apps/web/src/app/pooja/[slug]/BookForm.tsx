"use client";
import { useState } from "react";

export default function BookForm({ templateId, price }: { templateId: string; price: number }) {
  const [dt, setDt] = useState(""); const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  async function book() {
    setBusy(true);
    const r = await fetch("/api/pooja/book", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId, scheduledAt: dt, notes }) });
    const d = await r.json();
    if (d.ok) window.location.href = `/dashboard/bookings/${d.bookingId}`; else alert(d.error);
    setBusy(false);
  }
  return (
    <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6">
      <label className="text-sm text-white/60">Schedule for</label>
      <input type="datetime-local" className="input mt-1" value={dt} onChange={e => setDt(e.target.value)} />
      <label className="text-sm text-white/60 mt-3 block">Special instructions / Sankalp details</label>
      <textarea rows={3} className="input mt-1" value={notes} onChange={e => setNotes(e.target.value)} />
      <button onClick={book} disabled={busy || !dt} className="btn-primary mt-4">{busy?"Booking…":`Book Pooja · ₹ ${price}`}</button>
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </div>
  );
}
