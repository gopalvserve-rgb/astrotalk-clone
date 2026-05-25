import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Astrotalk Clone — Talk to Astrologers right now",
  description: "Verified astrologers, free kundli, daily horoscope, vastu, numerology and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          ["--color-primary" as any]: "#F26B1D",
          ["--color-secondary" as any]: "#1A1230",
          ["--color-accent" as any]: "#F5C518",
          backgroundColor: "#1A1230",
        }}
      >
        {children}
      </body>
    </html>
  );
}
