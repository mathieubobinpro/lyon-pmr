import { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from '../types';
import { LYON_CENTER } from '../api/grandlyon';

type GeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; coords: Coordinates }
  | { status: 'error'; message: string };

export function useGeolocation() {
  const [state, setState]           = useState<GeolocationState>({ status: 'idle' });
  // Dernières coords GPS valides — conservées pendant le rechargement pour éviter
  // que flyTo parte vers LYON_CENTER quand retryGeoloc() est appelé
  const [lastCoords, setLastCoords] = useState<Coordinates | null>(null);

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: 'error', message: 'Géolocalisation non supportée' });
      return;
    }
    setState({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coordinates = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLastCoords(coords);
        setState({ status: 'success', coords });
      },
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { request(); }, []);

  // Pendant le loading, on garde les dernières coords connues (pas LYON_CENTER)
  const coords: Coordinates =
    state.status === 'success' ? state.coords : (lastCoords ?? LYON_CENTER);

  return { state, coords, retry: request };
}
