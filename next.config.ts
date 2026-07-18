import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@anthropic-ai/sdk", "pdf-parse", "better-sqlite3"],
};

export default nextConfig;
