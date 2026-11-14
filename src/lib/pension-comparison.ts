import type { PensionItem } from '@/lib/types';

export type ComparisonSection = 'Precio y ubicación' | 'Servicios' | 'Reglas';
export type ComparisonRow = {
  label: string;
  section: ComparisonSection;
  value: (pension: PensionItem) => string;
};

export const COMPARISON_SECTIONS: readonly ComparisonSection[] = [
  'Precio y ubicación',
  'Servicios',
  'Reglas',
];

const money = (value: number, currency: string): string =>
  `${value.toLocaleString('es-CL')} ${currency}`;
const included = (value: boolean): string => (value ? 'Incluido' : 'No incluido');
const allowed = (value: boolean): string => (value ? 'Permitido' : 'No permitido');

export const COMPARISON_ROWS: readonly ComparisonRow[] = [
  { label: 'Precio mensual desde', section: 'Precio y ubicación', value: (p) => money(p.baseMonthlyPrice, p.currency) },
  { label: 'Garantía', section: 'Precio y ubicación', value: (p) => p.deposit == null ? 'No informada' : money(p.deposit, p.currency) },
  { label: 'Ubicación', section: 'Precio y ubicación', value: (p) => `${p.neighborhood}, ${p.city}` },
  { label: 'Dirección', section: 'Precio y ubicación', value: (p) => p.address },
  { label: 'Evaluación', section: 'Precio y ubicación', value: (p) => p.ratingCount > 0 ? `${p.ratingAverage.toFixed(1)} / 5 · ${p.ratingCount} reseñas` : 'Sin reseñas' },
  { label: 'Agua', section: 'Servicios', value: (p) => included(p.waterIncluded) },
  { label: 'Electricidad', section: 'Servicios', value: (p) => included(p.electricityIncluded) },
  { label: 'Gas', section: 'Servicios', value: (p) => included(p.gasIncluded) },
  { label: 'Internet', section: 'Servicios', value: (p) => included(p.internetIncluded) },
  { label: 'Comodidades', section: 'Servicios', value: (p) => p.amenities.map((item) => item.name).sort().join(', ') || 'Sin comodidades informadas' },
  { label: 'Visitas', section: 'Reglas', value: (p) => allowed(p.guestsAllowed) },
  { label: 'Mascotas', section: 'Reglas', value: (p) => allowed(p.petsAllowed) },
  { label: 'Fumar', section: 'Reglas', value: (p) => allowed(p.smokingAllowed) },
  { label: 'Hora de llegada', section: 'Reglas', value: (p) => p.curfewTime || 'No informada' },
];
