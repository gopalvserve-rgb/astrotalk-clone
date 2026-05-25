import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { resolveTenant, tenantDb } from "@/lib/tenant";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { consultationId, reason } = await req.json();

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);
  const c = await db.consultation.findUnique({ where: { id: consultationId } });
  if (!c || c.userId !== user.uid) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.consultation.update({
    where: { id: consultationId },
    data: { status: "ENDED", endedAt: new Date(), endReason: reason || "user_ended" },
  });
  return NextResponse.json({ ok: true });
}
