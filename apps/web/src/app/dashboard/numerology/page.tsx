import Link from "next/link";
import { resolveTenant } from "../../../lib/tenant";
import { modulesByTab } from "@astrotalk/shared";

export default async function NumerologyDashboard() {
  const tenant = await resolveTenant();
  const items = modulesByTab("numerology").filter((m) => tenant.enabledModules.includes(m.key) && m.route);
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-white">Numerology Dashboard</h1>
      <p className="text-white/60 mt-1">Pythagorean + Chaldean — your numbers, decoded.</p>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((m) => (
          <Link key={m.key} href={m.route!} className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-5">
            <div className="text-3xl">{m.icon}</div>
            <div className="mt-3 text-white font-semibold">{m.label}</div>
            <div className="text-white/50 text-xs mt-1">{m.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
