import type { NextConfig } from 'next';

// Backend URL — override via BACKEND_URL env var in production
const BACKEND_URL = process.env.BACKEND_URL || "https://api.campusiyo.in";

const nextConfig: NextConfig = {

  devIndicators: {
    position: 'bottom-right',
  },

  // ── Production hardening ───────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By: Next.js header

  // ── Image optimization ─────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400, // 24 hours
  },

  // ── API Rewrites (Next.js → Spring Boot) ─────────────────────────────────
  async rewrites() {
  return [
      //testing ke liye
      {
        source: "/test",
        destination: "https://httpbin.org/anything",
      },
      // Notes
      {
        source: "/api/notes",
        destination: `${BACKEND_URL}/notes`,
      },
      {
        source: "/api/notes/:path*",
        destination: `${BACKEND_URL}/notes/:path*`,
      },

      // Courses
      {
        source: "/api/courses",
        destination: `${BACKEND_URL}/courses`,
      },
      {
        source: "/api/courses/:path*",
        destination: `${BACKEND_URL}/courses/:path*`,
      },

      // Auth
      {
        source: "/api/auth",
        destination: `${BACKEND_URL}/auth`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${BACKEND_URL}/auth/:path*`,
      },

      // Users
      {
        source: "/api/users",
        destination: `${BACKEND_URL}/users`,
      },
      {
        source: "/api/users/:path*",
        destination: `${BACKEND_URL}/users/:path*`,
      },

      // API v1
      {
        source: "/api/api/v1",
        destination: `${BACKEND_URL}/api/v1`,
      },
      {
        source: "/api/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },

      // Admin
      {
        source: "/api/admin",
        destination: `${BACKEND_URL}/admin`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${BACKEND_URL}/admin/:path*`,
      },

      // User
      {
        source: "/api/user",
        destination: `${BACKEND_URL}/user`,
      },
      {
        source: "/api/user/:path*",
        destination: `${BACKEND_URL}/user/:path*`,
      },
    ];
  },

  // ── Security & cache headers ───────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Aggressively cache immutable static assets
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache favicon and icon assets
        source: '/(favicon|android-chrome|apple-touch)(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },
};

export default nextConfig;