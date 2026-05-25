"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AiKundaliPage() {
  const [form, setForm] = useState({ name: "", date: "", time: "", place: "" });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true); setText(""); setErr("");
    try {
      const r = await fetch("/api/ai", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ task: "kundali_reading", input: form, language: "en" }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      setText(data.text);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">AI Kundali Reading</h1>
        <p className="text-white/60 mt-1">Get a detailed AI-powered Vedic reading using DeepSeek + Gemini. ₹49</p>

        <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6 grid md:grid-cols-2 gap-4">
          <input placeholder="Full name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input type="time" className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <input placeholder="Place of birth" className="input" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} />
        </div>

        <button onClick={run} disabled={busy} className="btn-primary mt-4">
          {busy ? "Reading the stars…" : "Get AI Reading"}
        </button>
        {err && <div className="mt-3 text-red-300">{err}</div>}

        {text && (
          <article className="mt-8 prose prose-invert max-w-none rounded-2xl bg-white/5 border border-white/10 p-6 text-white whitespace-pre-wrap">
            {text}
          </article>
        )}
      </main>
      <Footer />
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </>
  );
}
