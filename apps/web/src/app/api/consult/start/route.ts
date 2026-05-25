import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { resolveTenant, tenantDb, isModuleEnabled } from "@/lib/tenant";

const Body = z.object({
  astrologerId: z.string(),
  mode: z.enum(["CHAT", "CALL", "VIDEO"]),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await resolveTenant();
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const modKey = parsed.data.mode === "CHAT" ? "chat_with_astrologer"
    : parsed.data.mode === "CALL" ? "call_with_astrologer" : "video_call";
  if (!isModuleEnabled(tenant, modKey)) {
    return NextResponse.json({ error: "Module disabled" }, { status: 403 });
  }

  const db = await tenantDb(tenant);
  const a = await db.astrologer.findUnique({ where: { id: parsed.data.astrologerId } });
  if (!a) return NextResponse.json({ error: "Astrologer not found" }, { status: 404 });

  const rate = parsed.data.mode === "CHAT" ? a.rateChatPerMin
    : parsed.data.mode === "CALL" ? a.rateCallPerMin : a.rateVideoPerMin;

  // Pre-flight wallet check — need at least 1 min worth
  const wallet = await db.wallet.findUnique({ where: { userId: user.uid } });
  if (!wallet || Number(wallet.balance) < Number(rate)) {
    return NextResponse.json({ error: "Recharge wallet to start", required: Number(rate) }, { status: 402 });
  }

  const consult = await db.consultation.create({
    data: {
      userId: user.uid, astrologerId: a.id, mode: parsed.data.mode,
      ratePerMin: rate, status: "ACTIVE", startedAt: new Date(),
      channelId: `c_${Date.now()}_${user.uid.slice(0,6)}`,
      isAiSession: a.type === "AI",
    },
  });

  return NextResponse.json({
    ok: true,
    consultationId: consult.id,
    channelId: consult.channelId,
    ratePerMin: Number(rate),
    astrologer: { id: a.id, name: a.displayName ?? a.name, avatarUrl: a.avatarUrl, type: a.type },
  });
}
