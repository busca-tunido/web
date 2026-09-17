import type { MetadataRoute } from 'next';
import { env } from '@/env';

const LAST_MODIFIED_DATE = '2026-09-14T00:00:00.000Z';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  return [
    {
      url: cleanBaseUrl,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${cleanBaseUrl}/faq`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${cleanBaseUrl}/contact`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${cleanBaseUrl}/terms`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${cleanBaseUrl}/privacy`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];
}
