import { useState, useEffect, useRef } from 'react';
import { Crosshair, Search, X } from 'lucide-react';
import type { ParkingSpot, Coordinates, FontSize } from '../../types';
import { MapView } from '../map/MapView';
import { DetailSheet } from '../ui/DetailSheet';
import { PMRSymbol } from '../ui/PMRSymbol';
import { searchAddress } from '../../api/ban';
import type { GeocodingResult } from '../../types';

interface Props {
  spots: ParkingSpot[];
  userCoords: Coordinates;
  dark?: boolean;
  fontSize?: FontSize;
  locateTrigger?: number;
  onFlyTo: (coords: Coordinates) => void;
  onLocate: () => void;
}

export function MapScreen({ spots, userCoords, dark = false, fontSize = 'normal', locateTrigger = 0, onLocate }: Props) {
  const [selected, setSelected] = useState<ParkingSpot | null>(null);
  const [searchVal, setSearchVal] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Recherche d'adresse avec debounce 400ms
  useEffect(() => {
    if (searchVal.length < 3) { setResults([]); return; }
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const res = await searchAddress(searchVal, abortRef.current.signal);
      setResults(res);
    }, 400);
    return () => clearTimeout(t);
  }, [searchVal]);

  const nearest = spots[0] ?? null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Carte */}
      <MapView
        spots={spots}
        userCoords={userCoords}
        selectedSpot={selected}
        onSelectSpot={setSelected}
        locateTrigger={locateTrigger}
        dark={dark}
      />

      {/* Compteur haut */}
      <div
        aria-live="polite"
        style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          background: dark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          padding: '6px 14px', borderRadius: 20,
          fontSize: 13, fontWeight: 600, color: dark ? '#EEE' : '#1A1A1A',
          zIndex: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          whiteSpace: 'nowrap',
        }}
      >
        {spots.length} places PMR dans cette zone
      </div>

      {/* FAB Localiser — bas droite, zone pouce */}
      <button
        onClick={onLocate}
        aria-label="Me localiser sur la carte"
        style={{
          position: 'absolute',
          bottom: selected ? '58vh' : '30vh',
          right: 16,
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: dark ? '#2A2A2A' : '#FFFFFF',
          boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, transition: 'bottom 0.3s',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <Crosshair size={24} color="#0066FF" aria-hidden />
      </button>

      {/* Bottom sheet — état accueil */}
      {!selected && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: dark ? '#1E1E1E' : '#FFFFFF',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        }}>
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: dark ? '#444' : '#DDD' }} />
          </div>

          {/* Barre de recherche */}
          <div style={{ padding: '0 16px 12px', position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: dark ? '#2A2A2A' : '#F5F5F7', borderRadius: 14,
              padding: '0 16px', height: 52,
            }}>
              <Search size={20} color="#6B7280" aria-hidden />
              <input
                type="search"
                placeholder="Où veux-tu aller ?"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                aria-label="Rechercher une adresse à Lyon"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 17, color: dark ? '#F0F0F0' : '#1A1A1A', fontFamily: 'inherit',
                }}
              />
              {searchVal && (
                <button onClick={() => { setSearchVal(''); setResults([]); }} aria-label="Effacer la recherche" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X size={18} color="#6B7280" aria-hidden />
                </button>
              )}
            </div>

            {/* Autocomplete */}
            {results.length > 0 && (
              <div style={{
                position: 'absolute', left: 16, right: 16, top: 58,
                background: dark ? '#2A2A2A' : '#FFFFFF', borderRadius: 14,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 200, overflow: 'hidden',
              }}>
                {results.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { setSearchVal(r.label); setResults([]); }}
                    style={{
                      width: '100%', padding: '12px 16px', border: 'none',
                      background: 'transparent', textAlign: 'left', cursor: 'pointer',
                      fontSize: 15, color: dark ? '#EEE' : '#1A1A1A',
                      borderBottom: i < results.length - 1 ? `1px solid ${dark ? '#333' : '#E5E7EB'}` : 'none',
                      minHeight: 56,
                    }}
                    aria-label={r.label}
                  >
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>{r.city}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA principal — place la plus proche */}
          <div style={{ padding: '0 16px 12px' }}>
            <button
              onClick={() => nearest && setSelected(nearest)}
              disabled={!nearest}
              aria-label="Trouver la place PMR la plus proche"
              data-testid="btn-nearest"
              style={{
                width: '100%', height: 72, borderRadius: 20, border: 'none', cursor: 'pointer',
                background: '#0066FF', color: '#FFFFFF',
                fontSize: 18, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                boxShadow: '0 4px 20px rgba(0,102,255,0.35)',
                WebkitTapHighlightColor: 'transparent',
              }}
              onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
              onTouchEnd={(e) =>   { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            >
              <PMRSymbol size={28} color="#FFFFFF" />
              <span>Place la plus proche</span>
            </button>
          </div>

        </div>
      )}

      {/* Bottom sheet — état détail */}
      {selected && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 99 }}>
          <DetailSheet
            spot={selected}
            dark={dark}
            fontSize={fontSize}
            onClose={() => setSelected(null)}
          />
        </div>
      )}
    </div>
  );
}
