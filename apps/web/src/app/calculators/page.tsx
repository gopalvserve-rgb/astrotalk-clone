import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const CALC_GROUPS = [
  {
    name: "Vedic Astrology", items: [
      { slug: "kundali", name: "Free Kundli", icon: "🔮" },
      { slug: "matching", name: "Kundli Matching", icon: "💞" },
      { slug: "panchang", name: "Today Panchang", icon: "☀️" },
      { slug: "dasha", name: "Vimshottari Dasha", icon: "🌀" },
      { slug: "compatibility", name: "Zodiac Compatibility", icon: "♈" },
      { slug: "ascendant", name: "Lagna / Ascendant", icon: "↗️" },
      { slug: "moon-sign", name: "Moon Sign", icon: "🌙" },
      { slug: "nakshatra", name: "Nakshatra Finder", icon: "✨" },
      { slug: "rashi", name: "Rashi Finder", icon: "♎" },
    ],
  },
  {
    name: "Numerology", items: [
      { slug: "life-path", name: "Life Path Number", icon: "1️⃣" },
      { slug: "destiny", name: "Destiny Number", icon: "🎯" },
      { slug: "lucky-number", name: "Lucky Number", icon: "🍀" },
      { slug: "name-number", name: "Name Number", icon: "🔠" },
    ],
  },
  {
    name: "Shubh Muhurat (2026)", items: [
      { slug: "muhurat/marriage", name: "Marriage Muhurat", icon: "💒" },
      { slug: "muhurat/griha_pravesh", name: "Griha Pravesh", icon: "🏠" },
      { slug: "muhurat/mundan", name: "Mundan", icon: "💈" },
      { slug: "muhurat/naamkaran", name: "Naamkaran", icon: "👶" },
      { slug: "muhurat/annaprashan", name: "Annaprashan", icon: "🍚" },
      { slug: "muhurat/bhoomi_pujan", name: "Bhoomi Pujan", icon: "⛰" },
      { slug: "muhurat/car_bike", name: "Car / Bike Purchase", icon: "🚗" },
    ],
  },
  {
    name: "Vastu", items: [
      { slug: "vastu/direction", name: "Main Entrance Direction", icon: "🧭" },
      { slug: "vastu/plot", name: "Plot Shape Analysis", icon: "📐" },
      { slug: "vastu/colour", name: "Colour by Direction", icon: "🎨" },
    ],
  },
];

export default function CalculatorsHub() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="font-display text-3xl font-bold text-white">All Calculators</h1>
        <p className="text-white/60 mt-1">Free Vedic, Numerology, Vastu and Muhurat calculators — instant.</p>

        {CALC_GROUPS.map((g) => (
          <section key={g.name} className="mt-10">
            <h2 className="text-xl font-semibold text-white">{g.name}</h2>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
              {g.items.map((it) => (
                <Link key={it.slug} href={`/calculators/${it.slug}`}
                  className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-5 transition">
                  <div className="text-3xl">{it.icon}</div>
                  <div className="mt-2 text-white font-semibold">{it.name}</div>
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
