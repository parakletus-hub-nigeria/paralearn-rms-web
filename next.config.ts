import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.K12_BACKEND_URL || "https://paralearn-backend-b3ezb3e3ged0eyf8.switzerlandnorth-01.azurewebsites.net"}/:path*`,
      },
      {
        source: "/api/uni-proxy/:path*",
        destination: `${process.env.UNI_BACKEND_URL || "http://localhost:3001"}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "arua.org",
        pathname: "/**",
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
