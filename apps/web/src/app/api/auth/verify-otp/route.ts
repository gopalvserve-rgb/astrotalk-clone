import { NextResponse } from "next/server";
import { resolveTenant, tenantDb } from "@/lib/tenant";
import { issueToken, setSessionCookie } from "@/lib/auth";
import { OTP_STORE } from "@/lib/otp-store";

export async function POST(req: Request) {
  const { phone, otp } = await req.json();
  const rec = OTP_STORE.get(phone);
  if (!rec || rec.exp < Date.now() || rec.code !== String(otp)) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
  }

  const tenant = await resolveTenant();
  const db = await tenantDb(tenant);

  let user = await db.user.findUnique({ where: { phone } });
  if (!user) user = await db.user.create({ data: { phone, isPhoneVerified: true } });
  else if (!user.isPhoneVerified) {
    await db.user.update({ where: { id: user.id }, data: { isPhoneVerified: true } });
  }

  await db.wallet.upsert({
    where: { userId: user.id }, update: {},
    create: { userId: user.id, balance: 0 },
  });

  OTP_STORE.delete(phone);

  const token = await issueToken({ uid: user.id, tid: tenant.id, role: "user" });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true, user: { id: user.id, phone: user.phone } });
}
