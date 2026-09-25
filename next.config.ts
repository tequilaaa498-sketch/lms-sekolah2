import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  serverExternalPackages: ["mariadb", "@prisma/adapter-mariadb"],
};

export default nextConfig;