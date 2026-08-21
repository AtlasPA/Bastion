import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Offer submissions upload up to 8 compressed photos in one action.
      bodySizeLimit: "25mb",
    },
    // The local dev database (prisma dev) allows very few concurrent
    // connections; parallel prerender workers overwhelm it during builds.
    cpus: 1,
  },
};

export default nextConfig;
