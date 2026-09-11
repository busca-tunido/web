import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error('Missing env var: NEXT_PUBLIC_APP_URL must be defined in environment (.env).');
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/cuenta/', '/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
