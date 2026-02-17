/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/ui", "@repo/shared"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
