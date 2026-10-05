import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tunido_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, statusCode: 401, message: 'No autenticado' },
        { status: 401 },
      );
    }

    const targetUrl = `${env.API_INTERNAL_URL.replace(/\/+$/, '')}/auth/me`;
    const apiRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno al obtener perfil';
    return NextResponse.json({ success: false, statusCode: 500, message }, { status: 500 });
  }
}
