const S3_BASE = 'https://br-gentle-butterfly-aevuizs0.storage.c-2.us-east-2.aws.neon.tech/uploads';

const CITY_IMAGE_MAP: Record<string, string> = {
  santiago: `${S3_BASE}/cities/santiago.webp`,
  valparaiso: `${S3_BASE}/cities/valparaiso.webp`,
  valparaíso: `${S3_BASE}/cities/valparaiso.webp`,
  concepcion: `${S3_BASE}/cities/concepcion.webp`,
  concepción: `${S3_BASE}/cities/concepcion.webp`,
  valdivia: `${S3_BASE}/cities/valdivia.webp`,
  temuco: `${S3_BASE}/cities/temuco.webp`,
  antofagasta: `${S3_BASE}/cities/norte-costa.webp`,
  laserena: `${S3_BASE}/cities/norte-costa.webp`,
  'la serena': `${S3_BASE}/cities/norte-costa.webp`,
  coquimbo: `${S3_BASE}/cities/norte-costa.webp`,
  'vina del mar': `${S3_BASE}/cities/norte-costa.webp`,
  'viña del mar': `${S3_BASE}/cities/norte-costa.webp`,
  talca: `${S3_BASE}/cities/city-mock.webp`,
  chillan: `${S3_BASE}/cities/city-mock.webp`,
  chillán: `${S3_BASE}/cities/city-mock.webp`,
  iquique: `${S3_BASE}/cities/norte-costa.webp`,
  arica: `${S3_BASE}/cities/norte-costa.webp`,
  'puerto montt': `${S3_BASE}/cities/valdivia.webp`,
  'puerto varas': `${S3_BASE}/cities/valdivia.webp`,
};

const DEFAULT_CITY_IMAGE = `${S3_BASE}/cities/santiago.webp`;

const UNIVERSITY_KEYWORD_IMAGES: Array<{ pattern: RegExp; url: string }> = [
  {
    pattern: /universidad de chile|uchile/i,
    url: `${S3_BASE}/universities/uchile-classic.webp`,
  },
  {
    pattern: /cat[oó]lica|puc|uc\b/i,
    url: `${S3_BASE}/universities/puc-campus.webp`,
  },
  {
    pattern: /concepci[oó]n|udec/i,
    url: `${S3_BASE}/universities/udec-campanil.webp`,
  },
  {
    pattern: /valpara[ií]so|uv\b/i,
    url: `${S3_BASE}/universities/uv-patio.webp`,
  },
  {
    pattern: /santa mar[ií]a|utfsm|usm\b/i,
    url: `${S3_BASE}/universities/utfsm-library.webp`,
  },
  {
    pattern: /austral|uach/i,
    url: `${S3_BASE}/universities/uach-nature.webp`,
  },
  {
    pattern: /portales|udp/i,
    url: `${S3_BASE}/universities/udp-students.webp`,
  },
  {
    pattern: /santiago|usach/i,
    url: `${S3_BASE}/universities/puc-campus.webp`,
  },
  {
    pattern: /finis|terrae/i,
    url: `${S3_BASE}/universities/uchile-classic.webp`,
  },
  {
    pattern: /mistral|ugm/i,
    url: `${S3_BASE}/universities/uv-patio.webp`,
  },
  {
    pattern: /sek/i,
    url: `${S3_BASE}/universities/utfsm-library.webp`,
  },
  {
    pattern: /cervantes/i,
    url: `${S3_BASE}/universities/uchile-classic.webp`,
  },
];

const UNIVERSITY_FALLBACK_POOL = [
  `${S3_BASE}/universities/puc-campus.webp`,
  `${S3_BASE}/universities/uchile-classic.webp`,
  `${S3_BASE}/universities/utfsm-library.webp`,
  `${S3_BASE}/universities/uv-patio.webp`,
  `${S3_BASE}/universities/udp-students.webp`,
  `${S3_BASE}/universities/uach-nature.webp`,
  `${S3_BASE}/universities/udec-campanil.webp`,
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
