import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error('Missing env var: NEXT_PUBLIC_APP_URL must be defined in environment (.env).');
  }

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
