import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        saffron:   { DEFAULT: "#F26B1D", 50: "#FFF3EA", 500: "#F26B1D", 700: "#C44E0B" },
        nightsky:  { DEFAULT: "#1A1230", 700: "#0C0721", 900: "#070218" },
        gold:      { DEFAULT: "#F5C518", 500: "#F5C518" },
        sandstone: "#FFF7EE",
      },
      fontFamily: { display: ["var(--font-display)", "serif"], sans: ["var(--font-sans)", "system-ui"] },
    },
  },
  plugins: [],
} satisfies Config;
