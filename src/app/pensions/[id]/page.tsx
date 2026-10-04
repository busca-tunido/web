import { ChevronRight, Home } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicNavHeader } from '@/components/common/public-nav-header';
import { PensionDetailContent } from '@/components/pensions/pension-detail-content';
import { mapRawPensionToItem } from '@/lib/api-client';
import { isApiSuccess } from '@/lib/api-response';
import type { PensionItem } from '@/lib/types';
import { pensionsService } from '@/services/pensions.service';

type PensionPageProps = {
  params: Promise<{ id: string }>;
};

async function getPensionData(id: string): Promise<PensionItem | null> {
  try {
    const res = await pensionsService.fetchPensionById(id);
    if (!isApiSuccess(res) || !res.data) {
      return null;
    }
    return mapRawPensionToItem(res.data as unknown as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function generateMetadata(props: PensionPageProps): Promise<Metadata> {
  const { id } = await props.params;
  const pension = await getPensionData(id);

  if (!pension) {
    return {
      title: 'Pensión no encontrada | BuscaTuNido',
      description: 'La pensión universitaria solicitada no existe o no se encuentra disponible.',
    };
  }

  const title = `${pension.title} en ${pension.city} | BuscaTuNido`;
  const description =
    pension.description?.slice(0, 160) ||
    `Pensión universitaria en ${pension.address}, ${pension.city}. Habitaciones desde $${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP mensuales.`;
  const canonicalUrl = `/pensions/${id}`;
  const firstPhoto = pension.photos?.[0];

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
      images: firstPhoto ? [{ url: firstPhoto, width: 1200, height: 630, alt: pension.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: firstPhoto ? [firstPhoto] : [],
    },
  };
}

export default async function PensionPage(props: PensionPageProps) {
  const { id } = await props.params;
  const pension = await getPensionData(id);

  if (!pension) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: pension.title,
    description: pension.description,
    image: pension.photos?.[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: pension.address,
      addressLocality: pension.city,
      addressRegion: pension.neighborhood || pension.city,
      addressCountry: 'CL',
    },
    geo:
      pension.latitude && pension.longitude
        ? {
            '@type': 'GeoCoordinates',
            latitude: pension.latitude,
            longitude: pension.longitude,
          }
        : undefined,
    priceRange: `$${pension.priceMonthlyClp.toLocaleString('es-CL')} CLP`,
    aggregateRating:
      pension.ratingAverage > 0 && pension.reviewsCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: pension.ratingAverage,
            reviewCount: pension.reviewsCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      <PublicNavHeader title={pension.title} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground flex items-center gap-1 transition">
            <Home className="h-3.5 w-3.5" />
            <span>Inicio</span>
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link
            href={`/?city=${encodeURIComponent(pension.city)}`}
            className="hover:text-foreground transition"
          >
            {pension.city}
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
            {pension.title}
          </span>
        </nav>

        <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-xs">
          <PensionDetailContent pension={pension} />
        </div>
      </main>

      <footer className="w-full border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} BuscaTuNido. Plataforma de residencias estudiantiles en
          Chile.
        </p>
      </footer>
    </div>
  );
}
