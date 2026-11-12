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
  webpack: (config, { isServer }) => {
    if (isServer) {
      if (Array.isArray(config.externals)) {
        config.externals.push("@distube/ytdl-core");
      } else if (config.externals) {
        config.externals = [config.externals, "@distube/ytdl-core"];
      } else {
        config.externals = ["@distube/ytdl-core"];
      }
    }
    return config;
  },
};

export default nextConfig;
