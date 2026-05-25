import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { getPanchang } from "@astrotalk/astrology";

export default function PanchangPage() {
  const today = new Date();
  const p = getPanchang(today, 28.61, 77.20);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Today's Panchang</h1>
        <p className="text-white/60 mt-1">For New Delhi · {today.toDateString()}</p>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {Object.entries(p).map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="text-xs uppercase text-white/50">{k}</div>
              <div className="text-white text-lg">{String(v)}</div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
