import type { PensionItem } from '@/lib/types';

export type ComparisonSection = 'Precio y ubicación' | 'Servicios' | 'Reglas';
export type ComparisonMetric = 'price' | 'distance' | 'rating' | 'equipment' | 'reviews';
export type ComparisonRow = {
  label: string;
  section: ComparisonSection;
  value: (pension: PensionItem, universityId?: string) => string;
  metric?: ComparisonMetric;
};

export const COMPARISON_SECTIONS: readonly ComparisonSection[] = [
  'Precio y ubicación',
  'Servicios',
  'Reglas',
];
export const COMPARISON_ADVANTAGES: Record<ComparisonMetric, string> = {
  price: 'Más económica',
  distance: 'Más cercana',
  rating: 'Mejor evaluada',
  equipment: 'Más equipada',
  reviews: 'Más reseñas',
};

const money = (value: number, currency: string): string =>
  `${value.toLocaleString('es-CL')} ${currency}`;
const included = (value: boolean): string => (value ? 'Incluido' : 'No incluido');
const allowed = (value: boolean): string => (value ? 'Permitido' : 'No permitido');
const amenitySlugs = (p: PensionItem): Set<string> =>
  new Set([...p.amenities.map((a) => a.slug), ...(p.amenitySlugs ?? [])]);
const publishedAmenity = (p: PensionItem, slug: string): string =>
  amenitySlugs(p).has(slug) ? 'Disponible' : 'No informado';

export function comparisonCampus(p: PensionItem, universityId?: string) {
  const candidates = p.nearbyUniversities.filter(
    (u) => Number.isFinite(u.distanceMeters) && u.distanceMeters >= 0,
  );
  if (universityId) {
    const match = candidates.find((u) => u.university.id === universityId);
    return match ? { name: match.university.name, distanceMeters: match.distanceMeters } : null;
  }
  const nearest = [...candidates].sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
  if (nearest) return { name: nearest.university.name, distanceMeters: nearest.distanceMeters };
  const summary = p.nearestUniversity;
  return summary && Number.isFinite(summary.distanceMeters) && summary.distanceMeters >= 0
    ? { name: summary.name, distanceMeters: summary.distanceMeters }
    : null;
}

function equipmentCount(p: PensionItem): number {
  const services = amenitySlugs(p);
  for (const slug of ['wifi-alta-velocidad', 'agua-incluida', 'luz-incluida', 'gas-incluido'])
    services.delete(slug);
  return (
    services.size +
    [
      p.waterIncluded,
      p.electricityIncluded,
      p.gasIncluded,
      p.internetIncluded || amenitySlugs(p).has('wifi-alta-velocidad'),
    ].filter(Boolean).length
  );
}

export function comparisonWinner(
  metric: ComparisonMetric,
  pensions: readonly (PensionItem | null)[],
  universityId?: string,
): string | null {
  const [a, b] = pensions;
  if (!a || !b) return null;
  let values: readonly [number | null, number | null];
  switch (metric) {
    case 'price':
      if (a.currency !== b.currency) return null;
      values = [a.baseMonthlyPrice, b.baseMonthlyPrice];
      break;
    case 'distance':
      values = [
        comparisonCampus(a, universityId)?.distanceMeters ?? null,
        comparisonCampus(b, universityId)?.distanceMeters ?? null,
      ];
      break;
    case 'rating':
      values = [
        a.ratingCount > 0 ? a.ratingAverage : null,
        b.ratingCount > 0 ? b.ratingAverage : null,
      ];
      break;
    case 'equipment':
      values = [equipmentCount(a), equipmentCount(b)];
      break;
    case 'reviews':
      values = [a.reviewsCount, b.reviewsCount];
      break;
  }
  const [first, second] = values;
  if (
    first === null ||
    second === null ||
    !Number.isFinite(first) ||
    !Number.isFinite(second) ||
    first < 0 ||
    second < 0 ||
    first === second
  )
    return null;
  return (metric === 'price' || metric === 'distance' ? first < second : first > second)
    ? a.id
    : b.id;
}

const roomTypes: Record<PensionItem['rooms'][number]['type'], string> = {
  SINGLE: 'Individual',
  SHARED: 'Compartida',
  STUDIO: 'Estudio',
};

