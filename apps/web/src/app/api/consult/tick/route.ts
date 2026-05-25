import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { resolveTenant, tenantDb } from "../../../../lib/tenant";
import { startMeter } from "@astrotalk/realtime";

/**
 * Called by the client every 60s while a chat/call is active.
 * Returns the new wallet balance, or ends the session if low.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { consultationId } = await req.json();

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);

  const consult = await db.consultation.findUnique({ where: { id: consultationId } });
  if (!consult || consult.userId !== user.uid) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (consult.status !== "ACTIVE") return NextResponse.json({ ended: true, reason: consult.status });

  const meter = startMeter({
    consultationId, userId: user.uid, ratePerMin: Number(consult.ratePerMin), db: db as any,
  });
  const res = await meter.tick();
  if (!("ok" in res) || !res.ok) {
    await db.consultation.update({ where: { id: consultationId }, data: { status: "ENDED", endedAt: new Date(), endReason: res.reason } });
    return NextResponse.json({ ended: true, reason: res.reason });
  }

  const w = await db.wallet.findUnique({ where: { userId: user.uid } });
  return NextResponse.json({ ended: false, balance: Number(w?.balance ?? 0) });
}
