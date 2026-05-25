import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { resolveTenant } from "@/lib/tenant";

const ZODIAC = "♈︎ ♉︎ ♊︎ ♋︎ ♌︎ ♍︎ ♎︎ ♏︎ ♐︎ ♑︎ ♒︎ ♓︎  ";

const HERO_STATS = [
  ["48,726+", "verified astrologers"],
  ["120.2M+", "happy customers"],
  ["12 sec", "avg reply time"],
  ["13", "languages"],
  ["4.7★", "rating"],
];

const FREE_TOOLS = [
  { icon: "🔮", label: "Free Kundli", href: "/free-kundli", module: "free_kundli" },
  { icon: "💞", label: "Match Making", href: "/matchmaking", module: "kundli_matching" },
  { icon: "🔢", label: "Numerology", href: "/ai/numerology", module: "ai_numerology" },
  { icon: "☀️", label: "Today Panchang", href: "/panchang", module: "panchang" },
  { icon: "🃏", label: "Tarot Cards", href: "/tarot", module: "tarot_reading" },
  { icon: "♈", label: "Compatibility", href: "/compatibility", module: "compatibility" },
  { icon: "👤", label: "Face Reading", href: "/face-reading", module: "face_reading" },
  { icon: "🖐", label: "Palm Reading", href: "/palm-reading", module: "palm_reading" },
];

const DASHBOARD_TABS = [
  { key: "astrology", label: "Astrology", href: "/dashboard/astrology" },
  { key: "numerology", label: "Numerology", href: "/dashboard/numerology" },
  { key: "vastu", label: "Vastu", href: "/dashboard/vastu" },
];

export default async function HomePage() {
  const t = await resolveTenant().catch(() => null);
  const brand = t?.theme.brandName ?? "Astrotalk";
  const isOn = (m: string) => !t || t.enabledModules.includes(m);

  return (
    <>
      <Header />

      {/* Zodiac marquee */}
      <div className="zodiac-bar text-center overflow-hidden whitespace-nowrap py-2 border-y border-white/10">
        {ZODIAC.repeat(8)}
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 text-center">
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight text-white">
          Talk to <span style={{ color: "var(--color-primary)" }}><i>Astrologers</i></span> right now.
        </h1>
        <p className="mt-4 text-white/70 max-w-2xl mx-auto">
          {brand} brings verified Vedic astrologers, free kundli, panchang, vastu, numerology and AI-powered
          consultations — anytime, in your language.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {isOn("chat_with_astrologer") && <Link href="/chat-with-astrologer" className="btn-primary">Get Free Chat</Link>}
          <Link href="#download" className="btn-ghost">Download The App</Link>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-white/70">
          {HERO_STATS.map(([n, l]) => (
            <div key={l}><b className="text-white">{n}</b> · {l}</div>
          ))}
        </div>
      </section>

      <div className="zodiac-bar text-center overflow-hidden whitespace-nowrap py-2 border-y border-white/10">
        {ZODIAC.repeat(8)}
      </div>

      {/* Dashboard tab launcher */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-white text-center">Three dashboards. One platform.</h2>
        <p className="text-white/60 text-center mt-2">Switch between Astrology, Numerology and Vastu.</p>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {DASHBOARD_TABS.map((tab) => (
            <Link
              key={tab.key} href={tab.href}
              className="block rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-[var(--color-primary)] transition"
            >
              <div className="text-4xl mb-3">
                {tab.key === "astrology" ? "🌟" : tab.key === "numerology" ? "🔢" : "🏠"}
              </div>
              <div className="text-xl font-semibold text-white">{tab.label}</div>
              <div className="text-white/50 mt-1 text-sm">Open the {tab.label} dashboard →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Free tools grid */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-white text-center">Try before you talk</h2>
        <p className="text-white/60 text-center mt-2">Free tools, instant answers.</p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {FREE_TOOLS.filter((tool) => isOn(tool.module)).map((tool) => (
            <Link
              key={tool.href} href={tool.href}
              className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-6 text-center transition"
            >
              <div className="text-4xl mb-2">{tool.icon}</div>
              <div className="text-white font-semibold">{tool.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] p-10 text-center">
          <h2 className="font-display text-3xl font-bold text-[var(--color-secondary)]">
            Recharge your wallet, start your first chat free.
          </h2>
          <p className="text-[var(--color-secondary)]/80 mt-2">
            Powered by Cashfree. Secure. Refundable. 24×7 support.
          </p>
          <div className="mt-6">
            <Link href="/wallet" className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-secondary)] text-white px-7 py-3 font-semibold">
              Recharge Wallet
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
