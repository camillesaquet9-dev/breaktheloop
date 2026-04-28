import type { NextConfig } from "next";

// On Vercel, VERCEL_GIT_COMMIT_SHA is populated per-build. Locally it's empty;
// the footer falls back to "dev".
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_COMMIT_SHA ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Self-contained build for Docker: copies node_modules + .next/standalone.
  // Image size ~150 MB instead of ~1.2 GB with full pnpm cache.
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
  },
  async headers() {
    return [];
  },
};

export default nextConfig;
