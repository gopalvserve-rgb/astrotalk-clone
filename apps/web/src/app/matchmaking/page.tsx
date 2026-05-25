"use client";
import { useState } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export default function MatchmakingPage() {
  const blank = { name: "", date: "", time: "", place: "" };
  const [boy, setBoy] = useState({ ...blank });
  const [girl, setGirl] = useState({ ...blank });
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setResult(null);
    const r = await fetch("/api/astrology/match", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ boy, girl }),
    });
    setResult(await r.json()); setBusy(false);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Kundli Matching (36 Gunas)</h1>
        <p className="text-white/60 mt-1">Ashtakoot Guna Milan — check compatibility for marriage.</p>

        <form onSubmit={go} className="mt-6 grid md:grid-cols-2 gap-6">
          <Partner title="Boy" data={boy} setData={setBoy} />
          <Partner title="Girl" data={girl} setData={setGirl} />
          <div className="md:col-span-2"><button disabled={busy} className="btn-primary">{busy ? "Matching…" : "Check Compatibility"}</button></div>
        </form>

        {result?.ok && (
          <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 text-white">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-5xl font-bold">{result.total} / 36</div>
                <div className="text-[var(--color-primary)] font-semibold mt-1">{result.verdict} · {result.percent}%</div>
              </div>
            </div>
            <table className="w-full mt-6 text-sm">
              <thead className="text-white/60 text-left"><tr><th>Koot</th><th>Score</th><th>Reason</th></tr></thead>
              <tbody>
                {result.breakdown.map((b: any) => (
                  <tr key={b.koot} className="border-t border-white/5">
                    <td className="py-2">{b.koot}</td>
                    <td>{b.score} / {b.max}</td>
                    <td className="text-white/60">{b.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.5rem .75rem;border-radius:.5rem;width:100%}`}</style>
    </>
  );
}

function Partner({ title, data, setData }: { title: string; data: any; setData: (x: any) => void }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="space-y-3 mt-3">
        <input placeholder="Name" className="input" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
        <input type="date" className="input" value={data.date} onChange={e => setData({ ...data, date: e.target.value })} />
        <input type="time" className="input" value={data.time} onChange={e => setData({ ...data, time: e.target.value })} />
        <input placeholder="Place" className="input" value={data.place} onChange={e => setData({ ...data, place: e.target.value })} />
      </div>
    </div>
  );
}
