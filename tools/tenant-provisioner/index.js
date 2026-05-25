#!/usr/bin/env node
/**
 * Tenant Provisioner CLI
 *
 *   pnpm tenant:create --slug=client1 --name="Client One" --domain=client1.com [--db=postgresql://...]
 *
 * What it does:
 *   1. Creates a PostgreSQL database (or uses the one in --db)
 *   2. Runs `prisma migrate deploy` against it
 *   3. Inserts a Tenant row into the master DB with the connection string
 *   4. Inserts the TenantDomain (verified=false until DNS is checked)
 *   5. Inserts default TenantModule rows (all default-on modules)
 *   6. Creates an empty TenantTheme row
 *
 * Run after pointing the domain's DNS A-record at your server.
 */

const { execSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

function arg(name, def) {
  const m = process.argv.find((a) => a.startsWith(`--${name}=`));
  return m ? m.split("=").slice(1).join("=") : def;
}

async function main() {
  const slug   = arg("slug");
  const name   = arg("name", slug);
  const domain = arg("domain");
  const dbUrl  = arg("db");

  if (!slug || !domain) {
    console.error("Usage: tenant:create --slug=<slug> --name=<name> --domain=<host> [--db=<conn>]");
    process.exit(1);
  }

  const connString = dbUrl ?? (process.env.TENANT_DATABASE_URL_TEMPLATE || "")
    .replace("{tenantId}", slug);
  if (!connString) {
    console.error("Either --db= or env TENANT_DATABASE_URL_TEMPLATE is required");
    process.exit(1);
  }

  console.log(`▶ Provisioning tenant "${slug}" at ${domain}…`);

  // 1) Create DB if it doesn't exist
  try {
    const url = new URL(connString);
    const dbName = url.pathname.slice(1);
    const adminUrl = new URL(connString); adminUrl.pathname = "/postgres";
    console.log(`  • Ensuring database "${dbName}" exists…`);
    execSync(`psql "${adminUrl}" -tc "SELECT 1 FROM pg_database WHERE datname='${dbName}'" | grep -q 1 || psql "${adminUrl}" -c 'CREATE DATABASE "${dbName}"'`,
      { stdio: "inherit", shell: "/bin/bash" });
  } catch (e) {
    console.warn("  ⚠ Could not auto-create DB (continuing) —", e.message);
  }

  // 2) Run migrations
  console.log("  • Running migrations…");
  execSync("pnpm --filter @astrotalk/db migrate:deploy", {
    stdio: "inherit", env: { ...process.env, DATABASE_URL: connString },
  });

  // 3) Insert into master
  const master = new PrismaClient();
  const tenant = await master.tenant.create({
    data: {
      slug, name, status: "ACTIVE", dbConnString: connString,
      domains: { create: [{ domain, isPrimary: true, verified: false }] },
      theme:   { create: { brandName: name } },
    },
  });

  const { MODULES } = await import("../../packages/shared/src/modules.js").catch(() => ({ MODULES: {} }));
  // Phase-1 default — enable everything that is defaultOn
  const defaults = Object.values(MODULES).filter((m) => m.defaultOn);
  for (const m of defaults) {
    await master.tenantModule.create({
      data: { tenantId: tenant.id, moduleKey: m.key, enabled: true },
    });
  }

  await master.$disconnect();
  console.log(`✔ Tenant "${slug}" created. Point ${domain} → this server, then verify SSL.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
