import type { ParkingSpot, ParkingConfiguration } from '../types';

const WFS_URL = 'https://data.grandlyon.com/geoserver/wfs';
const TYPENAME = 'metropole-de-lyon:com_donnees_communales.comstationnementpmr_1_0_0';
const TIMEOUT_MS = 5000;

// Coordonnées de Lyon centre (fallback géoloc)
export const LYON_CENTER = { lat: 45.7640, lng: 4.8357 };

// ── Mock data — 10 places Lyon centre (fallback si API indisponible) ──────────
export const MOCK_SPOTS: ParkingSpot[] = [
  { id: 'mock-1', name: 'Bellecour_1',     coordinates: { lat: 45.7578, lng: 4.8320 }, address: 'Place Bellecour',          postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 3, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-2', name: 'Republique_47',   coordinates: { lat: 45.7640, lng: 4.8340 }, address: 'Rue de la République',     postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 2, configuration: 'longitudinal',  updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-3', name: 'VictorHugo_12',   coordinates: { lat: 45.7560, lng: 4.8310 }, address: 'Rue Victor Hugo',          postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 2, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-4', name: 'StAntoine_1',     coordinates: { lat: 45.7670, lng: 4.8355 }, address: 'Quai Saint-Antoine',       postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 2, configuration: 'longitudinal',  updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-5', name: 'Carnot_1',        coordinates: { lat: 45.7530, lng: 4.8295 }, address: 'Place Carnot',             postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 4, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-6', name: 'Herriot_23',      coordinates: { lat: 45.7650, lng: 4.8270 }, address: 'Rue Édouard Herriot',      postalCode: '69001', city: 'Lyon 1er', inseeCode: 69381, nbPlaces: 2, configuration: 'longitudinal',  updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-7', name: 'Pecherie_1',      coordinates: { lat: 45.7680, lng: 4.8300 }, address: 'Quai de la Pêcherie',      postalCode: '69001', city: 'Lyon 1er', inseeCode: 69381, nbPlaces: 1, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-8', name: 'Gambetta_5',      coordinates: { lat: 45.7500, lng: 4.8450 }, address: 'Cours Gambetta',           postalCode: '69007', city: 'Lyon 7e',  inseeCode: 69387, nbPlaces: 2, configuration: 'epi',          updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-9', name: 'Tupin_8',         coordinates: { lat: 45.7620, lng: 4.8360 }, address: 'Rue Tupin',                postalCode: '69002', city: 'Lyon 2e',  inseeCode: 69382, nbPlaces: 1, configuration: 'longitudinal',  updatedAt: '2025-09-01T00:00:00Z' },
  { id: 'mock-10', name: 'Jaures_2',       coordinates: { lat: 45.7490, lng: 4.8340 }, address: 'Avenue Jean Jaurès',       postalCode: '69007', city: 'Lyon 7e',  inseeCode: 69387, nbPlaces: 3, configuration: 'bataille',     updatedAt: '2025-09-01T00:00:00Z' },
];

// ── Parsing GeoJSON → ParkingSpot ─────────────────────────────────────────────
function parseConfiguration(raw: string | null | undefined): ParkingConfiguration {
  const v = (raw ?? '').toLowerCase();
  if (v.includes('batail'))  return 'bataille';
  if (v.includes('long'))    return 'longitudinal';
  if (v.includes('epi') || v.includes('épi')) return 'epi';
  return 'unknown';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function featureToParkingSpot(feature: any): ParkingSpot | null {
  try {
    const p = feature.properties ?? {};
    const [lng, lat] = feature.geometry?.coordinates ?? [null, null];
    if (lng === null || lat === null) return null;

    return {
      id:            p.uid ?? `gid-${p.gid}`,
      name:          p.nom ?? '',
      coordinates:   { lat, lng },
      address:       p.adresse ?? '',
      postalCode:    String(p.codepost ?? ''),
      city:          p.commune ?? '',
      inseeCode:     Number(p.code_insee ?? 0),
      nbPlaces:      Number(p.nb_places ?? 1),
      configuration: parseConfiguration(p.configuration),
      length:        p.longueur_m ?? undefined,
      infoLocation:  p.infoloc ?? undefined,
      updatedAt:     p.last_update_fme ?? '',
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

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { 'User-Agent': 'Lyon-PMR-App/1.0' },
    });

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
