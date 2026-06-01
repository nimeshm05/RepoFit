import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: "/onboarding",
        destination: "/chat",
        permanent: false,
      },
      {
        source: "/onboarding/:path*",
        destination: "/chat",
        permanent: false,
      },
      {
        source: "/preference-elicitation",
        destination: "/chat",
        permanent: false,
      },
      {
        source: "/preference-elicitation/:path*",
        destination: "/chat",
        permanent: false,
      },
      {
        source: "/recommendations",
        destination: "/chat",
        permanent: false,
      },
      {
        source: "/recommendations/:path*",
        destination: "/chat",
        permanent: false,
      },
      {
        source: "/repos",
        destination: "/dev/repos",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
