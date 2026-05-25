import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "../lib/auth";

const NAV = [
  { label: "Tenants",      href: "/tenants",     emoji: "🏢" },
  { label: "Modules",      href: "/modules",     emoji: "🧩" },
  { label: "Astrologers",  href: "/astrologers", emoji: "🧙" },
  { label: "Products",     href: "/products",    emoji: "🛍" },
  { label: "Pooja",        href: "/pooja",       emoji: "🪔" },
  { label: "Yatras",       href: "/yatras",      emoji: "🛕" },
  { label: "Sewa Causes",  href: "/sewa",        emoji: "🤲" },
  { label: "Live Darshan", href: "/darshan",     emoji: "📺" },
  { label: "Articles",     href: "/articles",    emoji: "📰" },
  { label: "Users",        href: "/users",       emoji: "👤" },
  { label: "Wallet Audit", href: "/wallet",      emoji: "💰" },
  { label: "AI Usage",     href: "/ai-usage",   emoji: "🤖" },
  { label: "Settings",     href: "/settings",    emoji: "⚙" },
];

export async function AdminShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const a = await getAdmin();
  if (!a) redirect("/login");
  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr]">
      <aside className="border-r border-white/10 bg-black/30 p-4">
        <div className="text-xl font-bold text-amber-400">Astrotalk Admin</div>
        <nav className="mt-6 space-y-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2 hover:bg-white/5">
              <span className="mr-2">{n.emoji}</span>{n.label}
            </Link>
          ))}
        </nav>
        <form action="/api/signout" method="post" className="mt-8">
          <button className="btn-outline w-full">Sign out</button>
        </form>
      </aside>
      <main className="p-8">
        {title && <h1 className="text-3xl font-bold">{title}</h1>}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
