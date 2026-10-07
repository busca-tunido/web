import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.set('tunido_token', '', {
    path: '/',
    maxAge: 0,
  });
  cookieStore.set('tunido_role', '', {
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({
    success: true,
    statusCode: 200,
    message: 'Sesión finalizada exitosamente',
  });
}
