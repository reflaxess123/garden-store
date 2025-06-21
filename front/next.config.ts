import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      // Добавляем другие домены по необходимости
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  },
  typescript: {
    // Включаем TypeScript проверки во время разработки
    ignoreBuildErrors: false,
  },
  eslint: {
    // Не игнорируем ESLint ошибки во время сборки
    ignoreDuringBuilds: false,
  },
  webpack: (config, options) => {
    // Добавляем TypeScript checker только в dev режиме
    if (options.dev && !options.isServer) {
      config.plugins.push(
        new ForkTsCheckerWebpackPlugin({
          typescript: {
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
            },
          },
        })
      );
    }
    return config;
  },
};

export default nextConfig;
