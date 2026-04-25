import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock idb-keyval avant l'import du module testé
vi.mock('idb-keyval', () => {
  const store = new Map<string, unknown>();
  return {
    get:  vi.fn((key: string) => Promise.resolve(store.get(key))),
    set:  vi.fn((key: string, value: unknown) => { store.set(key, value); return Promise.resolve(); }),
    del:  vi.fn((key: string) => { store.delete(key); return Promise.resolve(); }),
    _store: store,
    _reset: () => store.clear(),
  };
});

import { cacheSpots, getCachedSpots, isCacheFresh, clearCache } from '../../src/lib/offlineCache';
import type { ParkingSpot } from '../../src/types';
import * as idbKeyval from 'idb-keyval';

const SPOT: ParkingSpot = {
  id: 'test-1', name: 'Bellecour_1',
  coordinates: { lat: 45.757, lng: 4.832 },
  address: 'Place Bellecour', postalCode: '69002', city: 'Lyon 2e',
  inseeCode: 69382, nbPlaces: 2, configuration: 'bataille', updatedAt: '',
};

beforeEach(() => {
  vi.clearAllMocks();
  (idbKeyval as unknown as { _reset: () => void })._reset();
});

describe('cacheSpots', () => {
  it('appelle set deux fois (spots + timestamp)', async () => {
    await cacheSpots([SPOT]);
    expect(idbKeyval.set).toHaveBeenCalledTimes(2);
  });

  it('persiste les spots', async () => {
    await cacheSpots([SPOT]);
    const { spots } = await getCachedSpots();
    expect(spots).toHaveLength(1);
    expect(spots[0].id).toBe('test-1');
  });
});

describe('getCachedSpots', () => {
  it('retourne isStale=true si aucune donnée en cache', async () => {
    const { spots, savedAt, isStale } = await getCachedSpots();
    expect(spots).toHaveLength(0);
    expect(savedAt).toBeNull();
    expect(isStale).toBe(true);
  });

  it('retourne isStale=false si données récentes (< 24h)', async () => {
    await cacheSpots([SPOT]);
    const { isStale } = await getCachedSpots();
    expect(isStale).toBe(false);
  });

  it('retourne isStale=true si données périmées (> 24h)', async () => {
    // Écrit directement dans le store interne pour éviter de remplacer l'implémentation du mock
    const store = (idbKeyval as unknown as { _store: Map<string, unknown> })._store;
    store.set('lyon-pmr:spots', [SPOT]);
    store.set('lyon-pmr:spots-saved-at', Date.now() - 25 * 60 * 60 * 1000);
    const { isStale } = await getCachedSpots();
    expect(isStale).toBe(true);
  });
});

describe('isCacheFresh', () => {
  it('retourne false si pas de timestamp', async () => {
    expect(await isCacheFresh()).toBe(false);
  });

  it('retourne true si timestamp récent', async () => {
    await cacheSpots([SPOT]);
    expect(await isCacheFresh()).toBe(true);
  });
});

describe('clearCache', () => {
  it('supprime les clés du store', async () => {
    await cacheSpots([SPOT]);
    await clearCache();
    expect(idbKeyval.del).toHaveBeenCalledTimes(2);
    const { spots } = await getCachedSpots();
    expect(spots).toHaveLength(0);
  });
});
