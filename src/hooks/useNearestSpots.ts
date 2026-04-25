import { useMemo } from 'react';
import type { ParkingSpot, Coordinates } from '../types';
import { haversine } from '../lib/distance';

const MAX_RADIUS_M = 2000; // 2 km par défaut
const MAX_VISIBLE   = 200;

/**
 * Trie les spots par distance depuis userCoords,
 * filtre par rayon, et limite à MAX_VISIBLE.
 */
export function useNearestSpots(
  spots: ParkingSpot[],
  userCoords: Coordinates,
  radiusM = MAX_RADIUS_M
): ParkingSpot[] {
  return useMemo(() => {
    return spots
      .map((s) => ({ ...s, distance: haversine(userCoords, s.coordinates) }))
      .filter((s) => s.distance <= radiusM)
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
      .slice(0, MAX_VISIBLE);
  }, [spots, userCoords, radiusM]);
}
