import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  // Security headers are also set in middleware.ts (step 4). Duplicate here for
  // routes not touched by the middleware (e.g. static assets).
  async headers() {
    return [];
  },
};

export default nextConfig;
