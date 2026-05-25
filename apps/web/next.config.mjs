/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@astrotalk/ai",
    "@astrotalk/astrology",
    "@astrotalk/db",
    "@astrotalk/numerology",
    "@astrotalk/payments",
    "@astrotalk/shared",
  ],
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};
export default nextConfig;
