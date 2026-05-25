"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NameGeneratorPage() {
  const [kind, setKind] = useState<"business" | "baby">("business");
  const [f, setF] = useState({
    industry: "Software", founders: "", preferences: "",
    babyGender: "boy", nakshatra: "", startingSyllable: "",
  });
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true); setText("");
    const r = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: kind === "business" ? "business_name" : "baby_name", input: f }) });
    setText((await r.json()).text || ""); setBusy(false);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">AI Name Generator</h1>
        <p className="text-white/60 mt-1">Business or baby names — auspicious + numerologically aligned. ₹19</p>

        <div className="mt-4 flex gap-2">
          <button onClick={() => setKind("business")} className={`btn-${kind==="business"?"primary":"ghost"} text-sm py-2 px-4`}>Business name</button>
          <button onClick={() => setKind("baby")} className={`btn-${kind==="baby"?"primary":"ghost"} text-sm py-2 px-4`}>Baby name</button>
        </div>

        {kind === "business" ? (
          <div className="mt-6 grid md:grid-cols-2 gap-3 rounded-2xl bg-white/5 border border-white/10 p-6">
            <input className="input" placeholder="Industry" value={f.industry} onChange={e => setF({...f, industry: e.target.value})} />
            <input className="input" placeholder="Founder names (comma-separated)" value={f.founders} onChange={e => setF({...f, founders: e.target.value})} />
            <textarea className="input md:col-span-2" rows={2} placeholder="Preferences (e.g. starts with 'A', short, .com available)" value={f.preferences} onChange={e => setF({...f, preferences: e.target.value})} />
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-2 gap-3 rounded-2xl bg-white/5 border border-white/10 p-6">
            <select className="input" value={f.babyGender} onChange={e => setF({...f, babyGender: e.target.value})}>
              <option value="boy">Boy</option><option value="girl">Girl</option>
            </select>
            <input className="input" placeholder="Nakshatra" value={f.nakshatra} onChange={e => setF({...f, nakshatra: e.target.value})} />
            <input className="input" placeholder="Starting syllable (optional)" value={f.startingSyllable} onChange={e => setF({...f, startingSyllable: e.target.value})} />
          </div>
        )}
        <button onClick={go} disabled={busy} className="btn-primary mt-4">{busy?"Generating…":"Get Names"}</button>
        {text && <article className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6 text-white whitespace-pre-wrap">{text}</article>}
      </main>
      <Footer />
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </>
  );
}
