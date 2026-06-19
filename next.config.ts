import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname)
  },
  outputFileTracingIncludes: {
    "/api/pdf": ["./bin/**/*", "./fonts/**/*"]
  }
};

export default nextConfig;
