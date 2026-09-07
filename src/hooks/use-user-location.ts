'use client';

import { useCallback, useEffect, useState } from 'react';

export type UserCoordinates = {
  latitude: number;
  longitude: number;
};

const SANTIAGO_COORDINATES: UserCoordinates = {
  latitude: -33.4489,
  longitude: -70.6693,
};

export function useUserLocation() {
  const [location, setLocation] = useState<UserCoordinates | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    setIsResolving(true);
    setError(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocation(SANTIAGO_COORDINATES);
      setIsResolving(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsResolving(false);
      },
      (err) => {
        setError(err.message);
        setLocation(SANTIAGO_COORDINATES);
        setIsResolving(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 300000,
      },
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return {
    location: location ?? SANTIAGO_COORDINATES,
    rawLocation: location,
    isResolving,
    error,
    requestLocation,
  };
}
