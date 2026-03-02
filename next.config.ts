import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  webpack: (config, { defaultLoaders }) => {
    config.resolveLoader = {
      ...config.resolveLoader,
      modules: [
        path.resolve(__dirname, "node_modules"),
        ...(config.resolveLoader?.modules ?? []),
      ],
    };
    config.resolve = {
      ...config.resolve,
      modules: [
        path.resolve(__dirname, "node_modules"),
        "node_modules",
      ],
    };
    return config;
  },
};

export default nextConfig;
