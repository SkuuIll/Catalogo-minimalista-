import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure uploads are served with correct headers for Cloudflare
  async headers() {
    return [
      {
        // Static uploads — unique filenames mean immutable is safe
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // Upload API — never cache, pass cookies through Cloudflare
        source: "/api/upload",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        // All other API routes — no caching
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },

  // Allow images from any hostname (needed for external URL images)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  // Increase serverActions body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
