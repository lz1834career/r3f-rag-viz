import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@r3f-rag-viz/react", "@r3f-rag-viz/core"],
  reactStrictMode: false,
};

export default nextConfig;
