import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Monorepo: pin the tracing root to the repo root so Next resolves the
  // workspace correctly (and so build-time reads of ../../docs work).
  outputFileTracingRoot: path.join(__dirname, "..", ".."),
  eslint: {
    // Lint runs in dev / CI separately; don't block the build on it.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
