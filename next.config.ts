import type { NextConfig } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || "https://api.campusiyo.in";
const IS_EXPORT = process.env.NEXT_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(IS_EXPORT ? { output: "export" } : {}),

  devIndicators: {
    position: "bottom-right",
  },

  compress: true,
  poweredByHeader: false,

  images: {
    unoptimized: IS_EXPORT,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400,
  },

  ...(!IS_EXPORT
    ? {
        async rewrites() {
          return [
            {
              source: "/api/notes",
              destination: `${BACKEND_URL}/notes`,
            },
            {
              source: "/api/notes/:path*",
              destination: `${BACKEND_URL}/notes/:path*`,
            },
            {
              source: "/api/courses",
              destination: `${BACKEND_URL}/courses`,
            },
            {
              source: "/api/courses/:path*",
              destination: `${BACKEND_URL}/courses/:path*`,
            },
            {
              source: "/api/auth",
              destination: `${BACKEND_URL}/auth`,
            },
            {
              source: "/api/auth/:path*",
              destination: `${BACKEND_URL}/auth/:path*`,
            },
            {
              source: "/api/users",
              destination: `${BACKEND_URL}/users`,
            },
            {
              source: "/api/users/:path*",
              destination: `${BACKEND_URL}/users/:path*`,
            },
            {
              source: "/api/admin",
              destination: `${BACKEND_URL}/admin`,
            },
            {
              source: "/api/admin/:path*",
              destination: `${BACKEND_URL}/admin/:path*`,
            },
          ];
        },
      }
    : {}),

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;