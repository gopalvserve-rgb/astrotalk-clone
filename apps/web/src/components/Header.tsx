import Link from "next/link";
import { resolveTenant } from "@/lib/tenant";
import { getCurrentUser } from "@/lib/auth";

export async function Header() {
  const tenant = await resolveTenant().catch(() => null);
  const user = await getCurrentUser();
  const brand = tenant?.theme.brandName ?? "Astrotalk";

  const nav: Array<{ label: string; href: string; module?: string }> = [
    { label: "Consultations", href: "/chat-with-astrologer", module: "chat_with_astrologer" },
    { label: "Horoscope", href: "/horoscope", module: "horoscope" },
    { label: "Free Kundli", href: "/free-kundli", module: "free_kundli" },
    { label: "Panchang", href: "/panchang", module: "panchang" },
    { label: "Calculators", href: "/calculators", module: "calculators" },
    { label: "Shop", href: "/shop", module: "live_shop" },
    { label: "Pooja", href: "/pooja", module: "book_pooja" },
    { label: "Darshan", href: "/darshan", module: "live_darshan" },
    { label: "Blog", href: "/blog", module: "blog" },
  ];

  const enabled = (m?: string) => !m || (tenant?.enabledModules.includes(m) ?? true);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-secondary)]/85 border-b border-white/10">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-white">
          {tenant?.theme.logoUrl && <img src={tenant.theme.logoUrl} alt="" className="h-8 w-8" />}
          <span style={{ color: "var(--color-primary)" }}>{brand}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5 text-sm text-white/80">
          {nav.filter((n) => enabled(n.module)).map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-white">{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-ghost text-sm py-2 px-4">My Account</Link>
          ) : (
            <Link href="/signin" className="btn-ghost text-sm py-2 px-4">Sign In</Link>
          )}
          {enabled("chat_with_astrologer") && (
            <Link href="/chat-with-astrologer" className="btn-primary text-sm py-2 px-4">First Chat Free</Link>
          )}
        </div>
      </div>
    </header>
  );
}
