import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", ".generated/postgres", ".generated/local"]
};

export default nextConfig;
