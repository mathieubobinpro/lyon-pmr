import { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from '../types';
import { LYON_CENTER } from '../api/grandlyon';

type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; coords: Coordinates }
  | { status: 'error'; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', message: 'Géolocalisation non supportée' });
      return;
    }
    setState({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ status: 'success', coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      (err) => {
        const msg =
          err.code === GeolocationPositionError.PERMISSION_DENIED
            ? 'Permission refusée — utilisation du centre de Lyon'
            : 'Position indisponible';
        setState({ status: 'error', message: msg });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => { request(); }, [request]);

  const coords: Coordinates =
    state.status === 'success' ? state.coords : LYON_CENTER;

  return { state, coords, retry: request };
}
