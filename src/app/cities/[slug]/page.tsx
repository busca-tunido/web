import type { Metadata } from 'next';
import { UserAppShell } from '@/components/shells/student-app-shell';
import { slugToCityName } from '@/lib/city-slugs';
import { getStudentInitialData } from '@/lib/server-student-prefetch';

type CityPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(props: CityPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const cityName = slugToCityName(slug);

  const title = `Pensiones Universitarias en ${cityName} | BuscaTuNido`;
  const description = `Encuentra y compara residencias y pensiones estudiantiles en ${cityName}. Precios reales, ubicaciones cercanas a campus universitarios y opiniones verificadas.`;
  const canonicalUrl = `/cities/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'BuscaTuNido',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CityPage(props: CityPageProps) {
  const { slug } = await props.params;
  const cityName = slugToCityName(slug);

  const initialData = await getStudentInitialData({ city: cityName });

  const initialNavigationState = {
    tab: 'explore' as const,
    city: cityName,
    uni: null,
    pensionId: null,
    isFiltersOpen: false,
    reviewsPensionId: null,
    publishReviewPensionId: null,
  };

  return (
    <UserAppShell
      initialData={initialData}
      initialNavigationState={initialNavigationState}
      initialTab="explore"
    />
  );
}
