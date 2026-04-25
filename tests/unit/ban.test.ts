import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchAddress } from '../../src/api/ban';

describe('searchAddress', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('retourne [] si la query fait moins de 3 caractères', async () => {
    const results = await searchAddress('ab');
    expect(results).toEqual([]);
  });

  it('parse correctement une réponse BAN', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: { label: 'Place Bellecour, Lyon', name: 'Place Bellecour', city: 'Lyon' },
            geometry: { coordinates: [4.832, 45.757] },
          },
        ],
      }),
    });

    const results = await searchAddress('Bellecour');
    expect(results).toHaveLength(1);
    expect(results[0].label).toBe('Place Bellecour, Lyon');
    expect(results[0].city).toBe('Lyon');
    expect(results[0].coordinates.lat).toBeCloseTo(45.757, 2);
    expect(results[0].coordinates.lng).toBeCloseTo(4.832, 2);
  });

  it('retourne [] si la réponse HTTP est en erreur', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const results = await searchAddress('République');
    expect(results).toEqual([]);
  });

  it('retourne [] si le réseau échoue', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'));
    const results = await searchAddress('République');
    expect(results).toEqual([]);
  });

  it('retourne [] si features est absent', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    const results = await searchAddress('République');
    expect(results).toEqual([]);
  });
});
