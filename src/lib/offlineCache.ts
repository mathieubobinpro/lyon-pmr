import { get, set, del } from 'idb-keyval';
import type { ParkingSpot } from '../types';

const KEY_SPOTS    = 'lyon-pmr:spots';
const KEY_SAVED_AT = 'lyon-pmr:spots-saved-at';

const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

export async function cacheSpots(spots: ParkingSpot[]): Promise<void> {
  await set(KEY_SPOTS, spots);
  await set(KEY_SAVED_AT, Date.now());
}

export async function getCachedSpots(): Promise<{
  spots: ParkingSpot[];
  savedAt: number | null;
  isStale: boolean;
}> {
  const spots   = (await get<ParkingSpot[]>(KEY_SPOTS)) ?? [];
  const savedAt = (await get<number>(KEY_SAVED_AT))     ?? null;
  const isStale = savedAt === null || Date.now() - savedAt > MAX_AGE_MS;
  return { spots, savedAt, isStale };
}

/** Retourne true si le cache est frais (< 24h). */
export async function isCacheFresh(): Promise<boolean> {
  const savedAt = await get<number>(KEY_SAVED_AT);
  if (!savedAt) return false;
  return Date.now() - savedAt < MAX_AGE_MS;
}

export async function clearCache(): Promise<void> {
  await del(KEY_SPOTS);
  await del(KEY_SAVED_AT);
}
