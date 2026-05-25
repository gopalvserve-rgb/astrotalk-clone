import { NextResponse } from "next/server";
import { resolveTenant, tenantDb } from "@/lib/tenant";

// In-memory OTP store keyed by phone — production should use Redis with TTL.
const OTP_STORE = new Map<string, { code: string; exp: number }>();

export async function POST(req: Request) {
  const { phone } = await req.json();
  if (!phone || !/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ""))) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);

  // Upsert the user (create on first sign-in) — final account marked
  // verified only after OTP verification.
  await db.user.upsert({
    where: { phone }, update: {}, create: { phone },
  });

  // Generate OTP (6 digits, 5 min TTL)
  const code = String(Math.floor(100000 + Math.random() * 900000));
  OTP_STORE.set(phone, { code, exp: Date.now() + 5 * 60 * 1000 });

  // TODO: send via MSG91 / Twilio. For Phase 1 we log to server only.
  // eslint-disable-next-line no-console
  console.log(`[OTP] ${phone} → ${code}`);

  return NextResponse.json({ ok: true, hint: process.env.NODE_ENV === "development" ? code : undefined });
}

export { OTP_STORE };
