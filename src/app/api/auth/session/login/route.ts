import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { env } from '@/env';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const targetUrl = `${env.API_INTERNAL_URL.replace(/\/+$/, '')}/auth/login`;

    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor || realIp || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (clientIp) {
      headers['x-forwarded-for'] = clientIp;
    }

    const apiRes = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const rawData = (await apiRes.json().catch(() => ({}))) as Record<string, unknown>;

    if (!apiRes.ok) {
      return NextResponse.json(rawData, { status: apiRes.status });
    }

    const payload = (
      rawData && typeof rawData === 'object' && 'data' in rawData && rawData.data
        ? rawData.data
        : rawData
    ) as {
      token?: string;
      accessToken?: string;
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: 'STUDENT' | 'LANDLORD' | 'ADMIN' | 'MODERATOR';
      };
    };

    const token = payload.accessToken || payload.token || '';
    const user = payload.user;
    const cookieStore = await cookies();

    if (token) {
      cookieStore.set('tunido_token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    if (user?.role) {
      cookieStore.set('tunido_role', user.role.toUpperCase(), {
        httpOnly: false,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.json({
      success: true,
      statusCode: 200,
      data: {
        token,
        accessToken: token,
        user,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error interno al procesar inicio de sesión';
    return NextResponse.json({ success: false, statusCode: 500, message }, { status: 500 });
  }
}
