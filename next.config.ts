import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["typeorm", "reflect-metadata"],
};

export default nextConfig;
