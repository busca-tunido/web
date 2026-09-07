import type { Organization, WebSite, WithContext } from 'schema-dts';

export function RootJsonLd() {
  const websiteSchema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BuscaTuNido',
    url: 'https://buscatunido.vercel.app',
    description:
      'Plataforma comunitaria para buscar, comparar y validar pensiones universitarias en Chile con verificación estudiantil.',
    inLanguage: 'es-CL',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://buscatunido.vercel.app/?search={search_term_string}',
      query: 'required name=search_term_string',
    },
  };

  const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BuscaTuNido',
    url: 'https://buscatunido.vercel.app',
    logo: 'https://buscatunido.vercel.app/apple-touch-icon.png',
    sameAs: ['https://github.com/busca-tunido'],
  };

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
    </>
  );
}
