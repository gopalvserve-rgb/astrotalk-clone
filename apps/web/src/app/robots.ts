import type { MetadataRoute } from "next";
import { resolveTenant } from "@/lib/tenant";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let host = "https://example.com";
  try { host = `https://${(await resolveTenant()).primaryDomain}`; } catch {}
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard/", "/wallet/", "/admin/"] },
    ],
    sitemap: `${host}/sitemap.xml`,
  };
}