export const COMPARISON_ROWS: readonly ComparisonRow[] = [
  {
    label: 'Precio mensual desde',
    section: 'Precio y ubicación',
    value: (p) => money(p.baseMonthlyPrice, p.currency),
    metric: 'price',
  },
  {
    label: 'Garantía',
    section: 'Precio y ubicación',
    value: (p) => (p.deposit == null ? 'No informada' : money(p.deposit, p.currency)),
  },
  {
    label: 'Universidad más cercana',
    section: 'Precio y ubicación',
    value: (p, id) => comparisonCampus(p, id)?.name ?? 'No informada',
  },
  {
    label: 'Distancia al campus',
    section: 'Precio y ubicación',
    value: (p, id) => {
      const campus = comparisonCampus(p, id);
      return campus ? `${campus.distanceMeters.toLocaleString('es-CL')} m` : 'No informada';
    },
    metric: 'distance',
  },
  {
    label: 'Dirección',
    section: 'Precio y ubicación',
    value: (p) => `${p.address}, ${p.neighborhood}, ${p.city}`,
  },
  {
    label: 'Tipo de habitación',
    section: 'Precio y ubicación',
    value: (p) =>
      [...new Set(p.rooms.filter((r) => r.isActive !== false).map((r) => roomTypes[r.type]))].join(
        ', ',
      ) || 'No informado',
  },
  {
    label: 'Calificación',
    section: 'Precio y ubicación',
    value: (p) => (p.ratingCount > 0 ? `${p.ratingAverage.toFixed(1)} / 5` : 'Sin evaluaciones'),
    metric: 'rating',
  },
  {
    label: 'Cantidad de reseñas',
    section: 'Precio y ubicación',
    value: (p) => p.reviewsCount.toLocaleString('es-CL'),
    metric: 'reviews',
  },
  {
    label: 'Descripción resumida',
    section: 'Precio y ubicación',
    value: (p) => p.description?.trim() || 'No informada',
  },
  {
    label: 'Servicios',
    section: 'Servicios',
    value: (p) =>
      p.amenities
        .map((a) => a.name)
        .sort()
        .join(', ') || 'Sin comodidades informadas',
    metric: 'equipment',
  },
  {
    label: 'Comidas incluidas',
    section: 'Servicios',
    value: (p) => (amenitySlugs(p).has('comida-incluida') ? 'Incluidas' : 'No informado'),
  },
  {
    label: 'Lavandería',
    section: 'Servicios',
    value: (p) => publishedAmenity(p, 'lavadora-secadora'),
  },
  {
    label: 'Wifi',
    section: 'Servicios',
    value: (p) => (p.internetIncluded ? 'Incluido' : publishedAmenity(p, 'wifi-alta-velocidad')),
  },
  {
    label: 'Baño privado',
    section: 'Servicios',
    value: (p) => {
      const rooms = p.rooms.filter((r) => r.isActive !== false);
      return rooms.some((r) => r.hasPrivateBathroom)
        ? 'Disponible en algunas habitaciones'
        : amenitySlugs(p).has('bano-privado')
          ? 'Disponible'
          : rooms.length > 0
            ? 'No disponible en las habitaciones publicadas'
            : 'No informado';
    },
  },
  {
    label: 'Sala de estudio',
    section: 'Servicios',
    value: (p) => publishedAmenity(p, 'sala-estudio-cowork'),
  },
  { label: 'Agua', section: 'Servicios', value: (p) => included(p.waterIncluded) },
  { label: 'Electricidad', section: 'Servicios', value: (p) => included(p.electricityIncluded) },
  { label: 'Gas', section: 'Servicios', value: (p) => included(p.gasIncluded) },
  { label: 'Internet incluido', section: 'Servicios', value: (p) => included(p.internetIncluded) },
  { label: 'Visitas', section: 'Reglas', value: (p) => allowed(p.guestsAllowed) },
  { label: 'Mascotas', section: 'Reglas', value: (p) => allowed(p.petsAllowed) },
  { label: 'Fumar', section: 'Reglas', value: (p) => allowed(p.smokingAllowed) },
  { label: 'Hora de llegada', section: 'Reglas', value: (p) => p.curfewTime || 'No informada' },
];
