import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure for static export (no database required)
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable server-side features since we're using localStorage
  experimental: {
    appDir: true,
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
