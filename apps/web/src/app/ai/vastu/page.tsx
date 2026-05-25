"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const DIRECTIONS = ["N","NE","E","SE","S","SW","W","NW"];

export default function AiVastuPage() {
  const [f, setF] = useState({
    propertyType: "Home",
    entranceDirection: "N",
    kitchenDirection: "SE",
    masterBedroomDirection: "SW",
    poojaRoomDirection: "NE",
    toiletDirection: "NW",
    plotShape: "Rectangular",
    issues: "",
  });
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true); setText("");
    const r = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ task: "vastu_consult", input: f }) });
    setText((await r.json()).text || ""); setBusy(false);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">AI Vastu Consultation</h1>
        <p className="text-white/60 mt-1">Personalised Vastu analysis with non-structural remedies. ₹49</p>

        <div className="mt-6 grid md:grid-cols-2 gap-3 rounded-2xl bg-white/5 border border-white/10 p-6">
          <Sel label="Property" v={f.propertyType} k="propertyType" set={setF} opts={["Home","Office","Shop","Plot"]} />
          <Sel label="Plot shape" v={f.plotShape} k="plotShape" set={setF} opts={["Rectangular","Square","L-shape","Irregular"]} />
          <Sel label="Main entrance" v={f.entranceDirection} k="entranceDirection" set={setF} opts={DIRECTIONS} />
          <Sel label="Kitchen" v={f.kitchenDirection} k="kitchenDirection" set={setF} opts={DIRECTIONS} />
          <Sel label="Master bedroom" v={f.masterBedroomDirection} k="masterBedroomDirection" set={setF} opts={DIRECTIONS} />
          <Sel label="Pooja room" v={f.poojaRoomDirection} k="poojaRoomDirection" set={setF} opts={DIRECTIONS} />
          <Sel label="Toilet" v={f.toiletDirection} k="toiletDirection" set={setF} opts={DIRECTIONS} />
          <textarea className="input md:col-span-2" rows={3} placeholder="Describe any issues (financial, health, conflicts…)"
            value={f.issues} onChange={e => setF({...f, issues: e.target.value})} />
        </div>
        <button onClick={go} disabled={busy} className="btn-primary mt-4">{busy?"Analyzing…":"Get Vastu Report"}</button>
        {text && <article className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-6 text-white whitespace-pre-wrap">{text}</article>}
      </main>
      <Footer />
      <style>{`.input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);color:#fff;padding:.75rem 1rem;border-radius:.75rem;width:100%}`}</style>
    </>
  );
}
function Sel({ label, v, k, set, opts }: any) {
  return <label className="block"><div className="text-xs text-white/60 mb-1">{label}</div>
    <select className="input" value={v} onChange={e => set((p:any)=>({...p, [k]: e.target.value}))}>{opts.map((o:string)=> <option key={o}>{o}</option>)}</select>
  </label>;
}
