/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  transpilePackages: ["@astrotalk/db", "@astrotalk/shared"],
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
  output: "standalone",
};
