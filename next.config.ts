import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Fix workspace root inference warnings (useful when there are multiple lockfiles)
  turbopack: {
    // Set the project root for Turbopack/Next to this folder
    root: './'
  }
};

export default nextConfig;
