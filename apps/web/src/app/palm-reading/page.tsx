"use client";
import { useState } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export default function PalmReadingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [hand, setHand] = useState<"left" | "right">("right");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!file) return;
    setBusy(true); setText("");
    const base64 = await new Promise<string>((res) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result).split(",")[1] ?? "");
      fr.readAsDataURL(file);
    });
    const r = await fetch("/api/ai", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        task: "palm_reading", input: { hand }, image: { base64, mimeType: file.type },
      }),
    });
    setText((await r.json()).text || ""); setBusy(false);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">AI Palm Reading</h1>
        <p className="text-white/60 mt-1">Upload a clear photo of your dominant palm. ₹49</p>

        <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
          <label className="text-white text-sm">Which hand?</label>
          <select value={hand} onChange={(e) => setHand(e.target.value as any)} className="input">
            <option value="right">Right (dominant)</option>
            <option value="left">Left</option>
          </select>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-white" />
        </div>

        <button onClick={run} disabled={busy || !file} className="btn-primary mt-4">
          {busy ? "Reading palm…" : "Get Palm Reading"}
        </button>

        {text && <article className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 text-white whitespace-pre-wrap">{text}</article>}
      </main>
      <Footer />
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </>
  );
}
