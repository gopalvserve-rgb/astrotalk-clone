import Link from "next/link";

// Server-safe + Client-safe. For demo: no DB/cookie reads here.
// (Phase 9.x: re-introduce server fetch via a HeaderShell wrapper for server pages.)
export function Header({
  brand = "Astrotalk",
  primaryColor = "var(--color-primary)",
  isLoggedIn = false,
  enabledModules,
}: {
  brand?: string;
  primaryColor?: string;
  isLoggedIn?: boolean;
  enabledModules?: string[];
} = {}) {
  const nav = [
    { label: "Consultations", href: "/chat-with-astrologer", module: "chat_with_astrologer" },
    { label: "Horoscope",     href: "/horoscope",            module: "horoscope" },
    { label: "Free Kundli",   href: "/free-kundli",          module: "free_kundli" },
    { label: "Panchang",      href: "/panchang",             module: "panchang" },
    { label: "Calculators",   href: "/calculators",          module: "calculators" },
    { label: "Shop",          href: "/shop",                 module: "live_shop" },
    { label: "Pooja",         href: "/pooja",                module: "book_pooja" },
    { label: "Darshan",       href: "/darshan",              module: "live_darshan" },
    { label: "Blog",          href: "/blog",                 module: "blog" },
  ];
  const enabled = (m?: string) => !m || !enabledModules || enabledModules.includes(m);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-secondary)]/85 border-b border-white/10">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <span style={{ color: primaryColor }}>{brand}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-white/80">
          {nav.filter((n) => enabled(n.module)).map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-white">{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href={isLoggedIn ? "/dashboard" : "/signin"} className="btn-ghost text-sm py-2 px-4">
            {isLoggedIn ? "My Account" : "Sign In"}
          </Link>
          <Link href="/chat-with-astrologer" className="btn-primary text-sm py-2 px-4">First Chat Free</Link>
        </div>
      </div>
    </header>
  );
}
