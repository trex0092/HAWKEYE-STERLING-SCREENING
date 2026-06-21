/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server build (.next/standalone) for slim Docker images.
  output: "standalone",
  // Bundle the build-time sanctions/PEP index into the screening route's
  // serverless function so it can be read in-process at runtime.
  outputFileTracingIncludes: {
    "/api/quick-screen": ["./src/lib/data/generated/**"],
  },
};

export default nextConfig;
