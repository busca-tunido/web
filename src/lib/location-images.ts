const CITY_IMAGE_MAP: Record<string, string> = {
  santiago:
    'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=800&q=80',
  valparaiso:
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
  valparaíso:
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
  concepcion:
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
  concepción:
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
  valdivia:
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  temuco:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  antofagasta:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  laserena:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'la serena':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  coquimbo:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'vina del mar':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'viña del mar':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  talca:
    'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
  chillan:
    'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
  chillán:
    'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
  iquique:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  arica:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'puerto montt':
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  'puerto varas':
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_CITY_IMAGE =
  'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80';

const UNIVERSITY_KEYWORD_IMAGES: Array<{ pattern: RegExp; url: string }> = [
  {
    pattern: /universidad de chile|uchile/i,
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /cat[oó]lica|puc|uc\b/i,
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /concepci[oó]n|udec/i,
    url: 'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /valpara[ií]so|uv\b/i,
    url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /santa mar[ií]a|utfsm|usm\b/i,
    url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /austral|uach/i,
    url: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /portales|udp/i,
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /santiago|usach/i,
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /finis|terrae/i,
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /mistral|ugm/i,
    url: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /sek/i,
    url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80',
  },
  {
    pattern: /cervantes/i,
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
  },
];

const UNIVERSITY_FALLBACK_POOL = [
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=800&q=80',
];

export function getCityImageUrl(cityName: string): string {
  if (!cityName) return DEFAULT_CITY_IMAGE;
  const normalized = cityName.trim().toLowerCase();
  return CITY_IMAGE_MAP[normalized] ?? DEFAULT_CITY_IMAGE;
}

export function getUniversityImageUrl(nameOrAcronym: string, identifier?: string): string {
  const text = `${nameOrAcronym} ${identifier ?? ''}`;
  for (const item of UNIVERSITY_KEYWORD_IMAGES) {
    if (item.pattern.test(text)) {
      return item.url;
    }
  }
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % UNIVERSITY_FALLBACK_POOL.length;
  return UNIVERSITY_FALLBACK_POOL[index];
}
