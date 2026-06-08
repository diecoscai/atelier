import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Lint runs in dev / CI separately; don't block the build on it.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
