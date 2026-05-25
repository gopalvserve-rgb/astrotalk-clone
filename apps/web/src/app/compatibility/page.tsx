"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];

export default function CompatibilityPage() {
  const [a, setA] = useState("Aries"); const [b, setB] = useState("Leo");
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true); setText("");
    const r = await fetch("/api/ai", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "compatibility", input: { sign_a: a, sign_b: b } }),
    });
    setText((await r.json()).text || ""); setBusy(false);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Zodiac Compatibility</h1>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <select value={a} onChange={e => setA(e.target.value)} className="input">
            {SIGNS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={b} onChange={e => setB(e.target.value)} className="input">
            {SIGNS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={go} disabled={busy} className="btn-primary mt-4">{busy ? "Analyzing…" : "Check Compatibility"}</button>
        {text && <article className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6 text-white whitespace-pre-wrap">{text}</article>}
      </main>
      <Footer />
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </>
  );
}
