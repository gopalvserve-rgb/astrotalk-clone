import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Seed runs against the MASTER db.
// It creates: a super admin + a demo tenant with default modules enabled.

async function main() {
  console.log("Seeding master DB…");

  // Super admin
  const email = process.env.SUPER_ADMIN_EMAIL ?? "admin@astrotalk.local";
  const password = process.env.SUPER_ADMIN_PASSWORD ?? "ChangeMe!1234";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.superAdmin.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Super Admin" },
  });
  console.log(`  ✔ Super admin: ${email}`);

  // Demo tenant
  const tenantSlug = "demo";
  const tenant = await prisma.tenant.upsert({
    where: { slug: tenantSlug },
    update: {},
    create: {
      slug: tenantSlug,
      name: "Demo Astrotalk",
      status: "ACTIVE",
      dbConnString:
        process.env.TENANT_DATABASE_URL_TEMPLATE?.replace("{tenantId}", tenantSlug) ??
        "postgresql://postgres:postgres@localhost:5432/astrotalk_tenant_demo",
      domains: {
        create: [
          { domain: "localhost", isPrimary: true, verified: true },
          { domain: "demo.localhost", isPrimary: false, verified: true },
        ],
      },
      theme: {
        create: {
          brandName: "Astrotalk Demo",
          primaryColor: "#F26B1D",
          secondaryColor: "#1A1230",
          accentColor: "#F5C518",
        },
      },
    },
  });
  console.log(`  ✔ Demo tenant: ${tenant.slug}`);

  // Default modules — all on
  const moduleKeys = [
    "chat_with_astrologer", "call_with_astrologer", "video_call",
    "ai_kundali_reading", "ai_astrology", "ai_numerology", "ai_vastu",
    "ai_business_name", "face_reading", "palm_reading", "tarot_reading",
    "meditation_mantra", "book_pooja", "live_darshan", "live_shop",
    "sewa", "yatra_booking", "panchang", "free_kundli", "kundli_matching",
    "compatibility", "calculators", "horoscope", "wallet",
    "session_history", "blog", "pandit_management",
  ];
  for (const key of moduleKeys) {
    await prisma.tenantModule.upsert({
      where: { tenantId_moduleKey: { tenantId: tenant.id, moduleKey: key } },
      update: {},
      create: { tenantId: tenant.id, moduleKey: key, enabled: true },
    });
  }
  console.log(`  ✔ ${moduleKeys.length} modules enabled for demo tenant`);

  console.log("\nDone.\nLogin to admin with:");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
