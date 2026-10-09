import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('tunido_token');
    cookieStore.delete('tunido_role');
  } catch {}

  const response = NextResponse.json({
    success: true,
    statusCode: 200,
    message: 'Sesión finalizada exitosamente',
  });

  response.cookies.delete('tunido_token');
  response.cookies.delete('tunido_role');
  response.cookies.set('tunido_token', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  response.cookies.set('tunido_role', '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
