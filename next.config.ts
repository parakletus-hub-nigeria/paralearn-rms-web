import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*", // When we request /api/proxy...
        destination: `${process.env.K12_BACKEND_URL}/:path*`, // ...send it to the K12 backend
      },
      {
        source: "/api/uni-proxy/:path*", // When we request /api/uni-proxy...
        destination: `${process.env.UNI_BACKEND_URL}/:path*`, // ...send it to the University backend
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
