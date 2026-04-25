import { get, set } from 'idb-keyval';
import type { ParkingSpot } from '../types';

const KEY_SPOTS    = 'lyon-pmr:spots';
const KEY_SAVED_AT = 'lyon-pmr:spots-saved-at';

export async function cacheSpots(spots: ParkingSpot[]): Promise<void> {
  await set(KEY_SPOTS, spots);
  await set(KEY_SAVED_AT, Date.now());
}

export async function getCachedSpots(): Promise<{ spots: ParkingSpot[]; savedAt: number | null }> {
  const spots   = (await get<ParkingSpot[]>(KEY_SPOTS))   ?? [];
  const savedAt = (await get<number>(KEY_SAVED_AT))       ?? null;
  return { spots, savedAt };
}
