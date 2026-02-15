/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/shared"],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
