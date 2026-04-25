import type { GeocodingResult } from '../types';

const BAN_URL = 'https://api-adresse.data.gouv.fr/search/';

/** Géocode une adresse via l'API BAN. Filtre sur le département 69 (Lyon). */
export async function searchAddress(query: string, signal?: AbortSignal): Promise<GeocodingResult[]> {
  if (query.trim().length < 3) return [];

  const url = new URL(BAN_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '4');
  url.searchParams.set('citycode', '69');

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
