/**
 * DNS verification — checks the domain's A or CNAME points at us.
 * Server-side only. Uses Node's `dns/promises`.
 */
import { promises as dns } from "node:dns";

const PLATFORM_IPS = (process.env.PLATFORM_PUBLIC_IPS || "").split(",").map(s => s.trim()).filter(Boolean);
const PLATFORM_CNAME = process.env.PLATFORM_CNAME_TARGET || "astrotalk-platform.example.com";

export async function verifyDomain(domain: string): Promise<{ ok: boolean; reason: string }> {
  try {
    const a = await dns.resolve4(domain).catch(() => []);
    if (a.some(ip => PLATFORM_IPS.includes(ip))) return { ok: true, reason: "A record points to platform" };

    const cname = await dns.resolveCname(domain).catch(() => []);
    if (cname.some(c => c.endsWith(PLATFORM_CNAME))) return { ok: true, reason: "CNAME points to platform" };

    return { ok: false, reason: "DNS does not point at platform IP/CNAME" };
  } catch (e: any) {
    return { ok: false, reason: e.message };
  }
}
