import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@crawlee/browser",
    "@crawlee/playwright",
    "@crawlee/browser-pool",
    "playwright",
    "playwright-core",
  ],
};

export default nextConfig;
