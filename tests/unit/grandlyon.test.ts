import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchParkingSpots, MOCK_SPOTS, parseConfiguration, featureToParkingSpot } from '../../src/api/grandlyon';

// ── parseConfiguration ─────────────────────────────────────────────────────────
describe('parseConfiguration', () => {
  it('reconnaît "bataille"', ()  => expect(parseConfiguration('bataille')).toBe('bataille'));
  it('reconnaît "BATAILLE"', ()  => expect(parseConfiguration('BATAILLE')).toBe('bataille'));
  it('reconnaît "longitudinal"', () => expect(parseConfiguration('longitudinal')).toBe('longitudinal'));
  it('reconnaît "LONG"', ()      => expect(parseConfiguration('LONG')).toBe('longitudinal'));
  it('reconnaît "epi"', ()       => expect(parseConfiguration('epi')).toBe('epi'));
  it('reconnaît "épi"', ()       => expect(parseConfiguration('épi')).toBe('epi'));
  it('retourne unknown pour null', () => expect(parseConfiguration(null)).toBe('unknown'));
  it('retourne unknown pour chaîne inconnue', () => expect(parseConfiguration('parallel')).toBe('unknown'));
});

// ── featureToParkingSpot ───────────────────────────────────────────────────────
describe('featureToParkingSpot', () => {
  const VALID_FEATURE = {
    geometry: { type: 'Point', coordinates: [4.8994, 45.8170] },
    properties: {
      uid: 'PMR-69286-1216', nom: 'Ravel_33_4', adresse: 'Ravel',
      codepost: 69140, commune: 'Rillieux la Pape', code_insee: 69286,
      nb_places: 2, configuration: 'bataille', longueur_m: null,
      infoloc: null, last_update_fme: '2025-09-17T14:34:31Z', gid: 3801,
    },
  };

  it('parse correctement un feature valide', () => {
    const spot = featureToParkingSpot(VALID_FEATURE);
    expect(spot).not.toBeNull();
    expect(spot!.id).toBe('PMR-69286-1216');
    expect(spot!.coordinates.lat).toBeCloseTo(45.817, 2);
    expect(spot!.coordinates.lng).toBeCloseTo(4.8994, 2);
    expect(spot!.configuration).toBe('bataille');
    expect(spot!.nbPlaces).toBe(2);
    expect(spot!.length).toBeUndefined();
    expect(spot!.infoLocation).toBeUndefined();
  });

  it('utilise gid comme fallback id si uid absent', () => {
    const f = { ...VALID_FEATURE, properties: { ...VALID_FEATURE.properties, uid: null } };
    const spot = featureToParkingSpot(f);
    expect(spot!.id).toBe('gid-3801');
  });

  it('retourne null si geometry absente', () => {
    expect(featureToParkingSpot({ geometry: null, properties: {} })).toBeNull();
  });

  it('retourne null si coordonnées invalides', () => {
    const f = { geometry: { coordinates: [null, null] }, properties: { uid: 'x', gid: 1 } };
    expect(featureToParkingSpot(f)).toBeNull();
  });

  it('garantit nbPlaces >= 1', () => {
    const f = { ...VALID_FEATURE, properties: { ...VALID_FEATURE.properties, nb_places: 0 } };
    const spot = featureToParkingSpot(f);
    expect(spot!.nbPlaces).toBeGreaterThanOrEqual(1);
  });

  it('parse longueur_m si présente', () => {
    const f = { ...VALID_FEATURE, properties: { ...VALID_FEATURE.properties, longueur_m: 6.5 } };
    const spot = featureToParkingSpot(f);
    expect(spot!.length).toBe(6.5);
  });
});

// ── fetchParkingSpots ──────────────────────────────────────────────────────────
describe('fetchParkingSpots', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('parse correctement un GeoJSON valide', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [
        { geometry: { type: 'Point', coordinates: [4.8994, 45.8170] },
          properties: { uid: 'PMR-69286-1216', adresse: 'Ravel', codepost: 69140,
            commune: 'Rillieux la Pape', code_insee: 69286, nb_places: 2,
            configuration: 'bataille', gid: 3801, last_update_fme: '' } },
      ] }),
    });
    const spots = await fetchParkingSpots();
    expect(spots[0].id).toBe('PMR-69286-1216');
  });

  it('retourne MOCK_SPOTS si API échoue', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network'));
    const spots = await fetchParkingSpots();
    expect(spots).toEqual(MOCK_SPOTS);
  });

  it('retourne MOCK_SPOTS si réponse HTTP non-OK', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    const spots = await fetchParkingSpots();
    expect(spots).toEqual(MOCK_SPOTS);
  });

  it('filtre les features sans géométrie valide', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [
        { geometry: null, properties: { uid: 'bad', gid: 1 } },
        { geometry: { coordinates: [4.835, 45.764] }, properties: { uid: 'good', gid: 2, last_update_fme: '' } },
      ] }),
    });
    const spots = await fetchParkingSpots();
    expect(spots.some(s => s.id === 'good')).toBe(true);
    expect(spots.every(s => s.id !== 'bad')).toBe(true);
  });

  it('MOCK_SPOTS couvre bien 9 arrondissements', () => {
    const cities = new Set(MOCK_SPOTS.map(s => s.city));
    expect(cities.size).toBeGreaterThanOrEqual(8);
  });

  it('MOCK_SPOTS contient 20 entrées', () => {
    expect(MOCK_SPOTS).toHaveLength(20);
  });
});
