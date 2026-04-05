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
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://smartgumastha-backend-production.up.railway.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
