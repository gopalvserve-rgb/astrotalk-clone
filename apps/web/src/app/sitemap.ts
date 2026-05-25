import type { MetadataRoute } from "next";
import { resolveTenant, tenantDb } from "../lib/tenant";
import { MODULES } from "@astrotalk/shared";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let host = "https://example.com";
  let enabledModuleKeys: string[] = Object.keys(MODULES);
  try {
    const t = await resolveTenant();
    host = `https://${t.primaryDomain}`;
    enabledModuleKeys = t.enabledModules;
  } catch { /* */ }

  const staticUrls = [
    "/", "/signin", "/calculators", "/horoscope", "/free-kundli", "/matchmaking",
    "/compatibility", "/panchang", "/tarot", "/face-reading", "/palm-reading",
    "/shop", "/pooja", "/sewa", "/yatra", "/darshan", "/meditation", "/mantras",
    "/about-us", "/pricing", "/terms-and-conditions", "/privacy-policies",
  ];

  const horoscopeUrls: string[] = [];
  for (const sign of ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"]) {
    for (const period of ["daily","weekly","monthly","yearly"]) {
      horoscopeUrls.push(`/horoscope/${period}/${sign}`);
    }
  }

  const all = [...staticUrls, ...horoscopeUrls];
  return all.map(url => ({ url: `${host}${url}`, lastModified: new Date(), changeFrequency: "weekly", priority: url === "/" ? 1 : 0.6 }));
}
