import { NextResponse } from "next/server";
import { z } from "zod";
import { ai } from "@astrotalk/ai";
import { getCurrentUser } from "@/lib/auth";
import { resolveTenant, tenantDb, isModuleEnabled } from "@/lib/tenant";

/**
 * Unified AI endpoint.
 *  POST /api/ai
 *    { task: "kundali_reading" | "numerology_report" | … , input: {...}, image?: {...} }
 *
 *  • Checks module is enabled for the tenant
 *  • Checks (and deducts) wallet for the task's price (configurable)
 *  • Calls the AI router (Gemini or DeepSeek)
 *  • Persists AiReport row
 */

const AI_TASK_PRICES: Record<string, number> = {
  kundali_reading:   49,
  numerology_report: 29,
  vastu_consult:     49,
  business_name:     19,
  baby_name:         19,
  tarot_reading:     29,
  face_reading:      49,
  palm_reading:      49,
  horoscope_daily:    0,
  compatibility:      0,
  match_making:       9,
  chat_fallback:      0,
};

const TASK_TO_MODULE: Record<string, string> = {
  kundali_reading:   "ai_kundali_reading",
  numerology_report: "ai_numerology",
  vastu_consult:     "ai_vastu",
  business_name:     "ai_business_name",
  baby_name:         "ai_business_name",
  tarot_reading:     "tarot_reading",
  face_reading:      "face_reading",
  palm_reading:      "palm_reading",
  horoscope_daily:   "horoscope",
  compatibility:     "compatibility",
  match_making:      "kundli_matching",
  chat_fallback:     "ai_astrology",
};

const Body = z.object({
  task: z.string(),
  input: z.record(z.any()),
  image: z.object({ base64: z.string().optional(), url: z.string().optional(), mimeType: z.string().optional() }).optional(),
  language: z.string().default("en"),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { task, input, image, language } = parsed.data;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenant = await resolveTenant();
  const modKey = TASK_TO_MODULE[task];
  if (modKey && !isModuleEnabled(tenant, modKey)) {
    return NextResponse.json({ error: "Module disabled" }, { status: 403 });
  }

  const price = AI_TASK_PRICES[task] ?? 49;
  const db = await tenantDb(tenant);

  // Wallet check + deduct (if priced)
  if (price > 0) {
    const wallet = await db.wallet.findUnique({ where: { userId: user.uid } });
    if (!wallet || Number(wallet.balance) < price) {
      return NextResponse.json({ error: "Insufficient wallet balance", topupNeeded: price - Number(wallet?.balance ?? 0) }, { status: 402 });
    }
    await db.$transaction(async (tx) => {
      const w = await tx.wallet.update({
        where: { id: wallet.id }, data: { balance: { decrement: price } },
      });
      await tx.walletTransaction.create({
        data: {
          walletId: w.id, type: "DEDUCT_AI", amount: price as any,
          balanceAfter: w.balance, status: "SUCCESS",
          description: `AI: ${task}`,
        },
      });
    });
  }

  // Persist a pending AiReport row
  const report = await db.aiReport.create({
    data: {
      userId: user.uid, kind: task.toUpperCase() as any,
      inputJson: input as any, provider: "router", model: "auto",
      status: "pending",
    },
  });

  // Run AI
  const t0 = Date.now();
  try {
    const result = await ai.complete({ task: task as any, input, image, language, userId: user.uid });
    await db.aiReport.update({
      where: { id: report.id },
      data: {
        outputText: result.text, provider: result.provider, model: result.model,
        status: "done", durationMs: Date.now() - t0, completedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true, reportId: report.id, text: result.text, provider: result.provider });
  } catch (e: any) {
    await db.aiReport.update({
      where: { id: report.id },
      data: { status: "failed", error: e.message, durationMs: Date.now() - t0 },
    });
    // refund the deduction
    if (price > 0) {
      const wallet = await db.wallet.findUnique({ where: { userId: user.uid } });
      if (wallet) {
        await db.$transaction(async (tx) => {
          const w = await tx.wallet.update({
            where: { id: wallet.id }, data: { balance: { increment: price } },
          });
          await tx.walletTransaction.create({
            data: {
              walletId: w.id, type: "REFUND", amount: price as any,
              balanceAfter: w.balance, status: "SUCCESS",
              description: `Refund: AI task ${task} failed`,
            },
          });
        });
      }
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
