import { NextResponse } from "next/server";
import { getMasterDb } from "@astrotalk/db";
import { MODULES } from "@astrotalk/shared";
import { getAdmin } from "../../../../lib/auth";

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { slug, name, primaryDomain, brandName, primaryColor, secondaryColor, accentColor, dbConnString } = body;
  if (!slug || !name || !primaryDomain) return NextResponse.json({ error: "slug, name, primaryDomain required" }, { status: 400 });

  const conn = dbConnString || (process.env.TENANT_DATABASE_URL_TEMPLATE || "").replace("{tenantId}", slug);
  if (!conn) return NextResponse.json({ error: "No DB connection string available" }, { status: 400 });

  const db = getMasterDb();
  const exists = await db.tenant.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "Slug already exists" }, { status: 409 });

  const tenant = await db.tenant.create({
    data: {
      slug, name, status: "ACTIVE", dbConnString: conn,
      domains: { create: [{ domain: primaryDomain, isPrimary: true, verified: false }] },
      theme:   { create: { brandName: brandName || name, primaryColor, secondaryColor, accentColor } },
      modules: { create: Object.values(MODULES).filter(m => m.defaultOn).map(m => ({ moduleKey: m.key, enabled: true })) },
    },
  });

  return NextResponse.json({ ok: true, tenantId: tenant.id });
}
