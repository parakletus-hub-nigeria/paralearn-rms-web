import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*', // When we request /api/proxy...
        destination: 'https://paralearn-backend-b3ezb3e3ged0eyf8.switzerlandnorth-01.azurewebsites.net/:path*', // ...send it here
      },
    ];
  },
};

export default nextConfig;
