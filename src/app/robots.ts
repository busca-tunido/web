import type { MetadataRoute } from 'next';
import { env } from '@/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/terms', '/privacy', '/faq', '/contact', '/llms.txt', '/llms-full.txt'],
        disallow: ['/api/', '/cuenta/', '/admin/'],
      },
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'],
        allow: ['/', '/terms', '/privacy', '/faq', '/contact', '/llms.txt', '/llms-full.txt'],
        disallow: ['/api/', '/cuenta/', '/admin/'],
      },
    ],
    sitemap: `${cleanBaseUrl}/sitemap.xml`,
  };
}
