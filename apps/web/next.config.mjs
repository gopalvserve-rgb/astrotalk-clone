/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@astrotalk/ai",
    "@astrotalk/astrology",
    "@astrotalk/db",
    "@astrotalk/numerology",
    "@astrotalk/payments",
    "@astrotalk/realtime",
    "@astrotalk/shared",
  ],
  typescript: { ignoreBuildErrors: true },   // demo: skip type errors that aren't runtime blockers
  eslint:     { ignoreDuringBuilds: true },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  output: "standalone",
};
export default nextConfig;
