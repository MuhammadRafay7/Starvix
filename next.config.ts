import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lpcsryvamynithpvxffv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Removed the experimental turbopack block to clear terminal warnings
  experimental: {},
};

export default nextConfig;