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
        destination: "/preference-elicitation",
        permanent: false,
      },
      {
        source: "/onboarding/:path*",
        destination: "/preference-elicitation/:path*",
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
