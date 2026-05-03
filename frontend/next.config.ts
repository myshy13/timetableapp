import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  distDir: "dist",
  output: "export",
  turbopack: {
    root: "/Users/hamish/Desktop/Code/SaaS/timetableapp",
  },
  devIndicators: false,
  allowedDevOrigins: ["192.168.10.111"],
}

export default nextConfig
