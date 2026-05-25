import "./globals.css";
import type { Metadata } from "next";
import { resolveTenant } from "@/lib/tenant";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const t = await resolveTenant();
    return {
      title: `${t.theme.brandName} — Talk to Astrologers right now`,
      description: `${t.theme.brandName}: Verified astrologers, free kundli, daily horoscope, vastu, numerology and more.`,
      icons: t.theme.logoUrl ? [{ url: t.theme.logoUrl }] : undefined,
    };
  } catch {
    return { title: "Astrotalk Clone" };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let theme = { primaryColor: "#F26B1D", secondaryColor: "#1A1230", accentColor: "#F5C518", brandName: "Astrotalk" };
  try { theme = (await resolveTenant()).theme as any; } catch { /* pre-seed */ }

  return (
    <html lang="en">
      <body
        style={{
          // expose tenant theme as CSS variables
          ["--color-primary" as any]: theme.primaryColor,
          ["--color-secondary" as any]: theme.secondaryColor,
          ["--color-accent" as any]: theme.accentColor,
          backgroundColor: theme.secondaryColor,
        }}
      >
        {children}
      </body>
    </html>
  );
}
