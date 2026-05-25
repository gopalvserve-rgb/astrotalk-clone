import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { resolveTenant, tenantDb } from "@/lib/tenant";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/dashboard");

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);
  const wallet = await db.wallet.findUnique({ where: { userId: user.uid } });

  const tabs = [
    { key: "astrology",  label: "Astrology",  emoji: "🌟", href: "/dashboard/astrology" },
    { key: "numerology", label: "Numerology", emoji: "🔢", href: "/dashboard/numerology" },
    { key: "vastu",      label: "Vastu",      emoji: "🏠", href: "/dashboard/vastu" },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Wallet strip */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-white/60">Wallet Balance</div>
            <div className="text-2xl font-bold text-white">
              ₹ {wallet?.balance?.toString() ?? "0.00"}
            </div>
          </div>
          <Link href="/wallet" className="btn-primary text-sm py-2 px-4">Recharge</Link>
        </div>

        {/* Tabs */}
        <nav className="mt-6 flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <Link
              key={t.key} href={t.href}
              className="rounded-full px-5 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              <span className="mr-2">{t.emoji}</span>{t.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6">{children}</div>
      </main>
      <Footer />
    </>
  );
}
