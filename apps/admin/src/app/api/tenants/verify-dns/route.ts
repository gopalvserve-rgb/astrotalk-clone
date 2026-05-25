import { NextResponse } from "next/server";
import { verifyDomain } from "../../../../lib/dns-verify";
import { getMasterDb } from "@astrotalk/db";
import { getAdmin } from "../../../../lib/auth";

export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { domainId } = await req.json();
  const db = getMasterDb();
  const d = await db.tenantDomain.findUnique({ where: { id: domainId } });
  if (!d) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  const res = await verifyDomain(d.domain);
  if (res.ok) await db.tenantDomain.update({ where: { id: d.id }, data: { verified: true } });
  return NextResponse.json(res);
}
