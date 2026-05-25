import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SIGNS = [
  { slug: "aries", name: "Aries", glyph: "♈" }, { slug: "taurus", name: "Taurus", glyph: "♉" },
  { slug: "gemini", name: "Gemini", glyph: "♊" }, { slug: "cancer", name: "Cancer", glyph: "♋" },
  { slug: "leo", name: "Leo", glyph: "♌" }, { slug: "virgo", name: "Virgo", glyph: "♍" },
  { slug: "libra", name: "Libra", glyph: "♎" }, { slug: "scorpio", name: "Scorpio", glyph: "♏" },
  { slug: "sagittarius", name: "Sagittarius", glyph: "♐" }, { slug: "capricorn", name: "Capricorn", glyph: "♑" },
  { slug: "aquarius", name: "Aquarius", glyph: "♒" }, { slug: "pisces", name: "Pisces", glyph: "♓" },
];
const PERIODS = ["daily","weekly","monthly","yearly"] as const;

export default function HoroscopePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">Horoscopes</h1>
        <p className="text-white/60 mt-1">Daily, weekly, monthly and yearly forecasts for all 12 signs.</p>

        {PERIODS.map(p => (
          <section key={p} className="mt-10">
            <h2 className="text-xl font-semibold text-white capitalize">{p} Horoscope</h2>
            <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-3">
              {SIGNS.map(s => (
                <Link key={s.slug} href={`/horoscope/${p}/${s.slug}`}
                  className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-4 text-center transition">
                  <div className="text-3xl">{s.glyph}</div>
                  <div className="mt-1 text-white text-sm">{s.name}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
