/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@distube/ytdl-core",
      "sharp",
      "@prisma/client",
      "prisma",
      "mediabunny",
    ],
  },
};

export default nextConfig;
