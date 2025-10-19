import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oetxbwjdxhcryqkdfdpr.storage.supabase.co",
      },
    ],
  },
};

export default nextConfig;
