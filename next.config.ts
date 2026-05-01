import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static file serving for uploads via Next.js
  // Uploads served via /api/uploads/[filename] route (app router handler)
  // This config ensures proper caching headers only when NOT going through
  // Next.js page routing (verified via has:cookie condition)

  async headers() {
    return [
      {
        // Uploads via /api/uploads route — no-cache so Cloudflare doesn't
        // prerender and cache 404s for new files
        source: "/api/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        // Upload API endpoint — never cache
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

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "showjr.store" },
      { protocol: "https", hostname: "showjr.store" },
    ],
    unoptimized: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;