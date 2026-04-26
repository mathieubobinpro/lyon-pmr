import { useState, useEffect, useRef } from 'react';
import { Crosshair, Search, X, ChevronLeft } from 'lucide-react';
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
  const [selected, setSelected]     = useState<ParkingSpot | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchVal, setSearchVal]   = useState('');
  const [results, setResults]       = useState<GeocodingResult[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus auto quand on passe en mode recherche
  useEffect(() => {
    if (searchMode) setTimeout(() => inputRef.current?.focus(), 80);
  }, [searchMode]);

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

  const closeSearch = () => {
    setSearchMode(false);
    setSearchVal('');
    setResults([]);
  };

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

      {/* FAB Localiser */}
      <button
        onClick={onLocate}
        aria-label="Me localiser sur la carte"
        style={{
          position: 'absolute',
          bottom: selected ? '58vh' : '26vh',
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

          {/* MODE RECHERCHE */}
          {searchMode ? (
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: dark ? '#2A2A2A' : '#F5F5F7', borderRadius: 14,
                padding: '0 16px', height: 52,
              }}>
                <Search size={20} color="#6B7280" aria-hidden />
                <input
                  ref={inputRef}
                  type="search"
                  placeholder="Adresse, lieu…"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  aria-label="Rechercher une adresse à Lyon"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontSize: 17, color: dark ? '#F0F0F0' : '#1A1A1A', fontFamily: 'inherit',
                  }}
                />
                {searchVal && (
                  <button
                    onClick={() => { setSearchVal(''); setResults([]); inputRef.current?.focus(); }}
                    aria-label="Effacer la recherche"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <X size={18} color="#6B7280" aria-hidden />
                  </button>
                )}
              </div>

              {results.length > 0 && (
                <div style={{
                  marginTop: 8,
                  background: dark ? '#2A2A2A' : '#FFFFFF', borderRadius: 14,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden',
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

              <button
                onClick={closeSearch}
                aria-label="Retour"
                style={{
                  marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 600, color: '#0066FF', padding: '4px 0',
                }}
              >
                <ChevronLeft size={18} aria-hidden />
                Retour
              </button>
            </div>
          ) : (
            /* MODE ACCUEIL */
            <div style={{ padding: '0 16px 12px' }}>
              {/* CTA principal */}
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
                  marginBottom: 10,
                  WebkitTapHighlightColor: 'transparent',
                }}
                onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                onTouchEnd={(e) =>   { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                <PMRSymbol size={28} color="#FFFFFF" />
                <span>Place la plus proche</span>
              </button>

              {/* Bouton secondaire — Où veux-tu aller ? */}
              <button
                onClick={() => setSearchMode(true)}
                aria-label="Rechercher une adresse"
                style={{
                  width: '100%', height: 52, borderRadius: 14, cursor: 'pointer',
                  background: dark ? '#2A2A2A' : '#F5F5F7',
                  border: `1.5px solid ${dark ? '#333' : '#E5E7EB'}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '0 16px',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Search size={18} color="#6B7280" aria-hidden />
                <span style={{ fontSize: 16, color: '#6B7280', fontWeight: 500 }}>
                  Où veux-tu aller ?
                </span>
              </button>
            </div>
          )}
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
