import { NextResponse } from "next/server";
import { resolveTenant, tenantDb } from "../../../../lib/tenant";
import { OTP_STORE } from "../../../../lib/otp-store";

export async function POST(req: Request) {
  const { phone } = await req.json();
  if (!phone || !/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ""))) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);

  await db.user.upsert({ where: { phone }, update: {}, create: { phone } });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  OTP_STORE.set(phone, { code, exp: Date.now() + 5 * 60 * 1000 });

  // eslint-disable-next-line no-console
  console.log(`[OTP] ${phone} → ${code}`);

  return NextResponse.json({ ok: true, hint: process.env.NODE_ENV === "development" ? code : undefined });
}
