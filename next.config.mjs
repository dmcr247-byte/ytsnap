/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@distube/ytdl-core", "sharp", "@prisma/client", "prisma"],
  },
};

export default nextConfig;
