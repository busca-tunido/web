import type { MetadataRoute } from 'next';
import { env } from '@/env';
import { cityNameToSlug } from '@/lib/city-slugs';
import { fetchInitialCities, fetchInitialPensions } from '@/lib/server-student-prefetch';

const LAST_MODIFIED_DATE = '2026-09-14T00:00:00.000Z';

const KNOWN_CITIES = [
  'Valparaíso',
  'Viña del Mar',
  'Santiago',
  'Concepción',
  'Antofagasta',
  'Temuco',
  'Valdivia',
  'La Serena',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  const internalApiUrl = env.API_INTERNAL_URL.replace(/\/+$/, '');

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  let cityRoutes: MetadataRoute.Sitemap = [];
  let pensionRoutes: MetadataRoute.Sitemap = [];

  try {
    const [cities, pensionsResult] = await Promise.all([
      fetchInitialCities(internalApiUrl),
      fetchInitialPensions(internalApiUrl, { limit: 100 }),
    ]);

    const resolvedCityNames = cities.length > 0 ? cities.map((c) => c.name) : KNOWN_CITIES;
    const uniqueSlugs = Array.from(new Set(resolvedCityNames.map(cityNameToSlug)));

    cityRoutes = uniqueSlugs.map((slug) => ({
      url: `${baseUrl}/cities/${slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    pensionRoutes = (pensionsResult.items ?? []).map((p) => ({
      url: `${baseUrl}/pensions/${p.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {
    cityRoutes = KNOWN_CITIES.map(cityNameToSlug).map((slug) => ({
      url: `${baseUrl}/cities/${slug}`,
      lastModified: LAST_MODIFIED_DATE,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  }

  return [...staticRoutes, ...cityRoutes, ...pensionRoutes];
}
