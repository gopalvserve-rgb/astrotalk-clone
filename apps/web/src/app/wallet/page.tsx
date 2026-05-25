import { redirect } from "next/navigation";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { getCurrentUser } from "../../lib/auth";
import { resolveTenant, tenantDb } from "../../lib/tenant";
import RechargeForm from "./RechargeForm";

const PRESETS = [100, 200, 500, 1000, 2000, 5000];

export default async function WalletPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/wallet");

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);

  const wallet = await db.wallet.upsert({
    where: { userId: user.uid }, update: {},
    create: { userId: user.uid, balance: 0 },
  });

  const txns = await db.walletTransaction.findMany({
    where: { walletId: wallet.id }, orderBy: { createdAt: "desc" }, take: 20,
  });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-white">Wallet</h1>

        <div className="mt-6 rounded-3xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] p-8 text-[var(--color-secondary)]">
          <div className="text-sm opacity-80">Available Balance</div>
          <div className="text-5xl font-bold mt-1">₹ {wallet.balance.toString()}</div>
        </div>

        <h2 className="text-xl font-semibold text-white mt-10">Recharge</h2>
        <RechargeForm presets={PRESETS} />

        <h2 className="text-xl font-semibold text-white mt-10">Recent Transactions</h2>
        <div className="mt-3 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60 text-left">
              <tr><th className="p-3">Date</th><th>Type</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {txns.length === 0 && <tr><td colSpan={4} className="p-6 text-white/50">No transactions yet.</td></tr>}
              {txns.map((t) => (
                <tr key={t.id} className="border-t border-white/5 text-white/80">
                  <td className="p-3">{new Date(t.createdAt).toLocaleString()}</td>
                  <td>{t.type}</td>
                  <td>₹ {t.amount.toString()}</td>
                  <td>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
