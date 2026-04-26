import type { GeocodingResult, Coordinates } from '../types';

const BAN_URL = 'https://api-adresse.data.gouv.fr/search/';

/**
 * Géocode une adresse via l'API BAN (Base Adresse Nationale).
 * Biaise les résultats vers les coordonnées fournies (position utilisateur ou Lyon).
 */
export async function searchAddress(
  query: string,
  signal?: AbortSignal,
  near?: Coordinates,
): Promise<GeocodingResult[]> {
  if (query.trim().length < 3) return [];

  const url = new URL(BAN_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '5');
  url.searchParams.set('type', 'housenumber,street,locality,municipality');

  // Biais géographique : la BAN remonte les résultats proches en priorité
  if (near) {
    url.searchParams.set('lat', near.lat.toFixed(6));
    url.searchParams.set('lon', near.lng.toFixed(6));
  }

  try {
    const res = await fetch(url.toString(), { signal });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.features ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (f: any): GeocodingResult => ({
        label:       f.properties?.label ?? '',
        name:        f.properties?.name  ?? '',
        city:        f.properties?.city  ?? '',
        coordinates: {
          lat: f.geometry?.coordinates?.[1] ?? 0,
          lng: f.geometry?.coordinates?.[0] ?? 0,
        },
      })
    );
  } catch {
    return [];
  }
}
