import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

/**
 * Gère l'affichage de la modale de demande de géolocalisation.
 *
 * Deux chemins selon le support navigateur :
 *
 * A) navigator.permissions disponible (Chrome, Firefox, Edge…)
 *    - granted  → rien
 *    - prompt   → demande native déjà déclenchée par useGeolocation, rien à faire
 *    - denied   → modale custom (si non dismissée)
 *    - Surveille les changements en temps réel (ex : réactivation depuis les réglages)
 *
 * B) navigator.permissions absent (vieux Safari, WebView…)
 *    - useGeolocation a déjà appelé getCurrentPosition ; on observe son résultat
 *    - Si l'état est une erreur PERMISSION_DENIED → modale custom
 *    - Pas de second appel GPS redondant
 *
 * @param geoErrorMessage  Message d'erreur de useGeolocation (fallback path B)
 */
export function useGeolocationPermission(geoErrorMessage: string | null) {
  const [showPrompt, setShowPrompt] = useState(false);

  // ── Chemin A : API Permissions ──────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.permissions) return; // géré par le chemin B

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      const evaluate = (state: PermissionState) => {
        if (state === 'denied' && !storage.getGeolocDismissed()) {
          setShowPrompt(true);
        } else if (state === 'granted') {
          // L'utilisateur vient de réactiver → on efface le flag de dismiss
          storage.setGeolocDismissed(false);
          setShowPrompt(false);
        } else {
          // prompt ou accordé précédemment
          setShowPrompt(false);
        }
      };

      evaluate(result.state);
      result.addEventListener('change', () => evaluate(result.state));
    });
  }, []);

  // ── Chemin B : fallback sans API Permissions ────────────────────────────────
  // useGeolocation a déjà tenté getCurrentPosition ; si le message indique un
  // refus explicite (code PERMISSION_DENIED), on affiche la modale.
  useEffect(() => {
    if (navigator.permissions) return; // chemin A actif, ne pas interférer
    if (!geoErrorMessage)        return;
    if (storage.getGeolocDismissed()) return;

    // Le message de refus est posé par useGeolocation
    if (geoErrorMessage.includes('Permission refusée')) {
      setShowPrompt(true);
    }
  }, [geoErrorMessage]);

  const dismiss = () => {
    storage.setGeolocDismissed(true);
    setShowPrompt(false);
  };

  return { showPrompt, dismiss };
}
