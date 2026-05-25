"use client";
import { useState } from "react";

const PRESETS = [101, 251, 501, 1100, 2100, 5100];

export default function DonateForm({ causeId }: { causeId: string }) {
  const [amount, setAmount] = useState(251); const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function donate() {
    setBusy(true);
    const r = await fetch("/api/sewa/donate", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ causeId, amount, message: msg }) });
    const d = await r.json();
    if (d.ok) { alert("Thank you for your sewa! 🙏"); window.location.reload(); }
    else alert(d.error);
    setBusy(false);
  }
  return (
    <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button key={p} onClick={() => setAmount(p)} className={`px-4 py-2 rounded-full border ${amount===p?"bg-[var(--color-primary)] border-[var(--color-primary)] text-white":"border-white/10 text-white"}`}>₹ {p}</button>
        ))}
      </div>
      <textarea rows={2} placeholder="Sankalp / dedication (optional)" value={msg} onChange={e => setMsg(e.target.value)} className="input mt-3" />
      <button onClick={donate} disabled={busy || amount < 1} className="btn-primary mt-4">{busy?"Processing…":`Donate ₹ ${amount}`}</button>
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </div>
  );
}
