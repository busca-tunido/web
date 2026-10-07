import type { MetadataRoute } from 'next';
import { env } from '@/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/explore',
          '/pensions/*',
          '/cities/*',
          '/terms',
          '/privacy',
          '/faq',
          '/contact',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: [
          '/api/',
          '/landlord/',
          '/landlord/*',
          '/cuenta/',
          '/admin/',
          '/favorites',
          '/history',
          '/account',
        ],
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'],
        allow: [
          '/',
          '/explore',
          '/pensions/*',
          '/cities/*',
          '/terms',
          '/privacy',
          '/faq',
          '/contact',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: [
          '/api/',
          '/landlord/',
          '/landlord/*',
          '/cuenta/',
          '/admin/',
          '/favorites',
          '/history',
          '/account',
        ],
      },
    ],
    sitemap: `${cleanBaseUrl}/sitemap.xml`,
  };
}
