import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Offer submissions upload up to 8 compressed photos in one action.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
