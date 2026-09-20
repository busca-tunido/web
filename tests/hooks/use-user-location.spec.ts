import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { extractServerGeoLocation } from '@/lib/server-geo';
import type { CityInfo } from '@/lib/types';
import {
  SANTIAGO_COORDINATES,
  calculateDistance,
  findClosestCity,
  sortCitiesWithCurrentFirst,
  useUserLocation,
} from '@/lib/use-user-location';

const mockCities: CityInfo[] = [
  {
    id: 'city-1',
    name: 'Santiago',
    region: 'Región Metropolitana',
    latitude: -33.4489,
    longitude: -70.6693,
    pensionsCount: 45,
    averagePriceClp: 320000,
    imageUrl: 'https://br-gentle-butterfly-aevuizs0.storage.c-2.us-east-2.aws.neon.tech/uploads/cities/city-mock.webp',
    foreignStudentRate: 0.12,
  },
  {
    id: 'city-2',
    name: 'Valparaíso',
    region: 'Región de Valparaíso',
    latitude: -33.0472,
    longitude: -71.6127,
    pensionsCount: 20,
    averagePriceClp: 280000,
    imageUrl: 'https://br-gentle-butterfly-aevuizs0.storage.c-2.us-east-2.aws.neon.tech/uploads/cities/city-mock.webp',
    foreignStudentRate: 0.08,
  },
  {
    id: 'city-3',
    name: 'Concepción',
    region: 'Región del Biobío',
    latitude: -36.827,
    longitude: -73.0503,
    pensionsCount: 15,
    averagePriceClp: 250000,
    imageUrl: 'https://br-gentle-butterfly-aevuizs0.storage.c-2.us-east-2.aws.neon.tech/uploads/cities/city-mock.webp',
    foreignStudentRate: 0.05,
  },
];

describe('extractServerGeoLocation', () => {
  it('extracts geo info from Cloudflare headers', () => {
    const headers = new Headers();
    headers.set('cf-ipcity', 'Valpara%C3%ADso');
    headers.set('cf-iplatitude', '-33.0472');
    headers.set('cf-iplongitude', '-71.6127');
    headers.set('cf-ipcountry', 'CL');

    const result = extractServerGeoLocation(headers);
    expect(result.city).toBe('Valparaíso');
    expect(result.latitude).toBe(-33.0472);
    expect(result.longitude).toBe(-71.6127);
    expect(result.country).toBe('CL');
  });

  it('extracts geo info from AWS CloudFront headers when present', () => {
    const headers = new Headers();
    headers.set('cloudfront-viewer-city', 'Concepcion');
    headers.set('cloudfront-viewer-latitude', '-36.8270');
    headers.set('cloudfront-viewer-longitude', '-73.0503');
    headers.set('cloudfront-viewer-country-name', 'Chile');

    const result = extractServerGeoLocation(headers);
    expect(result.city).toBe('Concepcion');
    expect(result.latitude).toBe(-36.827);
    expect(result.longitude).toBe(-73.0503);
    expect(result.country).toBe('Chile');
  });

  it('extracts geo info from Vercel headers when present', () => {
    const headers = new Headers();
    headers.set('x-vercel-ip-city', 'Santiago');
    headers.set('x-vercel-ip-latitude', '-33.4489');
    headers.set('x-vercel-ip-longitude', '-70.6693');
    headers.set('x-vercel-ip-country', 'CL');

    const result = extractServerGeoLocation(headers);
    expect(result.city).toBe('Santiago');
    expect(result.latitude).toBe(-33.4489);
    expect(result.longitude).toBe(-70.6693);
    expect(result.country).toBe('CL');
  });

  it('returns nulls safely when no headers are present', () => {
    const headers = new Headers();
    const result = extractServerGeoLocation(headers);
    expect(result.city).toBeNull();
    expect(result.latitude).toBeNull();
    expect(result.longitude).toBeNull();
    expect(result.country).toBeNull();
  });
});

describe('useUserLocation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses server geo fallback coordinates when native geolocation fails or is denied', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((_success, error) => {
        error(new Error('User denied Geolocation'));
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const serverGeo = {
      city: 'Valparaíso',
      latitude: -33.0472,
      longitude: -71.6127,
      country: 'CL',
    };

    const { result } = renderHook(() => useUserLocation(mockCities, serverGeo));

    expect(result.current.userLocation.latitude).toBe(-33.0472);
    expect(result.current.userLocation.longitude).toBe(-71.6127);
    expect(result.current.currentCity?.name).toBe('Valparaíso');
    expect(result.current.isDetecting).toBe(false);
  });

  it('defaults to Santiago coordinates if no server geo and geolocation fails', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((_success, error) => {
        error(new Error('Permission denied'));
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const { result } = renderHook(() => useUserLocation(mockCities, null));

    expect(result.current.userLocation).toEqual(SANTIAGO_COORDINATES);
    expect(result.current.currentCity?.name).toBe('Santiago');
    expect(result.current.isDetecting).toBe(false);
  });

  it('updates location and closest city when navigator.geolocation succeeds', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: -36.82,
            longitude: -73.05,
          },
        });
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const { result } = renderHook(() => useUserLocation(mockCities, null));

    expect(result.current.userLocation.latitude).toBe(-36.82);
    expect(result.current.userLocation.longitude).toBe(-73.05);
    expect(result.current.currentCity?.name).toBe('Concepción');
    expect(result.current.isDetecting).toBe(false);
  });

  it('prioritizes GPS coordinates over server geo header city when geolocation succeeds', () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: -36.82,
            longitude: -73.05,
          },
        });
      }),
    };
    vi.stubGlobal('navigator', { geolocation: mockGeolocation });

    const serverGeo = {
      city: 'Santiago',
      latitude: -33.4489,
      longitude: -70.6693,
      country: 'CL',
    };

    const { result } = renderHook(() => useUserLocation(mockCities, serverGeo));

    expect(result.current.userLocation.latitude).toBe(-36.82);
    expect(result.current.userLocation.longitude).toBe(-73.05);
    expect(result.current.currentCity?.name).toBe('Concepción');
    expect(result.current.isDetecting).toBe(false);
  });
});

describe('calculateDistance & findClosestCity & sortCitiesWithCurrentFirst', () => {
  it('calculates distance between Santiago and Valparaíso (~100km)', () => {
    const d = calculateDistance(-33.4489, -70.6693, -33.0472, -71.6127);
    expect(Math.round(d)).toBeGreaterThanOrEqual(95);
    expect(Math.round(d)).toBeLessThanOrEqual(110);
  });

  it('finds closest city accurately', () => {
    const nearConcepcion = { latitude: -36.8, longitude: -73.0 };
    const closest = findClosestCity(mockCities, nearConcepcion);
    expect(closest?.name).toBe('Concepción');
  });

  it('sorts cities placing current city first', () => {
    const sorted = sortCitiesWithCurrentFirst(mockCities, mockCities[1]);
    expect(sorted[0].name).toBe('Valparaíso');
    expect(sorted[0].isCurrentCity).toBe(true);
  });
});
