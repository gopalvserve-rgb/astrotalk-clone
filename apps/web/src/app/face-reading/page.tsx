"use client";
import { useState } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export default function FaceReadingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    if (!file) return;
    setBusy(true); setText(""); setErr("");
    try {
      const base64 = await new Promise<string>((res) => {
        const fr = new FileReader();
        fr.onload = () => res(String(fr.result).split(",")[1] ?? "");
        fr.readAsDataURL(file);
      });
      const r = await fetch("/api/ai", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          task: "face_reading", input: { note: "User-uploaded selfie" },
          image: { base64, mimeType: file.type },
        }),
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
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">AI Face Reading</h1>
        <p className="text-white/60 mt-1">Upload a clear front-facing selfie. Powered by Gemini Vision. ₹49</p>

        <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6">
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-white" />
          {file && <div className="text-white/60 text-xs mt-2">{file.name}</div>}
        </div>

        <button onClick={run} disabled={busy || !file} className="btn-primary mt-4">
          {busy ? "Reading face…" : "Get Face Reading"}
        </button>
        {err && <div className="mt-3 text-red-300">{err}</div>}

        {text && (
          <article className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 text-white whitespace-pre-wrap">{text}</article>
        )}
      </main>
      <Footer />
    </>
  );
}
