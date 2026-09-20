'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ServerGeoLocation } from './server-geo';
import type { CityInfo } from './types';

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

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
  const initialCoordinates = useMemo<UserCoordinates>(() => {
    if (
      typeof serverGeo?.latitude === 'number' &&
      !Number.isNaN(serverGeo.latitude) &&
      typeof serverGeo?.longitude === 'number' &&
      !Number.isNaN(serverGeo.longitude)
    ) {
      return { latitude: serverGeo.latitude, longitude: serverGeo.longitude };
    }
    return SANTIAGO_COORDINATES;
  }, [serverGeo]);

  const [userLocation, setUserLocation] = useState<UserCoordinates>(initialCoordinates);
  const [hasGpsCoordinates, setHasGpsCoordinates] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(true);

  const requestLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setHasGpsCoordinates(true);
        setIsDetecting(false);
      },
      () => {
        setIsDetecting(false);
      },
      {
        timeout: 5000,
        enableHighAccuracy: true,
        maximumAge: 300000,
      },
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const currentCity = useMemo(() => {
    if (cities.length === 0) return null;

    if (hasGpsCoordinates) {
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
  }, [cities, userLocation, serverGeo, hasGpsCoordinates]);

  return {
    userLocation,
    currentCity,
    isDetecting,
    requestLocation,
  };
}
