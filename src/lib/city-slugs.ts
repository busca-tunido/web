const CITY_SLUG_MAP: Record<string, string> = {
  valparaiso: 'Valparaíso',
  'vina-del-mar': 'Viña del Mar',
  santiago: 'Santiago',
  concepcion: 'Concepción',
  antofagasta: 'Antofagasta',
  temuco: 'Temuco',
  valdivia: 'Valdivia',
  'la-serena': 'La Serena',
  talca: 'Talca',
  chillan: 'Chillán',
  arica: 'Arica',
  iquique: 'Iquique',
  'puerto-montt': 'Puerto Montt',
};

export function cityNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function slugToCityName(slug: string): string {
  const normalized = slug.toLowerCase().trim();
  if (CITY_SLUG_MAP[normalized]) {
    return CITY_SLUG_MAP[normalized];
  }
  return normalized
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
