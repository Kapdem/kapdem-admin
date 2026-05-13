import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    domains: [
      "kapdem.s3.eu-central-1.amazonaws.com",
      "localhost",
      "kapdem-org.s3.eu-north-1.amazonaws.com",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "3000mb",
    },
  },
};

export default nextConfig;
