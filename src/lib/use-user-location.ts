'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ServerGeoLocation } from './server-geo';
import type { CityInfo } from './types';

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

export type BrowserLocation = UserCoordinates & {
  accuracy: number;
  timestamp: number;
};

export type LocationStatus =
  | 'locating'
  | 'ready'
  | 'denied'
  | 'timeout'
  | 'unavailable'
  | 'unsupported';
export type LocationSource = 'browser' | 'ip' | 'default';

export const LOCATION_REQUEST_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 15_000,
};

function validCoordinates(latitude: unknown, longitude: unknown): boolean {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    Math.abs(latitude) <= 90 &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    Math.abs(longitude) <= 180
  );
}

export const SANTIAGO_COORDINATES: UserCoordinates = {
  latitude: -33.4489,
  longitude: -70.6693,
};

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findClosestCity(cities: CityInfo[], coords: UserCoordinates): CityInfo | null {
  if (!cities.length) return null;
  let closest = cities[0];
  let minDistance = calculateDistance(
    coords.latitude,
    coords.longitude,
    closest.latitude,
    closest.longitude,
  );

  for (let i = 1; i < cities.length; i++) {
    const d = calculateDistance(
      coords.latitude,
      coords.longitude,
      cities[i].latitude,
      cities[i].longitude,
    );
    if (d < minDistance) {
      minDistance = d;
      closest = cities[i];
    }
  }
  return closest;
}

export function sortCitiesWithCurrentFirst(
  cities: CityInfo[],
  closestCity: CityInfo | null,
): CityInfo[] {
  if (!closestCity) return cities;
  const updated = cities.map((c) => ({
    ...c,
    isCurrentCity: c.id === closestCity.id,
  }));
  const target = updated.find((c) => c.id === closestCity.id);
  const others = updated.filter((c) => c.id !== closestCity.id);
  return target ? [target, ...others] : updated;
}

export function useUserLocation(cities: CityInfo[], serverGeo?: ServerGeoLocation | null) {
  const hasServerCoordinates = validCoordinates(serverGeo?.latitude, serverGeo?.longitude);
  const initialCoordinates = useMemo<UserCoordinates>(() => {
    if (
      typeof serverGeo?.latitude === 'number' &&
      hasServerCoordinates &&
      typeof serverGeo?.longitude === 'number' &&
      Number.isFinite(serverGeo.longitude)
    ) {
      return { latitude: serverGeo.latitude, longitude: serverGeo.longitude };
    }
    return SANTIAGO_COORDINATES;
  }, [serverGeo, hasServerCoordinates]);

  const [browserLocation, setBrowserLocation] = useState<BrowserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('locating');
  const [locationError, setLocationError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const requestLocation = useCallback((): Promise<BrowserLocation | null> => {
    const requestId = ++requestIdRef.current;
    const isCurrent = (): boolean => mountedRef.current && requestIdRef.current === requestId;
    if (!mountedRef.current) return Promise.resolve(null);
    setLocationStatus('locating');
    setLocationError(null);

    return new Promise((resolve) => {
      const fail = (status: LocationStatus, message: string): void => {
        if (isCurrent()) {
          setBrowserLocation(null);
          setLocationStatus(status);
          setLocationError(message);
        }
        resolve(null);
      };
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        fail('unsupported', 'Este navegador no permite obtener tu ubicación.');
        return;
      }
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!isCurrent()) {
              resolve(null);
              return;
            }
            const { latitude, longitude, accuracy } = position.coords;
            if (
              !validCoordinates(latitude, longitude) ||
              !Number.isFinite(accuracy) ||
              accuracy < 0 ||
              !Number.isFinite(position.timestamp)
            ) {
              fail(
                'unavailable',
                'El dispositivo no entregó una ubicación válida. Inténtalo de nuevo.',
              );
              return;
            }
            const location: BrowserLocation = {
              latitude,
              longitude,
              accuracy,
              timestamp: position.timestamp,
            };
            setBrowserLocation(location);
            setLocationStatus('ready');
            setLocationError(null);
            resolve(location);
          },
          (error) => {
            if (error.code === 1)
              fail(
                'denied',
                'Permiso de ubicación denegado. Habilítalo en el navegador y vuelve a intentar.',
              );
            else if (error.code === 3)
              fail('timeout', 'No pudimos obtener tu ubicación a tiempo. Vuelve a intentar.');
            else
              fail(
                'unavailable',
                'Tu dispositivo no pudo determinar la ubicación. Vuelve a intentar.',
              );
          },
          LOCATION_REQUEST_OPTIONS,
        );
      } catch {
        fail(
          'unavailable',
          'No pudimos acceder a la ubicación del dispositivo. Vuelve a intentar.',
        );
      }
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void requestLocation();
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [requestLocation]);

  const userLocation = useMemo<UserCoordinates>(
    () =>
      browserLocation
        ? { latitude: browserLocation.latitude, longitude: browserLocation.longitude }
        : initialCoordinates,
    [browserLocation, initialCoordinates],
  );
  const locationSource: LocationSource = browserLocation
    ? 'browser'
    : hasServerCoordinates
      ? 'ip'
      : 'default';

  const currentCity = useMemo(() => {
    if (cities.length === 0) return null;

    if (browserLocation) {
      const closest = findClosestCity(cities, userLocation);
      if (closest) return closest;
    }

    if (serverGeo?.city) {
      const serverCityMatch = cities.find(
        (c) => c.name.toLowerCase() === serverGeo.city?.toLowerCase(),
      );
      if (serverCityMatch) {
        return serverCityMatch;
      }
    }

    if (userLocation) {
      const closest = findClosestCity(cities, userLocation);
      if (closest) return closest;
    }

    return cities.find((c) => c.name.toLowerCase() === 'santiago') ?? cities[0] ?? null;
  }, [cities, userLocation, serverGeo, browserLocation]);

  return {
    userLocation,
    currentCity,
    browserLocation,
    locationSource,
    locationStatus,
    locationError,
    isDetecting: locationStatus === 'locating',
    requestLocation,
  };
}
