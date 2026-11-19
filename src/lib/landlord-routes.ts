export type LandlordTab = 'pension' | 'rooms' | 'reviews' | 'proposals' | 'pensions' | 'account';

export function getLandlordTabFromPathname(pathname: string): LandlordTab | null {
  const segment = pathname
    .split('?')[0]
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
  if (segment === 'landlord' || segment === 'landlord/pension') return 'pension';
  if (segment === 'landlord/rooms') return 'rooms';
  if (segment === 'landlord/reviews') return 'reviews';
  if (segment === 'landlord/proposals') return 'proposals';
  if (segment === 'landlord/properties' || segment === 'landlord/pensions') return 'pensions';
  if (segment === 'landlord/account') return 'account';
  return null;
}

export function getPathnameForLandlordTab(tab: LandlordTab): string {
  if (tab === 'pension') return '/landlord';
  if (tab === 'pensions') return '/landlord/properties';
  return `/landlord/${tab}`;
}

export const LANDLORD_TAB_TITLES: Record<LandlordTab, string> = {
  pension: 'Panel de Propietario | BuscaTuNido',
  rooms: 'Gestión de Habitaciones | BuscaTuNido',
  reviews: 'Reseñas de Estudiantes | BuscaTuNido',
  proposals: 'Sugerencias de la Comunidad | BuscaTuNido',
  pensions: 'Mis Pensiones | BuscaTuNido',
  account: 'Mi Cuenta de Propietario | BuscaTuNido',
};
