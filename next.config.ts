import type { NextConfig } from 'next';
import { env } from './src/env';

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion', '@base-ui/react'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'br-gentle-butterfly-aevuizs0.storage.c-2.us-east-2.aws.neon.tech',
      },
      {
        protocol: 'https',
        hostname: '*.storage.c-2.us-east-2.aws.neon.tech',
      },
      {
        protocol: 'https',
        hostname: '*.neon.tech',
      },
      {
        protocol: 'https',
        hostname: 'buscatunido.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'buscatunido-api.onrender.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '*.onrender.com',
      },
    ],
  },
  async rewrites() {
    const apiTarget = env.API_INTERNAL_URL;
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiTarget}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
