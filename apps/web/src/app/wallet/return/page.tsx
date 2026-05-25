import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function RechargeReturn() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="text-6xl">🎉</div>
        <h1 className="font-display text-3xl font-bold text-white mt-4">Payment received</h1>
        <p className="text-white/60 mt-2">
          Your wallet balance will update within a few seconds once the gateway confirms the payment.
        </p>
        <Link href="/wallet" className="btn-primary mt-6 inline-flex">View Wallet</Link>
      </main>
      <Footer />
    </>
  );
}
