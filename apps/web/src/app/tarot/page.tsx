"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const MAJOR = ["The Fool","The Magician","The High Priestess","The Empress","The Emperor","The Hierophant","The Lovers","The Chariot","Strength","The Hermit","Wheel of Fortune","Justice","The Hanged Man","Death","Temperance","The Devil","The Tower","The Star","The Moon","The Sun","Judgement","The World"];
const SUITS = ["Wands","Cups","Swords","Pentacles"];
const COURT = ["Page","Knight","Queen","King"];
const DECK: string[] = [...MAJOR, ...SUITS.flatMap(s => ["Ace","2","3","4","5","6","7","8","9","10",...COURT].map(r => `${r} of ${s}`))];

function drawCards(n: number) {
  const d = [...DECK].sort(() => Math.random() - 0.5).slice(0, n);
  return d.map(name => ({ name, reversed: Math.random() < 0.3 }));
}

export default function TarotPage() {
  const [spread, setSpread] = useState<"3" | "5" | "10">("3");
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState<{ name: string; reversed: boolean }[]>([]);
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false);

  function flip() { setCards(drawCards(Number(spread))); setText(""); }

  async function interpret() {
    setBusy(true);
    const r = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "tarot_reading", input: { question, spread, cards } }) });
    setText((await r.json()).text || ""); setBusy(false);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Tarot Reading</h1>
        <p className="text-white/60 mt-1">3-card / 5-card / Celtic Cross spreads with AI interpretation. ₹29</p>

        <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
          <textarea className="input" rows={2} placeholder="What's your question?" value={question} onChange={e=>setQuestion(e.target.value)} />
          <div className="flex gap-2">
            {(["3","5","10"] as const).map(s => (
              <button key={s} onClick={() => setSpread(s)}
                className={`px-4 py-2 rounded-full border ${spread===s?"bg-[var(--color-primary)] border-[var(--color-primary)] text-white":"border-white/10 text-white"}`}>
                {s === "3" ? "Past-Present-Future" : s === "5" ? "5-card" : "Celtic Cross"}
              </button>
            ))}
          </div>
          <button onClick={flip} className="btn-primary">Draw cards</button>
        </div>

        {cards.length > 0 && (
          <>
            <div className={`mt-6 grid gap-3 ${cards.length===3?"grid-cols-3":cards.length===5?"grid-cols-5":"grid-cols-5"}`}>
              {cards.map((c, i) => (
                <div key={i} className={`rounded-2xl border border-white/10 p-4 text-center ${c.reversed?"bg-red-900/20":"bg-white/5"}`}>
                  <div className="text-3xl">🃏</div>
                  <div className="text-white text-sm mt-1">{c.name}</div>
                  {c.reversed && <div className="text-red-300 text-[10px] mt-1">Reversed</div>}
                </div>
              ))}
            </div>
            <button onClick={interpret} disabled={busy || !question} className="btn-primary mt-4">{busy?"Reading…":"Get AI Interpretation"}</button>
          </>
        )}
        {text && <article className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6 text-white whitespace-pre-wrap">{text}</article>}
      </main>
      <Footer />
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </>
  );
}
