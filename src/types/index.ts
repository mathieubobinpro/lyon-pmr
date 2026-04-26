export interface Coordinates {
  lat: number;
  lng: number;
}

export type ParkingConfiguration = 'bataille' | 'longitudinal' | 'epi' | 'unknown';

export interface ParkingSpot {
  id: string;
  name: string;
  coordinates: Coordinates;
  address: string;
  postalCode: string;
  city: string;
  inseeCode: number;
  nbPlaces: number;
  configuration: ParkingConfiguration;
  length?: number;
  infoLocation?: string;
  updatedAt: string;
  // Distance calculée côté client (non persistée)
  distance?: number;
}

// Conservé pour la compatibilité de storage.ts / useFavorites.ts (non exposé dans l'UI)
export interface Favorite {
  id: string;
  label: string;
  spotId: string;
  emoji: string;
  createdAt: number;
}

export interface GeocodingResult {
  label: string;
  name: string;
  city: string;
  coordinates: Coordinates;
}

export type FontSize = 'normal' | 'grand' | 'tres-grand';

export type ActiveTab = 'map' | 'list' | 'settings';
