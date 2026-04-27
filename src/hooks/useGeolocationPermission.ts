import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

export type PermissionState = 'unknown' | 'granted' | 'prompt' | 'denied';

/**
 * Interroge l'API Permissions pour connaître l'état de la géolocalisation.
 *
 * - granted  → comportement normal, pas de popin
 * - prompt   → déclenche la demande native (déjà gérée par useGeolocation)
 * - denied   → affiche la popin custom (si non déjà dismissée)
 * - unknown  → API Permissions non supportée, on laisse passer
 */
export function useGeolocationPermission() {
  const [permState, setPermState] = useState<PermissionState>('unknown');
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!navigator.permissions) return; // navigateur trop ancien → pas de popin

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      const update = (state: PermissionState) => {
        setPermState(state);
        if (state === 'denied') {
          // N'afficher que si l'utilisateur n'a pas déjà choisi "continuer sans"
          if (!storage.getGeolocDismissed()) setShowPrompt(true);
        } else {
          // granted ou prompt : on cache la popin et on réinitialise le dismiss
          setShowPrompt(false);
          if (state === 'granted') storage.setGeolocDismissed(false);
        }
      };

      update(result.state as PermissionState);

      // Surveiller les changements en temps réel (ex : l'utilisateur réactive depuis les réglages)
      result.addEventListener('change', () => update(result.state as PermissionState));
    });
  }, []);

  const dismiss = () => {
    storage.setGeolocDismissed(true);
    setShowPrompt(false);
  };

  return { permState, showPrompt, dismiss };
}
