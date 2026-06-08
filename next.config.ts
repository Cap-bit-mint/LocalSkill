import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack (default in Next.js 16)
  turbopack: {},
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
