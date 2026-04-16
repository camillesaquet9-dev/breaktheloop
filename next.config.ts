import type { NextConfig } from "next";

// On Vercel, VERCEL_GIT_COMMIT_SHA is populated per-build. Locally it's empty;
// the footer falls back to "dev".
const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.NEXT_PUBLIC_COMMIT_SHA ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: __dirname,
  },
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
  },
  // Security headers are also set in middleware.ts (step 4). Duplicate here for
  // routes not touched by the middleware (e.g. static assets).
  async headers() {
    return [];
  },
};

export default nextConfig;
