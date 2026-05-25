import Link from "next/link";
import { resolveTenant } from "@/lib/tenant";

export async function Footer() {
  const tenant = await resolveTenant().catch(() => null);
  const brand = tenant?.theme.brandName ?? "Astrotalk";

  return (
    <footer className="mt-24 border-t border-white/10 bg-[var(--color-secondary)] text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="font-display text-xl font-bold" style={{ color: "var(--color-primary)" }}>{brand}</div>
          <p className="mt-3 text-sm leading-relaxed">
            Verified astrologers, free kundli, daily horoscope, numerology, vastu — all in one place.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Services</h4>
          <ul className="text-sm space-y-2">
            <li><Link href="/chat-with-astrologer">Chat with Astrologer</Link></li>
            <li><Link href="/talk-to-astrologer">Talk to Astrologer</Link></li>
            <li><Link href="/ai/kundali">AI Kundali</Link></li>
            <li><Link href="/ai/numerology">Numerology</Link></li>
            <li><Link href="/ai/vastu">Vastu Consultation</Link></li>
            <li><Link href="/face-reading">Face Reading</Link></li>
            <li><Link href="/palm-reading">Palm Reading</Link></li>
            <li><Link href="/tarot">Tarot Reading</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Free Tools</h4>
          <ul className="text-sm space-y-2">
            <li><Link href="/free-kundli">Free Kundli</Link></li>
            <li><Link href="/matchmaking">Kundli Matching</Link></li>
            <li><Link href="/compatibility">Compatibility</Link></li>
            <li><Link href="/panchang">Panchang</Link></li>
            <li><Link href="/horoscope">Horoscope</Link></li>
            <li><Link href="/calculators">All Calculators</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Company</h4>
          <ul className="text-sm space-y-2">
            <li><Link href="/about-us">About Us</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/terms-and-conditions">Terms</Link></li>
            <li><Link href="/privacy-policies">Privacy</Link></li>
            <li><Link href="/refund-and-cancellation-policy">Refund Policy</Link></li>
            <li><Link href="/sewa">Sewa / Donations</Link></li>
            <li><Link href="/yatra">Yatra</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {brand}. All rights reserved.
      </div>
    </footer>
  );
}
