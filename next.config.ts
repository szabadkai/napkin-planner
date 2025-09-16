import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent mis-detection of root when multiple lockfiles exist outside the repo.
    root: ".",
  },
};

export default nextConfig;
