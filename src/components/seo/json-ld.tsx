import type { Organization, WebSite, WithContext } from 'schema-dts';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://buscatunido.vercel.app';

export function RootJsonLd() {
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

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
    </>
  );
}
