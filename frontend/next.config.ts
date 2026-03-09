import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // explicitly disable turbopack (avoids panic logs) and set root to this folder
  turbopack: {
    enabled: false,
    root: __dirname, // ensures paths like src/app/layout.tsx are resolved inside frontend
  },
};

export default nextConfig;
