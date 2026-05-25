"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function FreeKundliPage() {
  const [form, setForm] = useState({
    name: "", gender: "male", date: "", time: "", place: "", lat: 28.61, lng: 77.20,
  });
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setResult(null);
    try {
      const r = await fetch("/api/astrology/kundali", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      setResult(data);
    } finally { setBusy(false); }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Free Kundli</h1>
        <p className="text-white/60 mt-2">Generate your Vedic birth chart instantly.</p>

        <form onSubmit={submit} className="mt-6 grid md:grid-cols-2 gap-4 rounded-2xl bg-white/5 border border-white/10 p-6">
          <Field label="Full name">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Gender">
            <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
          </Field>
          <Field label="Date of birth">
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </Field>
          <Field label="Time of birth">
            <input type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
          </Field>
          <Field label="Place of birth">
            <input className="input md:col-span-2" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} required />
          </Field>
          <div className="md:col-span-2">
            <button disabled={busy} className="btn-primary">{busy ? "Calculating…" : "Generate Kundli"}</button>
          </div>
        </form>

        {result && (
          <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 text-white">
            <h2 className="text-xl font-semibold">Your Kundli</h2>
            <pre className="mt-3 text-xs whitespace-pre-wrap text-white/80">{JSON.stringify(result, null, 2)}</pre>
            <a href="/ai/kundali" className="btn-primary mt-4 inline-flex">Get AI Reading →</a>
          </div>
        )}
      </main>
      <Footer />
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><div className="text-xs text-white/60 mb-1">{label}</div>{children}</label>;
}
