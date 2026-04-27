import type { ParkingSpot, ParkingConfiguration } from '../types';

const WFS_URL  = 'https://data.grandlyon.com/geoserver/wfs';
const TYPENAME = 'metropole-de-lyon:com_donnees_communales.comstationnementpmr_1_0_0';
const TIMEOUT_MS = 20_000; // full dataset peut peser plusieurs secondes

export const LYON_CENTER = { lat: 45.7640, lng: 4.8357 };

// ── Mock data — 20 places réalistes, réparties sur les 9 arrondissements ──────
export const MOCK_SPOTS: ParkingSpot[] = [
  // 1er
  { id: 'mock-01', name: 'Herriot_23',        coordinates: { lat: 45.7665, lng: 4.8275 }, address: 'Rue Édouard Herriot',       postalCode: '69001', city: 'Lyon 1er', inseeCode: 69381, nbPlaces: 2, configuration: 'longitudinal', updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-02', name: 'Pecherie_1',        coordinates: { lat: 45.7680, lng: 4.8308 }, address: 'Quai de la Pêcherie',       postalCode: '69001', city: 'Lyon 1er', inseeCode: 69381, nbPlaces: 1, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-03', name: 'Terreaux_1',        coordinates: { lat: 45.7677, lng: 4.8338 }, address: 'Place des Terreaux',        postalCode: '69001', city: 'Lyon 1er', inseeCode: 69381, nbPlaces: 2, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  // 2e
  { id: 'mock-04', name: 'Bellecour_1',       coordinates: { lat: 45.7578, lng: 4.8322 }, address: 'Place Bellecour',           postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 3, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-05', name: 'Republique_47',     coordinates: { lat: 45.7640, lng: 4.8342 }, address: 'Rue de la République',      postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 2, configuration: 'longitudinal', updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-06', name: 'VictorHugo_12',     coordinates: { lat: 45.7555, lng: 4.8308 }, address: 'Rue Victor Hugo',           postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 2, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-07', name: 'Carnot_1',          coordinates: { lat: 45.7530, lng: 4.8295 }, address: 'Place Carnot',              postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 4, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  // 3e
  { id: 'mock-08', name: 'Garibaldi_30',      coordinates: { lat: 45.7568, lng: 4.8445 }, address: 'Rue Garibaldi',             postalCode: '69003', city: 'Lyon 3e',  inseeCode: 69383, nbPlaces: 2, configuration: 'longitudinal', updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-09', name: 'Lafayette_55',      coordinates: { lat: 45.7610, lng: 4.8405 }, address: 'Cours Lafayette',           postalCode: '69003', city: 'Lyon 3e',  inseeCode: 69383, nbPlaces: 2, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  // 4e
  { id: 'mock-10', name: 'CroixRousse_8',     coordinates: { lat: 45.7742, lng: 4.8338 }, address: 'Boulevard de la Croix-Rousse', postalCode: '69004', city: 'Lyon 4e', inseeCode: 69384, nbPlaces: 1, configuration: 'longitudinal', updatedAt: '2025-09-01T00:00:00Z' },
  // 5e
  { id: 'mock-11', name: 'StJean_1',          coordinates: { lat: 45.7618, lng: 4.8268 }, address: 'Place Saint-Jean',          postalCode: '69005', city: 'Lyon 5e',  inseeCode: 69385, nbPlaces: 2, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  // 6e
  { id: 'mock-12', name: 'Foch_10',           coordinates: { lat: 45.7718, lng: 4.8498 }, address: 'Cours Franklin Roosevelt',  postalCode: '69006', city: 'Lyon 6e',  inseeCode: 69386, nbPlaces: 2, configuration: 'longitudinal', updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-13', name: 'Saxe_25',           coordinates: { lat: 45.7695, lng: 4.8462 }, address: 'Avenue Maréchal de Saxe',   postalCode: '69006', city: 'Lyon 6e',  inseeCode: 69386, nbPlaces: 3, configuration: 'epi',          updatedAt: '2025-09-01T00:00:00Z' },
  // 7e
  { id: 'mock-14', name: 'Jaures_2',          coordinates: { lat: 45.7490, lng: 4.8340 }, address: 'Avenue Jean Jaurès',        postalCode: '69007', city: 'Lyon 7e',  inseeCode: 69387, nbPlaces: 3, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-15', name: 'Gambetta_5',        coordinates: { lat: 45.7500, lng: 4.8448 }, address: 'Cours Gambetta',            postalCode: '69007', city: 'Lyon 7e',  inseeCode: 69387, nbPlaces: 2, configuration: 'epi',          updatedAt: '2025-09-01T00:00:00Z' },
  // 8e
  { id: 'mock-16', name: 'Mermoz_4',          coordinates: { lat: 45.7402, lng: 4.8582 }, address: 'Avenue Jean Mermoz',        postalCode: '69008', city: 'Lyon 8e',  inseeCode: 69388, nbPlaces: 2, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-17', name: 'Etats-Unis_60',     coordinates: { lat: 45.7338, lng: 4.8612 }, address: 'Avenue des États-Unis',     postalCode: '69008', city: 'Lyon 8e',  inseeCode: 69388, nbPlaces: 2, configuration: 'longitudinal', updatedAt: '2025-09-01T00:00:00Z' },
  // 9e
  { id: 'mock-18', name: 'Gorge-de-Loup_1',  coordinates: { lat: 45.7718, lng: 4.8048 }, address: 'Rue Pierre Audry',          postalCode: '69009', city: 'Lyon 9e',  inseeCode: 69389, nbPlaces: 1, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  // 2e bis (Saône)
  { id: 'mock-19', name: 'StAntoine_1',       coordinates: { lat: 45.7672, lng: 4.8358 }, address: 'Quai Saint-Antoine',        postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 2, configuration: 'longitudinal', updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-20', name: 'Tupin_8',           coordinates: { lat: 45.7622, lng: 4.8362 }, address: 'Rue Tupin',                 postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 1, configuration: 'longitudinal', updatedAt: '2025-09-01T00:00:00Z' },
];

// ── Parsing GeoJSON → ParkingSpot ─────────────────────────────────────────────

/** Exporté pour les tests unitaires */
export function parseConfiguration(raw: string | null | undefined): ParkingConfiguration {
  const v = (raw ?? '').toLowerCase();
  if (v.includes('batail'))                    return 'bataille';
  if (v.includes('long'))                      return 'longitudinal';
  if (v.includes('epi') || v.includes('épi')) return 'epi';
  return 'unknown';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function featureToParkingSpot(feature: any): ParkingSpot | null {
  try {
    const p = feature.properties ?? {};
    const [lng, lat] = feature.geometry?.coordinates ?? [null, null];
    if (lng === null || lat === null || isNaN(lng) || isNaN(lat)) return null;

    return {
      id:            String(p.uid ?? `gid-${p.gid}`),
      name:          String(p.nom ?? ''),
      coordinates:   { lat: Number(lat), lng: Number(lng) },
      address:       String(p.adresse ?? ''),
      postalCode:    String(p.codepost ?? ''),
      city:          String(p.commune ?? ''),
      inseeCode:     Number(p.code_insee ?? 0),
      nbPlaces:      Math.max(1, Number(p.nb_places ?? 1)),
      configuration: parseConfiguration(p.configuration),
      length:        p.longueur_m != null ? Number(p.longueur_m) : undefined,
      infoLocation:  p.infoloc != null ? String(p.infoloc) : undefined,
      updatedAt:     String(p.last_update_fme ?? ''),
    };
  } catch {
    return null;
  }
}

/** Charge tous les emplacements PMR de la Métropole de Lyon. */
export async function fetchParkingSpots(): Promise<ParkingSpot[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = new URL(WFS_URL);
    url.searchParams.set('SERVICE', 'WFS');
    url.searchParams.set('REQUEST', 'GetFeature');
    url.searchParams.set('typename', TYPENAME);
    url.searchParams.set('OUTPUTFORMAT', 'application/json');
    url.searchParams.set('SRSNAME', 'EPSG:4326');

    // Ne pas passer de headers custom : 'User-Agent' est un header interdit
    // côté navigateur — WebKit (iOS) lève une TypeError, causant le fallback MOCK.
    const res = await fetch(url.toString(), { signal: controller.signal });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const spots = (data.features ?? [])
      .map(featureToParkingSpot)
      .filter((s: ParkingSpot | null): s is ParkingSpot => s !== null);

    return spots.length > 0 ? spots : MOCK_SPOTS;
  } catch {
    return MOCK_SPOTS;
  } finally {
    clearTimeout(timer);
  }
}
