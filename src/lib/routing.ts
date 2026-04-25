import type { Coordinates } from '../types';

export type NavApp = 'apple' | 'google' | 'waze';

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>)['MSStream'];
}

/** Retourne l'URL de navigation selon l'app choisie et la plateforme. */
export function buildNavUrl(coords: Coordinates, app: NavApp): string {
  const { lat, lng } = coords;
  switch (app) {
    case 'apple':
      return `maps://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
    case 'google':
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    case 'waze':
      return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  }
}

/** Détecte l'app de navigation la plus pertinente selon la plateforme. */
export function detectDefaultNavApp(): NavApp {
  return isIOS() ? 'apple' : 'google';
}

export const NAV_APPS: { id: NavApp; label: string; emoji: string }[] = [
  { id: 'apple',  label: 'Plans Apple',  emoji: '🗺️' },
  { id: 'google', label: 'Google Maps',  emoji: '📍' },
  { id: 'waze',   label: 'Waze',         emoji: '🚗' },
];
