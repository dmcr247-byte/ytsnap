/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
    outputFileTracingIncludes: {
      "/api/**/*": [
        "./node_modules/@distube/ytdl-core/**/*",
      ],
    },
    serverComponentsExternalPackages: [
      "@distube/ytdl-core",
      "sharp",
      "@prisma/client",
      "prisma",
      "mediabunny",
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "ytsnap-chi.vercel.app",
          },
        ],
        destination: "https://www.ytsnap.tech/:path*",
        permanent: true,
      },
    ];
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
