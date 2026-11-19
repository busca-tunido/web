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
export type LocationSource = 'browser' | 'saved' | 'ip' | 'default';

export const LAST_KNOWN_LOCATION_STORAGE_KEY = 'tunido_last_location';
export const PREFERRED_CITY_STORAGE_KEY = 'tunido_last_city';
const SAVED_LOCATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type SavedLocationEntry = UserCoordinates & {
  cityName?: string;
  savedAt: number;
};

function parseSavedEntry(raw: string | null): SavedLocationEntry | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SavedLocationEntry>;
    if (
      !validCoordinates(parsed.latitude, parsed.longitude) ||
      typeof parsed.savedAt !== 'number' ||
      !Number.isFinite(parsed.savedAt)
    ) {
      return null;
    }
    if (Date.now() - parsed.savedAt > SAVED_LOCATION_TTL_MS) {
      return null;
    }
    return {
      latitude: parsed.latitude as number,
      longitude: parsed.longitude as number,
      cityName: typeof parsed.cityName === 'string' ? parsed.cityName : undefined,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

function readSavedLocationPreference(): SavedLocationEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const lastBrowser = parseSavedEntry(
      window.localStorage.getItem(LAST_KNOWN_LOCATION_STORAGE_KEY),
    );
    const preferredCity = parseSavedEntry(window.localStorage.getItem(PREFERRED_CITY_STORAGE_KEY));
    if (preferredCity && lastBrowser) {
      return preferredCity.savedAt >= lastBrowser.savedAt ? preferredCity : lastBrowser;
    }
    return preferredCity ?? lastBrowser;
  } catch {
    return null;
  }
}

function writeSavedEntry(key: string, entry: SavedLocationEntry): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {}
}

export const LOCATION_REQUEST_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 15_000,
};

export const LOCATION_FALLBACK_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 300_000,
  timeout: 10_000,
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
  const serverCityCoordinates = useMemo<UserCoordinates | null>(() => {
    if (
      typeof serverGeo?.latitude === 'number' &&
      hasServerCoordinates &&
      typeof serverGeo?.longitude === 'number' &&
      Number.isFinite(serverGeo.longitude)
    ) {
      return { latitude: serverGeo.latitude, longitude: serverGeo.longitude };
    }
    if (serverGeo?.city && cities.length > 0) {
      const matched = cities.find((c) => c.name.toLowerCase() === serverGeo.city?.toLowerCase());
      if (matched && validCoordinates(matched.latitude, matched.longitude)) {
        return { latitude: matched.latitude, longitude: matched.longitude };
      }
    }
    return null;
  }, [serverGeo, hasServerCoordinates, cities]);

  const [browserLocation, setBrowserLocation] = useState<BrowserLocation | null>(null);
  const [savedLocation, setSavedLocation] = useState<SavedLocationEntry | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('locating');
  const [locationError, setLocationError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const rememberPreferredCity = useCallback(
    (target: string | CityInfo | null | undefined): void => {
      if (!target) return;
      const cityObj =
        typeof target === 'string'
          ? cities.find((c) => c.name.toLowerCase() === target.trim().toLowerCase())
          : target;
      if (!cityObj || !validCoordinates(cityObj.latitude, cityObj.longitude)) {
        return;
      }
      const entry: SavedLocationEntry = {
        latitude: cityObj.latitude,
        longitude: cityObj.longitude,
        cityName: cityObj.name,
        savedAt: Date.now(),
      };
      writeSavedEntry(PREFERRED_CITY_STORAGE_KEY, entry);
      setSavedLocation(entry);
    },
    [cities],
  );

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
      const attemptRequest = (options: PositionOptions, allowFallback: boolean): void => {
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
              const savedEntry: SavedLocationEntry = {
                latitude,
                longitude,
                savedAt: Date.now(),
              };
              writeSavedEntry(LAST_KNOWN_LOCATION_STORAGE_KEY, savedEntry);
              setSavedLocation(savedEntry);
              setBrowserLocation(location);
              setLocationStatus('ready');
              setLocationError(null);
              resolve(location);
            },
            (error) => {
              if (!isCurrent()) {
                resolve(null);
                return;
              }
              if (error.code === 1) {
                fail(
                  'denied',
                  'Permiso de ubicación denegado. Habilítalo en el navegador y en tu sistema.',
                );
                return;
              }
              if (allowFallback) {
                attemptRequest(LOCATION_FALLBACK_OPTIONS, false);
                return;
              }
              if (error.code === 3) {
                fail('timeout', 'No pudimos obtener tu ubicación a tiempo. Vuelve a intentar.');
                return;
              }
              fail(
                'unavailable',
                'No se pudo determinar la ubicación. Verifica los servicios de ubicación de tu dispositivo.',
              );
            },
            options,
          );
        } catch {
          if (allowFallback) {
            attemptRequest(LOCATION_FALLBACK_OPTIONS, false);
            return;
          }
          fail(
            'unavailable',
            'No se pudo determinar la ubicación. Verifica los servicios de ubicación de tu dispositivo.',
          );
        }
      };

      attemptRequest(LOCATION_REQUEST_OPTIONS, true);
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const restored = readSavedLocationPreference();
    if (restored) {
      setSavedLocation(restored);
    }
    void requestLocation();
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [requestLocation]);

  const isBrowserSettled = locationStatus !== 'locating';
  const shouldUseVercelFallback =
    !browserLocation && !savedLocation && isBrowserSettled && Boolean(serverCityCoordinates);

  const userLocation = useMemo<UserCoordinates>(() => {
    if (browserLocation) {
      return { latitude: browserLocation.latitude, longitude: browserLocation.longitude };
    }
    if (savedLocation) {
      return { latitude: savedLocation.latitude, longitude: savedLocation.longitude };
    }
    if (shouldUseVercelFallback && serverCityCoordinates) {
      return serverCityCoordinates;
    }
    return SANTIAGO_COORDINATES;
  }, [browserLocation, savedLocation, shouldUseVercelFallback, serverCityCoordinates]);

  const locationSource: LocationSource = browserLocation
    ? 'browser'
    : savedLocation
      ? 'saved'
      : shouldUseVercelFallback
        ? 'ip'
        : 'default';

  const currentCity = useMemo(() => {
    if (cities.length === 0) return null;

    if (browserLocation) {
      const closest = findClosestCity(cities, userLocation);
      if (closest) return closest;
    }

    if (savedLocation) {
      if (savedLocation.cityName) {
        const savedCityMatch = cities.find(
          (c) => c.name.toLowerCase() === savedLocation.cityName?.toLowerCase(),
        );
        if (savedCityMatch) {
          return savedCityMatch;
        }
      }
      const closestSaved = findClosestCity(cities, savedLocation);
      if (closestSaved) return closestSaved;
    }

    if (shouldUseVercelFallback) {
      if (serverGeo?.city) {
        const serverCityMatch = cities.find(
          (c) => c.name.toLowerCase() === serverGeo.city?.toLowerCase(),
        );
        if (serverCityMatch) {
          return serverCityMatch;
        }
      }
      const closestServer = findClosestCity(cities, userLocation);
      if (closestServer) return closestServer;
    }

    return cities.find((c) => c.name.toLowerCase() === 'santiago') ?? cities[0] ?? null;
  }, [cities, userLocation, serverGeo, browserLocation, savedLocation, shouldUseVercelFallback]);

  return {
    userLocation,
    currentCity,
    browserLocation,
    locationSource,
    locationStatus,
    locationError,
    isDetecting: locationStatus === 'locating',
    requestLocation,
    rememberPreferredCity,
  };
}
