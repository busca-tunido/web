import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function redirectIfLandlordCookie(target = '/landlord'): Promise<void> {
  const cookieStore = await cookies();
  const role = cookieStore.get('tunido_role')?.value;
  if (role?.toUpperCase() === 'LANDLORD') {
    redirect(target);
  }
}

export async function hasLandlordServerCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const role = cookieStore.get('tunido_role')?.value;
  const normalizedRole = role?.toUpperCase();
  return normalizedRole === 'LANDLORD' || normalizedRole === 'ADMIN';
}
