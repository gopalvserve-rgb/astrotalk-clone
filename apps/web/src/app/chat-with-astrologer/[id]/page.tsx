"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";

export default function AstrologerChatRoom() {
  const params = useParams<{ id: string }>();
  const astrologerId = params.id;
  const [session, setSession] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [input, setInput] = useState(""); const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/consult/start", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ astrologerId, mode: "CHAT" }) });
      const data = await r.json();
      if (!r.ok) { alert(data.error); return; }
      setSession(data);
      // Start per-minute meter
      tickRef.current = setInterval(async () => {
        const t = await fetch("/api/consult/tick", { method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ consultationId: data.consultationId }) });
        const td = await t.json();
        if (td.ended) { clearInterval(tickRef.current!); alert("Session ended: " + td.reason); }
        else setBalance(td.balance);
      }, 60_000);
    })();
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [astrologerId]);

  async function send() {
    if (!input.trim() || !session) return;
    const next = [...msgs, { senderRole: "user", body: input }];
    setMsgs(next); setInput(""); setBusy(true);
    const r = await fetch("/api/consult/messages", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ consultationId: session.consultationId, body: input }) });
    const data = await r.json();
    if (data.reply) setMsgs(m => [...m, { senderRole: "ai", body: data.reply.body }]);
    setBusy(false);
  }

  async function endSession() {
    if (!session) return;
    await fetch("/api/consult/end", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ consultationId: session.consultationId, reason: "user_ended" }) });
    window.location.href = "/dashboard";
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 flex flex-col h-[85vh]">
        <div className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 p-4">
          <div>
            <div className="font-semibold text-white">{session?.astrologer?.name || "Connecting…"}</div>
            <div className="text-white/60 text-xs">₹ {session?.ratePerMin}/min</div>
          </div>
          <div className="text-right">
            <div className="text-white/60 text-xs">Wallet</div>
            <div className="text-white font-semibold">₹ {balance?.toFixed(2) ?? "—"}</div>
          </div>
          <button onClick={endSession} className="btn-ghost text-sm py-2 px-3">End</button>
        </div>

        <div className="flex-1 overflow-y-auto rounded-2xl bg-white/5 border border-white/10 p-6 mt-4 space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.senderRole==="user"?"justify-end":"justify-start"}`}>
              <div className={`max-w-md rounded-2xl px-4 py-3 ${m.senderRole==="user"?"bg-[var(--color-primary)] text-white":"bg-white/10 text-white"}`}>{m.body}</div>
            </div>
          ))}
          {busy && <div className="text-white/50 text-sm">Typing…</div>}
        </div>
        <div className="mt-4 flex gap-2">
          <input className="input flex-1" placeholder="Type your message…" value={input}
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
