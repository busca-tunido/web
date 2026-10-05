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

    const rawData = (await apiRes.json().catch(() => ({}))) as Record<string, unknown>;

    if (!apiRes.ok) {
      if (apiRes.status === 401) {
        cookieStore.set('tunido_token', '', { path: '/', maxAge: 0 });
        cookieStore.set('tunido_role', '', { path: '/', maxAge: 0 });
      }
      return NextResponse.json(rawData, { status: apiRes.status });
    }

    const userPayload = (
      rawData && typeof rawData === 'object' && 'data' in rawData && rawData.data
        ? rawData.data
        : rawData
    ) as Record<string, unknown>;

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: {
        ...userPayload,
        token,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno al obtener perfil';
    return NextResponse.json({ success: false, statusCode: 500, message }, { status: 500 });
  }
}
