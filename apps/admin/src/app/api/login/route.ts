import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getMasterDb } from "@astrotalk/db";
import { issueAdminToken, setAdminCookie } from "../../../lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const db = getMasterDb();
  const sa = await db.superAdmin.findUnique({ where: { email } });
  if (!sa || !(await bcrypt.compare(password, sa.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = await issueAdminToken({ sid: sa.id, role: "super_admin" });
  setAdminCookie(token);
  await db.superAdmin.update({ where: { id: sa.id }, data: { lastLoginAt: new Date() } });
  return NextResponse.json({ ok: true });
}
