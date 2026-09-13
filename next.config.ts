import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@circle-fin/w3s-pw-web-sdk"],
};

export default nextConfig;
