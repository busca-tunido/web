import type { ItemList, LodgingBusiness, Organization, WebSite, WithContext } from 'schema-dts';
import { env } from '@/env';
import type { PensionItem } from '@/lib/types';

const APP_URL = env.NEXT_PUBLIC_APP_URL;

export type AccommodationWithOffers = WithContext<LodgingBusiness> & {
  offers?: {
    '@type': 'Offer';
    price: number;
    priceCurrency: string;
    availability: string;
    unitText?: string;
  };
};

type RootJsonLdProps = {
  pensions?: PensionItem[];
};

export function generateAccommodationSchema(
  pension: PensionItem,
  appUrl: string = APP_URL,
): AccommodationWithOffers {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: pension.title,
    description:
      pension.description || `Pensión universitaria en ${pension.city}, ${pension.neighborhood}.`,
    url: `${appUrl}/pensions/${pension.slug || pension.id}`,
    image: pension.photos?.[0] || `${appUrl}/icon.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: pension.address,
      addressLocality: pension.city,
      addressRegion: pension.neighborhood,
      addressCountry: 'CL',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: pension.latitude,
      longitude: pension.longitude,
    },
    offers: {
      '@type': 'Offer',
      price: pension.priceMonthlyClp,
      priceCurrency: 'CLP',
      availability: 'https://schema.org/InStock',
      unitText: 'MONTH',
    },
    ...(pension.reviewsCount > 0 && pension.ratingAverage > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: pension.ratingAverage,
            reviewCount: pension.reviewsCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function generateItemListSchema(
  pensions: PensionItem[],
  appUrl: string = APP_URL,
): WithContext<ItemList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Pensiones y Residencias Universitarias en Chile',
    description:
      'Catálogo de pensiones y residencias universitarias verificadas para estudiantes en Chile.',
    url: appUrl,
    numberOfItems: pensions.length,
    itemListElement: pensions.map((pension, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: pension.title,
      url: `${appUrl}/pensions/${pension.slug || pension.id}`,
      item: {
        '@type': 'Accommodation',
        name: pension.title,
        description: pension.description || `Pensión universitaria en ${pension.city}.`,
        url: `${appUrl}/pensions/${pension.slug || pension.id}`,
        image: pension.photos?.[0] || `${appUrl}/icon.png`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: pension.address,
          addressLocality: pension.city,
          addressRegion: pension.neighborhood,
          addressCountry: 'CL',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: pension.latitude,
          longitude: pension.longitude,
        },
        offers: {
          '@type': 'Offer',
          price: pension.priceMonthlyClp,
          priceCurrency: 'CLP',
          availability: 'https://schema.org/InStock',
          unitText: 'MONTH',
        },
        ...(pension.reviewsCount > 0 && pension.ratingAverage > 0
          ? {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: pension.ratingAverage,
                reviewCount: pension.reviewsCount,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      },
    })),
  };
}

export function RootJsonLd({ pensions = [] }: RootJsonLdProps = {}) {
  const websiteSchema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BuscaTuNido',
    alternateName: ['TuNido', 'Busca Tu Nido', 'BuscaTuNido Chile'],
    url: APP_URL,
    description:
      'Plataforma comunitaria para buscar, comparar y validar pensiones universitarias en Chile con verificación estudiantil.',
    inLanguage: 'es-CL',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${APP_URL}/?search={search_term_string}`,
      query: 'required name=search_term_string',
    },
  };

  const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BuscaTuNido',
    url: APP_URL,
    logo: `${APP_URL}/icon.png`,
    sameAs: ['https://github.com/busca-tunido'],
  };

  const itemListSchema: WithContext<ItemList> = generateItemListSchema(pensions, APP_URL);

  const accommodationSchema: AccommodationWithOffers =
    pensions.length > 0
      ? generateAccommodationSchema(pensions[0], APP_URL)
      : {
          '@context': 'https://schema.org',
          '@type': 'LodgingBusiness',
          name: 'Pensiones y Residencias Universitarias en Chile',
          description:
            'Alojamientos y pensiones universitarias con habitaciones amobladas, wifi, servicios incluidos y verificación estudiantil.',
          url: APP_URL,
          image: `${APP_URL}/icon.png`,
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'CL',
            addressRegion: 'Región Metropolitana',
            addressLocality: 'Santiago',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: -33.4489,
            longitude: -70.6693,
          },
          offers: {
            '@type': 'Offer',
            price: 250000,
            priceCurrency: 'CLP',
            availability: 'https://schema.org/InStock',
            unitText: 'MONTH',
          },
        };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(accommodationSchema)}</script>
    </>
  );
}

export function AccommodationJsonLd({ pension }: { pension: PensionItem }) {
  const schema = generateAccommodationSchema(pension, APP_URL);
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}

export function ItemListJsonLd({ pensions }: { pensions: PensionItem[] }) {
  const schema = generateItemListSchema(pensions, APP_URL);
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>;
}
