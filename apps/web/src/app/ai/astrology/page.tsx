"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AiAstrologyChat() {
  const [msgs, setMsgs] = useState<{ role: "user"|"ai"; text: string }[]>([
    { role: "ai", text: "Namaste! I am your AI astrologer. Tell me your birth date, time, place, and what you'd like to know." },
  ]);
  const [input, setInput] = useState(""); const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const next = [...msgs, { role: "user" as const, text: input }];
    setMsgs(next); setInput(""); setBusy(true);
    const r = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "chat_fallback", input: { message: input, history: next } }) });
    const data = await r.json();
    setMsgs(m => [...m, { role: "ai", text: data.text || "(no response)" }]);
    setBusy(false);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10 flex flex-col h-[80vh]">
        <h1 className="font-display text-3xl font-bold text-white">Chat with AI Astrologer</h1>
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white/5 border border-white/10 p-6 mt-4 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
              <div className={`max-w-md rounded-2xl px-4 py-3 ${m.role==="user"?"bg-[var(--color-primary)] text-white":"bg-white/10 text-white"}`}>{m.text}</div>
            </div>
          ))}
          {busy && <div className="text-white/50 text-sm">AI is typing…</div>}
        </div>
        <div className="mt-4 flex gap-2">
          <input className="input flex-1" placeholder="Type your question…" value={input}
            onKeyDown={e => e.key==="Enter" && send()}
            onChange={e => setInput(e.target.value)} />
          <button onClick={send} disabled={busy} className="btn-primary">Send</button>
        </div>
      </main>
      <Footer />
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </>
  );
}
