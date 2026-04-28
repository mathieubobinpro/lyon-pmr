import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';

/**
 * Gère l'affichage de la modale de demande de géolocalisation.
 *
 * Deux chemins complémentaires (pas exclusifs) :
 *
 * A) navigator.permissions.query()
 *    → détecte l'état "déjà refusé" au chargement de la page
 *    → try/catch car certains iOS rejettent la query 'geolocation'
 *    → sur iOS, PermissionStatus.change ne fire PAS après un refus natif
 *      en cours de session, d'où la nécessité de Chemin B en complément
 *
 * B) geoErrorMessage de useGeolocation (filet de sécurité universel)
 *    → s'active dès que getCurrentPosition retourne PERMISSION_DENIED
 *    → couvre : refus natif en cours de session, iOS sans onchange,
 *      navigateurs où query() est buggy ou absent
 *    → pas de guard "si permissions existe" : les deux chemins coexistent
 *
 * @param geoErrorMessage  Message d'erreur exposé par useGeolocation
 */
export function useGeolocationPermission(geoErrorMessage: string | null) {
  const [showPrompt, setShowPrompt]    = useState(false);
  const [isLocationDenied, setDenied] = useState(false);

  // ── Chemin A : détection à l'initialisation via l'API Permissions ──────────
  useEffect(() => {
    if (!navigator.permissions) return;

    (async () => {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });

        const evaluate = (state: PermissionState) => {
          if (state === 'denied') {
            setDenied(true);
            if (!storage.getGeolocDismissed()) setShowPrompt(true);
          } else if (state === 'granted') {
            // L'utilisateur vient de réactiver → efface le denied posé par Chemin B
            setDenied(false);
            storage.setGeolocDismissed(false);
            setShowPrompt(false);
          }
          // 'prompt' : on ne touche rien — Chemin B est seul arbitre sur iOS
        };

        evaluate(result.state);
        // onchange ne fire pas sur iOS — Chemin B prend le relais pour ce cas
        result.addEventListener('change', () => evaluate(result.state));
      } catch {
        // permissions.query('geolocation') non supportée sur ce navigateur
        // → Chemin B gère tout
      }
    })();
  }, []);

  // ── Chemin B : filet de sécurité universel basé sur l'erreur GPS ───────────
  // S'exécute toujours (pas de guard navigator.permissions).
  // Couvre le refus natif en cours de session sur iOS où onchange ne fire pas.
  useEffect(() => {
    if (!geoErrorMessage) return;
    if (storage.getGeolocDismissed()) return;

    if (geoErrorMessage.includes('Permission refusée')) {
      setDenied(true);
      setShowPrompt(true);
    }
  }, [geoErrorMessage]);

  const dismiss = () => {
    storage.setGeolocDismissed(true);
    setShowPrompt(false);
  };

  const show = () => setShowPrompt(true);

  return { showPrompt, show, dismiss, isLocationDenied };
}
