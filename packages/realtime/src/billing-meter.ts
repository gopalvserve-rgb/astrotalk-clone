/**
 * Per-minute wallet meter for consultations.
 *
 *   const meter = startMeter({ consultationId, ratePerMin, db, onLowBalance });
 *   await meter.tick();         // call every 60s
 *   await meter.stop();         // settles final fractional minute
 *
 * Each tick:
 *   1. Compute amount due
 *   2. Decrement wallet in a $transaction
 *   3. If balance < ratePerMin → return { ended: true, reason: "low_balance" }
 *   4. Append WalletTransaction
 *   5. Increment consultation.durationSec
 */

import type { PrismaClient } from "@prisma/client";

export interface MeterOpts {
  consultationId: string;
  userId: string;
  ratePerMin: number;
  db: PrismaClient;
  onLowBalance?: () => Promise<void>;
}

export function startMeter(opts: MeterOpts) {
  let startedAt = Date.now();

  async function tick(): Promise<{ ok: true } | { ok: false; reason: string }> {
    const wallet = await opts.db.wallet.findUnique({ where: { userId: opts.userId } });
    if (!wallet || Number(wallet.balance) < opts.ratePerMin) {
      await opts.onLowBalance?.();
      return { ok: false, reason: "low_balance" };
    }
    await opts.db.$transaction(async (tx) => {
      const w = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: opts.ratePerMin as any } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: w.id, type: "DEDUCT_CONSULTATION", amount: opts.ratePerMin as any,
          balanceAfter: w.balance, status: "SUCCESS",
          reference: opts.consultationId, description: "Consultation per-minute deduction",
        },
      });
      await tx.consultation.update({
        where: { id: opts.consultationId },
        data: { durationSec: { increment: 60 }, totalAmount: { increment: opts.ratePerMin as any } },
      });
    });
    return { ok: true };
  }

  async function stop() {
    const durSec = Math.floor((Date.now() - startedAt) / 1000);
    await opts.db.consultation.update({
      where: { id: opts.consultationId },
      data: { status: "ENDED", endedAt: new Date() },
    });
    return { durationSec: durSec };
  }

  return { tick, stop, startedAt };
}
