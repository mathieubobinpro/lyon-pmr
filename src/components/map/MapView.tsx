import { useEffect, useRef, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Supercluster, { type ClusterProperties } from 'supercluster';
import type { ParkingSpot, Coordinates } from '../../types';
import { PMRSymbol } from '../ui/PMRSymbol';
import { renderToStaticMarkup } from 'react-dom/server';

interface Props {
  spots: ParkingSpot[];
  userCoords: Coordinates;
  selectedSpot: ParkingSpot | null;
  onSelectSpot: (spot: ParkingSpot) => void;
  locateTrigger?: number;
  searchTarget?: Coordinates | null;
  dark?: boolean;
}

const TILE_URL      = 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_URL_DARK = 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const INITIAL_ZOOM  = 14;

// Tailles des cercles de cluster (px)
const clusterSize = (count: number) => (count < 10 ? 36 : count < 50 ? 44 : 54);

export function MapView({ spots, userCoords, selectedSpot, onSelectSpot, locateTrigger = 0, searchTarget = null, dark = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<maplibregl.Map | null>(null);
  // Holds both cluster markers (key "c-{id}") and individual spot markers (key "s-{id}")
  const markersRef   = useRef<Map<string, maplibregl.Marker>>(new Map());

  // Build supercluster index whenever spots change
  const index = useMemo(() => {
    const sc = new Supercluster<{ spotId: string }>({ radius: 60, maxZoom: 16 });
    sc.load(
      spots.map((spot) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [spot.coordinates.lng, spot.coordinates.lat] },
        properties: { spotId: spot.id },
      }))
    );
    return sc;
  }, [spots]);

  // Spot lookup map for O(1) access
  const spotById = useMemo(() => new Map(spots.map((s) => [s.id, s])), [spots]);

  // Initialise la carte une seule fois
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: 'raster',
            tiles: [(dark ? TILE_URL_DARK : TILE_URL).replace('{a-d}', 'a')],
            tileSize: 256,
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
          },
        },
        layers: [{ id: 'carto-tiles', type: 'raster', source: 'carto' }],
      },
      center: [userCoords.lng, userCoords.lat],
      zoom: INITIAL_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      markersRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marqueur utilisateur (point bleu pulsé)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const el = document.createElement('div');
    el.style.cssText = `
      width: 16px; height: 16px; border-radius: 50%;
      background: #0066FF; border: 3px solid white;
      box-shadow: 0 0 0 4px rgba(0,102,255,0.25);
    `;
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([userCoords.lng, userCoords.lat])
      .addTo(map);
    return () => { marker.remove(); };
  }, [userCoords]);

  // ─── Clustering ────────────────────────────────────────────────────────────
  const updateClusters = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    const zoom   = Math.round(map.getZoom());
    const bbox: [number, number, number, number] = [
      bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth(),
    ];

    const features = index.getClusters(bbox, zoom);
    const nextKeys  = new Set<string>();

    features.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates as [number, number];
      // Discriminate cluster features from individual point features
      const isCluster = 'cluster_id' in feature.properties;

      if (isCluster) {
        // ── Cluster marker ──────────────────────────────────────────────────
        const { cluster_id: clusterId, point_count: count } =
          feature.properties as ClusterProperties;
        const key       = `c-${clusterId}`;
        nextKeys.add(key);

        if (markersRef.current.has(key)) return; // already rendered

        const size = clusterSize(count);
        const fontSize = size <= 36 ? 13 : size <= 44 ? 14 : 15;

        const el = document.createElement('div');
        el.style.cssText = `
          width: ${size}px; height: ${size}px; border-radius: 50%;
          background: #2563EB; color: #FFFFFF;
          display: flex; align-items: center; justify-content: center;
          font-size: ${fontSize}px; font-weight: 700;
          font-family: Inter, system-ui, sans-serif;
          box-shadow: 0 2px 10px rgba(37,99,235,0.45);
          border: 2.5px solid rgba(255,255,255,0.85);
          cursor: pointer;
        `;
        el.textContent = count >= 1000 ? `${Math.floor(count / 1000)}k` : String(count);
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `Groupe de ${count} places PMR — cliquer pour zoomer`);
        el.setAttribute('tabindex', '0');

        const expand = () => {
          const expansionZoom = Math.min(index.getClusterExpansionZoom(clusterId), 20);
          map.flyTo({ center: [lng, lat], zoom: expansionZoom, duration: 500 });
        };
        el.addEventListener('click', expand);
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') expand(); });

        markersRef.current.set(
          key,
          new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map),
        );
      } else {
        // ── Individual spot marker ──────────────────────────────────────────
        const { spotId } = feature.properties as { spotId: string };
        const spot        = spotById.get(spotId);
        if (!spot) return;

        const key        = `s-${spotId}`;
        const isSelected = selectedSpot?.id === spotId;
        nextKeys.add(key);

        const existing = markersRef.current.get(key);

        if (existing) {
          // Update selection state in-place (avoids recreating the marker)
          const el = existing.getElement();
          el.style.background = isSelected ? '#0066FF' : '#FFFFFF';
          el.style.boxShadow  = isSelected
            ? '0 0 0 3px rgba(0,102,255,0.3), 0 4px 12px rgba(0,102,255,0.4)'
            : '0 2px 8px rgba(0,0,0,0.2)';
          el.innerHTML = renderToStaticMarkup(
            <PMRSymbol size={22} color={isSelected ? '#FFFFFF' : '#0066FF'} />,
          );
          return;
        }

        const el = document.createElement('div');
        el.style.cssText = `
          width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
          background: ${isSelected ? '#0066FF' : '#FFFFFF'};
          box-shadow: ${
            isSelected
              ? '0 0 0 3px rgba(0,102,255,0.3), 0 4px 12px rgba(0,102,255,0.4)'
              : '0 2px 8px rgba(0,0,0,0.2)'
          };
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.15s;
        `;
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `Place PMR — ${spot.address}`);
        el.setAttribute('tabindex', '0');
        el.innerHTML = renderToStaticMarkup(
          <PMRSymbol size={22} color={isSelected ? '#FFFFFF' : '#0066FF'} />,
        );

        el.addEventListener('click',   () => onSelectSpot(spot));
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') onSelectSpot(spot); });

        markersRef.current.set(
          key,
          new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lng, lat]).addTo(map),
        );
      }
    });

    // Remove markers that are no longer in view / have been clustered
    markersRef.current.forEach((marker, key) => {
      if (!nextKeys.has(key)) {
        marker.remove();
        markersRef.current.delete(key);
      }
    });
  }, [index, spotById, selectedSpot, onSelectSpot]);

  // Re-run clustering after map moves, zooms, or when data/selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.loaded()) updateClusters();
    else map.once('load', updateClusters);

    map.on('moveend', updateClusters);
    map.on('zoomend', updateClusters);
    return () => {
      map.off('moveend', updateClusters);
      map.off('zoomend', updateClusters);
    };
  }, [updateClusters]);

  // ─── Locate / flyTo logic ───────────────────────────────────────────────────
  const isFirstLocate = useRef(true);
  const pendingLocate = useRef(false);

  useEffect(() => {
    if (isFirstLocate.current) { isFirstLocate.current = false; return; }
    pendingLocate.current = true;
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [userCoords.lng, userCoords.lat], zoom: 15, duration: 600 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locateTrigger]);

  useEffect(() => {
    if (!pendingLocate.current) return;
    pendingLocate.current = false;
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [userCoords.lng, userCoords.lat], zoom: 15, duration: 600 });
  }, [userCoords]);

  // Fly to selected spot
  useEffect(() => {
    const map = mapRef.current;
    if (map && selectedSpot) {
      map.flyTo({
        center: [selectedSpot.coordinates.lng, selectedSpot.coordinates.lat],
        zoom: 16,
        duration: 800,
      });
    }
  }, [selectedSpot]);

  // Fly to address search result
  useEffect(() => {
    const map = mapRef.current;
    if (map && searchTarget) {
      map.flyTo({ center: [searchTarget.lng, searchTarget.lat], zoom: 15, duration: 600 });
    }
  }, [searchTarget]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0 }}
      aria-label="Carte des places de stationnement PMR"
      role="application"
    />
  );
}
