'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CityInfo } from './types';

export type UserCoordinates = {
  latitude: number;
  longitude: number;
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

export function useUserLocation(cities: CityInfo[]) {
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(true);
  const [currentCity, setCurrentCity] = useState<CityInfo | null>(null);

  const fetchPublicIpLocation = useCallback(async (): Promise<UserCoordinates | null> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
          return { latitude: data.latitude, longitude: data.longitude };
        }
      }
    } catch (_err) {}

    try {
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 4000);
      const res2 = await fetch('https://ipwho.is/', { signal: controller2.signal });
      clearTimeout(timeoutId2);
      if (res2.ok) {
        const data2 = await res2.json();
        if (typeof data2.latitude === 'number' && typeof data2.longitude === 'number') {
          return { latitude: data2.latitude, longitude: data2.longitude };
        }
      }
    } catch (_err) {}

    return null;
  }, []);

  const detectLocation = useCallback(async () => {
    setIsDetecting(true);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      const ipCoords = await fetchPublicIpLocation();
      if (ipCoords) {
        setUserLocation(ipCoords);
        const closest = findClosestCity(cities, ipCoords);
        setCurrentCity(closest);
      }
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setUserLocation(coords);
        const closest = findClosestCity(cities, coords);
        setCurrentCity(closest);
        setIsDetecting(false);
      },
      async (_err) => {
        const ipCoords = await fetchPublicIpLocation();
        if (ipCoords) {
          setUserLocation(ipCoords);
          const closest = findClosestCity(cities, ipCoords);
          setCurrentCity(closest);
        } else if (cities.length > 0) {
          const santiago = cities.find((c) => c.name.toLowerCase() === 'santiago') ?? cities[0];
          setUserLocation({ latitude: santiago.latitude, longitude: santiago.longitude });
          setCurrentCity(santiago);
        }
        setIsDetecting(false);
      },
      {
        timeout: 6000,
        enableHighAccuracy: true,
        maximumAge: 120000,
      },
    );
  }, [cities, fetchPublicIpLocation]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return {
    userLocation,
    currentCity,
    isDetecting,
    requestLocation: detectLocation,
  };
}
