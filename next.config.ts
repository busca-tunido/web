import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'web-git-main-joseleivas-projects.vercel.app',
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
      {
        protocol: 'https',
        hostname: '*.neon.tech',
      },
      {
        protocol: 'https',
        hostname: '*.cartocdn.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const apiTarget = process.env.API_INTERNAL_URL;
    if (!apiTarget) {
      throw new Error(
        'Missing required environment variable: API_INTERNAL_URL must be defined in environment (.env).',
      );
    }
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
