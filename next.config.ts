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
        source: "/chat",
        destination: "/",
        permanent: false,
      },
      {
        source: "/chat/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/onboarding",
        destination: "/",
        permanent: false,
      },
      {
        source: "/onboarding/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/preference-elicitation",
        destination: "/",
        permanent: false,
      },
      {
        source: "/preference-elicitation/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/recommendations",
        destination: "/",
        permanent: false,
      },
      {
        source: "/recommendations/:path*",
        destination: "/",
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
