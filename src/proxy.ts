import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest): NextResponse {
  const token = request.cookies.get('tunido_token')?.value;
  const role = request.cookies.get('tunido_role')?.value;
  const pathname = request.nextUrl.pathname;
  const requiresAuth = pathname.startsWith('/landlord') || pathname.startsWith('/account');

  if (requiresAuth && !token) {
    const url = new URL('/', request.url);
    url.searchParams.set('auth', 'login');
    return NextResponse.redirect(url);
  }

  const normalizedRole = role?.toUpperCase();
  if (
    pathname.startsWith('/landlord') &&
    normalizedRole !== 'LANDLORD' &&
    normalizedRole !== 'ADMIN'
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-search', request.nextUrl.search);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const middleware = proxy;

export const config = {
  matcher: ['/landlord/:path*', '/account/:path*', '/explore', '/map', '/favorites', '/history'],
};
