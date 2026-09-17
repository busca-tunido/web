import type { MetadataRoute } from 'next';
import { env } from '@/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/terms', '/privacy', '/faq', '/contact'],
      disallow: ['/api/', '/cuenta/', '/admin/'],
    },
    sitemap: `${cleanBaseUrl}/sitemap.xml`,
  };
}
