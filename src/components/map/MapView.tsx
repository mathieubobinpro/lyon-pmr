import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { ParkingSpot, Coordinates } from '../../types';
import { PMRSymbol } from '../ui/PMRSymbol';
import { renderToStaticMarkup } from 'react-dom/server';

interface Props {
  spots: ParkingSpot[];
  userCoords: Coordinates;
  selectedSpot: ParkingSpot | null;
  onSelectSpot: (spot: ParkingSpot) => void;
  dark?: boolean;
}

const TILE_URL = 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_URL_DARK = 'https://{a-d}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const INITIAL_ZOOM = 14;

// Rayon d'affichage des spots selon le zoom
function radiusForZoom(zoom: number): number {
  if (zoom >= 16) return 500;
  if (zoom >= 14) return 2000;
  if (zoom >= 12) return 5000;
  return 10000;
}

export function MapView({ spots, userCoords, selectedSpot, onSelectSpot, dark = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<maplibregl.Map | null>(null);
  const markersRef   = useRef<Map<string, maplibregl.Marker>>(new Map());

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
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
          },
        },
        layers: [{ id: 'carto-tiles', type: 'raster', source: 'carto' }],
      },
      center: [userCoords.lng, userCoords.lat],
      zoom: INITIAL_ZOOM,
    });

    // a11y: contrôle zoom avec libellés français
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-left'
    );

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
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

  // Rendu des marqueurs PMR — masquage hors rayon
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const zoom = map.getZoom();
    const radius = radiusForZoom(zoom);

    spots.forEach((spot) => {
      const dist = spot.distance ?? Infinity;
      const visible = dist <= radius;
      const existing = markersRef.current.get(spot.id);

      if (!visible) {
        existing?.remove();
        markersRef.current.delete(spot.id);
        return;
      }

      if (existing) {
        // Met à jour la sélection visuelle
        const el = existing.getElement();
        const isSelected = selectedSpot?.id === spot.id;
        el.style.background = isSelected ? '#0066FF' : '#FFFFFF';
        el.style.boxShadow   = isSelected
          ? '0 0 0 3px rgba(0,102,255,0.3), 0 4px 12px rgba(0,102,255,0.4)'
          : '0 2px 8px rgba(0,0,0,0.2)';
        return;
      }

      // Crée un nouveau marqueur
      const isSelected = selectedSpot?.id === spot.id;
      const el = document.createElement('div');
      el.style.cssText = `
        width: 40px; height: 40px; border-radius: 50%; cursor: pointer;
        background: ${isSelected ? '#0066FF' : '#FFFFFF'};
        box-shadow: ${isSelected
          ? '0 0 0 3px rgba(0,102,255,0.3), 0 4px 12px rgba(0,102,255,0.4)'
          : '0 2px 8px rgba(0,0,0,0.2)'};
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.15s;
      `;
      // a11y: role button + label pour navigation clavier sur marqueur
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `Place PMR — ${spot.address}`);
      el.setAttribute('tabindex', '0');
      el.innerHTML = renderToStaticMarkup(
        <PMRSymbol size={22} color={isSelected ? '#FFFFFF' : '#0066FF'} />
      );

      el.addEventListener('click', () => onSelectSpot(spot));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') onSelectSpot(spot); });

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([spot.coordinates.lng, spot.coordinates.lat])
        .addTo(map);

      markersRef.current.set(spot.id, marker);
    });
  }, [spots, selectedSpot, onSelectSpot]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.loaded()) updateMarkers();
    else map.once('load', updateMarkers);
    map.on('zoom', updateMarkers);
    return () => { map.off('zoom', updateMarkers); };
  }, [updateMarkers]);

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

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0 }}
      aria-label="Carte des places de stationnement PMR"
      role="application"
    />
  );
}
