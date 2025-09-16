import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Use an absolute root path to satisfy Next.js in all environments (incl. Vercel).
    root: process.cwd(),
  },
};

export default nextConfig;
