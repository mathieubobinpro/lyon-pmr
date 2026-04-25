import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchParkingSpots, MOCK_SPOTS } from '../../src/api/grandlyon';

describe('fetchParkingSpots', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('parse correctement un GeoJSON valide', async () => {
    const feature = {
      geometry: { type: 'Point', coordinates: [4.8994, 45.8170] },
      properties: {
        uid: 'PMR-69286-1216', nom: 'Ravel_33_4', adresse: 'Ravel',
        codepost: 69140, commune: 'Rillieux la Pape', code_insee: 69286,
        nb_places: 2, configuration: 'bataille', longueur_m: null,
        infoloc: null, last_update_fme: '2025-09-17T14:34:31Z', gid: 3801,
      },
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [feature] }),
    });

    const spots = await fetchParkingSpots();
    expect(spots).toHaveLength(1);
    expect(spots[0].id).toBe('PMR-69286-1216');
    expect(spots[0].coordinates.lat).toBeCloseTo(45.817, 2);
    expect(spots[0].coordinates.lng).toBeCloseTo(4.8994, 2);
    expect(spots[0].configuration).toBe('bataille');
    expect(spots[0].nbPlaces).toBe(2);
  });

  it('retourne le mock si l\'API échoue', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'));
    const spots = await fetchParkingSpots();
    expect(spots).toEqual(MOCK_SPOTS);
  });

  it('retourne le mock si la réponse HTTP est en erreur', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    const spots = await fetchParkingSpots();
    expect(spots).toEqual(MOCK_SPOTS);
  });

  it('filtre les features sans géométrie', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          { geometry: null, properties: { uid: 'bad', nb_places: 1, gid: 1 } },
          { geometry: { type: 'Point', coordinates: [4.835, 45.764] }, properties: { uid: 'good', adresse: 'Test', nb_places: 1, gid: 2, last_update_fme: '' } },
        ],
      }),
    });
    const spots = await fetchParkingSpots();
    expect(spots.every((s) => s.id !== 'bad')).toBe(true);
    expect(spots.some((s) => s.id === 'good')).toBe(true);
  });
});
