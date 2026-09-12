import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@privy-io/react-auth", "@privy-io/wagmi"],
};

export default nextConfig;
