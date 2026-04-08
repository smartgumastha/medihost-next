import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.medihost.in' },
      { protocol: 'https', hostname: '**.hemato.in' },
      { protocol: 'https', hostname: 'smartgumastha-backend-production.up.railway.app' },
    ],
  },
  // Headers for API proxy CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization,x-admin-key' },
        ],
      },
    ];
  },
  // Rewrites to proxy API calls to Railway backend
  async rewrites() {
    return {
      // beforeFiles rewrites run before Next.js checks for pages/API routes
      // This ensures /api/presence/*, /api/storefront/*, etc. go to Railway
      // while /api/auth/* (our Next.js API routes) still work
      beforeFiles: [
        {
          source: '/api/proxy/:path*',
          destination: 'https://smartgumastha-backend-production.up.railway.app/api/:path*',
        },
      ],
      afterFiles: [
        // Proxy all /api/* calls that aren't handled by Next.js API routes to Railway
        // Next.js API routes (/api/auth/*, /api/ai/*) are checked first
        // Anything else (presence, storefront, etc.) goes to Railway
        {
          source: '/api/presence/:path*',
          destination: 'https://smartgumastha-backend-production.up.railway.app/api/presence/:path*',
        },
        {
          source: '/api/storefront/:path*',
          destination: 'https://smartgumastha-backend-production.up.railway.app/api/storefront/:path*',
        },
        // /api/admin/* routes are handled by Next.js API routes in src/app/api/admin/
      ],
      fallback: [],
    };
  },
  async redirects() {
    return [
      { source: '/dashboard.html', destination: '/dashboard', permanent: true },
      { source: '/admin.html', destination: '/admin', permanent: true },
      { source: '/onboard.html', destination: '/dashboard', permanent: true },
      { source: '/login.html', destination: '/login', permanent: true },
      { source: '/signup.html', destination: '/signup', permanent: true },
    ];
  },
};

export default nextConfig;
