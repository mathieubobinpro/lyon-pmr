import type { Coordinates } from '../types';

const R = 6371000; // rayon Terre en mètres

/** Distance Haversine en mètres entre deux points GPS. */
export function haversine(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters / 10) * 10} m`;
}

/** Conservé pour PlaceCard (vue Liste). */
export function formatWalkTime(meters: number): string {
  const minutes = Math.round(meters / 80); // ~80m/min = 4.8 km/h
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

/**
 * Formate la distance pour la fiche détail d'une place PMR.
 * Règles :
 *   < 10 m       → "À proximité immédiate"
 *   < 1 000 m    → "350 m"  (arrondi à la dizaine)
 *   ≥ 1 000 m    → "1,2 km" (1 décimale, virgule française)
 *   null         → "Distance inconnue" (pas de géoloc)
 */
export function formatSpotDistance(meters: number | null): string {
  if (meters === null)  return 'Distance inconnue';
  if (meters < 10)      return 'À proximité immédiate';
  if (meters < 1000)    return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}
