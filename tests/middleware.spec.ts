import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from '@/proxy';

describe('Edge Proxy', () => {
  it('redirects to /?auth=login when no tunido_token is present on /landlord paths', () => {
    const req = new NextRequest('http://localhost:3000/landlord/properties');
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/?auth=login');
  });

  it('redirects to /?auth=login when no tunido_token is present on /account paths', () => {
    const req = new NextRequest('http://localhost:3000/account');
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/?auth=login');
  });

  it('allows guest users on public portal routes and forwards x-pathname and x-search', () => {
    const req = new NextRequest('http://localhost:3000/explore?city=Valparaiso');
    const res = proxy(req);

    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-request-x-pathname')).toBe('/explore');
    expect(res.headers.get('x-middleware-request-x-search')).toBe('?city=Valparaiso');
  });

  it('redirects non-landlord users trying to access /landlord paths', () => {
    const req = new NextRequest('http://localhost:3000/landlord/properties');
    req.cookies.set('tunido_token', 'valid-token');
    req.cookies.set('tunido_role', 'STUDENT');
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('allows landlord users to access /landlord paths and forwards x-pathname', () => {
    const req = new NextRequest('http://localhost:3000/landlord/properties');
    req.cookies.set('tunido_token', 'valid-token');
    req.cookies.set('tunido_role', 'LANDLORD');
    const res = proxy(req);

    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-request-x-pathname')).toBe('/landlord/properties');
  });

  it('allows authenticated users to access /account paths', () => {
    const req = new NextRequest('http://localhost:3000/account/profile');
    req.cookies.set('tunido_token', 'valid-token');
    req.cookies.set('tunido_role', 'STUDENT');
    const res = proxy(req);

    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-request-x-pathname')).toBe('/account/profile');
  });
});
