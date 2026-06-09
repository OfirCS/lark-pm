import type { NextConfig } from "next";

// Base path for GitHub Pages project sites (e.g. "/lark-pm").
// Set NEXT_PUBLIC_BASE_PATH at build time; empty for local dev / root domains.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Static HTML export → deployable to GitHub Pages with no server/backend.
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
