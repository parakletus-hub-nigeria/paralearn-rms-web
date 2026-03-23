import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.K12_BACKEND_URL}`,
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
