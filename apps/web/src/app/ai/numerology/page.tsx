"use client";
import { useState } from "react";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";

export default function AiNumerologyPage() {
  const [form, setForm] = useState({ name: "", dob: "" });
  const [report, setReport] = useState<any>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true); setReport(null); setText("");
    // 1) Compute numbers locally
    const c = await fetch("/api/numerology", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
    const calc = await c.json();
    setReport(calc.report);
    // 2) Pass to AI for narrative
    const a = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "numerology_report", input: { name: form.name, dob: form.dob, ...calc.report } }) });
    setText((await a.json()).text || "");
    setBusy(false);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">AI Numerology Report</h1>
        <p className="text-white/60 mt-1">Pythagorean + Chaldean + DeepSeek narrative. ₹29</p>

        <div className="mt-6 grid md:grid-cols-2 gap-4 rounded-2xl bg-white/5 border border-white/10 p-6">
          <input placeholder="Full name (use full birth-name)" className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input type="date" className="input" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
        </div>
        <button onClick={go} disabled={busy || !form.name || !form.dob} className="btn-primary mt-4">{busy?"Calculating…":"Generate Report"}</button>

        {report && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(report).map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs uppercase text-white/50">{k}</div>
                <div className="text-white text-lg">{Array.isArray(v) ? v.join(", ") : String(v)}</div>
              </div>
            ))}
          </div>
        )}
        {text && <article className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6 text-white whitespace-pre-wrap">{text}</article>}
      </main>
      <Footer />
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </>
  );
}
