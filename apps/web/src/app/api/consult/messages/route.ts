import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { resolveTenant, tenantDb } from "../../../../lib/tenant";
import { ai } from "@astrotalk/ai";

/**
 * Chat message API — append a user message, get AI/human reply.
 * For AI astrologers, immediately routes to Gemini chat_fallback.
 * For human astrologers, persists and emits via Socket.IO (Phase 4.x).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { consultationId, body } = await req.json();

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);
  const c = await db.consultation.findUnique({ where: { id: consultationId }, include: { astrologer: true } });
  if (!c || c.userId !== user.uid) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.chatMessage.create({ data: { consultationId, senderId: user.uid, senderRole: "user", body } });

  // AI astrologer — generate reply immediately
  if (c.isAiSession || c.astrologer.type === "AI") {
    const out = await ai.complete({
      task: "chat_fallback", input: { message: body },
      tenantConfig: { provider: (c.astrologer.aiProvider as any) || undefined },
    });
    const reply = await db.chatMessage.create({
      data: { consultationId, senderId: c.astrologerId, senderRole: "ai", body: out.text },
    });
    return NextResponse.json({ ok: true, reply: { id: reply.id, body: reply.body } });
  }

  // Human astrologer — Socket.IO will push live (Phase 4.x).
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const consultationId = url.searchParams.get("consultationId");
  if (!consultationId) return NextResponse.json({ error: "consultationId required" }, { status: 400 });

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);
  const msgs = await db.chatMessage.findMany({
    where: { consultationId }, orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ ok: true, messages: msgs });
}
